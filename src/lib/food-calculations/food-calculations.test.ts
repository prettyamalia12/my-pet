import { describe, expect, it } from 'vitest';
import {
  daysRemaining,
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
