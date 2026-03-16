import 'dotenv/config';
import { telegramParser } from '@/features/telegram-parser/parser.service';
import { getChannelsList } from '@/shared/config/telegram';
import pb from '@/lib/pocketbase';
import { readFile, unlink } from 'fs/promises';

async function testPocketBase() {
  console.log('🚀 Тестирование сохранения в PocketBase');
  const channels = getChannelsList();
  console.log('Каналы:', channels);

  const posts = await telegramParser.getMultipleChannelsPosts(channels, 2);
  console.log(`Получено постов: ${posts.length}`);

  for (const post of posts) {
    const url = `https://t.me/${post.channelUsername}/${post.id}`;
    const existing = await pb
      .collection('news')
      .getFirstListItem(`url="${url}"`)
      .catch(() => null);
    if (existing) {
      console.log(`⏭️ Новость уже существует: ${post.id}`);
      // Удаляем временные файлы
      if (post.media) {
        for (const m of post.media) {
          await unlink(m.tempPath).catch(() => {});
        }
      }
      continue;
    }

    // Создаём новость
    const newsData = {
      title:
        post.message.split('\n')[0].slice(0, 100) || 'Новость из Telegram',
      content: post.message,
      source: `@${post.channelUsername}`,
      url,
      publishedAt: post.date.toISOString(),
      channelUsername: post.channelUsername,
      channelTitle: post.channelTitle || '',
    };
    const newNews = await pb.collection('news').create(newsData);
    console.log(`✅ Создана новость: ${newNews.id}`);

    // Загружаем медиа
    if (post.media && post.media.length > 0) {
      for (let i = 0; i < post.media.length; i++) {
        const m = post.media[i];
        console.log(
          `   Загружаю медиа ${i + 1}/${post.media.length}: ${m.tempPath}`
        );

        const fileBuffer = await readFile(m.tempPath);
        const fileName = m.fileName || `file${i}.jpg`;

        // Создаём FormData без сторонних библиотек
        const formData = new FormData();
        formData.append('newsId', newNews.id);
        formData.append('type', m.type);
        formData.append('order', i.toString());
        formData.append('file', new Blob([fileBuffer]), fileName); // Blob для передачи файла

        if (m.mimeType) formData.append('mimeType', m.mimeType);
        if (m.width) formData.append('width', m.width.toString());
        if (m.height) formData.append('height', m.height.toString());

        await pb.collection('media').create(formData);
        console.log(`   ✅ Медиа загружено`);

        await unlink(m.tempPath);
      }
    }
  }

  console.log('🎉 Тест завершён');
}

testPocketBase().catch(console.error);
