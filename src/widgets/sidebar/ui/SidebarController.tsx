'use client';

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface SidebarControllerProps {
  isOpen: boolean;
  toastMessage: ToastMessage | null;
  isScrollingDown: boolean;
  children: React.ReactNode;
  onMenuClick: () => void;
  onClose: () => void;
}

export function SidebarController({
  isOpen,
  toastMessage,
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
            : 'top-12 right-6 bg-[#229ED9] text-white shadow-[#229ED9]/40'
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

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
          <div
            className={`${
              toastMessage.type === 'success'
                ? 'bg-green-500'
                : toastMessage.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-[#229ED9]'
            } text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 font-medium`}
          >
            {toastMessage.type === 'success' && (
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {toastMessage.type === 'error' && (
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
