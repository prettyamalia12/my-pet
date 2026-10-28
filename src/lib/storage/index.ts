import { SPECIES, type Pet, type Species } from '../../types';

export const STORAGE_KEY = 'pet-companion:v1';
export const SCHEMA_VERSION = 1;

export interface StoredState {
  version: number;
  pets: Pet[];
  selectedPetId: string | null;
}

export const SAMPLE_PET_ID = 'sample-mochi';

export function createSamplePet(): Pet {
  return {
    id: SAMPLE_PET_ID,
    name: 'Mochi',
    species: 'cat',
    breed: 'Scottish Fold mix',
    dateOfBirth: '2023-04-12',
    weightKg: 4.2,
    notes: 'Loves cardboard boxes and sunbeams. Fussy about wet food.',
    avatar: {
      bodyColor: '#ed9752',
      eyeColor: '#d9a441',
      collar: true,
      bow: false,
    },
    food: {
      stockAmount: 1.2,
      stockUnit: 'kg',
      dailyConsumptionGrams: 45,
      updatedAt: new Date().toISOString(),
    },
    nextCareDate: {
      date: '2026-11-08',
      label: 'Vaccination',
    },
  };
}

export function createSeedState(): StoredState {
  return {
    version: SCHEMA_VERSION,
    pets: [createSamplePet()],
    selectedPetId: SAMPLE_PET_ID,
  };
}

// ---- validation guards ---------------------------------------------------
// LocalStorage content is untrusted: it may be hand-edited, stale, or from an
// older version. These guards check shape and types so a corrupt value can
// never crash the app — we fall back to seeded sample data instead.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || (typeof value === 'number' && Number.isFinite(value));
}

function isSpecies(value: unknown): value is Species {
  return typeof value === 'string' && (SPECIES as readonly string[]).includes(value);
}

export function isPet(value: unknown): value is Pet {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || value.id.length === 0) return false;
  if (typeof value.name !== 'string' || value.name.length === 0) return false;
  if (!isSpecies(value.species)) return false;
  if (!isOptionalString(value.breed)) return false;
  if (!isOptionalString(value.dateOfBirth)) return false;
  if (!isOptionalNumber(value.approximateAgeYears)) return false;
  if (!isOptionalNumber(value.weightKg)) return false;
  if (!isOptionalString(value.notes)) return false;
  // At least one path to compute an age.
  if (value.dateOfBirth === undefined && value.approximateAgeYears === undefined) {
    return false;
  }

  const avatar = value.avatar;
  if (!isRecord(avatar)) return false;
  if (typeof avatar.bodyColor !== 'string') return false;
  if (typeof avatar.eyeColor !== 'string') return false;
  if (typeof avatar.collar !== 'boolean') return false;
  if (typeof avatar.bow !== 'boolean') return false;

  const food = value.food;
  if (!isRecord(food)) return false;
  if (typeof food.stockAmount !== 'number' || !Number.isFinite(food.stockAmount)) return false;
  if (food.stockUnit !== 'g' && food.stockUnit !== 'kg') return false;
  if (
    food.dailyConsumptionGrams !== null &&
    (typeof food.dailyConsumptionGrams !== 'number' ||
      !Number.isFinite(food.dailyConsumptionGrams))
  ) {
    return false;
  }
  if (typeof food.updatedAt !== 'string') return false;

  if (value.nextCareDate !== undefined) {
    if (!isRecord(value.nextCareDate)) return false;
    if (typeof value.nextCareDate.date !== 'string') return false;
    if (!isOptionalString(value.nextCareDate.label)) return false;
  }

  return true;
}

function isStoredState(value: unknown): value is StoredState {
  if (!isRecord(value)) return false;
  if (value.version !== SCHEMA_VERSION) return false;
  if (!Array.isArray(value.pets) || !value.pets.every(isPet)) return false;
  if (value.selectedPetId !== null && typeof value.selectedPetId !== 'string') return false;
  return true;
}

// ---- public API -----------------------------------------------------------

/** Load state from LocalStorage, falling back to seeded sample data on any problem. */
export function loadState(): StoredState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return createSeedState();
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredState(parsed)) return createSeedState();
    // Keep the selection pointing at a pet that actually exists.
    const selectedExists = parsed.pets.some((pet) => pet.id === parsed.selectedPetId);
    return {
      ...parsed,
      selectedPetId: selectedExists ? parsed.selectedPetId : (parsed.pets[0]?.id ?? null),
    };
  } catch {
    return createSeedState();
  }
}

export function saveState(state: StoredState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable (private mode) — the app keeps working in memory.
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
