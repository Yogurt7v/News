interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2 mb-3">
      <p className="text-[11px] font-semibold tracking-wider text-black/40 dark:text-white/40 uppercase">
        {title}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[11px] font-bold text-[#0071e3] hover:text-[#005bb5] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
