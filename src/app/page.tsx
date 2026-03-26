import { redirect } from 'next/navigation';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { NewsList } from '@/widgets/news-card/ui/NewsList';
import createServerClient from '@/shared/lib/pocketbase.server';
import { NoSubscriptions } from '@/widgets/sidebar/ui/NoSubscriptions';
import { Wallpaper } from '@/widgets/wallpaper/ui/Wallpaper';
import { PageHeader } from '@/app/page/ui/PageHeader';

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
  let hasSubscriptions = false;
  let subscriptionCount = 0;

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
  } else if (channel) {
    filter = `source = "@${channel.replace(/^@/, '')}"`;
  } else {
    const userId = pb.authStore.model?.id;
    if (userId) {
      const subscriptions = await pb
        .collection('subscriptions')
        .getFullList({
          filter: `userId = "${userId}"`,
        });
      subscriptionCount = subscriptions.length;
      if (subscriptions.length > 0) {
        hasSubscriptions = true;
        const channelList = subscriptions.map(
          (s) =>
            `@${(s as unknown as { channelUsername: string }).channelUsername}`
        );
        filter = channelList
          .map((ch: string) => `source = "${ch}"`)
          .join(' || ');
      } else {
        filter = 'id = ""';
      }
    } else {
      filter = 'id = ""';
    }
  }

  const result = await pb.collection('news').getList(1, 20, {
    filter: filter || undefined,
    sort: '-publishedAt',
    expand: 'media(newsId)',
  });

  const pageTitle = group
    ? 'Новости группы'
    : channel
      ? `@${channel.replace('@', '')}`
      : 'Мои подписки';

  const statsText =
    subscriptionCount > 0
      ? `${subscriptionCount} канал${subscriptionCount === 1 ? '' : subscriptionCount < 5 ? 'а' : 'ов'} • ${result.totalItems} новостей`
      : undefined;

  return (
    <Wallpaper>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Header */}
            <PageHeader
              title={pageTitle}
              statsText={statsText}
              showHint={!hasSubscriptions && !channel && !group}
            />

            {/* Content */}
            {result.items.length > 0 ? (
              <NewsList
                initialNews={
                  result.items as unknown as Parameters<
                    typeof NewsList
                  >[0]['initialNews']
                }
              />
            ) : (
              <NoSubscriptions hasSubscriptions={hasSubscriptions} />
            )}
          </div>
        </main>
      </div>
    </Wallpaper>
  );
}
