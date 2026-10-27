import type { Pet } from '../types';

function pluralize(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? '' : 's'}`;
}

/** Human-friendly age, from date of birth when known, else the approximate age. */
export function formatAge(pet: Pet, now: Date = new Date()): string {
  if (pet.dateOfBirth) {
    const dob = new Date(pet.dateOfBirth);
    if (!Number.isNaN(dob.getTime()) && dob.getTime() <= now.getTime()) {
      let years = now.getFullYear() - dob.getFullYear();
      let months = now.getMonth() - dob.getMonth();
      if (now.getDate() < dob.getDate()) months -= 1;
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      if (years <= 0 && months <= 0) return 'Less than a month old';
      if (years <= 0) return pluralize(months, 'month');
      if (months === 0) return pluralize(years, 'year');
      return `${pluralize(years, 'year')} ${pluralize(months, 'month')}`;
    }
  }
  if (typeof pet.approximateAgeYears === 'number' && pet.approximateAgeYears >= 0) {
    if (pet.approximateAgeYears === 0) return 'Under a year old (approx.)';
    return `About ${pluralize(pet.approximateAgeYears, 'year')} old`;
  }
  return 'Age unknown';
}

const SPECIES_EMOJI: Record<string, string> = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  bird: '🐦',
  other: '🐾',
};

export function speciesEmoji(species: string): string {
  return SPECIES_EMOJI[species] ?? '🐾';
}

/** "in 5 days" / "today" / "in 1 day" — null when the date is invalid or past. */
export function formatDaysUntil(isoDate: string, now: Date = new Date()): string | null {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = date.getTime() - startOfToday.getTime();
  const days = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (days < 0) return null;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export function daysUntil(isoDate: string, now: Date = new Date()): number | null {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((date.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000));
}

export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
