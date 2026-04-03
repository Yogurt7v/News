interface ModalFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  isLoading?: boolean;
  variant?: 'primary' | 'danger';
}

export function ModalFooter({
  onCancel,
  onConfirm,
  confirmLabel,
  isLoading,
  variant = 'primary',
}: ModalFooterProps) {
  const isDanger = variant === 'danger';
  const confirmClass = isDanger
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-[#0071e3] hover:bg-[#1f8cc7]';

  return (
    <div className="px-4 py-4 flex flex-col sm:flex-row gap-2 sm:gap-3 bg-gray-50/80 dark:bg-black/30 border-t border-black/5 dark:border-white/5">
      <button
        type="button"
        onClick={onCancel}
        className="sm:flex-1 px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-100 rounded-full bg-white/80 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        Отмена
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        className={`sm:flex-1 px-4 py-2.5 text-sm font-semibold rounded-full text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ${confirmClass}`}
      >
        {isLoading ? 'Загрузка...' : confirmLabel}
      </button>
    </div>
  );
}
