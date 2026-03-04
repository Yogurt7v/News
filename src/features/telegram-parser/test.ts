import 'dotenv/config';

import { getChannelsList } from '@/shared/config/telegram';
import { telegramParser } from './parser.service';

async function test() {
  try {
    const channels = getChannelsList();
    console.log('Каналы для парсинга:', channels);

    const savedCount = await telegramParser.fetchAndSaveNews(channels, 3);
    console.log(`✅ Сохранено ${savedCount} новых новостей`);

    // Проверим, что в базе появились новости
    const { db } = await import('@/db');
    const allNews = await db.query.news.findMany({
      limit: 5,
      orderBy: (news, { desc }) => [desc(news.publishedAt)],
    });
    console.log(
      'Последние новости в БД:',
      allNews.map((n) => ({ title: n.title, source: n.source }))
    );
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

test();
