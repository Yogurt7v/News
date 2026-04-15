import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-[#0071e3]/5">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 animate-fade-in">
          <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#0071e3]/10 to-[#0071e3]/5 flex items-center justify-center">
            <span className="text-7xl font-bold text-[#0071e3]/60">
              404
            </span>
          </div>

          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#0071e3]/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#0071e3]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-white/10 shadow-2xl shadow-black/5 overflow-hidden animate-scale-in">
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-3 text-foreground">
              Страница не найдена
            </h1>

            <p className="text-sm text-black/50 dark:text-white/50 mb-6 leading-relaxed">
              Запрашиваемая страница не существует или была перемещена.
              Вернитесь на главную страницу.
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl bg-[#0071e3] hover:bg-[#005bb5] text-white font-semibold shadow-lg shadow-[#0071e3]/25 transition-all active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5"
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
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
