export function NoSubscriptions({
  hasSubscriptions,
}: {
  hasSubscriptions: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20">
      {/* Иконка-заглушка */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm">
        <svg
          className="w-12 h-12 text-[#229ED9] opacity-80"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {hasSubscriptions ? 'Лента пуста' : 'Начните чтение'}
      </h3>

      <p className="max-w-xs mx-auto text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
        {hasSubscriptions
          ? 'Новости по вашим подпискам еще не обработаны парсером. Загляните позже.'
          : 'Подпишитесь на Telegram-каналы, чтобы собрать свою персональную ленту новостей.'}
      </p>
    </div>
  );
}
