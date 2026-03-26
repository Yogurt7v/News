interface PageHeaderProps {
  title: string;
  statsText?: string;
  showHint: boolean;
}

export function PageHeader({
  title,
  statsText,
  showHint,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-white/10 p-6 shadow-lg shadow-black/5">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {statsText && (
          <p className="text-sm text-black/40 dark:text-white/40 mt-1">
            {statsText}
          </p>
        )}
        {showHint && (
          <p className="text-sm text-black/40 dark:text-white/40 mt-1">
            Добавьте каналы для начала чтения
          </p>
        )}
      </div>
    </div>
  );
}
