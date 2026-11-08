import type { StockLogEntry, StockUnit } from '../../types';

/** Food is considered "low" when this many (or fewer) days of food remain. */
export const LOW_STOCK_THRESHOLD_DAYS = 5;

export type FoodStatus = 'ok' | 'low' | 'exhausted' | 'overdue' | 'unknown';

export interface FoodStatusInput {
  /** Current stock converted to grams. */
  stockGrams: number | null | undefined;
  /** Estimated consumption in grams per day. */
  dailyConsumptionGrams: number | null | undefined;
  /** ISO timestamp of when the stock figure was recorded. */
  updatedAt?: string | Date | null;
  /** Reference "now" — injectable for tests. Defaults to the current time. */
  now?: Date;
  /** Days-remaining at or below which the status becomes "low". */
  lowThresholdDays?: number;
}

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Convert an amount in g or kg to grams. Returns null for invalid/negative input. */
export function toGrams(amount: number, unit: StockUnit): number | null {
  if (!isValidNumber(amount) || amount < 0) return null;
  return unit === 'kg' ? amount * 1000 : amount;
}

/**
 * How many days the stock lasts at the given consumption rate.
 * Returns null when required data is missing or invalid
 * (negative stock, zero/negative/non-finite consumption).
 */
export function daysRemaining(
  stockGrams: number | null | undefined,
  dailyConsumptionGrams: number | null | undefined,
): number | null {
  if (!isValidNumber(stockGrams) || stockGrams < 0) return null;
  if (!isValidNumber(dailyConsumptionGrams) || dailyConsumptionGrams <= 0) return null;
  return stockGrams / dailyConsumptionGrams;
}

/**
 * Estimated run-out date: `days` after `fromDate`.
 * Returns null when either input is missing/invalid.
 */
export function estimateRunOutDate(
  days: number | null | undefined,
  fromDate: Date | string,
): Date | null {
  if (!isValidNumber(days) || days < 0) return null;
  const from = fromDate instanceof Date ? fromDate : new Date(fromDate);
  if (Number.isNaN(from.getTime())) return null;
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * One clear food status at a time.
 *
 * Assumptions (documented in the README):
 * - Stock of exactly 0 g means the food is 'exhausted', regardless of consumption data.
 * - Otherwise, without a valid positive consumption rate we cannot estimate anything
 *   and report 'unknown' — we never invent numbers.
 * - The run-out date is estimated from the day the stock was recorded (`updatedAt`).
 *   If that estimated date is already in the past, the status is 'overdue':
 *   by our own estimate the food should be gone by now, so the recorded stock is stale.
 * - 'low' when days remaining (from the recording date) is at or below the threshold.
 */
export function getFoodStatus(input: FoodStatusInput): FoodStatus {
  const { stockGrams, dailyConsumptionGrams, updatedAt } = input;
  const now = input.now ?? new Date();
  const threshold = input.lowThresholdDays ?? LOW_STOCK_THRESHOLD_DAYS;

  if (!isValidNumber(stockGrams) || stockGrams < 0) return 'unknown';
  if (stockGrams === 0) return 'exhausted';
  if (!isValidNumber(dailyConsumptionGrams) || dailyConsumptionGrams <= 0) return 'unknown';

  const days = daysRemaining(stockGrams, dailyConsumptionGrams);
  if (days === null) return 'unknown';

  const from = updatedAt ?? now;
  const runOut = estimateRunOutDate(days, from);
  if (runOut !== null && runOut.getTime() < now.getTime()) return 'overdue';

  if (days <= threshold) return 'low';
  return 'ok';
}

// ---- consumption estimation from stock readings ---------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Daily consumption implied by a bag size and how long it lasts —
 * the "a bag lasts me about 3 weeks" way of knowing a pet's appetite.
 * `bagGrams` must already be converted (see toGrams). Returns null for
 * invalid input — we never invent a number.
 */
export function consumptionFromBagDuration(
  bagGrams: number | null | undefined,
  days: number | null | undefined,
): number | null {
  if (!isValidNumber(bagGrams) || bagGrams <= 0) return null;
  if (!isValidNumber(days) || days <= 0) return null;
  return Math.round((bagGrams / days) * 10) / 10;
}

export interface EstimateConsumptionOptions {
  /** Reference "now" — injectable for tests. Defaults to the current time. */
  now?: Date;
  /** Only readings within this many days of `now` are used. */
  windowDays?: number;
  /** Minimum elapsed days across consuming segments before we report a rate. */
  minDaysCovered?: number;
}

function isValidLogEntry(entry: StockLogEntry): boolean {
  return (
    typeof entry?.at === 'string' &&
    !Number.isNaN(new Date(entry.at).getTime()) &&
    isValidNumber(entry.stockGrams) &&
    entry.stockGrams >= 0
  );
}

/**
 * Estimate daily consumption (grams/day) from a log of stock readings.
 *
 * Each pair of consecutive readings where the stock went DOWN is a
 * "consuming segment": the drop divided by the elapsed days is that
 * segment's rate. A pair where the stock went UP or stayed flat is a
 * restock: it breaks the chain, because the drop across a restock says
 * nothing about how fast the food is eaten.
 *
 * The estimate is total grams dropped over total elapsed days across all
 * consuming segments within the window. Returns null when there isn't
 * enough coverage to say anything — we never invent a number.
 */
export function estimateDailyConsumption(
  log: readonly StockLogEntry[] | undefined,
  options: EstimateConsumptionOptions = {},
): number | null {
  if (!log || log.length < 2) return null;
  const now = options.now ?? new Date();
  const windowDays = options.windowDays ?? 90;
  const minDaysCovered = options.minDaysCovered ?? 2;
  const windowStart = now.getTime() - windowDays * DAY_MS;

  const entries = log
    .filter(isValidLogEntry)
    .map((entry) => ({ time: new Date(entry.at).getTime(), grams: entry.stockGrams }))
    .filter((entry) => entry.time <= now.getTime() && entry.time >= windowStart)
    .sort((a, b) => a.time - b.time);

  let consumed = 0;
  let daysCovered = 0;
  for (let i = 1; i < entries.length; i++) {
    const elapsedDays = (entries[i].time - entries[i - 1].time) / DAY_MS;
    if (elapsedDays <= 0) continue;
    const delta = entries[i - 1].grams - entries[i].grams;
    if (delta <= 0) continue; // restock or flat reading — the chain is broken
    consumed += delta;
    daysCovered += elapsedDays;
  }

  if (consumed <= 0 || daysCovered < minDaysCovered) return null;
  return Math.round((consumed / daysCovered) * 10) / 10;
}

/**
 * Append a stock reading to the log, keeping the log bounded so storage
 * stays small (oldest entries drop off past `maxEntries`).
 */
export function appendStockLogEntry(
  log: readonly StockLogEntry[] | undefined,
  entry: StockLogEntry,
  options: { maxEntries?: number } = {},
): StockLogEntry[] {
  const maxEntries = options.maxEntries ?? 60;
  const next = [...(log ?? []), entry];
  return next.length > maxEntries ? next.slice(next.length - maxEntries) : next;
}
