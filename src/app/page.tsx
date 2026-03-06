import { db } from '@/db';
import { news } from '@/db/schema';
import { NewsList } from '@/widgets/news-card/ui/NewsList';
import { desc, sql, eq } from 'drizzle-orm';
import Link from 'next/link'; // Используем Link для навигации

export const dynamic = 'force-dynamic';

// Добавляем типизацию для пропсов страницы
interface HomePageProps {
  searchParams: { channel?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const selectedChannel = searchParams.channel;

  // 1. Получаем новости (с фильтром, если выбран канал)
  const newsItems = await db.query.news.findMany({
    limit: 20,
    where: selectedChannel ? eq(news.source, selectedChannel) : undefined,
    orderBy: [desc(news.publishedAt)],
    with: { media: true },
  });

  // 2. Получаем список каналов для сайдбара
  const channels = await db
    .select({
      username: news.source,
      count: sql<number>`count(*)`,
    })
    .from(news)
    .groupBy(news.source)
    .orderBy(sql`count(*) DESC`);

  return (
    <div className="flex h-screen bg-[#f0f2f5] dark:bg-[#1c1c1c] overflow-hidden">
      {/* Левая панель */}
      <aside className="w-80 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#242424] flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <Link href="/">
            <h2 className="text-xl font-bold text-[#2481cc] cursor-pointer hover:opacity-80 transition-opacity">
              Channels
            </h2>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Ссылка "Все каналы" */}
          <Link
            href="/"
            className={`p-3 flex items-center gap-3 transition-colors hover:bg-gray-100 dark:hover:bg-[#2b2b2b] ${!selectedChannel ? 'bg-blue-50 dark:bg-[#2b2b2b] border-l-4 border-[#2481cc]' : ''}`}
          >
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
              🌍
            </div>
            <span className="font-semibold text-sm dark:text-gray-200">
              Все новости
            </span>
          </Link>

          {channels.map((ch) => (
            <Link
              key={ch.username}
              href={`/?channel=${encodeURIComponent(ch.username || '')}`}
              className={`p-3 flex items-center gap-3 transition-colors hover:bg-gray-100 dark:hover:bg-[#2b2b2b] ${
                selectedChannel === ch.username
                  ? 'bg-blue-50 dark:bg-[#2b2b2b] border-l-4 border-[#2481cc]'
                  : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full g-linear-to-tr from-[#33a8e2] to-[#2481cc] flex items-center justify-center text-white font-bold text-lg shrink-0">
                {ch.username?.slice(0, 1).toUpperCase() || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate dark:text-gray-200">
                  {ch.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {ch.count} сообщений
                </p>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* Правая часть: Лента */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#e7ebf0] dark:bg-[#0f0f0f]">
        <header className="h-14 bg-white dark:bg-[#242424] border-b border-gray-200 dark:border-gray-800 flex items-center px-6 z-10 shadow-sm">
          <h1 className="font-medium dark:text-white">
            {selectedChannel ? `Канал: ${selectedChannel}` : 'Все новости'}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          <div className="max-w-2xl mx-auto">
            {/* ВАЖНО: Добавляем key={selectedChannel}, чтобы React полностью 
               пересоздавал NewsList при смене канала, сбрасывая его внутренний стейт 
            */}
            <NewsList
              key={selectedChannel}
              initialNews={newsItems}
              currentChannel={selectedChannel}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
