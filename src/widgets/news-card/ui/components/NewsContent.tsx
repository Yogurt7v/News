import type { NewsContentProps } from './NewsContent.types';

export function NewsContent({ title, content, url }: NewsContentProps) {
  return (
    <div className="p-5 space-y-3">
      <h2 className="text-[17px] font-bold leading-tight text-foreground">
        {title}...
      </h2>

      {content && (
        <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
          {content}
        </p>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#0071e3] hover:underline"
      >
        Читать в Telegram
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <path d="M15 3h6v6" />
          <path d="M10 14L21 3" />
        </svg>
      </a>
    </div>
  );
}
