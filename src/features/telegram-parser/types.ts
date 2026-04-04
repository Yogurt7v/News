export interface TelegramPostMedia {
  type: 'photo' | 'video' | 'document';
  fileId: string;
  tempPath: string;
  mimeType: string;
  fileName: string;
  width: number;
  height: number;
  fileBuffer?: Buffer;
}

export interface TelegramPost {
  id: number;
  date: Date;
  message: string;
  peerId: string;
  channelUsername?: string;
  channelTitle?: string;
  media?: TelegramPostMedia[];
}

export interface ParsedMessage {
  id: number;
  date: Date;
  text?: string;
  media?: unknown;
  groupedId?: bigint;
  chat?: {
    id: bigint;
    title?: string;
    username?: string;
    _?: string;
  };
}

export interface ParserDialog {
  entity?: {
    id: bigint;
    title?: string;
    username?: string;
    _?: string;
  };
  chat?: {
    id: bigint;
    title?: string;
    username?: string;
    _?: string;
  };
}

export interface ParserCallbacks {
  onChannelFound?: (username: string, title: string) => void;
  onChannelNotFound?: (username: string) => void;
  onPostSaved?: (channelUsername: string, postId: string) => void;
  onError?: (channelUsername: string, error: Error) => void;
  onProgress?: (message: string) => void;
}
