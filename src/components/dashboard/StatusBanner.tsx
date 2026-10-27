import type { PetStatus, PetStatusKind } from '../../lib/status';

const TONES: Record<PetStatusKind, { classes: string; icon: string; label: string }> = {
  exhausted: {
    classes: 'bg-red-50 text-red-800 ring-red-200',
    icon: '🚨',
    label: 'Food exhausted',
  },
  overdue: {
    classes: 'bg-red-50 text-red-800 ring-red-200',
    icon: '⏰',
    label: 'Estimate overdue',
  },
  low: {
    classes: 'bg-amber-50 text-amber-800 ring-amber-200',
    icon: '⚠️',
    label: 'Food running low',
  },
  care: {
    classes: 'bg-sky-50 text-sky-800 ring-sky-200',
    icon: '📅',
    label: 'Upcoming care',
  },
  unknown: {
    classes: 'bg-stone-100 text-stone-700 ring-stone-200',
    icon: '📝',
    label: 'More info needed',
  },
  ok: {
    classes: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    icon: '💚',
    label: 'All good',
  },
};

export function StatusBanner({ status }: { status: PetStatus }) {
  const tone = TONES[status.kind];
  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition-colors ${tone.classes}`}
    >
      <span className="text-xl" aria-hidden="true">
        {tone.icon}
      </span>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide opacity-70">
          {tone.label}
        </p>
        <p className="text-sm font-semibold">{status.message}</p>
      </div>
    </div>
  );
}
