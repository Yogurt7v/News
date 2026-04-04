import type { ChannelInfo } from '@/entities';

export interface CreateGroupModalProps {
  allChannels: ChannelInfo[];
  onClose: () => void;
  onSubmit: (name: string, selected: ChannelInfo[]) => Promise<void>;
}
