import type { ChannelSearchResult } from '@/entities';

export interface ChannelSearchResultsProps {
  channels: ChannelSearchResult[];
  onSelect: (channel: ChannelSearchResult) => void;
}
