export interface Group {
  id: string;
  userId: string;
  name: string;
  channels: string[];
  createdAt: string;
}

export interface GroupWithChannels {
  id: string;
  name: string;
  channels: {
    id: string;
    username: string;
    title: string;
  }[];
}
