export const SPECIES = ['cat', 'dog', 'rabbit', 'bird', 'other'] as const;
export type Species = (typeof SPECIES)[number];

export type StockUnit = 'g' | 'kg';

export interface AvatarConfig {
  bodyColor: string;
  eyeColor: string;
  collar: boolean;
  bow: boolean;
}

export interface FoodStock {
  stockAmount: number;
  stockUnit: StockUnit;
  dailyConsumptionGrams: number | null;
  /** ISO timestamp of when the stock amount was last confirmed by the user. */
  updatedAt: string;
}

export interface CareEvent {
  /** ISO date (yyyy-mm-dd). */
  date: string;
  label?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed?: string;
  /** ISO date string. Either this or approximateAgeYears must be present. */
  dateOfBirth?: string;
  approximateAgeYears?: number;
  weightKg?: number;
  notes?: string;
  avatar: AvatarConfig;
  food: FoodStock;
  nextCareDate?: CareEvent;
}

export interface PetFormValues {
  name: string;
  species: Species | '';
  breed: string;
  dateOfBirth: string;
  approximateAgeYears: string;
  weightKg: string;
  notes: string;
}
