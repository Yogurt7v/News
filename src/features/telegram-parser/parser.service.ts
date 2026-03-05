import { getTelegramClient } from '@/shared/api/telegram-mtcute/client';
import { db } from '@/db';
import { media, news } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { TelegramClient } from '@mtcute/node'; // Добавьте импорт типа

export interface TelegramPost {
  id: number;
  date: Date;
  media?: TelegramPostMedia[];
  message: string;
  peerId: string;
  channelUsername?: string;
}

export interface TelegramPostMedia {
  type: 'photo' | 'video' | 'document' | 'web_page';
  url?: string;
  fileId: string;
  mimeType?: string;
  fileName?: string;
  width?: number;
  height?: number;
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
    console.log(messages[0]);
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

  private extractAllMedia(
    telegramMedia: any
  ): Array<{ type: string; url: string }> {
    const result: Array<{ type: string; url: string }> = [];
    if (!telegramMedia) return result;

    // Фото
    if (telegramMedia.photo) {
      // Получаем самое большое фото (последний размер)
      const sizes = telegramMedia.photo.sizes;
      if (sizes && sizes.length > 0) {
        const largest = sizes[sizes.length - 1];
        // Формируем URL (в реальном проекте нужно использовать file reference)
        const url = `https://t.me/file/${telegramMedia.photo.id}.jpg`;
        result.push({ type: 'photo', url });
      }
    }

    // Видео
    if (telegramMedia.video) {
      const url = `https://t.me/file/${telegramMedia.video.id}.mp4`;
      result.push({ type: 'video', url });
    }

    // Документы-изображения
    if (
      telegramMedia.document &&
      telegramMedia.document.mimeType?.startsWith('image/')
    ) {
      const url = `https://t.me/file/${telegramMedia.document.id}.jpg`;
      result.push({ type: 'photo', url });
    }

    // Если в сообщении есть группа медиа (альбом) – нужно обрабатывать отдельно
    // Для упрощения пока оставляем так

    return result;
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
      publishedAt: post.date,
      categoryId: null,
      // imageUrl больше не нужен
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

      // 1. Проверяем, есть ли уже такая новость (по URL или другому уникальному полю)
      const existing = await db.query.news.findFirst({
        where: eq(news.url, newsData.url),
      });

      if (existing) continue;

      try {
        // 2. Используем транзакцию: либо сохраняется всё, либо ничего
        await db.transaction(async (tx) => {
          // Вставляем основную запись новости
          const [newNews] = await tx
            .insert(news)
            .values(newsData)
            .returning({ id: news.id }); // Получаем сгенерированный UUID

          // 3. Подготавливаем список медиа для вставки
          if (post.media && post.media.length > 0) {
            const mediaToInsert = post.media.map((m) => ({
              newsId: newNews.id, // Тот самый UUID из вставленной записи
              type: m.type,
              url: m.url || '',
              mimeType: m.mimeType || '',
              fieldName: m.fileName || '',
            }));

            // Вставляем все медиа одним запросом (Batch Insert)
            await tx.insert(media).values(mediaToInsert);
          }
        });

        savedCount++;
      } catch (error) {
        console.error(`Ошибка при сохранении новости ${post.id}:`, error);
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
