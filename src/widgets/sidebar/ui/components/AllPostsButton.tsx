import type { AllPostsButtonProps } from './AllPostsButton.types';

export function AllPostsButton({
  isActive,
  onClick,
}: AllPostsButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
        isActive
          ? 'bg-[#0071e3] text-white shadow-sm'
          : 'bg-[#fafafc] dark:bg-gray-800 text-[#0071e3] border border-[#0071e3] hover:bg-[#0071e3]/10'
      }`}
    >
      <svg
        className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#0071e3]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
      Все посты
    </button>
  );
}
