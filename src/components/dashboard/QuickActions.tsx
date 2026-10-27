interface QuickActionsProps {
  onEditPet: () => void;
  onUpdateFood: () => void;
  onCustomizeAvatar: () => void;
}

const buttonClass =
  'flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-cocoa-700 shadow-sm ring-1 ring-cocoa-700/10 transition hover:-translate-y-0.5 hover:bg-cream-50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500';

export function QuickActions({
  onEditPet,
  onUpdateFood,
  onCustomizeAvatar,
}: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Quick actions">
      <button type="button" onClick={onEditPet} className={buttonClass}>
        <span aria-hidden="true">✏️</span> Edit pet
      </button>
      <button type="button" onClick={onUpdateFood} className={buttonClass}>
        <span aria-hidden="true">🥣</span> Update food
      </button>
      <button type="button" onClick={onCustomizeAvatar} className={buttonClass}>
        <span aria-hidden="true">🎨</span> Customize avatar
      </button>
    </div>
  );
}
