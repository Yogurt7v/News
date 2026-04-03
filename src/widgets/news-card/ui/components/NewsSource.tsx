interface NewsSourceProps {
  channelTitle: string;
  source: string;
}

export function NewsSource({ channelTitle, source }: NewsSourceProps) {
  const displayTitle = channelTitle?.length > 0 ? channelTitle : source;

  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-[#0071e3]/10 flex items-center justify-center">
        <svg
          className="w-3.5 h-3.5 text-[#0071e3]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
          <path d="M9 9l6 3-6 3V9z" />
        </svg>
      </div>
      <span className="text-sm font-semibold text-[#0071e3]">
        {displayTitle}
      </span>
    </div>
  );
}
