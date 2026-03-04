import { getTelegramClient } from '@/shared/api/telegram-mtcute/client';
import { db } from '@/db';
import { news } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { TelegramClient } from '@mtcute/node'; // Добавьте импорт типа

export interface TelegramPost {
  id: number;
  date: Date;
  message: string;
  peerId: string;
  channelUsername?: string;
}

export class TelegramParserService {
  /**
   * Получить последние сообщения из канала
   * ПЕРЕДАЕМ client как аргумент, чтобы не инициализировать его постоянно
   */
  async getChannelPosts(
    client: TelegramClient,
    channelUsername: string,
    limit: number = 10
  ): Promise<TelegramPost[]> {
    // В mtcute getHistory — основной метод получения постов
    const messages = await client.getHistory(channelUsername, { limit });

    return messages.map((msg) => ({
      id: msg.id,
      date: msg.date,
      // В mtcute текст сообщения лежит в свойстве .text
      message: msg.text || '',
      peerId: msg.chat.id.toString(),
      channelUsername,
    }));
  }

  /**
   * Получить сообщения из нескольких каналов
   */
  async getMultipleChannelsPosts(
    channels: string[],
    limitPerChannel: number = 5
  ): Promise<TelegramPost[]> {
    // 1. Инициализируем клиент ОДИН РАЗ перед циклом
    const client = await getTelegramClient();
    const allPosts: TelegramPost[] = [];

    for (const channel of channels) {
      try {
        // 2. Передаем готовый клиент в метод
        const posts = await this.getChannelPosts(
          client,
          channel,
          limitPerChannel
        );
        allPosts.push(...posts);
      } catch (error) {
        console.error(
          `Ошибка получения сообщений из канала @${channel}:`,
          error
        );
      }
    }
    return allPosts;
  }

  /**
   * Преобразовать сообщение Telegram в формат новости
   */
  mapToNews(
    post: TelegramPost
  ): Omit<typeof news.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> {
    const url = `https://t.me/${post.channelUsername}/${post.id}`;
    return {
      title: this.extractTitle(post.message) || 'Новость из Telegram',
      content: post.message,
      source: `@${post.channelUsername}`,
      url,
      imageUrl: null,
      publishedAt: post.date,
      categoryId: null,
    };
  }

  private extractTitle(message: string): string | null {
    if (!message) return null;
    const firstLine = message.split('\n')[0].trim();
    return firstLine.length > 100
      ? firstLine.slice(0, 97) + '...'
      : firstLine;
  }

  /**
   * Сохранить новости в БД (только новые)
   */
  async saveNews(posts: TelegramPost[]): Promise<number> {
    let savedCount = 0;
    for (const post of posts) {
      const newsData = this.mapToNews(post);

      const existing = await db.query.news.findFirst({
        where: eq(news.url, newsData.url),
      });

      if (!existing) {
        await db.insert(news).values(newsData);
        savedCount++;
      }
    }
    return savedCount;
  }

  /**
   * Основной метод
   */
  async fetchAndSaveNews(
    channels: string[],
    limitPerChannel: number = 5
  ): Promise<number> {
    const posts = await this.getMultipleChannelsPosts(
      channels,
      limitPerChannel
    );
    return this.saveNews(posts);
  }
}

export const telegramParser = new TelegramParserService();
