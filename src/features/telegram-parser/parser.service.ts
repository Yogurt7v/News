import { getTelegramClient } from '@/shared/api/telegram-mtcute/client';
import { TelegramClient } from '@mtcute/node';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type Client from 'pocketbase';
import { createAdminClient } from '@/shared/lib/pocketbase-admin';

export interface TelegramPostMedia {
  type: 'photo' | 'video' | 'document';
  fileId: string;
  tempPath: string;
  mimeType: string;
  fileName: string;
  width: number;
  height: number;
}

export interface TelegramPost {
  id: number;
  date: Date;
  media: TelegramPostMedia[];
  message: string;
  peerId: string;
  channelUsername: string;
  channelTitle: string;
}

export class TelegramParserService {
  private pbInstance: Client | null = null;
  private logs: string[] = [];

  public log(msg: string) {
    this.logs.push(msg);
    console.log(msg);
  }

  public clearLogs() {
    this.logs = [];
  }

  public getLogs(): string[] {
    return [...this.logs];
  }

  private async getPb(): Promise<Client> {
    if (!this.pbInstance) this.pbInstance = await createAdminClient();
    return this.pbInstance;
  }

  async getChannelPosts(
    client: TelegramClient,
    channelUsername: string,
    limit: number = parseInt(process.env.POST_LIMIT!)
  ): Promise<TelegramPost[]> {
    const username = channelUsername.replace('@', '');
    this.log(`\n🔍 [${username}] Запрашиваю историю сообщений...`);

    // Берем с запасом, чтобы собрать полные альбомы
    const messages = await client.getHistory(username, {
      limit: limit * 2,
    });

    const groupedMessages = new Map<string, any[]>();
    for (const msg of messages) {
      const groupId = msg.groupedId
        ? `group_${msg.groupedId.toString()}`
        : `single_${msg.id}`;
      if (!groupedMessages.has(groupId)) groupedMessages.set(groupId, []);
      groupedMessages.get(groupId)!.push(msg);
    }

    const posts: TelegramPost[] = [];
    this.log(
      `📦 [${username}] Найдено групп/постов: ${groupedMessages.size}`
    );

    for (const [_, msgs] of groupedMessages) {
      msgs.sort((a, b) => a.id - b.id);
      const mainMsg = msgs[0];
      const fullText = msgs
        .map((m) => m.text || '')
        .filter(Boolean)
        .join('\n')
        .trim();
      const allMedia: TelegramPostMedia[] = [];

      if (msgs.some((m) => m.media)) {
        this.log(`➡️  Обработка медиа для поста ID: ${mainMsg.id}...`);
        for (const msg of msgs) {
          if (msg.media) {
            const extracted = await this.extractMedia(msg.media, client);
            if (extracted) allMedia.push(extracted);
          }
        }
      }

      if (!fullText && allMedia.length === 0) continue;

      posts.push({
        id: mainMsg.id,
        date: mainMsg.date,
        message: fullText,
        peerId: mainMsg.chat.id.toString(),
        channelUsername: username,
        channelTitle: mainMsg.chat?.title || username,
        media: allMedia,
      });
    }

    return posts.slice(0, limit);
  }

  private async extractMedia(
    m: any,
    client: TelegramClient
  ): Promise<TelegramPostMedia | null> {
    let type: TelegramPostMedia['type'] | null = null;
    const mime = m.mimeType || '';

    if (m.type === 'photo') type = 'photo';
    else if (
      m.type === 'video' ||
      m.type === 'animation' ||
      mime.includes('video')
    )
      type = 'video';
    else if (m.type === 'document') type = 'document';

    if (!type) return null;

    try {
      const ext =
        type === 'video' ? 'mp4' : type === 'photo' ? 'jpg' : 'bin';
      const fileName = `${m.fileId}.${ext}`;
      const tmpPath = path.join(os.tmpdir(), fileName);

      process.stdout.write(`   ⏳ Скачиваю ${type} ... `);

      await client.downloadToFile(tmpPath, m);

      process.stdout.write(`✅\n`); // Завершаем строку лога после скачивания

      return {
        type,
        fileId: m.fileId,
        tempPath: tmpPath,
        mimeType: mime || (type === 'video' ? 'video/mp4' : 'image/jpeg'),
        fileName,
        width: m.width || 0,
        height: m.height || 0,
      };
    } catch (e) {
      console.error(`\n❌ Ошибка скачивания ${m.fileId}:`, e);
      return null;
    }
  }

  async saveNews(post: TelegramPost): Promise<boolean> {
    const pb = await this.getPb();
    const newsUrl = `https://t.me/${post.channelUsername}/${post.id}`;

    try {
      const existing = await pb
        .collection('news')
        .getFirstListItem(`url = "${newsUrl}"`)
        .catch(() => null);
      if (existing) {
        for (const m of post.media)
          await fs.unlink(m.tempPath).catch(() => {});
        return false;
      }

      const newsRecord = await pb.collection('news').create({
        title:
          post.message.split('\n')[0].slice(0, 120) || 'Новость из TG',
        content: post.message,
        source: `@${post.channelUsername}`,
        url: newsUrl,
        publishedAt: post.date.toISOString(),
      });

      if (post.media.length > 0) {
        this.log(
          `   🚀 Загрузка в PocketBase: ${post.media.length} файлов...`
        );
        for (let i = 0; i < post.media.length; i++) {
          const m = post.media[i];
          const buffer = await fs.readFile(m.tempPath);
          const formData = new FormData();

          formData.append('newsId', newsRecord.id);
          formData.append('type', m.type);
          formData.append('order', i.toString());
          formData.append('width', m.width.toString());
          formData.append('height', m.height.toString());

          const fileObj = new Blob([buffer], { type: m.mimeType });
          formData.append('file', fileObj, m.fileName);

          await pb
            .collection('media')
            .create(formData, { requestKey: null });
          await fs.unlink(m.tempPath).catch(() => {});
          process.stdout.write(
            `      [${i + 1}/${post.media.length}] Файл загружен и удален из tmp\n`
          );
        }
      }
      return true;
    } catch (err) {
      console.error(`❌ Ошибка сохранения поста ${newsUrl}:`, err);
      return false;
    }
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 2000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (e: any) {
        lastError = e;
        const isNetworkError =
          e.code === 'ECONNRESET' ||
          e.message?.includes('ECONNRESET') ||
          e.message?.includes('ETIMEDOUT') ||
          e.message?.includes('socket');

        if (isNetworkError && attempt < maxRetries) {
          this.log(
            `⚠️ Попытка ${attempt}/${maxRetries} не удалась. Повтор через ${
              delayMs / 1000
            }с...`
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else if (attempt === maxRetries) {
          console.error(
            `🔴 Все ${maxRetries} попыток исчерпаны. Ошибка:`,
            e.message
          );
        }
      }
    }

    throw lastError;
  }

  async fetchAndSaveNews(
    channels: string[],
    limit: number = parseInt(process.env.POST_LIMIT!)
  ): Promise<number> {
    const client = await getTelegramClient();
    let totalSaved = 0;
    let lastError: Error | null = null;

    for (const channel of channels) {
      try {
        const posts = await this.withRetry(
          () => this.getChannelPosts(client, channel, limit),
          3,
          2000
        );
        for (const post of posts) {
          if (await this.saveNews(post)) {
            totalSaved++;
            this.log(`✨ Пост сохранен! (Всего: ${totalSaved})`);
          }
        }
      } catch (e: any) {
        lastError = e;
        console.error(`🔴 Ошибка на канале ${channel}:`, e.message);
      }
    }

    if (lastError && totalSaved === 0) {
      throw new Error(`Не удалось получить новости: ${lastError.message}`);
    }

    return totalSaved;
  }

  /**
   * Удаляет новости старше указанного количества дней
   * @param days количество дней, которые храним
   */
  async deleteOldNews(days: number = 3): Promise<number> {
    const pb = await this.getPb();

    // Вычисляем дату, которая была 'days' назад
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - days);

    // Форматируем дату для запроса PocketBase (YYYY-MM-DD HH:mm:ss)
    const dateStr = expirationDate
      .toISOString()
      .replace('T', ' ')
      .split('.')[0];

    this.log(`🧹 [Cleanup] Поиск новостей старше чем: ${dateStr}`);

    try {
      // 1. Находим все старые новости
      const oldRecords = await pb.collection('news').getFullList({
        filter: `publishedAt < "${dateStr}"`,
        fields: 'id',
      });

      if (oldRecords.length === 0) {
        this.log('✅ Старых новостей не найдено.');
        return 0;
      }

      this.log(
        `🗑️  Найдено старых записей: ${oldRecords.length}. Начинаю удаление...`
      );

      let deletedCount = 0;
      for (const record of oldRecords) {
        try {
          await pb.collection('news').delete(record.id);
          deletedCount++;
        } catch (err) {
          console.error(`❌ Ошибка удаления записи ${record.id}:`, err);
        }
      }

      console.log(`✨ Очистка завершена. Удалено постов: ${deletedCount}`);
      return deletedCount;
    } catch (err) {
      console.error('❌ Ошибка при выполнении очистки:', err);
      return 0;
    }
  }
}

export async function telegramParser(
  channels: string[],
  limit: number = parseInt(process.env.POST_LIMIT!)
) {
  const service = new TelegramParserService();
  service.clearLogs();
  service.log('🧹 Запуск очистки старых данных...');
  const deletedCount = await service.deleteOldNews(3);
  if (deletedCount > 0) {
    service.log(`♻️  Очищено постов: ${deletedCount}`);
  } else {
    service.log(`✅ База уже чиста, старых постов нет.`);
  }
  const savedCount = await service.fetchAndSaveNews(channels, limit);
  return {
    savedCount,
    logs: service.getLogs(),
  };
}
