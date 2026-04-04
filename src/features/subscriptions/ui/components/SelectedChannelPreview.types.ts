import type { ChannelSearchResult } from '@/entities';

export interface SelectedChannelPreviewProps {
  channel: ChannelSearchResult;
  onSubscribe: () => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string | null;
}
