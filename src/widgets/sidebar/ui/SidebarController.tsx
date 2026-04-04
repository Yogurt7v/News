'use client';

import type { SidebarControllerProps } from './SidebarController.types';

export function SidebarController({
  isOpen,
  isScrollingDown,
  children,
  onMenuClick,
  onClose,
}: SidebarControllerProps) {
  return (
    <>
      <button
        onClick={onMenuClick}
        className={`md:hidden fixed z-[100] w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-all duration-300 ${
          isScrollingDown
            ? 'top-4 right-4 bg-white/20 backdrop-blur-md text-white/60 border border-white/20'
            : 'top-12 right-10 bg-[#0071e3] text-white shadow-[#0071e3]/40'
        }`}
      >
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
          />
          <aside className="absolute top-0 left-0 h-full w-[85%] max-w-[320px] shadow-2xl animate-slide-in-right">
            {children}
          </aside>
        </div>
      )}
    </>
  );
}
