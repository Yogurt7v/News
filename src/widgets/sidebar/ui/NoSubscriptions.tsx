'use client';

interface NoSubscriptionsProps {
  hasSubscriptions: boolean;
}

export function NoSubscriptions({
  hasSubscriptions,
}: NoSubscriptionsProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-white/10 shadow-lg p-10 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#229ED9]/10 backdrop-blur-sm flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[#229ED9]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2">
          {hasSubscriptions ? 'Лента пуста' : 'Начните чтение'}
        </h3>

        <p className="text-sm text-black/50 dark:text-white/50 max-w-xs mx-auto leading-relaxed">
          {hasSubscriptions
            ? 'Новости по вашим подпискам ещё не обработаны. Загляните позже.'
            : 'Подпишитесь на Telegram-каналы, чтобы собрать свою персональную ленту.'}
        </p>
      </div>
    </div>
  );
}
