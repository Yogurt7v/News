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
  fileBuffer?: Buffer;
  thumbnailBuffer?: Buffer;
}

interface TelegramMediaAttributes {
  fileName?: string;
}

interface TelegramMedia {
  mimeType?: string;
  attributes?: TelegramMediaAttributes[];
  fileId?: string;
  type?: string;
  width?: number;
  height?: number;
  thumbnails?: TelegramMedia[];
  isVideo?: boolean;
}

interface TelegramThumbnail extends TelegramMedia {
  isVideo?: boolean;
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
  private callbacks?: ParserCallbacks;

  public setCallbacks(callbacks?: ParserCallbacks) {
    this.callbacks = callbacks;
  }

  public log(msg: string) {
    this.logs.push(msg);
    console.log(msg);
    this.callbacks?.onLog?.(msg);
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

    // Если username на кириллице - ищем через диалоги
    if (/[а-яА-ЯёЁ]/.test(username)) {
      return this.getChannelPostsByTitle(client, username, limit);
    }

    this.log(`\n🔍 [${username}] Запрашиваю историю сообщений...`);

    // Берем с запасом, чтобы собрать полные альбомы
    const messages = await client.getHistory(username, {
      limit: limit * 2,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    for (const [, msgs] of groupedMessages) {
      msgs.sort((a, b) => a.id - b.id);
      const mainMsg = msgs[0];
      const fullText = msgs
        .map((m) => m.text || '')
        .filter(Boolean)
        .join('\n')
        .trim();
      const allMedia: TelegramPostMedia[] = [];

      if (msgs.some((m) => m.media)) {
        this.log(`➡️  Обработка медиа ID: ${mainMsg.id}...`);
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

  private async getChannelPostsByTitle(
    client: TelegramClient,
    channelTitle: string,
    limit: number
  ): Promise<TelegramPost[]> {
    this.log(`🔍 [${channelTitle}] Ищу канал по названию...`);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let foundChat: any = null;

      // Ищем в диалогах пользователя
      for await (const dialog of client.iterDialogs({ limit: 200 })) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const chat: any =
          (dialog as any).entity || (dialog as any).chat || dialog;
        /* eslint-enable @typescript-eslint/no-explicit-any */
        if (
          chat &&
          chat.title?.toLowerCase().includes(channelTitle.toLowerCase())
        ) {
          if (
            chat._ === 'channel' ||
            chat._ === 'chat' ||
            chat._ === 'channelForbidden'
          ) {
            foundChat = chat;
            break;
          }
        }
      }

      if (!foundChat) {
        this.log(`⚠️ [${channelTitle}] Канал не найден в диалогах`);
        return [];
      }

      const peerId = foundChat.id.toString();
      this.log(`✅ [${channelTitle}] Найден: peerId=${peerId}`);

      const messages = await client.getHistory(peerId, {
        limit: limit * 2,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const groupedMessages = new Map<string, any[]>();
      for (const msg of messages) {
        const groupId = msg.groupedId
          ? `group_${msg.groupedId.toString()}`
          : `single_${msg.id}`;
        if (!groupedMessages.has(groupId))
          groupedMessages.set(groupId, []);
        groupedMessages.get(groupId)!.push(msg);
      }

      this.log(
        `📦 [${channelTitle}] Найдено групп/постов: ${groupedMessages.size}`
      );

      const posts: TelegramPost[] = [];

      for (const [, msgs] of groupedMessages) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        msgs.sort((a: any, b: any) => a.id - b.id);
        const mainMsg = msgs[0];
        const fullText = msgs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((m: any) => m.text || '')
          .filter(Boolean)
          .join('\n')
          .trim();
        const allMedia: TelegramPostMedia[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (msgs.some((m: any) => m.media)) {
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
          peerId: peerId,
          channelUsername: '',
          channelTitle: mainMsg.chat?.title || channelTitle,
          media: allMedia,
        });
      }

      return posts.slice(0, limit);
    } catch (e) {
      this.log(`❌ [${channelTitle}] Ошибка: ${(e as Error).message}`);
      return [];
    }
  }

  private getMimeType(m: TelegramMedia, type: string): string {
    if (type !== 'video')
      return type === 'photo' ? 'image/jpeg' : 'application/octet-stream';

    const mime = m.mimeType || '';
    if (mime) return mime;

    const attrs = m.attributes || [];
    for (const attr of attrs) {
      if (attr.fileName) {
        const ext = attr.fileName.split('.').pop()?.toLowerCase();
        if (ext === 'webm') return 'video/webm';
        if (ext === 'mkv') return 'video/x-matroska';
        if (ext === 'mp4' || ext === 'm4v') return 'video/mp4';
        if (ext === 'avi') return 'video/x-msvideo';
        if (ext === '3gp') return 'video/3gpp';
      }
    }

    return 'video/mp4';
  }

  private getFileExtension(mimeType: string): string {
    const map: Record<string, string> = {
      'video/webm': 'webm',
      'video/x-matroska': 'mkv',
      'video/mp4': 'mp4',
      'video/x-msvideo': 'avi',
      'video/3gpp': '3gp',
    };
    return map[mimeType] || 'mp4';
  }

  private async downloadWithTimeout(
    client: TelegramClient,
    filePath: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    media: any,
    timeoutMs: number = 60000
  ): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      await client.downloadToFile(filePath, media);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async downloadThumbnail(
    client: TelegramClient,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thumbnail: any,
    timeoutMs: number = 30000
  ): Promise<Buffer | null> {
    try {
      const tmpPath = path.join(os.tmpdir(), `thumb_${Date.now()}.jpg`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      await client.downloadToFile(tmpPath, thumbnail);
      clearTimeout(timeout);

      const buffer = await fs.readFile(tmpPath);
      await fs.unlink(tmpPath).catch(() => {});

      return buffer;
    } catch {
      return null;
    }
  }

  private canGetFileId(thumbnail: TelegramThumbnail): boolean {
    try {
      if (thumbnail.fileId && thumbnail.type !== 'i') {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async downloadWithRetry(
    client: TelegramClient,
    filePath: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    media: any,
    maxRetries: number = 7,
    timeoutMs: number = 60000
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await client.downloadToFile(filePath, media as any);
        clearTimeout(timeout);

        const stats = await fs.stat(filePath);
        if (stats.size > 0) {
          return true;
        }

        await fs.unlink(filePath).catch(() => {});
        this.log(
          `   ⚠️ Попытка ${attempt}/${maxRetries}: файл пустой, повторяю...`
        );
      } catch (e) {
        await fs.unlink(filePath).catch(() => {});
        const errMsg = e instanceof Error ? e.message : 'unknown';
        if (errMsg.includes('aborted')) {
          this.log(
            `   ⚠️ Попытка ${attempt}/${maxRetries}: таймаут, повторяю...`
          );
        } else {
          this.log(
            `   ⚠️ Попытка ${attempt}/${maxRetries}: ошибка, повторяю...`
          );
        }
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    return false;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private getBestPhotoSize(m: any): any {
    if (!m.sizes || !Array.isArray(m.sizes) || m.sizes.length === 0) {
      return m;
    }

    const sortedSizes = [...m.sizes].sort(
      (a: any, b: any) => b.width - a.width
    );

    for (const size of sortedSizes) {
      if (size && size.width && size.width > 100) {
        return size;
      }
    }

    return m.sizes[0];
  }

  private async extractMedia(
    m: any,
    client: TelegramClient
  ): Promise<TelegramPostMedia | null> {
    /* eslint-enable @typescript-eslint/no-explicit-any */
    let type: TelegramPostMedia['type'] | null = null;

    if (m.type === 'photo') type = 'photo';
    else if (
      m.type === 'video' ||
      m.type === 'animation' ||
      (m.mimeType || '').includes('video')
    )
      type = 'video';
    else if (m.type === 'document') type = 'document';

    if (!type) return null;

    const mediaToDownload =
      type === 'photo' && m.sizes ? this.getBestPhotoSize(m) : m;

    const mimeType = this.getMimeType(mediaToDownload, type);
    const ext = this.getFileExtension(mimeType);
    const fileName = `${m.fileId}.${ext}`;
    const tmpPath = path.join(os.tmpdir(), fileName);
    let thumbnailBuffer: Buffer | undefined;

    this.log(`   ⏳ Скачиваю ${type} (${mimeType})...`);

    try {
      const downloaded = await this.downloadWithRetry(
        client,
        tmpPath,
        mediaToDownload
      );

      if (!downloaded) {
        throw new Error(
          'Не удалось скачать файл после нескольких попыток'
        );
      }

      const stats = await fs.stat(tmpPath);
      const fileBuffer = await fs.readFile(tmpPath);
      await fs.unlink(tmpPath).catch(() => {});
      this.log(
        `✅ Готово (${(stats.size / 1024 / 1024).toFixed(2)} MB)\n`
      );

      if (type === 'video' && m.thumbnails && m.thumbnails.length > 0) {
        const validThumbs = m.thumbnails.filter((t: TelegramThumbnail) =>
          this.canGetFileId(t)
        );
        const videoThumb =
          validThumbs.find(
            (t: TelegramThumbnail) =>
              t.type === 'v' || t.type === 'u' || t.isVideo
          ) ||
          validThumbs[0] ||
          m.thumbnails[0];

        if (videoThumb && this.canGetFileId(videoThumb)) {
          try {
            this.log(`   🖼️  Скачиваю thumbnail...`);
            const thumb = await this.downloadThumbnail(client, videoThumb);
            if (thumb) {
              thumbnailBuffer = thumb;
              this.log(
                `✅ Thumbnail готов (${(thumb.length / 1024).toFixed(1)} KB)`
              );
            }
          } catch {
            this.log(
              `   ⚠️ Не удалось скачать thumbnail, продолжаем без него`
            );
          }
        }
      }

      return {
        type,
        fileId: m.fileId,
        tempPath: tmpPath,
        mimeType,
        fileName,
        width: m.width || 0,
        height: m.height || 0,
        fileBuffer,
        thumbnailBuffer,
      } as TelegramPostMedia & { fileBuffer: Buffer };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'unknown';
      if (errMsg.includes('aborted') || errMsg.includes('Abort')) {
        console.error(`\n⏱️ Таймаут скачивания ${m.fileId}`);
      } else {
        console.error(`\n❌ Ошибка скачивания ${m.fileId}:`, e);
      }
      await fs.unlink(tmpPath).catch(() => {});
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
        channelTitle: post.channelTitle,
        url: newsUrl,
        publishedAt: post.date.toISOString(),
      });

      if (post.media.length > 0) {
        this.log(`   🚀 Загрузка в базу: ${post.media.length} файлов...`);
        for (let i = 0; i < post.media.length; i++) {
          const m = post.media[i];

          const buffer = m.fileBuffer || (await fs.readFile(m.tempPath));
          const fileSize = buffer.length;
          this.log(
            `      📄 Размер файла: ${(fileSize / 1024 / 1024).toFixed(2)} MB`
          );

          const formData = new FormData();

          formData.append('newsId', newsRecord.id);
          formData.append('type', m.type);
          formData.append('order', i.toString());
          formData.append('width', m.width.toString());
          formData.append('height', m.height.toString());
          formData.append('size', fileSize.toString());
          formData.append('isCompressed', 'false');

          const uint8Array = new Uint8Array(buffer);
          const fileObj = new Blob([uint8Array], { type: m.mimeType });
          formData.append('file', fileObj, m.fileName);

          // Retry logic for media upload (3 attempts)
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              await pb
                .collection('media')
                .create(formData, { requestKey: null });
              break;
            } catch (mediaErr: any) {
              const errorStatus = mediaErr.status ?? 0;
              const errorData = mediaErr.data;
              this.log(
                `   ⚠️ Попытка ${attempt}/3: ошибка ${errorStatus}, данные: ${JSON.stringify(errorData)}`
              );
              if (
                attempt < 3 &&
                (errorStatus === 413 ||
                  errorStatus === 429 ||
                  errorStatus >= 500 ||
                  errorStatus === 0)
              ) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
              } else {
                throw mediaErr;
              }
            }
          }

          await fs.unlink(m.tempPath).catch(() => {});
          this.log(
            `      [${i + 1}/${post.media.length}] Файл загружен и удален из tmp\n`
          );

          if (m.thumbnailBuffer) {
            const thumbSize = m.thumbnailBuffer.length;
            this.log(
              `   🖼️  Сохраняю thumbnail (${(thumbSize / 1024).toFixed(1)} KB)...`
            );

            const thumbFormData = new FormData();
            thumbFormData.append('newsId', newsRecord.id);
            thumbFormData.append('type', 'thumbnail');
            thumbFormData.append('order', '-1');
            thumbFormData.append('size', thumbSize.toString());
            thumbFormData.append('isCompressed', 'true');

            const thumbUint8 = new Uint8Array(m.thumbnailBuffer);
            const thumbBlob = new Blob([thumbUint8], {
              type: 'image/jpeg',
            });
            thumbFormData.append(
              'file',
              thumbBlob,
              `thumb_${m.fileId}.jpg`
            );

            await pb
              .collection('media')
              .create(thumbFormData, { requestKey: null });
            this.log(`✅ Thumbnail сохранён\n`);
          }
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
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errAny = e as any;
        const isNetworkError =
          errAny.code === 'ECONNRESET' ||
          errAny.message?.includes('ECONNRESET') ||
          errAny.message?.includes('ETIMEDOUT') ||
          errAny.message?.includes('socket');

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
            lastError?.message
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
    await this.ensureMediaSizeLimit();
    let totalSaved = 0;
    let lastError: Error | null = null;

    for (const channel of channels) {
      try {
        this.log(`\n🔄 [${channel}] Обновляю аватарку канала...`);

        // Сначала получаем посты чтобы достать peerId
        const posts = await this.withRetry(
          () => this.getChannelPosts(client, channel, limit),
          3,
          2000
        );

        // Обновляем аватарку с использованием peerId из первого поста
        const peerId = posts.length > 0 ? posts[0].peerId : undefined;
        await this.updateChannelAvatar(client, channel, peerId);

        for (const post of posts) {
          if (await this.saveNews(post)) {
            totalSaved++;
            this.log(`✨ Пост сохранен! (Всего: ${totalSaved})`);
          }
        }
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        console.error(
          `🔴 Ошибка на канале ${channel}:`,
          lastError.message
        );
      }
    }

    if (lastError && totalSaved === 0) {
      throw new Error(`Не удалось получить новости: ${lastError.message}`);
    }

    return totalSaved;
  }

  private async updateChannelAvatar(
    client: TelegramClient,
    channelUsername: string,
    peerId?: string
  ): Promise<void> {
    const username = channelUsername.replace('@', '');
    const pb = await this.getPb();

    // Если есть валидный username - пробуем по нему
    if (
      username &&
      /^[a-zA-Z0-9_]+$/.test(username) &&
      username.length >= 3
    ) {
      try {
        const chat = await client.getChat(username);
        const photo = chat.photo;

        if (!photo) {
          this.log(`   ℹ️ У канала нет аватарки`);
          return;
        }

        this.log(`   ⬇️ Скачиваю аватарку...`);
        const photoToDownload = photo.big || photo.small;
        const tempPath = path.join(os.tmpdir(), `avatar_${username}.jpg`);

        await client.downloadToFile(tempPath, photoToDownload);

        const fileBuffer = await fs.readFile(tempPath);
        await fs.unlink(tempPath).catch(() => {});

        const subscriptions = await pb
          .collection('subscriptions')
          .getFullList({
            filter: `channelUsername = "${username}"`,
            fields: 'id',
          });

        if (subscriptions.length === 0) {
          this.log(`   ℹ️ Нет подписок для @${username}`);
          return;
        }

        const formData = new FormData();
        const uint8Array = new Uint8Array(fileBuffer);
        const fileObj = new Blob([uint8Array], { type: 'image/jpeg' });
        formData.append('avatar', fileObj, `avatar_${username}.jpg`);

        for (const sub of subscriptions) {
          await pb.collection('subscriptions').update(sub.id, formData);
        }

        this.log(
          `   ✅ Аватарка обновлена для ${subscriptions.length} подписки(ек)`
        );
        return;
      } catch {
        // Продолжаем - попробуем другие способы
      }
    }

    // Для каналов без username (русские названия) - пробуем использовать peerId
    if (peerId) {
      try {
        // Пробуем через getHistory - получаем любое сообщение из канала
        // Это даст нам объект чата с информацией
        const messages = await client.getHistory(username || peerId, {
          limit: 1,
        });
        if (messages.length > 0 && messages[0].chat) {
          const chat = messages[0].chat;
          const photo = chat.photo;

          if (photo) {
            this.log(`   ⬇️ Скачиваю аватарку по peerId...`);
            const photoToDownload = photo.big || photo.small;
            const tempPath = path.join(
              os.tmpdir(),
              `avatar_by_id_${peerId}.jpg`
            );

            await client.downloadToFile(tempPath, photoToDownload);

            const fileBuffer = await fs.readFile(tempPath);
            await fs.unlink(tempPath).catch(() => {});

            // Обновляем все подписки где channelUsername совпадает с peerId
            const subscriptions = await pb
              .collection('subscriptions')
              .getFullList({
                filter: `channelUsername = "${peerId}"`,
                fields: 'id',
              });

            if (subscriptions.length > 0) {
              const formData = new FormData();
              const uint8Array = new Uint8Array(fileBuffer);
              const fileObj = new Blob([uint8Array], {
                type: 'image/jpeg',
              });
              formData.append('avatar', fileObj, `avatar_${peerId}.jpg`);

              for (const sub of subscriptions) {
                await pb
                  .collection('subscriptions')
                  .update(sub.id, formData);
              }
              this.log(
                `   ✅ Аватарка обновлена для ${subscriptions.length} подписки(ек)`
              );
              return;
            }
          }
        }
      } catch (e) {
        this.log(
          `   ℹ️ Не удалось получить аватарку по peerId: ${e instanceof Error ? e.message : 'unknown'}`
        );
      }
    }

    this.log(`   ℹ️ Пропускаю аватарку (нет валидного username)`);
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

      this.log(`✨ Очистка завершена. Удалено постов: ${deletedCount}`);
      return deletedCount;
    } catch (err) {
      console.error('❌ Ошибка при выполнении очистки:', err);
      return 0;
    }
  }

  async ensureMediaSizeLimit(
    limitMB: number = parseInt('15360')
  ): Promise<void> {
    const pb = await this.getPb();
    const limit = limitMB * 1024 * 1024;
    this.log(
      `\n📏 [Media Limit] Проверяю лимит медиафайлов (${limitMB} МБ)...`
    );
    try {
      // Получаем все медиафайлы с их размерами
      const allMedia = await pb.collection('media').getFullList({
        fields: 'id,size,newsId,created',
        sort: '+created',
      });
      const totalSize = allMedia.reduce(
        (sum, m) => sum + (m.size || 0),
        0
      );
      const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

      this.log(
        `📊 [Media Limit] Текущий размер: ${totalSizeMB} МБ (${allMedia.length} файлов)`
      );
      if (totalSize <= limit) {
        this.log('✅ [Media Limit] Лимит не превышен.');
        return;
      }
      this.log(
        `⚠️ [Media Limit] Лимит превышен на ${((totalSize - limit) / 1024 / 1024).toFixed(2)} МБ. Начинаю очистку...`
      );
      // Группируем медиа по newsId
      const mediaByNews = new Map<
        string,
        { size: number; mediaIds: string[] }
      >();
      for (const m of allMedia) {
        if (!mediaByNews.has(m.newsId)) {
          mediaByNews.set(m.newsId, { size: 0, mediaIds: [] });
        }
        const newsData = mediaByNews.get(m.newsId)!;
        newsData.size += m.size || 0;
        newsData.mediaIds.push(m.id);
      }
      // Получаем новости, отсортированные по дате (от старых к новым)
      const sortedNews = await pb.collection('news').getFullList({
        fields: 'id,publishedAt',
        sort: '+publishedAt',
      });
      let freedSize = totalSize;
      let deletedCount = 0;
      for (const news of sortedNews) {
        if (freedSize <= limit) break;
        const newsMedia = mediaByNews.get(news.id);
        if (newsMedia) {
          // Удаляем медиафайлы новости
          for (const mediaId of newsMedia.mediaIds) {
            try {
              await pb.collection('media').delete(mediaId);
            } catch (err) {
              console.error(`❌ Ошибка удаления медиа ${mediaId}:`, err);
            }
          }
          freedSize -= newsMedia.size;
        }
        // Удаляем новость
        try {
          await pb.collection('news').delete(news.id);
          deletedCount++;
        } catch (err) {
          console.error(`❌ Ошибка удаления новости ${news.id}:`, err);
        }
      }
      this.log(
        `✨ [Media Limit] Очистка завершена. Удалено новостей: ${deletedCount}`
      );
      this.log(
        `📊 [Media Limit] Освобождено: ${((totalSize - freedSize) / 1024 / 1024).toFixed(2)} МБ`
      );
    } catch (err) {
      console.error('❌ [Media Limit] Ошибка проверки лимита:', err);
    }
  }
}

export interface ParserCallbacks {
  onLog?: (message: string) => void;
}

export async function telegramParser(
  channels: string[],
  limit: number = parseInt(process.env.POST_LIMIT!),
  callbacks?: ParserCallbacks
) {
  const service = new TelegramParserService();
  service.clearLogs();
  service.setCallbacks(callbacks);

  service.log('🧹 Запуск очистки старых данных...');
  const deletedCount = await service.deleteOldNews(3);
  if (deletedCount > 0) {
    service.log(`♻️  Очищено постов: ${deletedCount}`);
  } else {
    service.log('✅ База уже чиста, старых постов нет.');
  }
  const savedCount = await service.fetchAndSaveNews(channels, limit);
  return {
    savedCount,
    logs: service.getLogs(),
  };
}
