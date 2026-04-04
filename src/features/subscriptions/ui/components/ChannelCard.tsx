import type { ChannelCardProps } from './ChannelCard.types';
import { ChannelTypeIcon } from './ChannelTypeIcon';
import { ParticipantCount } from './ParticipantCount';

export function ChannelCard({ channel, onClick }: ChannelCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all text-left group"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <ChannelTypeIcon type={channel.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate text-foreground">
              {channel.title}
            </span>
            {channel.isPrivate && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-medium">
                Приватный
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-black/40 dark:text-white/40">
            {channel.username ? (
              <span>@{channel.username}</span>
            ) : (
              <span className="italic opacity-60">Без username</span>
            )}
            <ParticipantCount count={channel.participantsCount} />
          </div>
        </div>
      </div>
    </button>
  );
}
