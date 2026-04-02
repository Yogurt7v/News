import { ChannelSearchResult } from '@/entities';
import { ChannelCard } from './ChannelCard';

interface ChannelSearchResultsProps {
  channels: ChannelSearchResult[];
  onSelect: (channel: ChannelSearchResult) => void;
}

export function ChannelSearchResults({
  channels,
  onSelect,
}: ChannelSearchResultsProps) {
  if (channels.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold tracking-wide text-black/40 dark:text-white/40 uppercase">
        Найдено: {channels.length}
      </p>
      <div className="space-y-2">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onClick={() => onSelect(channel)}
          />
        ))}
      </div>
    </div>
  );
}
