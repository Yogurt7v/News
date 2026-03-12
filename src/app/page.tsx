import { db } from '@/db';
import { news } from '@/db/schema';
import { NewsList } from '@/widgets/news-card/ui/NewsList';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ channel?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { channel } = await searchParams;

  let query = db.query.news.findMany({
    limit: 20,
    orderBy: [desc(news.publishedAt)],
    with: { media: true },
  });

  // Если указан канал, фильтруем по источнику (source = @channel)
  if (channel) {
    const source = `@${channel.replace(/^@/, '')}`;
    query = db.query.news.findMany({
      where: eq(news.source, source),
      limit: 20,
      orderBy: [desc(news.publishedAt)],
      with: { media: true },
    });
  }

  const newsItems = await query;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">
          {channel ? `Новости канала @${channel}` : 'Все новости'}
        </h1>
        <NewsList initialNews={newsItems} />
      </main>
    </div>
  );
}
