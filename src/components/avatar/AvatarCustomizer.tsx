import type { AvatarConfig } from '../../types';
import { ACCENT_COLORS, BODY_COLORS, CAT_BREEDS, EYE_COLORS, PATCH_COLORS } from './avatar-options';

interface AvatarCustomizerProps {
  config: AvatarConfig;
  onChange: (updates: Partial<AvatarConfig>) => void;
}

interface ColorOption {
  value: string;
  label: string;
}

/** input[type=color] only accepts #rrggbb; fall back to a neutral cream. */
function toHexColor(value: string | undefined): string {
  return value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#fdf8f0';
}

function ColorSwatches({
  options,
  groupLabel,
  selectedValue,
  onSelect,
  onCustom,
}: {
  options: readonly ColorOption[];
  groupLabel: string;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
  onCustom: (value: string) => void;
}) {
  const isCustom = selectedValue != null && !options.some((color) => color.value === selectedValue);
  return (
    <fieldset>
      <legend className="text-sm font-bold text-cocoa-700">{groupLabel}</legend>
      <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label={groupLabel}>
        {options.map((color) => {
          const selected = selectedValue === color.value;
          return (
            <button
              key={color.value}
              type="button"
              onClick={() => onSelect(color.value)}
              aria-pressed={selected}
              aria-label={`${groupLabel}: ${color.label}`}
              title={color.label}
              className={`h-10 w-10 rounded-full shadow-inner ring-2 ring-offset-2 ring-offset-white transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peach-500 ${
                selected ? 'ring-peach-500 scale-110' : 'ring-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
            />
          );
        })}
        <label
          title="Custom color"
          className={`relative h-10 w-10 cursor-pointer rounded-full shadow-inner ring-2 ring-offset-2 ring-offset-white transition focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-peach-500 ${
            isCustom ? 'ring-peach-500 scale-110' : 'ring-transparent hover:scale-105'
          }`}
          style={{
            background: 'conic-gradient(#f28b9a, #f0c04a, #9fd68a, #39c5cf, #7a9df5, #c39af0, #f28b9a)',
          }}
        >
          <input
            type="color"
            value={toHexColor(selectedValue)}
            onChange={(event) => onCustom(event.target.value)}
            aria-label={`${groupLabel}: custom color`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[7px] rounded-full border border-white/80 shadow-sm"
            style={{ backgroundColor: toHexColor(selectedValue) }}
          />
        </label>
      </div>
    </fieldset>
  );
}

export function AvatarCustomizer({ config, onChange }: AvatarCustomizerProps) {
  return (
    <section
      aria-labelledby="avatar-customizer-heading"
      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-700/5"
    >
      <h2 id="avatar-customizer-heading" className="text-lg font-extrabold text-cocoa-900">
        Style the avatar
      </h2>

      <div className="mt-4 space-y-4">
        <fieldset>
          <legend className="text-sm font-bold text-cocoa-700">Breed</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Breed">
            {CAT_BREEDS.map((breed) => {
              const selected = (config.breed ?? CAT_BREEDS[0].id) === breed.id;
              return (
                <button
                  key={breed.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      breed: breed.id,
                      bodyColor: breed.bodyColor,
                      secondaryColor: breed.secondaryColor,
                      accentColor: breed.accentColor,
                    })
                  }
                  aria-pressed={selected}
                  className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500 ${
                    selected
                      ? 'bg-peach-500 text-white shadow-sm'
                      : 'bg-cream-100 text-cocoa-700 hover:bg-cream-50'
                  }`}
                >
                  {breed.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <ColorSwatches
          options={BODY_COLORS}
          groupLabel="Fur color"
          selectedValue={config.bodyColor}
          onSelect={(value) => onChange({ bodyColor: value })}
          onCustom={(value) => onChange({ bodyColor: value })}
        />
        <ColorSwatches
          options={PATCH_COLORS}
          groupLabel="Patch color"
          selectedValue={config.secondaryColor}
          onSelect={(value) => onChange({ secondaryColor: value })}
          onCustom={(value) => onChange({ secondaryColor: value })}
        />
        <ColorSwatches
          options={ACCENT_COLORS}
          groupLabel="Accent color"
          selectedValue={config.accentColor}
          onSelect={(value) => onChange({ accentColor: value })}
          onCustom={(value) => onChange({ accentColor: value })}
        />
        <ColorSwatches
          options={EYE_COLORS}
          groupLabel="Eye color"
          selectedValue={config.eyeColor}
          onSelect={(value) => onChange({ eyeColor: value })}
          onCustom={(value) => onChange({ eyeColor: value })}
        />

        <div className="flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-cream-100 px-4 py-2.5 text-sm font-bold text-cocoa-700 transition hover:bg-cream-50 has-checked:bg-peach-100 has-checked:text-cocoa-900 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-peach-500">
            <input
              type="checkbox"
              checked={config.collar}
              onChange={(event) => onChange({ collar: event.target.checked })}
              className="h-4 w-4 accent-peach-500"
            />
            Collar &amp; bell
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-cream-100 px-4 py-2.5 text-sm font-bold text-cocoa-700 transition hover:bg-cream-50 has-checked:bg-peach-100 has-checked:text-cocoa-900 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-peach-500">
            <input
              type="checkbox"
              checked={config.bow}
              onChange={(event) => onChange({ bow: event.target.checked })}
              className="h-4 w-4 accent-peach-500"
            />
            Bow
          </label>
        </div>
      </div>
    </section>
  );
}
