import type { LoadMoreButtonProps } from './LoadMoreButton.types';

export function LoadMoreButton({
  isLoading,
  onClick,
}: LoadMoreButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full py-4 rounded-2xl bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm font-semibold text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-fade-in-up"
    >
      {isLoading ? (
        <>
          <svg
            className="w-5 h-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Загрузка...
        </>
      ) : (
        'Загрузить ещё'
      )}
    </button>
  );
}
