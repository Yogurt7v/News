interface AllPostsButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export function AllPostsButton({
  isActive,
  onClick,
}: AllPostsButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
        isActive
          ? 'bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/30'
          : 'hover:bg-white/60 dark:hover:bg-white/5'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      </div>
      <span className="font-semibold">Все посты</span>
    </button>
  );
}
