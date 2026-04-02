export interface Channel {
  id: string;
  userId: string;
  channelUsername: string;
  channelTitle: string | null;
  avatar?: string;
  createdAt: string;
}

export interface ChannelInfo {
  id: string;
  username: string;
  title: string;
  avatar?: string;
}

export interface ChannelSearchResult {
  id: string;
  title: string;
  username: string | null;
  participantsCount: number;
  type: 'channel' | 'group';
  isPrivate: boolean;
}
