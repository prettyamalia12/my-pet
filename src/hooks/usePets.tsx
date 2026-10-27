import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Pet } from '../types';
import {
  SCHEMA_VERSION,
  createSeedState,
  loadState,
  saveState,
  type StoredState,
} from '../lib/storage';
import { PetsContext, createPetId, type PetsContextValue } from './pets-context';

export function PetsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const selectPet = useCallback((id: string) => {
    setState((prev) =>
      prev.pets.some((pet) => pet.id === id) ? { ...prev, selectedPetId: id } : prev,
    );
  }, []);

  const addPet = useCallback((pet: Omit<Pet, 'id'>): Pet => {
    const newPet: Pet = { ...pet, id: createPetId() };
    setState((prev) => ({
      ...prev,
      pets: [...prev.pets, newPet],
      selectedPetId: newPet.id,
    }));
    return newPet;
  }, []);

  const updatePet = useCallback((id: string, updates: Partial<Omit<Pet, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      pets: prev.pets.map((pet) => (pet.id === id ? { ...pet, ...updates } : pet)),
    }));
  }, []);

  const removePet = useCallback((id: string) => {
    setState((prev) => {
      const pets = prev.pets.filter((pet) => pet.id !== id);
      return {
        ...prev,
        pets,
        selectedPetId:
          prev.selectedPetId === id ? (pets[0]?.id ?? null) : prev.selectedPetId,
      };
    });
  }, []);

  const resetToSample = useCallback(() => {
    setState({ ...createSeedState(), version: SCHEMA_VERSION });
  }, []);

  const value = useMemo<PetsContextValue>(() => {
    const selectedPet = state.pets.find((pet) => pet.id === state.selectedPetId) ?? null;
    return {
      pets: state.pets,
      selectedPet,
      selectedPetId: state.selectedPetId,
      selectPet,
      addPet,
      updatePet,
      removePet,
      resetToSample,
    };
  }, [state, selectPet, addPet, updatePet, removePet, resetToSample]);

  return <PetsContext.Provider value={value}>{children}</PetsContext.Provider>;
}
