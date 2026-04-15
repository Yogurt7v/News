import type { PageHeaderProps } from './PageHeader.types';

export function PageHeader({
  title,
  statsText,
  showHint,
  children,
}: PageHeaderProps) {
  return (
    <div
      id="page-header"
      className="mb-6 animate-fade-in-up"
      style={{ scrollMarginTop: 24 }}
    >
      <div className="bg-white dark:bg-gray-900 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg shadow-gray-200/20 dark:shadow-black/30">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {statsText && (
          <p
            className="text-sm text-gray-500 dark:text-gray-400 mt-1 animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            {statsText}
          </p>
        )}
        {showHint && (
          <p
            className="text-sm text-gray-500 dark:text-gray-400 mt-1 animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            Добавьте каналы для начала чтения
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
