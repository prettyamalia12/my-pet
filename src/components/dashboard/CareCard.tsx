import { useState, type FormEvent } from 'react';
import type { CareEvent, Pet } from '../../types';
import { formatDate, formatDaysUntil } from '../../lib/age';

interface CareCardProps {
  pet: Pet;
  onSave: (care: CareEvent | undefined) => void;
}

const inputClass =
  'mt-1 w-full rounded-xl border border-cocoa-700/15 bg-cream-50 px-3 py-2 text-sm text-cocoa-900 focus:border-peach-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-peach-500/50';
const labelClass = 'block text-sm font-bold text-cocoa-700';

/** Optional next vet-visit / vaccination date with a free-text label. */
export function CareCard({ pet, onSave }: CareCardProps) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(pet.nextCareDate?.date ?? '');
  const [label, setLabel] = useState(pet.nextCareDate?.label ?? '');

  const openForm = () => {
    setDate(pet.nextCareDate?.date ?? '');
    setLabel(pet.nextCareDate?.label ?? '');
    setEditing(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!date) return; // native-required guard
    onSave({ date, label: label.trim() || undefined });
    setEditing(false);
  };

  return (
    <section
      aria-labelledby="care-card-heading"
      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-700/5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="care-card-heading" className="text-lg font-extrabold text-cocoa-900">
          🩺 Next care
        </h2>
        {!editing && (
          <button
            type="button"
            onClick={openForm}
            className="rounded-xl bg-cream-100 px-3 py-1.5 text-xs font-extrabold text-cocoa-700 transition hover:bg-peach-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
          >
            {pet.nextCareDate ? 'Edit' : 'Add date'}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="care-date" className={labelClass}>
              Date
            </label>
            <input
              id="care-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="care-label" className={labelClass}>
              Label <span className="font-normal text-cocoa-500">(optional)</span>
            </label>
            <input
              id="care-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g. "Vet visit" or "Vaccination"'
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl px-4 py-2 text-sm font-bold text-cocoa-500 transition hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-peach-500 px-5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-peach-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
            >
              Save
            </button>
          </div>
        </form>
      ) : pet.nextCareDate ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-sm text-cocoa-700">
            <span className="font-bold text-cocoa-900">
              {pet.nextCareDate.label?.trim() || 'Care appointment'}
            </span>{' '}
            · {formatDate(pet.nextCareDate.date)}
            {formatDaysUntil(pet.nextCareDate.date) && (
              <span className="font-semibold text-cocoa-500">
                {' '}
                ({formatDaysUntil(pet.nextCareDate.date)})
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={() => onSave(undefined)}
            className="rounded-xl px-3 py-1.5 text-xs font-bold text-cocoa-500 transition hover:bg-cream-100 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
          >
            Remove
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-cocoa-500">
          No upcoming vet visit or vaccination planned.
        </p>
      )}
    </section>
  );
}
