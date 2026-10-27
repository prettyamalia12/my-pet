import type { AvatarConfig } from '../../types';

/**
 * Static, cute fallback shown when WebGL is unavailable or the 3D scene fails.
 * The customization controls keep working — they edit stored data, not the 3D scene.
 */
export function AvatarFallback({ config, name }: { config: AvatarConfig; name: string }) {
  return (
    <div
      className="flex h-full min-h-72 w-full flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-b from-cream-50 to-cream-100 p-6"
      role="img"
      aria-label={`Static illustration of ${name}`}
    >
      <div
        className="relative flex h-36 w-36 items-center justify-center rounded-full shadow-inner"
        style={{ backgroundColor: config.bodyColor }}
      >
        <span className="text-6xl" aria-hidden="true">
          🐱
        </span>
        {config.bow && (
          <span className="absolute -top-1 right-2 text-3xl" aria-hidden="true">
            🎀
          </span>
        )}
        {config.collar && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xl" aria-hidden="true">
            🔔
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-cocoa-700">{name}</p>
      <p className="max-w-56 text-center text-xs text-cocoa-500">
        The interactive 3D avatar needs WebGL, which isn't available in this browser —
        but all customization choices are still saved.
      </p>
    </div>
  );
}
