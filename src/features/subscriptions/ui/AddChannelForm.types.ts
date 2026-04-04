export interface ChannelResult {
  id: string;
  title: string;
  username: string | null;
  participantsCount: number;
  type: 'channel' | 'group' | 'bot';
  isPrivate: boolean;
}

export interface AddChannelFormProps {
  onSuccess?: () => void;
}
