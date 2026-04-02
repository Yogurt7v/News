interface ChannelListItemProps {
  channel: {
    id: string;
    username: string;
    title: string;
    avatar?: string;
  };
  isActive: boolean;
  onClick: () => void;
  onUnsubscribe: (e: React.MouseEvent) => void;
}

export function ChannelListItem({
  channel,
  isActive,
  onClick,
  onUnsubscribe,
}: ChannelListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${
        isActive
          ? 'bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/30'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden ${
          isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <svg
          className={`w-4 h-4 ${
            isActive ? 'text-white/60' : 'text-gray-400'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
          <path d="M9 9l6 3-6 3V9z" fill="currentColor" />
        </svg>
      </div>
      <div className="flex-1 min-w-0 text-left">
        <span className="font-medium truncate block">{channel.title}</span>
        {channel.username !== channel.title && (
          <span
            className={`text-xs truncate block ${
              isActive
                ? 'text-white/60'
                : 'text-black/40 dark:text-white/40'
            }`}
          >
            @{channel.username}
          </span>
        )}
      </div>
      <button
        onClick={onUnsubscribe}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
          isActive
            ? 'hover:bg-white/20 text-white/60 hover:text-white'
            : 'hover:bg-red-500/10 text-black/30 dark:text-white/30 hover:text-red-500 opacity-0 group-hover:opacity-100'
        }`}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
