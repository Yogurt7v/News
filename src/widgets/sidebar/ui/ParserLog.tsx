'use client';

interface ParserLogProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  currentLog: string;
}

export function ParserLog({ status, currentLog }: ParserLogProps) {
  if (status !== 'loading' || !currentLog) return null;

  return (
    <div className="px-5 pb-3 mt-4">
      <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3">
        <div className="w-2 h-2 rounded-full bg-[#229ED9] animate-pulse" />
        <p className="text-sm text-black/60 dark:text-white/60 truncate">
          {currentLog}
        </p>
      </div>
    </div>
  );
}
