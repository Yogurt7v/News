import type { ModalHeaderProps } from './ModalHeader.types';

export function ModalHeader({ label, title, onClose }: ModalHeaderProps) {
  return (
    <div className="px-6 pt-5 pb-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p
          className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          {label}
        </p>
        <h3
          className="mt-1 text-[18px] font-semibold text-gray-900 dark:text-gray-50 truncate animate-fade-in"
          style={{ animationDelay: '0.15s' }}
        >
          {title}
        </h3>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-gray-500 hover:text-gray-900 hover:bg-black/10 dark:hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="Закрыть"
      >
        ✕
      </button>
    </div>
  );
}
