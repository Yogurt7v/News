export function AddChannelButton({
  disabled,
  isPending,
  isLimitReached,
}: {
  disabled?: boolean;
  isPending?: boolean;
  isLimitReached?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={isPending || disabled || isLimitReached}
      className="w-full py-4 rounded-2xl bg-[#0071e3] hover:bg-[#005bb5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all shadow-lg shadow-[#0071e3]/25 active:scale-[0.98]"
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
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
          Добавление...
        </span>
      ) : isLimitReached ? (
        'Лимит подписок исчерпан'
      ) : (
        'Добавить канал'
      )}
    </button>
  );
}
