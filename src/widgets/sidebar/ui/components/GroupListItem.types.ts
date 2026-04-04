import type { GroupInfo, ChannelInfo } from '../types';

export interface GroupListItemProps {
  group: GroupInfo;
  isActive: boolean;
  isEditing: boolean;
  editName: string;
  onClick: () => void;
  onEditStart: () => void;
  onEditChange: (name: string) => void;
  onEditSubmit: () => void;
  onDelete: () => void;
  showChannels?: boolean;
  channels?: ChannelInfo[];
  onRemoveChannel?: (channel: ChannelInfo) => void;
}
