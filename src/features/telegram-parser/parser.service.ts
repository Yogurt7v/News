'use server';

import { getTelegramClient } from '@/shared/api/telegram-mtcute/client';
import createServerClient from '@/shared/lib/pocketbase.server';
import { TelegramClient } from '@mtcute/node';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type Client from 'pocketbase';
import { createAdminClient } from '@/shared/lib/pocketbase-admin';

export interface TelegramPost {
  id: number;
  date: Date;
  media?: TelegramPostMedia[];
  message: string;
  peerId: string;
  channelUsername?: string;
  channelTitle?: string;
}

export interface TelegramPostMedia {
  type: 'photo' | 'video' | 'document' | 'web_page';
  url?: string;
  fileId: string;
  tempPath: string;
  mimeType?: string;
  fileName?: string;
  width?: number;
  height?: number;
}

export class TelegramParserService {
  private pbInstance: Client | null = null;

  // Метод для безопасного получения инициализированного клиента
  private async getPb(): Promise<Client> {
    if (!this.pbInstance) {
      this.pbInstance = await createAdminClient();
    }
    return this.pbInstance;
  }

  async getChannelPosts(
    client: TelegramClient,
    channelUsername: string,
    limit: number = 10
  ): Promise<TelegramPost[]> {
    console.log(
      `📡 [getChannelPosts] Запрашиваю историю @${channelUsername}`
    );
    const messages = await client.getHistory(channelUsername, { limit });

    const groupedMessages = new Map<string, any[]>();
    for (const msg of messages) {
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
      msgs.sort((a, b) => a.id - b.id);
      const mainMsg = msgs[0];
      const fullText = msgs
        .map((m) => m.text || '')
        .filter(Boolean)
        .join('\n');

      if (!fullText && !msgs.some((m) => m.media)) continue;

      const allExtractedMedia: TelegramPostMedia[] = [];
      for (const msg of msgs) {
        if (msg.media) {
          const mediaItem = await this.extractAllMedia(msg.media, client);
          allExtractedMedia.push(...mediaItem);
        }
      }

      posts.push({
        id: mainMsg.id,
        date: mainMsg.date,
        message: fullText,
        peerId: mainMsg.chat.id.toString(),
        channelUsername: channelUsername.replace('@', ''),
        channelTitle: mainMsg.chat?.title,
        media: allExtractedMedia,
      });
    }

    return posts;
  }

  async getMultipleChannelsPosts(
    channels: string[],
    limitPerChannel: number = 5
  ): Promise<TelegramPost[]> {
    const client = await getTelegramClient();
    const allPosts: TelegramPost[] = [];

    for (const channel of channels) {
      try {
        const posts = await this.getChannelPosts(
          client,
          channel,
          limitPerChannel
        );
        allPosts.push(...posts);
      } catch (error) {
        console.error(`Ошибка канала @${channel}:`, error);
      }
    }
    return allPosts;
  }

  private async extractAllMedia(
    m: any,
    client: TelegramClient
  ): Promise<TelegramPostMedia[]> {
    const result: TelegramPostMedia[] = [];
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
        const extension = type === 'video' ? 'mp4' : 'jpg';
        const fileName = `${m.fileId}.${extension}`;
        const tmpPath = path.join(os.tmpdir(), fileName);

        await client.downloadToFile(tmpPath, m);

        result.push({
          type,
          fileId: m.fileId,
          tempPath: tmpPath,
          mimeType: m.mimeType,
          fileName: fileName,
          width: m.width,
          height: m.height,
        });
      } catch (e) {
        console.error(`❌ Ошибка скачивания файла ${m.fileId}:`, e);
      }
    }
    return result;
  }

  private extractTitle(message: string): string | null {
    if (!message) return null;
    const firstLine = message.split('\n')[0].trim();
    return firstLine.length > 100
      ? firstLine.slice(0, 97) + '...'
      : firstLine;
  }

  mapToNews(post: TelegramPost) {
    return {
      title: this.extractTitle(post.message) || 'Новость из Telegram',
      content: post.message,
      source: `@${post.channelUsername}`,
      url: `https://t.me/${post.channelUsername}/${post.id}`,
      publishedAt: post.date.toISOString(),
      channelUsername: post.channelUsername,
      channelTitle: post.channelTitle || '',
    };
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
        if (post.media) {
          await Promise.all(
            post.media.map((m) => fs.unlink(m.tempPath).catch(() => {}))
          );
        }
        return false;
      }

      const newsData = this.mapToNews(post);
      const newNews = await pb.collection('news').create(newsData);

      if (post.media && post.media.length > 0) {
        const mediaPromises = post.media.map(async (m, i) => {
          try {
            const fileBuffer = await fs.readFile(m.tempPath);
            const fileName =
              m.fileName ||
              `file${i}.${m.type === 'video' ? 'mp4' : 'jpg'}`;

            const data = new FormData();
            data.append('newsId', newNews.id);
            data.append('type', m.type);
            data.append('order', i.toString());
            data.append('mimeType', m.mimeType || '');
            data.append('width', (m.width || 0).toString());
            data.append('height', (m.height || 0).toString());

            // Используем Blob для совместимости с FormData в серверном окружении
            const fileBlob = new Blob([fileBuffer], { type: m.mimeType });
            data.append('file', fileBlob, fileName);

            await pb.collection('media').create(data, {
              requestKey: null, // ЭТО ОТКЛЮЧИТ АВТО-ОТМЕНУ
            });
            await fs.unlink(m.tempPath).catch(() => {});
          } catch (err) {
            console.error(
              `❌ Ошибка медиа для новости ${newNews.id}:`,
              err
            );
          }
        });

        await Promise.all(mediaPromises);
      }
      return true;
    } catch (err) {
      console.error(`❌ Ошибка сохранения новости ${newsUrl}:`, err);
      return false;
    }
  }

  async saveAllNews(posts: TelegramPost[]): Promise<number> {
    let savedCount = 0;
    for (const post of posts) {
      if (await this.saveNews(post)) savedCount++;
    }
    return savedCount;
  }

  async fetchAndSaveNews(
    channels: string[],
    limitPerChannel: number = 5
  ): Promise<number> {
    const posts = await this.getMultipleChannelsPosts(
      channels,
      limitPerChannel
    );
    return this.saveAllNews(posts);
  }
}

export const telegramParser = new TelegramParserService();
