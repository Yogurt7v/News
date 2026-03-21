import { redirect } from 'next/navigation';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { NewsList } from '@/widgets/news-card/ui/NewsList';
import createServerClient from '@/shared/lib/pocketbase.server';
import { NoSubscriptions } from '@/widgets/sidebar/ui/NoSubscriptions';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ channel?: string; group?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const pb = await createServerClient();
  if (!pb.authStore.isValid) {
    redirect('/auth/signin');
  }

  const { channel, group } = await searchParams;

  let filter = '';
  let hasSubscriptions = false; // флаг для инструкции

  // Если выбрана группа
  if (group) {
    try {
      const groupRecord = await pb.collection('groups').getOne(group);
      if (groupRecord?.channels?.length) {
        const channelList = groupRecord.channels.map(
          (ch: string) => `@${ch}`
        );
        filter = channelList
          .map((ch: string) => `source = "${ch}"`)
          .join(' || ');
      } else {
        filter = 'id = ""';
      }
    } catch (e) {
      console.error('Ошибка получения группы:', e);
      filter = 'id = ""';
    }
  }
  // Если выбран конкретный канал
  else if (channel) {
    filter = `source = "@${channel.replace(/^@/, '')}"`;
  }
  // Без параметров – показываем новости из подписок пользователя
  else {
    const userId = pb.authStore.model?.id;
    if (userId) {
      // Получаем все подписки пользователя
      const subscriptions = await pb
        .collection('subscriptions')
        .getFullList({
          filter: `userId = "${userId}"`,
        });
      if (subscriptions.length > 0) {
        hasSubscriptions = true;
        const channelList = subscriptions.map(
          (s: any) => `@${s.channelUsername}`
        );
        filter = channelList
          .map((ch: string) => `source = "${ch}"`)
          .join(' || ');
      } else {
        // Нет подписок – показываем пустой список
        filter = 'id = ""';
      }
    } else {
      filter = 'id = ""';
    }
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
              : 'Мои подписки'}
        </h1>
        {result.items.length > 0 ? (
          <NewsList initialNews={result.items} />
        ) : (
          <NoSubscriptions hasSubscriptions={hasSubscriptions} />
        )}
      </main>
    </div>
  );
}
