import { getTelegramClient } from '@/shared/api/telegram-mtcute/client';
import { db } from '@/db';
import { media, news } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { TelegramClient } from '@mtcute/node'; // Добавьте импорт типа
import fs from 'fs/promises';
import path from 'path';

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
    console.log(
      `📡 [getChannelPosts] Запрашиваю историю @${channelUsername}`
    );

    const messages = await client.getHistory(channelUsername, { limit });
    console.log(
      `📩 [getChannelPosts] Получено из API: ${messages.length} объектов`
    );

    const groupedMessages = new Map<string, any[]>();

    for (const msg of messages) {
      // Если это часть альбома, используем groupedId, иначе уникальный id сообщения
      const groupId = msg.groupedId
        ? `group_${msg.groupedId.toString()}`
        : `single_${msg.id}`;

      if (!groupedMessages.has(groupId)) {
        groupedMessages.set(groupId, []);
      }
      groupedMessages.get(groupId)!.push(msg);
    }
    const posts: TelegramPost[] = [];

    for (const [groupId, msgs] of groupedMessages) {
      // Сортируем сообщения в группе по ID, чтобы текст (обычно он в первом) был предсказуем
      msgs.sort((a, b) => a.id - b.id);

      const mainMsg = msgs[0]; // Берем первое сообщение как основу

      // Собираем текст из всех сообщений группы (на случай, если подписи разные,
      // хотя в ТГ подпись обычно одна на весь альбом)
      const fullText = msgs
        .map((m) => m.text || '')
        .filter(Boolean)
        .join('\n');

      if (!fullText && !msgs.some((m) => m.media)) {
        continue;
      }

      console.log(
        `🔹 Обработка ${groupId} | Сообщений в группе: ${msgs.length}`
      );

      // Извлекаем медиа из ВСЕХ сообщений группы
      const allExtractedMedia: TelegramPostMedia[] = [];
      for (const msg of msgs) {
        if (msg.media) {
          const mediaItem = await this.extractAllMedia(msg.media, client);
          allExtractedMedia.push(...mediaItem);
        }
      }

      posts.push({
        id: mainMsg.id, // ID берем от первого сообщения группы
        date: mainMsg.date,
        message: fullText,
        peerId: mainMsg.chat.id.toString(),
        channelUsername: channelUsername.replace('@', ''),
        media: allExtractedMedia,
      });
    }

    console.log(
      `✅ [getChannelPosts] Итог: сформировано ${posts.length} постов из ${messages.length} объектов API`
    );
    return posts;
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

  private async extractAllMedia(
    telegramMedia: any,
    client: TelegramClient
  ): Promise<TelegramPostMedia[]> {
    const result: TelegramPostMedia[] = [];
    if (!telegramMedia) return result;

    const m = telegramMedia;
    const mediaType =
      typeof m.type === 'string'
        ? m.type
        : m.constructor.name.toLowerCase();

    let type: TelegramPostMedia['type'] | null = null;
    if (mediaType.includes('photo')) type = 'photo';
    else if (mediaType.includes('video')) type = 'video';
    else if (mediaType.includes('document')) type = 'document';

    if (type && m.fileId) {
      try {
        // 1. Определяем расширение и пути
        const extension = type === 'video' ? 'mp4' : 'jpg';
        const fileName = `${m.fileId}.${extension}`;

        // Убедись, что путь корректный для твоего проекта
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, fileName);

        // 2. Создаем папку, если её нет (важно!)
        await fs.mkdir(uploadDir, { recursive: true });

        // 3. Проверяем наличие файла
        const fileExists = await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false);

        if (fileExists) {
          console.log(`   📎 Файл уже на диске: ${fileName}`);
        } else {
          console.log(`   📥 Скачиваю ${type} в файл...`);

          await client.downloadToFile(filePath, m);

          console.log(`   ✅ Файл сохранен: ${fileName}`);
        }

        result.push({
          type,
          fileId: m.fileId,
          url: `/uploads/${fileName}`, // Путь относительно корня public для фронтенда
          mimeType: m.mimeType,
          fileName: fileName,
          width: m.width,
          height: m.height,
        });
      } catch (e) {
        console.error(`   ❌ Ошибка при работе с файлом ${m.fileId}:`, e);
      }
    }

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
