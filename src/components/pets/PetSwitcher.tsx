import type { Pet } from '../../types';
import { speciesEmoji } from '../../lib/age';

interface PetSwitcherProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function PetSwitcher({ pets, selectedPetId, onSelect, onAdd }: PetSwitcherProps) {
  return (
    <nav aria-label="Your pets" className="flex items-center gap-2 overflow-x-auto pb-1">
      {pets.map((pet) => {
        const selected = pet.id === selectedPetId;
        return (
          <button
            key={pet.id}
            type="button"
            onClick={() => onSelect(pet.id)}
            aria-pressed={selected}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-sm ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500 ${
              selected
                ? 'bg-peach-500 text-white ring-peach-500'
                : 'bg-white text-cocoa-700 ring-cocoa-700/10 hover:bg-cream-100'
            }`}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-xs ring-1 ring-cocoa-700/10"
              style={{ backgroundColor: pet.avatar.bodyColor }}
              aria-hidden="true"
            >
              {speciesEmoji(pet.species)}
            </span>
            {pet.name}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onAdd}
        className="shrink-0 rounded-full border-2 border-dashed border-peach-400 px-4 py-2 text-sm font-extrabold text-peach-600 transition hover:border-peach-500 hover:bg-peach-100/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
      >
        + Add pet
      </button>
    </nav>
  );
}
