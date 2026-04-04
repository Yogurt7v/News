export interface ChannelListItemProps {
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
