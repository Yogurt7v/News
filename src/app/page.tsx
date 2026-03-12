import { db } from '@/db';
import { desc, eq, inArray } from 'drizzle-orm';
import { news, groups, groupChannels } from '@/db/schema';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { NewsList } from '@/widgets/news-card/ui/NewsList';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ channel?: string; group?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { channel, group } = await searchParams;

  let newsItems = [];

  // Если выбран параметр group – фильтруем по группе
  if (group) {
    // Проверяем, что группа принадлежит текущему пользователю
    const userGroup = await db.query.groups.findFirst({
      where: eq(groups.id, group),
      with: {
        channels: { columns: { channelUsername: true } },
      },
    });

    if (userGroup && userGroup.userId === session.user.id) {
      const usernames = userGroup.channels.map(
        (c: { channelUsername: string }) => `@${c.channelUsername}`
      );
      if (usernames.length > 0) {
        newsItems = await db.query.news.findMany({
          where: inArray(news.source, usernames),
          limit: 20,
          orderBy: [desc(news.publishedAt)],
          with: { media: true },
        });
      } else {
        // Группа пуста – новостей нет
        newsItems = [];
      }
    } else {
      // Группа не принадлежит пользователю – показываем все новости (или пусто)
      newsItems = await db.query.news.findMany({
        limit: 20,
        orderBy: [desc(news.publishedAt)],
        with: { media: true },
      });
    }
  }
  // Если выбран параметр channel – фильтруем по одному каналу
  else if (channel) {
    const source = `@${channel.replace(/^@/, '')}`;
    newsItems = await db.query.news.findMany({
      where: eq(news.source, source),
      limit: 20,
      orderBy: [desc(news.publishedAt)],
      with: { media: true },
    });
  }
  // Без фильтра – все новости
  else {
    newsItems = await db.query.news.findMany({
      limit: 20,
      orderBy: [desc(news.publishedAt)],
      with: { media: true },
    });
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">
          {group ? 'Новости группы' : channel ? `Новости канала @${channel}` : 'Все новости'}
        </h1>
        <NewsList initialNews={newsItems} />
      </main>
    </div>
  );
}