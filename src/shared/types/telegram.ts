export interface TelegramPost {
  id: number; // ID сообщения в канале
  date: Date;
  message: string;
  peerId: string; // идентификатор канала
  channelUsername?: string;
  media?: any; // позже можно обработать
  publishedAt?: Date;
}
