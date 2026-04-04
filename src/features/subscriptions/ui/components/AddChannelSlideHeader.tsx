import type { AddChannelSlideHeaderProps } from './AddChannelSlideHeader.types';

export function AddChannelSlideHeader({
  onClose,
  remainingSlots,
  maxCount,
}: AddChannelSlideHeaderProps) {
  return (
    <div className="p-6 border-b border-black/5 dark:border-white/10">
      <div className="flex items-center justify-between">
        <div className="animate-fade-in-up">
          <h2 className="text-xl font-bold mt-1 text-foreground">
            Подписка на канал
          </h2>
          {remainingSlots !== undefined && maxCount !== undefined && (
            <p className="text-sm text-black/40 dark:text-white/40 mt-1">
              Осталось слотов: {remainingSlots} / {maxCount}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
        >
          <svg
            className="w-5 h-5 text-black/60 dark:text-white/60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
