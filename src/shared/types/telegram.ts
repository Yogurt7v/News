export interface TelegramMessage {
  id: number;
  date: Date;
  text?: string;
  media?: unknown;
  groupedId?: bigint;
  chat?: TelegramChat;
}

export interface TelegramChat {
  id: bigint;
  title?: string;
  username?: string;
  _?: string;
}

export interface TelegramDialog {
  chat?: TelegramChat;
  entity?: TelegramChat;
}

export type { TelegramClient } from '@mtcute/node';
