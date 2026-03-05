import { db } from '@/db';
import { news } from '@/db/schema';
import { NewsList } from '@/widgets/news-card/ui/NewsList';
import { desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Получаем новости
  const newsItems = await db.query.news.findMany({
    limit: 20,
    orderBy: [desc(news.publishedAt)],
    with: { media: true },
  });

  const channels = await db
    .select({
      username: news.source,
      count: sql<number>`count(*)`,
    })
    .from(news)
    .groupBy(news.source)
    .orderBy(sql`count(*) DESC`);

  return (
    // h-screen и overflow-hidden важны для эффекта мессенджера
    <div className="flex h-screen bg-[#f0f2f5] dark:bg-[#1c1c1c] overflow-hidden">
      {/* Левая панель: Список каналов */}
      <aside className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#242424] flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2481cc]">Channels</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {channels.map((ch) => (
            <div
              key={ch.username}
              className="p-3 hover:bg-gray-100 dark:hover:bg-[#2b2b2b] cursor-pointer flex items-center gap-3 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#33a8e2] to-[#2481cc] flex items-center justify-center text-white font-bold text-lg">
                {ch.username?.slice(0, 1).toUpperCase() || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate dark:text-gray-200">
                  @{ch.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {ch.count} сообщений
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Правая часть: Лента */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#e7ebf0] dark:bg-[#0f0f0f]">
        <header className="h-14 bg-white dark:bg-[#242424] border-b border-gray-200 dark:border-gray-800 flex items-center px-6 z-10 shadow-sm">
          <h1 className="font-medium">Все новости</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          <div className="max-w-2xl mx-auto">
            <NewsList initialNews={newsItems} />
          </div>
        </div>
      </main>
    </div>
  );
}
