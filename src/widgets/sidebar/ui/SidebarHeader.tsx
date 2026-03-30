'use client';

interface SidebarHeaderProps {
  onAddClick: () => void;
}

export function SidebarHeader({ onAddClick }: SidebarHeaderProps) {
  return (
    <div className="p-5 border-b border-gray-100 dark:border-gray-800 animate-fade-in-down">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => (window.location.href = '/')}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#229ED9] to-[#1b8ec2] flex items-center justify-center text-white shadow-lg shadow-[#229ED9]/30 group-hover:shadow-xl group-hover:shadow-[#229ED9]/40 transition-all">
            <span className="text-xl font-bold">N</span>
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">
              Будь в курсе
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ваша лента
            </p>
          </div>
        </div>
        <button
          onClick={onAddClick}
          className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center active:scale-95"
        >
          <svg
            className="w-5 h-5 text-[#229ED9]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
