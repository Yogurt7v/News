export interface ChannelItem {
  id: string;
  username: string;
  title: string;
  avatar?: string;
}

export interface ChannelsListProps {
  channels: ChannelItem[];
  currentChannel: string | null;
  onChannelClick: (username: string) => void;
  onUnsubscribe: (e: React.MouseEvent, channel: ChannelItem) => void;
}
