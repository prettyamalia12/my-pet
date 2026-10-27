import { createContext, useContext } from 'react';
import type { Pet } from '../types';

export interface PetsContextValue {
  pets: Pet[];
  selectedPet: Pet | null;
  selectedPetId: string | null;
  selectPet: (id: string) => void;
  addPet: (pet: Omit<Pet, 'id'>) => Pet;
  updatePet: (id: string, updates: Partial<Omit<Pet, 'id'>>) => void;
  removePet: (id: string) => void;
  resetToSample: () => void;
}

export const PetsContext = createContext<PetsContextValue | null>(null);

export function usePets(): PetsContextValue {
  const context = useContext(PetsContext);
  if (!context) throw new Error('usePets must be used within a PetsProvider');
  return context;
}

export function createPetId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pet-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
