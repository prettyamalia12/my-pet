import type { Pet } from '../types';
import { daysRemaining, estimateRunOutDate, getFoodStatus, toGrams } from './food-calculations';
import { daysUntil, formatDate } from './age';

/** A care event counts as "upcoming" when it is at most this many days away. */
export const UPCOMING_CARE_WINDOW_DAYS = 14;

export type PetStatusKind =
  | 'exhausted'
  | 'overdue'
  | 'low'
  | 'care'
  | 'unknown'
  | 'ok';

export interface PetStatus {
  kind: PetStatusKind;
  message: string;
  daysOfFoodLeft: number | null;
  runOutDate: Date | null;
}

/**
 * Derives ONE clear status per pet. Priority order when several apply:
 * exhausted/overdue > low food > upcoming care > missing data > ok.
 */
export function derivePetStatus(pet: Pet, now: Date = new Date()): PetStatus {
  const stockGrams = toGrams(pet.food.stockAmount, pet.food.stockUnit);
  const days = daysRemaining(stockGrams, pet.food.dailyConsumptionGrams);
  const runOut =
    days !== null ? estimateRunOutDate(days, pet.food.updatedAt ?? now) : null;
  const foodStatus = getFoodStatus({
    stockGrams,
    dailyConsumptionGrams: pet.food.dailyConsumptionGrams,
    updatedAt: pet.food.updatedAt,
    now,
  });

  if (foodStatus === 'exhausted') {
    return {
      kind: 'exhausted',
      message: `${pet.name}'s food has run out — time to restock!`,
      daysOfFoodLeft: days,
      runOutDate: runOut,
    };
  }
  if (foodStatus === 'overdue') {
    return {
      kind: 'overdue',
      message: `By our estimate ${pet.name}'s food ran out around ${
        runOut ? formatDate(runOut.toISOString().slice(0, 10)) : 'a while ago'
      }. Please check the bowl and update the stock.`,
      daysOfFoodLeft: days,
      runOutDate: runOut,
    };
  }
  if (foodStatus === 'low') {
    const wholeDays = days !== null ? Math.floor(days) : null;
    return {
      kind: 'low',
      message: `${pet.name}'s food may run out in ${wholeDays ?? 'a few'} day${
        wholeDays === 1 ? '' : 's'
      }${runOut ? ` (around ${formatDate(runOut.toISOString().slice(0, 10))})` : ''}.`,
      daysOfFoodLeft: days,
      runOutDate: runOut,
    };
  }

  if (pet.nextCareDate) {
    const inDays = daysUntil(pet.nextCareDate.date, now);
    if (inDays !== null && inDays >= 0 && inDays <= UPCOMING_CARE_WINDOW_DAYS) {
      const label = pet.nextCareDate.label?.trim() || 'Care appointment';
      const when = inDays === 0 ? 'today' : inDays === 1 ? 'tomorrow' : `in ${inDays} days`;
      return {
        kind: 'care',
        message: `${label} for ${pet.name} is coming up ${when} (${formatDate(
          pet.nextCareDate.date,
        )}).`,
        daysOfFoodLeft: days,
        runOutDate: runOut,
      };
    }
  }

  if (foodStatus === 'unknown') {
    const missingConsumption =
      pet.food.dailyConsumptionGrams === null || pet.food.dailyConsumptionGrams <= 0;
    return {
      kind: 'unknown',
      message: missingConsumption
        ? `Add ${pet.name}'s daily food consumption to see how long the food will last.`
        : `Add ${pet.name}'s current food stock to see how long it will last.`,
      daysOfFoodLeft: days,
      runOutDate: runOut,
    };
  }

  return {
    kind: 'ok',
    message: `${pet.name} has about ${days !== null ? Math.floor(days) : '?'} days of food left${
      runOut ? ` — restock by ${formatDate(runOut.toISOString().slice(0, 10))}` : ''
    }.`,
    daysOfFoodLeft: days,
    runOutDate: runOut,
  };
}
