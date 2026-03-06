import 'dotenv/config';

import { getChannelsList } from '@/shared/config/telegram';
import { telegramParser } from './parser.service';

async function test() {
  try {
    const channels = getChannelsList();

    const savedCount = await telegramParser.fetchAndSaveNews(channels, 10);
    console.log(`✅ Сохранено ${savedCount} новых новостей`);

    // Проверим, что в базе появились новости
    const { db } = await import('@/db');
    const allNews = await db.query.news.findMany({
      limit: 10,
      orderBy: (news, { desc }) => [desc(news.publishedAt)],
      with: {
        media: true,
      },
    });
    allNews.forEach((n) => {
      console.log(`- [${n.source}] ${n.title}`);
      if (n.media && n.media.length > 0) {
        n.media.forEach((m) =>
          console.log(`  📸 Медиа (${m.type}): ${m.url}`)
        );
      } else {
        console.log(`  ⚠️ У этой новости НЕТ медиа в базе`);
      }
    });
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

test();
