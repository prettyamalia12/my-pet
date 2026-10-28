import { useRef, useState } from 'react';
import type { AvatarConfig } from '../../types';

const OUTLINE_SOFT = '#e9c9a4';
const LEG_LINE = '#eccfae';
const BEAN = '#f2a0a0';
const INNER_EAR = '#f9c8c2';
const NOSE = '#f28b9a';
const FACE_LINE = '#5c4634';
const BLUSH = '#f9b3a8';
const WHISKER = '#d8b896';
const PUPIL = '#2b2118';
const COLLAR = '#e26d5c';
const BELL = '#f0c04a';
const BELL_SLIT = '#d8a23a';
const BOW = '#f27d98';
const BOW_CENTER = '#e5638a';
const SPARKLE = '#f6c89b';

/** Patches and shading adapt so they read on both light and dark fur. */
function isDarkFur(hex: string): boolean {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
}

interface Avatar2DProps {
  config: AvatarConfig;
  petName: string;
}

/**
 * Hand-crafted SVG kitten in a soft storybook style: chubby sitting body,
 * patched ear and tail tip, huge gentle eyes, blush, and toe beans. Patches
 * are translucent overlays that adapt to any fur color. Drag sideways to
 * wiggle. Idle bob/blink run via CSS and pause under prefers-reduced-motion.
 */
export function Avatar2D({ config, petName }: Avatar2DProps) {
  const [tilt, setTilt] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);

  const dark = isDarkFur(config.bodyColor);
  const patchStrong = dark ? 'rgba(255,255,255,0.3)' : 'rgba(196,120,55,0.85)';
  const patchTip = dark ? 'rgba(255,255,255,0.25)' : 'rgba(196,120,55,0.7)';
  const patchHead = dark ? 'rgba(255,255,255,0.18)' : 'rgba(196,120,55,0.5)';
  const patchBody = dark ? 'rgba(255,255,255,0.15)' : 'rgba(196,120,55,0.4)';
  const furLight = dark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.5)';

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    setTilt(Math.max(-10, Math.min(10, dx / 14)));
  };
  const endDrag = () => {
    dragStartX.current = null;
    setDragging(false);
    setTilt(0);
  };

  return (
    <div className="relative h-full w-full">
      {/* Soft pastel backdrop circle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_62%,#ffe4cd_0%,#fff3e6_45%,transparent_72%)]"
      />
      <div
        role="img"
        aria-label={`Cute illustrated avatar of ${petName}. Drag sideways to wiggle.`}
        className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            transform: `rotate(${tilt}deg)`,
            transition: dragging ? 'none' : 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <svg viewBox="0 0 400 400" className="avatar-bob h-full" aria-hidden="true">
            <defs>
              <radialGradient id="fur-light" cx="0.5" cy="0.3" r="0.9">
                <stop offset="0%" stopColor={furLight} />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              <filter id="avatar-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>

            {/* Sparkles */}
            <g fill={SPARKLE}>
              <path d="M 78 118 Q 80 124 86 126 Q 80 128 78 134 Q 76 128 70 126 Q 76 124 78 118 Z" />
              <path d="M 332 92 Q 334 98 340 100 Q 334 102 332 108 Q 330 102 324 100 Q 330 98 332 92 Z" />
              <path d="M 338 224 Q 340 230 346 232 Q 340 234 338 240 Q 336 234 330 232 Q 336 230 338 224 Z" />
            </g>

            {/* Ground shadow */}
            <ellipse cx="200" cy="356" rx="112" ry="12" fill="rgba(180,140,110,0.28)" filter="url(#avatar-soft-shadow)" />

            {/* Tail curling up beside the body, patched tip */}
            <path d="M 258 322 C 328 312 352 264 331 236 C 318 220 299 226 302 244" fill="none" stroke={OUTLINE_SOFT} strokeWidth="32" strokeLinecap="round" />
            <path d="M 258 322 C 328 312 352 264 331 236 C 318 220 299 226 302 244" fill="none" stroke={config.bodyColor} strokeWidth="25" strokeLinecap="round" />
            <path d="M 331 236 C 318 220 299 226 302 244" fill="none" stroke={patchTip} strokeWidth="25" strokeLinecap="round" />

            {/* Chubby body */}
            <path
              d="M 200 190 C 148 195 124 250 130 300 C 135 340 165 353 200 353 C 235 353 265 340 270 300 C 276 250 252 195 200 190 Z"
              fill={config.bodyColor}
              stroke={OUTLINE_SOFT}
              strokeWidth="3.5"
            />
            <path
              d="M 200 190 C 148 195 124 250 130 300 C 135 340 165 353 200 353 C 235 353 265 340 270 300 C 276 250 252 195 200 190 Z"
              fill="url(#fur-light)"
            />
            <ellipse cx="240" cy="302" rx="25" ry="34" fill={patchBody} transform="rotate(12 240 302)" />

            {/* Front leg hint lines + paws with toe beans */}
            <rect x="163" y="268" width="26" height="84" rx="13" fill={config.bodyColor} stroke={LEG_LINE} strokeWidth="3" />
            <rect x="211" y="268" width="26" height="84" rx="13" fill={config.bodyColor} stroke={LEG_LINE} strokeWidth="3" />
            <ellipse cx="180" cy="349" rx="16" ry="10" fill={config.bodyColor} stroke={LEG_LINE} strokeWidth="3" />
            <ellipse cx="220" cy="349" rx="16" ry="10" fill={config.bodyColor} stroke={LEG_LINE} strokeWidth="3" />
            <circle cx="176" cy="349" r="1.6" fill={BEAN} />
            <circle cx="184" cy="349" r="1.6" fill={BEAN} />
            <circle cx="216" cy="349" r="1.6" fill={BEAN} />
            <circle cx="224" cy="349" r="1.6" fill={BEAN} />

            {/* Ears — the left one wears the patch color */}
            <path d="M 128 118 L 112 38 Q 110 27 121 30 L 178 62 Z" fill={patchStrong} stroke={OUTLINE_SOFT} strokeWidth="3" strokeLinejoin="round" />
            <path d="M 132 96 L 123 52 L 156 68 Z" fill={INNER_EAR} />
            <path d="M 276 126 L 292 34 Q 295 24 285 27 L 220 58 Z" fill={config.bodyColor} stroke={OUTLINE_SOFT} strokeWidth="3" strokeLinejoin="round" />
            <path d="M 268 96 L 279 48 L 240 66 Z" fill={INNER_EAR} />

            {/* Collar under the chin (head overlaps its top edge) */}
            {config.collar && (
              <g>
                <path d="M 142 224 Q 200 254 258 226" fill="none" stroke={OUTLINE_SOFT} strokeWidth="19" strokeLinecap="round" />
                <path d="M 142 224 Q 200 254 258 226" fill="none" stroke={COLLAR} strokeWidth="13" strokeLinecap="round" />
              </g>
            )}

            {/* Head */}
            <circle cx="200" cy="150" r="88" fill={config.bodyColor} stroke={OUTLINE_SOFT} strokeWidth="3.5" />
            <circle cx="200" cy="150" r="88" fill="url(#fur-light)" />
            <path d="M 117 152 C 110 100 139 64 182 61 C 166 90 161 122 164 152 C 150 161 129 162 117 152 Z" fill={patchHead} />

            {/* Eyes */}
            <g className="avatar-blink">
              <circle cx="158" cy="150" r="19" fill={config.eyeColor} />
              <circle cx="158" cy="150" r="12" fill={PUPIL} />
              <circle cx="152" cy="143" r="6" fill="#ffffff" />
              <circle cx="164" cy="156" r="2.5" fill="#ffffff" opacity="0.9" />
            </g>
            <g className="avatar-blink">
              <circle cx="242" cy="150" r="19" fill={config.eyeColor} />
              <circle cx="242" cy="150" r="12" fill={PUPIL} />
              <circle cx="236" cy="143" r="6" fill="#ffffff" />
              <circle cx="248" cy="156" r="2.5" fill="#ffffff" opacity="0.9" />
            </g>

            {/* Nose + tiny smile */}
            <path d="M 193 168 Q 200 164 207 168 Q 204 176 200 177 Q 196 176 193 168 Z" fill={NOSE} />
            <path d="M 200 177 C 197 184 190 185 186 181" fill="none" stroke={FACE_LINE} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 200 177 C 203 184 210 185 214 181" fill="none" stroke={FACE_LINE} strokeWidth="3.5" strokeLinecap="round" />

            {/* Blush */}
            <ellipse cx="139" cy="180" rx="14" ry="8" fill={BLUSH} opacity="0.6" />
            <ellipse cx="261" cy="180" rx="14" ry="8" fill={BLUSH} opacity="0.45" />

            {/* Whiskers */}
            <g stroke={WHISKER} strokeWidth="2.5" strokeLinecap="round">
              <path d="M 128 168 L 88 160" />
              <path d="M 128 179 L 86 181" />
              <path d="M 272 166 L 312 158" />
              <path d="M 272 177 L 314 179" />
            </g>

            {/* Bell */}
            {config.collar && (
              <g>
                <circle cx="200" cy="250" r="10" fill={BELL} stroke={OUTLINE_SOFT} strokeWidth="3" />
                <path d="M 193 251 L 207 251" stroke={BELL_SLIT} strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {/* Bow on the left ear tip */}
            {config.bow && (
              <g transform="rotate(-12 122 36)">
                <path d="M 122 36 L 98 20 Q 90 38 102 48 Z" fill={BOW} />
                <path d="M 122 36 L 146 20 Q 154 38 142 48 Z" fill={BOW} />
                <circle cx="122" cy="36" r="7" fill={BOW_CENTER} />
              </g>
            )}
          </svg>
        </div>
      </div>

      <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-cocoa-500">
        Drag to wiggle {petName}
      </p>
    </div>
  );
}
