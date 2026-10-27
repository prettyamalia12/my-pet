interface EmptyStateProps {
  onAddPet: () => void;
  onResetSample: () => void;
}

export function EmptyState({ onAddPet, onResetSample }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-cocoa-700/5">
      <span className="text-6xl" aria-hidden="true">
        🐾
      </span>
      <h2 className="text-xl font-extrabold text-cocoa-900">No pets yet</h2>
      <p className="max-w-sm text-sm text-cocoa-500">
        Your companion list is empty. Add your first pet to start tracking food and care
        dates — or bring back Mochi, the sample cat.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onAddPet}
          className="rounded-xl bg-peach-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-peach-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
        >
          Add your first pet
        </button>
        <button
          type="button"
          onClick={onResetSample}
          className="rounded-xl bg-cream-100 px-5 py-2.5 text-sm font-bold text-cocoa-700 transition hover:bg-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
        >
          Restore sample pet
        </button>
      </div>
    </div>
  );
}
