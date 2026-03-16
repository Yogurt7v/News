import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import pb from '@/lib/pocketbase';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { NewsList } from '@/widgets/news-card/ui/NewsList';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ channel?: string; group?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  // Проверка авторизации (пока через NextAuth)
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { channel, group } = await searchParams;

  // Формируем фильтр для PocketBase
  let filter = '';
  if (group) {
    try {
      // Получаем группу и список её каналов
      const groupRecord = await pb.collection('groups').getOne(group);
      if (groupRecord?.channels?.length) {
        const channelList = groupRecord.channels.map(
          (ch: string) => `@${ch}`
        );
        filter = channelList.map((ch) => `source = "${ch}"`).join(' || ');
      } else {
        // Группа пуста – новостей нет
        filter = 'id = ""'; // заведомо ложное условие, чтобы вернуть пустой результат
      }
    } catch (e) {
      console.error('Ошибка получения группы:', e);
      filter = 'id = ""';
    }
  } else if (channel) {
    filter = `source = "@${channel.replace(/^@/, '')}"`;
  }

  // Запрос к PocketBase
  const result = await pb.collection('news').getList(1, 20, {
    filter: filter || undefined,
    sort: '-publishedAt',
    expand: 'media(newsId)',
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">
          {group
            ? 'Новости группы'
            : channel
              ? `Новости канала @${channel}`
              : 'Все новости'}
        </h1>
        <NewsList initialNews={result.items} />
      </main>
    </div>
  );
}
