import {
  forwardRef,
  useImperativeHandle,
  useState,
  type FormEvent,
} from 'react';
import type { FoodStock, Pet, StockUnit } from '../../types';
import { formatDate } from '../../lib/age';

export interface FoodCardHandle {
  openForm: () => void;
}

interface FoodCardProps {
  pet: Pet;
  onSave: (food: FoodStock) => void;
}

const inputClass =
  'mt-1 w-full rounded-xl border border-cocoa-700/15 bg-cream-50 px-3 py-2 text-sm text-cocoa-900 focus:border-peach-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-peach-500/50';
const labelClass = 'block text-sm font-bold text-cocoa-700';

/** Card showing current food stock with an inline "update food" form. */
export const FoodCard = forwardRef<FoodCardHandle, FoodCardProps>(function FoodCard(
  { pet, onSave },
  ref,
) {
  const [editing, setEditing] = useState(false);
  const [stockAmount, setStockAmount] = useState(String(pet.food.stockAmount));
  const [stockUnit, setStockUnit] = useState<StockUnit>(pet.food.stockUnit);
  const [consumption, setConsumption] = useState(
    pet.food.dailyConsumptionGrams !== null ? String(pet.food.dailyConsumptionGrams) : '',
  );
  const [error, setError] = useState<string | null>(null);

  const openForm = () => {
    setStockAmount(String(pet.food.stockAmount));
    setStockUnit(pet.food.stockUnit);
    setConsumption(
      pet.food.dailyConsumptionGrams !== null ? String(pet.food.dailyConsumptionGrams) : '',
    );
    setError(null);
    setEditing(true);
  };

  useImperativeHandle(ref, () => ({ openForm }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(stockAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Stock amount must be a non-negative number.');
      return;
    }
    let daily: number | null = null;
    if (consumption.trim().length > 0) {
      const parsed = Number(consumption);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setError('Daily consumption must be a positive number of grams (or left empty).');
        return;
      }
      daily = parsed;
    }
    setError(null);
    onSave({
      stockAmount: amount,
      stockUnit,
      dailyConsumptionGrams: daily,
      updatedAt: new Date().toISOString(),
    });
    setEditing(false);
  };

  return (
    <section
      aria-labelledby="food-card-heading"
      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-700/5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="food-card-heading" className="text-lg font-extrabold text-cocoa-900">
          🥣 Food stock
        </h2>
        {!editing && (
          <button
            type="button"
            onClick={openForm}
            className="rounded-xl bg-cream-100 px-3 py-1.5 text-xs font-extrabold text-cocoa-700 transition hover:bg-peach-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
          >
            Update food
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <label htmlFor="food-stock" className={labelClass}>
                Food in stock
              </label>
              <input
                id="food-stock"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={stockAmount}
                onChange={(e) => {
                  setStockAmount(e.target.value);
                  setError(null);
                }}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="food-unit" className={labelClass}>
                Unit
              </label>
              <select
                id="food-unit"
                value={stockUnit}
                onChange={(e) => setStockUnit(e.target.value as StockUnit)}
                className={inputClass}
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="food-consumption" className={labelClass}>
              Daily consumption (grams/day)
            </label>
            <input
              id="food-consumption"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              value={consumption}
              onChange={(e) => {
                setConsumption(e.target.value);
                setError(null);
              }}
              placeholder="e.g. 45"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-cocoa-500">
              Not sure? Weigh the bowl before and after a day, or check the feeding guide
              on the bag. Leave empty if unknown — we won't guess.
            </p>
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700" role="alert">
              {error}
            </p>
          )}
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
      ) : (
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="font-semibold text-cocoa-500">In stock</dt>
            <dd className="font-bold text-cocoa-900">
              {pet.food.stockAmount} {pet.food.stockUnit}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-semibold text-cocoa-500">Daily consumption</dt>
            <dd className="font-bold text-cocoa-900">
              {pet.food.dailyConsumptionGrams !== null
                ? `${pet.food.dailyConsumptionGrams} g/day`
                : 'not set'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-semibold text-cocoa-500">Last updated</dt>
            <dd className="font-bold text-cocoa-900">
              {formatDate(pet.food.updatedAt.slice(0, 10))}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
});
