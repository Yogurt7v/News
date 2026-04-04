import type { ChannelSearchInputProps } from './ChannelSearchInput.types';

export function ChannelSearchInput({
  value,
  onChange,
  onClear,
  isLoading,
}: ChannelSearchInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Введите название канала..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-4 pr-12 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 focus:border-[#0071e3]/50 focus:ring-2 focus:ring-[#0071e3]/20 outline-none hover:scale-[1.01] transition-all duration-200 placeholder:text-black/30 dark:placeholder:text-white/30"
        autoComplete="off"
      />
      {isLoading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!isLoading && value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 transition-colors"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
