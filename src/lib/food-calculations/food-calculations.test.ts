import { describe, expect, it } from 'vitest';
import {
  appendStockLogEntry,
  consumptionFromBagDuration,
  daysRemaining,
  estimateDailyConsumption,
  estimateRunOutDate,
  getFoodStatus,
  toGrams,
} from './index';

describe('toGrams', () => {
  it('converts kilograms to grams', () => {
    expect(toGrams(1.5, 'kg')).toBe(1500);
    expect(toGrams(2, 'kg')).toBe(2000);
  });

  it('passes grams through unchanged', () => {
    expect(toGrams(750, 'g')).toBe(750);
    expect(toGrams(0, 'g')).toBe(0);
  });

  it('returns null for invalid numbers', () => {
    expect(toGrams(NaN, 'g')).toBeNull();
    expect(toGrams(Infinity, 'kg')).toBeNull();
    expect(toGrams(-100, 'g')).toBeNull();
  });
});

describe('daysRemaining', () => {
  it('computes stock / consumption for normal values', () => {
    expect(daysRemaining(1000, 50)).toBe(20);
    expect(daysRemaining(450, 45)).toBe(10);
  });

  it('returns 0 for empty stock', () => {
    expect(daysRemaining(0, 50)).toBe(0);
  });

  it('returns null when stock data is missing or invalid', () => {
    expect(daysRemaining(null, 50)).toBeNull();
    expect(daysRemaining(undefined, 50)).toBeNull();
    expect(daysRemaining(NaN, 50)).toBeNull();
    expect(daysRemaining(-5, 50)).toBeNull();
  });

  it('returns null for zero or negative consumption', () => {
    expect(daysRemaining(1000, 0)).toBeNull();
    expect(daysRemaining(1000, -30)).toBeNull();
  });

  it('returns null when consumption is missing or invalid', () => {
    expect(daysRemaining(1000, null)).toBeNull();
    expect(daysRemaining(1000, undefined)).toBeNull();
    expect(daysRemaining(1000, NaN)).toBeNull();
    expect(daysRemaining(1000, Infinity)).toBeNull();
  });
});

describe('estimateRunOutDate', () => {
  const from = new Date('2026-10-01T00:00:00Z');

  it('adds whole days to the from date', () => {
    const result = estimateRunOutDate(10, from);
    expect(result?.toISOString()).toBe('2026-10-11T00:00:00.000Z');
  });

  it('handles fractional days', () => {
    const result = estimateRunOutDate(1.5, from);
    expect(result?.toISOString()).toBe('2026-10-02T12:00:00.000Z');
  });

  it('accepts an ISO string as from date', () => {
    const result = estimateRunOutDate(1, '2026-10-01T00:00:00Z');
    expect(result?.toISOString()).toBe('2026-10-02T00:00:00.000Z');
  });

  it('returns null for missing or invalid input', () => {
    expect(estimateRunOutDate(null, from)).toBeNull();
    expect(estimateRunOutDate(undefined, from)).toBeNull();
    expect(estimateRunOutDate(NaN, from)).toBeNull();
    expect(estimateRunOutDate(-3, from)).toBeNull();
    expect(estimateRunOutDate(10, 'not-a-date')).toBeNull();
  });
});

describe('getFoodStatus', () => {
  const now = new Date('2026-10-27T12:00:00Z');
  const updatedAt = '2026-10-27T00:00:00Z';

  it('is ok when plenty of food remains', () => {
    expect(
      getFoodStatus({ stockGrams: 2000, dailyConsumptionGrams: 50, updatedAt, now }),
    ).toBe('ok');
  });

  it('is low at or below the threshold', () => {
    expect(
      getFoodStatus({ stockGrams: 250, dailyConsumptionGrams: 50, updatedAt, now }),
    ).toBe('low'); // exactly 5 days
    expect(
      getFoodStatus({ stockGrams: 100, dailyConsumptionGrams: 50, updatedAt, now }),
    ).toBe('low');
  });

  it('is ok just above the threshold', () => {
    expect(
      getFoodStatus({ stockGrams: 251, dailyConsumptionGrams: 50, updatedAt, now }),
    ).toBe('ok');
  });

  it('respects a custom threshold', () => {
    expect(
      getFoodStatus({
        stockGrams: 500,
        dailyConsumptionGrams: 50,
        updatedAt,
        now,
        lowThresholdDays: 10,
      }),
    ).toBe('low');
  });

  it('is exhausted when stock is exactly zero', () => {
    expect(
      getFoodStatus({ stockGrams: 0, dailyConsumptionGrams: 50, updatedAt, now }),
    ).toBe('exhausted');
    // exhausted wins even when consumption data is missing
    expect(
      getFoodStatus({ stockGrams: 0, dailyConsumptionGrams: null, updatedAt, now }),
    ).toBe('exhausted');
  });

  it('is overdue when the estimated run-out date has passed', () => {
    expect(
      getFoodStatus({
        stockGrams: 500,
        dailyConsumptionGrams: 50,
        updatedAt: '2026-10-01T00:00:00Z', // ran out ~2026-10-11
        now,
      }),
    ).toBe('overdue');
  });

  it('is unknown when stock data is missing or invalid', () => {
    expect(
      getFoodStatus({ stockGrams: null, dailyConsumptionGrams: 50, updatedAt, now }),
    ).toBe('unknown');
    expect(
      getFoodStatus({ stockGrams: NaN, dailyConsumptionGrams: 50, updatedAt, now }),
    ).toBe('unknown');
    expect(
      getFoodStatus({ stockGrams: -1, dailyConsumptionGrams: 50, updatedAt, now }),
    ).toBe('unknown');
  });

  it('is unknown when consumption is missing, zero, negative or invalid', () => {
    for (const consumption of [null, undefined, 0, -10, NaN, Infinity]) {
      expect(
        getFoodStatus({
          stockGrams: 1000,
          dailyConsumptionGrams: consumption as number | null,
          updatedAt,
          now,
        }),
      ).toBe('unknown');
    }
  });
});

describe('estimateDailyConsumption', () => {
  const now = new Date('2026-11-01T12:00:00Z');
  const daysAgo = (days: number, grams: number) => ({
    at: new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString(),
    stockGrams: grams,
  });

  it('returns null without at least two readings', () => {
    expect(estimateDailyConsumption(undefined, { now })).toBeNull();
    expect(estimateDailyConsumption([], { now })).toBeNull();
    expect(estimateDailyConsumption([daysAgo(3, 1000)], { now })).toBeNull();
  });

  it('estimates the drop over elapsed days for a simple pair', () => {
    const log = [daysAgo(10, 1000), daysAgo(4, 700)];
    expect(estimateDailyConsumption(log, { now })).toBe(50);
  });

  it('accumulates across multiple consuming segments', () => {
    const log = [daysAgo(20, 2000), daysAgo(10, 1500), daysAgo(5, 1200)];
    // 500 g over 10 days, then 300 g over 5 days → 800 g / 15 days
    expect(estimateDailyConsumption(log, { now })).toBeCloseTo(53.3, 1);
  });

  it('treats a stock increase as a restock and breaks the chain', () => {
    const log = [
      daysAgo(20, 2000),
      daysAgo(10, 1500), // consumed 500 g in 10 days
      daysAgo(5, 2400), // restock — the 900 g jump says nothing about consumption
      daysAgo(0, 2000), // consumed 400 g in 5 days
    ];
    expect(estimateDailyConsumption(log, { now })).toBeCloseTo(60, 1);
  });

  it('ignores flat readings without breaking the consuming chain', () => {
    const log = [daysAgo(10, 1000), daysAgo(6, 1000), daysAgo(4, 800)];
    // only the 200 g drop over 2 days counts
    expect(estimateDailyConsumption(log, { now })).toBe(100);
  });

  it('returns null when the stock never decreased', () => {
    const log = [daysAgo(10, 1000), daysAgo(5, 1200)];
    expect(estimateDailyConsumption(log, { now })).toBeNull();
  });

  it('returns null when coverage is below the minimum', () => {
    const log = [daysAgo(1, 1000), daysAgo(0.5, 900)];
    expect(estimateDailyConsumption(log, { now })).toBeNull();
    // but honors a lower custom minimum
    expect(estimateDailyConsumption(log, { now, minDaysCovered: 0.25 })).toBe(200);
  });

  it('ignores readings outside the window', () => {
    const log = [daysAgo(120, 3000), daysAgo(110, 2000), daysAgo(10, 900)];
    // only the 10-day segment inside the default 90-day window counts
    expect(estimateDailyConsumption(log, { now })).toBeNull();
    // a wider window picks up all three readings: 2100 g over 110 days
    expect(estimateDailyConsumption(log, { now, windowDays: 130 })).toBeCloseTo(19.1, 1);
  });

  it('ignores readings from the future and invalid entries', () => {
    const log = [
      daysAgo(10, 1000),
      { at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), stockGrams: 100 },
      { at: 'not-a-date', stockGrams: 500 },
      { at: daysAgo(2, 0).at, stockGrams: NaN },
      daysAgo(2, 800),
    ];
    expect(estimateDailyConsumption(log, { now })).toBe(25);
  });
});

describe('consumptionFromBagDuration', () => {
  it('divides the bag size by the days it lasts', () => {
    expect(consumptionFromBagDuration(3000, 20)).toBe(150);
    expect(consumptionFromBagDuration(150, 3)).toBe(50);
  });

  it('keeps one decimal place', () => {
    expect(consumptionFromBagDuration(1000, 3)).toBeCloseTo(333.3, 1);
  });

  it('returns null for invalid input', () => {
    expect(consumptionFromBagDuration(null, 10)).toBeNull();
    expect(consumptionFromBagDuration(1000, null)).toBeNull();
    expect(consumptionFromBagDuration(0, 10)).toBeNull();
    expect(consumptionFromBagDuration(1000, 0)).toBeNull();
    expect(consumptionFromBagDuration(-500, 10)).toBeNull();
    expect(consumptionFromBagDuration(1000, -2)).toBeNull();
    expect(consumptionFromBagDuration(NaN, 10)).toBeNull();
    expect(consumptionFromBagDuration(1000, Infinity)).toBeNull();
  });
});

describe('appendStockLogEntry', () => {  it('starts a new log when none exists', () => {
    const entry = { at: '2026-11-01T00:00:00Z', stockGrams: 1200 };
    expect(appendStockLogEntry(undefined, entry)).toEqual([entry]);
    expect(appendStockLogEntry([], entry)).toEqual([entry]);
  });

  it('appends to the existing log', () => {
    const log = [{ at: '2026-10-01T00:00:00Z', stockGrams: 2000 }];
    const entry = { at: '2026-11-01T00:00:00Z', stockGrams: 1200 };
    expect(appendStockLogEntry(log, entry)).toHaveLength(2);
    expect(appendStockLogEntry(log, entry)[1]).toEqual(entry);
  });

  it('drops the oldest entries past maxEntries', () => {
    const log = Array.from({ length: 60 }, (_, i) => ({
      at: `2026-09-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
      stockGrams: 1000 + i,
    }));
    const entry = { at: '2026-11-01T00:00:00Z', stockGrams: 1200 };
    const next = appendStockLogEntry(log, entry);
    expect(next).toHaveLength(60);
    expect(next[0].stockGrams).toBe(1001);
    expect(next[59]).toEqual(entry);
  });
});
