import { useState, type FormEvent } from 'react';
import { SPECIES, type Pet, type PetFormValues, type Species } from '../../types';
import { Modal } from '../ui/Modal';

interface PetFormProps {
  /** When provided the form edits that pet; otherwise it creates a new one. */
  initialPet?: Pet;
  onSubmit: (values: PetFormValues) => void;
  onClose: () => void;
}

type Errors = Partial<Record<keyof PetFormValues, string>>;

const inputClass =
  'mt-1 w-full rounded-xl border border-cocoa-700/15 bg-cream-50 px-3 py-2 text-sm text-cocoa-900 placeholder:text-cocoa-500/60 focus:border-peach-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-peach-500/50';
const labelClass = 'block text-sm font-bold text-cocoa-700';
const errorClass = 'mt-1 text-xs font-semibold text-red-600';

function valuesFromPet(pet: Pet): PetFormValues {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? '',
    dateOfBirth: pet.dateOfBirth ?? '',
    approximateAgeYears:
      pet.approximateAgeYears !== undefined ? String(pet.approximateAgeYears) : '',
    weightKg: pet.weightKg !== undefined ? String(pet.weightKg) : '',
    notes: pet.notes ?? '',
  };
}

const EMPTY_VALUES: PetFormValues = {
  name: '',
  species: '',
  breed: '',
  dateOfBirth: '',
  approximateAgeYears: '',
  weightKg: '',
  notes: '',
};

function validate(values: PetFormValues): Errors {
  const errors: Errors = {};
  if (values.name.trim().length === 0) errors.name = 'Please give your pet a name.';
  if (values.species === '') errors.species = 'Please choose a species.';

  const hasDob = values.dateOfBirth.trim().length > 0;
  const approxRaw = values.approximateAgeYears.trim();
  const hasApprox = approxRaw.length > 0;
  if (!hasDob && !hasApprox) {
    errors.approximateAgeYears =
      'Enter a date of birth or an approximate age — at least one is needed.';
  }
  if (hasApprox) {
    const approx = Number(approxRaw);
    if (!Number.isFinite(approx) || approx < 0 || approx > 60) {
      errors.approximateAgeYears = 'Approximate age must be a number between 0 and 60.';
    }
  }
  if (values.weightKg.trim().length > 0) {
    const weight = Number(values.weightKg);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 200) {
      errors.weightKg = 'Weight must be a positive number (kg).';
    }
  }
  return errors;
}

export function PetForm({ initialPet, onSubmit, onClose }: PetFormProps) {
  const [values, setValues] = useState<PetFormValues>(() =>
    initialPet ? valuesFromPet(initialPet) : EMPTY_VALUES,
  );
  const [errors, setErrors] = useState<Errors>({});
  const [showApproxHelp, setShowApproxHelp] = useState(false);

  const set = (field: keyof PetFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    onSubmit({ ...values, name: values.name.trim(), breed: values.breed.trim() });
  };

  return (
    <Modal title={initialPet ? `Edit ${initialPet.name}` : 'Add a new pet'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="pet-name" className={labelClass}>
            Name <span aria-hidden="true" className="text-peach-600">*</span>
          </label>
          <input
            id="pet-name"
            type="text"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'pet-name-error' : undefined}
            placeholder="e.g. Mochi"
            className={inputClass}
            required
          />
          {errors.name && (
            <p id="pet-name-error" className={errorClass} role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="pet-species" className={labelClass}>
            Species <span aria-hidden="true" className="text-peach-600">*</span>
          </label>
          <select
            id="pet-species"
            value={values.species}
            onChange={(e) => set('species', e.target.value as Species)}
            aria-invalid={Boolean(errors.species)}
            aria-describedby={errors.species ? 'pet-species-error' : undefined}
            className={inputClass}
            required
          >
            <option value="">Select a species…</option>
            {SPECIES.map((species) => (
              <option key={species} value={species}>
                {species[0].toUpperCase() + species.slice(1)}
              </option>
            ))}
          </select>
          {errors.species && (
            <p id="pet-species-error" className={errorClass} role="alert">
              {errors.species}
            </p>
          )}
          <p className="mt-1 text-xs text-cocoa-500">
            The 3D avatar is a cat for now — other species still get full tracking.
          </p>
        </div>

        <div>
          <label htmlFor="pet-breed" className={labelClass}>
            Breed <span className="font-normal text-cocoa-500">(optional)</span>
          </label>
          <input
            id="pet-breed"
            type="text"
            value={values.breed}
            onChange={(e) => set('breed', e.target.value)}
            placeholder="e.g. Scottish Fold mix"
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pet-dob" className={labelClass}>
              Date of birth
            </label>
            <input
              id="pet-dob"
              type="date"
              value={values.dateOfBirth}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set('dateOfBirth', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="pet-approx-age" className={labelClass}>
                Approx. age (years)
              </label>
              <button
                type="button"
                onClick={() => setShowApproxHelp((v) => !v)}
                aria-label="Why do I need date of birth or approximate age?"
                aria-expanded={showApproxHelp}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-cream-100 text-[11px] font-extrabold text-cocoa-500 transition hover:bg-peach-100 focus-visible:outline-2 focus-visible:outline-peach-500"
              >
                ?
              </button>
            </div>
            <input
              id="pet-approx-age"
              type="number"
              min={0}
              max={60}
              step="0.5"
              inputMode="decimal"
              value={values.approximateAgeYears}
              onChange={(e) => set('approximateAgeYears', e.target.value)}
              aria-invalid={Boolean(errors.approximateAgeYears)}
              aria-describedby={
                errors.approximateAgeYears ? 'pet-approx-age-error' : undefined
              }
              placeholder="e.g. 3"
              className={inputClass}
            />
            {errors.approximateAgeYears && (
              <p id="pet-approx-age-error" className={errorClass} role="alert">
                {errors.approximateAgeYears}
              </p>
            )}
            {showApproxHelp && (
              <p className="mt-1 rounded-lg bg-cream-100 p-2 text-xs text-cocoa-700">
                Fill in either the date of birth or an approximate age — whichever you
                know. We use it to show your pet's age on the dashboard.
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="pet-weight" className={labelClass}>
            Weight (kg) <span className="font-normal text-cocoa-500">(optional)</span>
          </label>
          <input
            id="pet-weight"
            type="number"
            min={0}
            step="0.1"
            inputMode="decimal"
            value={values.weightKg}
            onChange={(e) => set('weightKg', e.target.value)}
            aria-invalid={Boolean(errors.weightKg)}
            aria-describedby="pet-weight-hint"
            placeholder="e.g. 4.2"
            className={inputClass}
          />
          {errors.weightKg ? (
            <p className={errorClass} role="alert">
              {errors.weightKg}
            </p>
          ) : (
            <p id="pet-weight-hint" className="mt-1 text-xs text-cocoa-500">
              Handy for vet visits, but you can skip it — it's never required.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="pet-notes" className={labelClass}>
            Notes <span className="font-normal text-cocoa-500">(optional)</span>
          </label>
          <textarea
            id="pet-notes"
            rows={3}
            value={values.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Quirks, allergies, favourite snacks…"
            className={inputClass}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-bold text-cocoa-500 transition hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-peach-500 px-5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-peach-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
          >
            {initialPet ? 'Save changes' : 'Add pet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
