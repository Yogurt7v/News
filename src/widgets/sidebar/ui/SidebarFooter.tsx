'use client';

import type { SidebarFooterProps } from './SidebarFooter.types';

export function SidebarFooter({ onLogout }: SidebarFooterProps) {
  return (
    <div className="p-4 border-t border-black/5 dark:border-white/5">
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all font-medium"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="16 17 21 12 16 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="21"
            y1="12"
            x2="9"
            y2="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Выйти
      </button>
    </div>
  );
}
