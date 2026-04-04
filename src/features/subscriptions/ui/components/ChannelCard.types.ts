import type { ChannelSearchResult } from '@/entities';

export interface ChannelCardProps {
  channel: ChannelSearchResult;
  onClick: () => void;
}
