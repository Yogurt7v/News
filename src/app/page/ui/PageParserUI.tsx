'use client';

import { useParserStatus } from './useParserStatus';

interface PageParserUIProps {
  isAdmin?: boolean;
}

export function PageParserUI({ isAdmin }: PageParserUIProps) {
  const { parserStatus, currentLog, runParser } = useParserStatus();

  return (
    <>
      {parserStatus === 'loading' && currentLog && (
        <div className="mt-3 flex items-center gap-3 bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-[#229ED9] animate-pulse" />
          <p className="text-sm text-black/60 dark:text-white/60 truncate">
            {currentLog}
          </p>
        </div>
      )}

      {isAdmin && (
        <button
          onClick={runParser}
          disabled={parserStatus === 'loading'}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 dark:bg-white/5 dark:hover:bg-white/10 transition-all font-medium text-[#229ED9]"
        >
          <svg
            className={`w-4 h-4 ${parserStatus === 'loading' ? 'animate-spin' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {parserStatus === 'loading' ? 'Загрузка...' : 'Обновить новости'}
        </button>
      )}
    </>
  );
}
