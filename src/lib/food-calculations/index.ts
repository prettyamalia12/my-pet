import type { StockUnit } from '../../types';

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
