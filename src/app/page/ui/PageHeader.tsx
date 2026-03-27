import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  statsText?: string;
  showHint: boolean;
  children?: ReactNode;
}

export function PageHeader({
  title,
  statsText,
  showHint,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6 animate-fade-in-up">
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-white/10 p-6 shadow-lg shadow-black/5">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {statsText && (
          <p
            className="text-sm text-black/40 dark:text-white/40 mt-1 animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            {statsText}
          </p>
        )}
        {showHint && (
          <p
            className="text-sm text-black/40 dark:text-white/40 mt-1 animate-fade-in"
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
