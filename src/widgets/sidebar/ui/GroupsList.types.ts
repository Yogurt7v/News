import type { ChannelInfo, GroupWithChannels } from '@/entities';

export interface GroupsListProps {
  groups: GroupWithChannels[];
  currentGroupId: string | null;
  editingGroupId: string | null;
  editName: string;
  searchParams: URLSearchParams;
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
