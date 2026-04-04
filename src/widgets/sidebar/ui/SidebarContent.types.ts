import type { ChannelInfo, GroupWithChannels } from '@/entities';

export interface SidebarContentProps {
  channels: ChannelInfo[];
  groups: GroupWithChannels[];
  currentChannel: string | null;
  currentGroupId: string | null;
  editingGroupId: string | null;
  editName: string;
  searchParams: URLSearchParams;
  pathname: string;
  onAllPostsClick: () => void;
  onCreateGroupClick: () => void;
  onChannelClick: (username: string) => void;
  onUnsubscribe: (e: React.MouseEvent, channel: ChannelInfo) => void;
  onGroupClick: (groupId: string) => void;
  onEditStart: (groupId: string, name: string) => void;
  onEditChange: (name: string) => void;
  onEditSubmit: (groupId: string) => void;
  onDeleteClick: (groupId: string, name: string) => void;
  onRemoveChannel: (
    e: React.MouseEvent,
    groupId: string,
    channel: ChannelInfo
  ) => void;
}
