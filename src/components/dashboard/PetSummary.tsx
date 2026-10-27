import type { Pet } from '../../types';
import { formatAge, formatDate, speciesEmoji } from '../../lib/age';
import type { PetStatus } from '../../lib/status';

interface PetSummaryProps {
  pet: Pet;
  status: PetStatus;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="text-sm font-semibold text-cocoa-500">{label}</dt>
      <dd className="text-right text-sm font-bold text-cocoa-900">{value}</dd>
    </div>
  );
}

export function PetSummary({ pet, status }: PetSummaryProps) {
  const foodLeft =
    status.daysOfFoodLeft !== null ? `${Math.floor(status.daysOfFoodLeft)} days` : '—';
  const runOut = status.runOutDate
    ? formatDate(status.runOutDate.toISOString().slice(0, 10))
    : '—';

  return (
    <section
      aria-labelledby="pet-summary-heading"
      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-700/5"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl ring-1 ring-cocoa-700/10"
          style={{ backgroundColor: pet.avatar.bodyColor }}
          aria-hidden="true"
        >
          {speciesEmoji(pet.species)}
        </span>
        <div>
          <h2 id="pet-summary-heading" className="text-xl font-extrabold text-cocoa-900">
            {pet.name}
          </h2>
          <p className="text-sm font-semibold text-cocoa-500">
            {pet.species[0].toUpperCase() + pet.species.slice(1)}
            {pet.breed ? ` · ${pet.breed}` : ''}
          </p>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-cocoa-700/5">
        <Row label="Age" value={formatAge(pet)} />
        {pet.weightKg !== undefined && (
          <Row label="Weight" value={`${pet.weightKg} kg`} />
        )}
        <Row label="Food left" value={foodLeft} />
        <Row label="Estimated run-out" value={runOut} />
        {pet.nextCareDate && (
          <Row
            label={pet.nextCareDate.label?.trim() || 'Next care date'}
            value={formatDate(pet.nextCareDate.date)}
          />
        )}
      </dl>

      {pet.notes && (
        <p className="mt-3 rounded-2xl bg-cream-100 p-3 text-sm text-cocoa-700">
          {pet.notes}
        </p>
      )}
    </section>
  );
}
