import type { AvatarConfig } from '../../types';
import { BODY_COLORS, EYE_COLORS } from './avatar-options';

interface AvatarCustomizerProps {
  config: AvatarConfig;
  onChange: (updates: Partial<AvatarConfig>) => void;
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
          <legend className="text-sm font-bold text-cocoa-700">Fur color</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Fur color">
            {BODY_COLORS.map((color) => {
              const selected = config.bodyColor === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => onChange({ bodyColor: color.value })}
                  aria-pressed={selected}
                  aria-label={`Fur color: ${color.label}`}
                  title={color.label}
                  className={`h-10 w-10 rounded-full shadow-inner ring-2 ring-offset-2 ring-offset-white transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peach-500 ${
                    selected ? 'ring-peach-500 scale-110' : 'ring-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-bold text-cocoa-700">Eye color</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Eye color">
            {EYE_COLORS.map((color) => {
              const selected = config.eyeColor === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => onChange({ eyeColor: color.value })}
                  aria-pressed={selected}
                  aria-label={`Eye color: ${color.label}`}
                  title={color.label}
                  className={`h-10 w-10 rounded-full shadow-inner ring-2 ring-offset-2 ring-offset-white transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peach-500 ${
                    selected ? 'ring-peach-500 scale-110' : 'ring-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              );
            })}
          </div>
        </fieldset>

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
