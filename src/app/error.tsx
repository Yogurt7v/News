'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({
  error,
  reset,
}: ErrorBoundaryProps) {
  const [isResetting, setIsResetting] = useState(false);

  console.error('Error caught by boundary:', error);

  const handleReset = () => {
    setIsResetting(true);
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-[#229ED9]/5">
      <div className="w-full max-w-md">
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-white/10 shadow-2xl shadow-black/5 overflow-hidden animate-fade-in">
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold mb-3 text-foreground">
              Что-то пошло не так
            </h1>

            <p className="text-sm text-black/50 dark:text-white/50 mb-6 leading-relaxed">
              Произошла непредвиденная ошибка. Попробуйте обновить страницу
              или вернитесь на главную.
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mb-6 p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-left">
                <p className="text-xs font-mono text-red-500 break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs font-mono text-black/30 dark:text-white/30 mt-2">
                    ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="flex-1 px-6 py-4 rounded-2xl bg-[#229ED9] hover:bg-[#1b8ec2] text-white font-semibold shadow-lg shadow-[#229ED9]/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <>
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
                    Обновляем...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 4v6h6" />
                      <path d="M23 20v-6h-6" />
                      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                    </svg>
                    Попробовать снова
                  </>
                )}
              </button>

              <Link
                href="/"
                className="flex-1 px-6 py-4 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 text-foreground font-semibold transition-all hover:bg-white/80 dark:hover:bg-white/15 active:scale-[0.98] flex items-center justify-center gap-2"
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
                На главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
