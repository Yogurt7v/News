import type { ChannelInfo } from '@/entities';

export interface ChannelCheckboxProps {
  channel: ChannelInfo;
  isSelected: boolean;
  onToggle: () => void;
}

export interface ChannelCheckboxListProps {
  channels: ChannelInfo[];
  selected: ChannelInfo[];
  onToggle: (channel: ChannelInfo) => void;
}
