import type { NewNewsIndicatorProps } from './NewNewsIndicator.types';

export function NewNewsIndicator({
  count,
  onClick,
}: NewNewsIndicatorProps) {
  const getWordForm = (n: number) => {
    if (n === 1) return { text: 'новую', post: 'ь' };
    if (n < 5) return { text: 'новые', post: 'ей' };
    return { text: 'новых', post: 'ей' };
  };

  const form = getWordForm(count);

  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-2xl bg-[#0071e3] text-white font-semibold hover:bg-[#005bb5] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 animate-fade-in-up"
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
      Показать {count} {form.text} новост{form.post}
    </button>
  );
}
