import { useRef, useState } from 'react';
import type { Pet, PetFormValues } from '../../types';
import { usePets } from '../../hooks/pets-context';
import { derivePetStatus } from '../../lib/status';
import { AvatarCanvas } from '../avatar/AvatarCanvas';
import { AvatarCustomizer } from '../avatar/AvatarCustomizer';
import { PetSwitcher } from '../pets/PetSwitcher';
import { PetForm } from '../pets/PetForm';
import { EmptyState } from '../pets/EmptyState';
import { Modal } from '../ui/Modal';
import { StatusBanner } from './StatusBanner';
import { PetSummary } from './PetSummary';
import { QuickActions } from './QuickActions';
import { FoodCard, type FoodCardHandle } from './FoodCard';
import { CareCard } from './CareCard';

function formValuesToPet(values: PetFormValues, base?: Pet): Omit<Pet, 'id'> {
  return {
    name: values.name,
    species: values.species === '' ? 'other' : values.species,
    breed: values.breed || undefined,
    dateOfBirth: values.dateOfBirth || undefined,
    approximateAgeYears:
      values.approximateAgeYears.trim().length > 0
        ? Number(values.approximateAgeYears)
        : undefined,
    weightKg: values.weightKg.trim().length > 0 ? Number(values.weightKg) : undefined,
    notes: values.notes.trim() || undefined,
    avatar: base?.avatar ?? {
      bodyColor: '#f2dfc8',
      eyeColor: '#d9a441',
      collar: false,
      bow: false,
    },
    food: base?.food ?? {
      stockAmount: 1,
      stockUnit: 'kg',
      dailyConsumptionGrams: null,
      updatedAt: new Date().toISOString(),
    },
    nextCareDate: base?.nextCareDate,
  };
}

export function Dashboard() {
  const {
    pets,
    selectedPet,
    selectedPetId,
    selectPet,
    addPet,
    updatePet,
    resetToSample,
  } = usePets();

  const [petFormOpen, setPetFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | undefined>(undefined);
  const [confirmReset, setConfirmReset] = useState(false);

  const foodCardRef = useRef<FoodCardHandle>(null);
  const foodSectionRef = useRef<HTMLDivElement>(null);
  const customizerRef = useRef<HTMLDivElement>(null);

  const openAddPet = () => {
    setEditingPet(undefined);
    setPetFormOpen(true);
  };
  const openEditPet = () => {
    setEditingPet(selectedPet ?? undefined);
    setPetFormOpen(true);
  };
  const scrollToFood = () => {
    foodSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    foodCardRef.current?.openForm();
  };
  const scrollToCustomizer = () => {
    customizerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handlePetSubmit = (values: PetFormValues) => {
    if (editingPet) {
      updatePet(editingPet.id, formValuesToPet(values, editingPet));
    } else {
      addPet(formValuesToPet(values));
    }
    setPetFormOpen(false);
    setEditingPet(undefined);
  };

  const status = selectedPet ? derivePetStatus(selectedPet) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-cream-100 to-peach-100/60 text-cocoa-900">
      <header className="sticky top-0 z-40 border-b border-cocoa-700/5 bg-cream-50/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <h1 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-cocoa-900">
            <span aria-hidden="true" className="text-2xl">
              🐾
            </span>
            Pet Companion
          </h1>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="rounded-full px-3 py-1.5 text-xs font-bold text-cocoa-500 transition hover:bg-cream-100 hover:text-cocoa-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
          >
            Reset sample data
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <PetSwitcher
          pets={pets}
          selectedPetId={selectedPetId}
          onSelect={selectPet}
          onAdd={openAddPet}
        />

        {selectedPet && status ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Avatar hero panel */}
            <div className="space-y-6">
              <div className="h-[420px] overflow-hidden rounded-3xl bg-gradient-to-b from-white to-cream-100 shadow-sm ring-1 ring-cocoa-700/5 sm:h-[480px] lg:h-[560px]">
                <AvatarCanvas
                  key={selectedPet.id}
                  config={selectedPet.avatar}
                  petName={selectedPet.name}
                />
              </div>
              <div ref={customizerRef} className="scroll-mt-24">
                <AvatarCustomizer
                  config={selectedPet.avatar}
                  onChange={(updates) =>
                    updatePet(selectedPet.id, {
                      avatar: { ...selectedPet.avatar, ...updates },
                    })
                  }
                />
              </div>
            </div>

            {/* Info cards */}
            <div className="space-y-4">
              <StatusBanner status={status} />
              <PetSummary pet={selectedPet} status={status} />
              <QuickActions
                onEditPet={openEditPet}
                onUpdateFood={scrollToFood}
                onCustomizeAvatar={scrollToCustomizer}
              />
              <div ref={foodSectionRef} className="scroll-mt-24">
                <FoodCard
                  key={selectedPet.id}
                  ref={foodCardRef}
                  pet={selectedPet}
                  onSave={(food) => updatePet(selectedPet.id, { food })}
                />
              </div>
              <CareCard
                key={`care-${selectedPet.id}`}
                pet={selectedPet}
                onSave={(nextCareDate) => updatePet(selectedPet.id, { nextCareDate })}
              />
            </div>
          </div>
        ) : (
          <EmptyState onAddPet={openAddPet} onResetSample={resetToSample} />
        )}
      </main>

      {petFormOpen && (
        <PetForm
          initialPet={editingPet}
          onSubmit={handlePetSubmit}
          onClose={() => {
            setPetFormOpen(false);
            setEditingPet(undefined);
          }}
        />
      )}

      {confirmReset && (
        <Modal title="Reset sample data?" onClose={() => setConfirmReset(false)}>
          <p className="text-sm text-cocoa-700">
            This replaces all current pets with the sample pet Mochi. Anything you've
            added will be lost.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="rounded-xl px-4 py-2 text-sm font-bold text-cocoa-500 transition hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                resetToSample();
                setConfirmReset(false);
              }}
              className="rounded-xl bg-red-500 px-5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              Yes, reset
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
