import { redirect } from 'next/navigation';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { Wallpaper } from '@/widgets/wallpaper/ui/Wallpaper';
import createServerClient from '@/shared/lib/pocketbase.server';
import { PageContent } from './page/ui/PageContent';
import type { PageProps } from './page.types';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: PageProps) {
  const pb = await createServerClient();
  if (!pb.authStore.isValid) {
    redirect('/auth/signin');
  }

  const { channel, group } = await searchParams;

  const isAdmin =
    (pb.authStore.model as unknown as { isAdmin?: boolean })?.isAdmin ??
    false;

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

  const result = await pb.collection('news').getList(1, 5, {
    filter: filter || undefined,
    sort: '-created',
    expand: 'media(newsId)',
  });

  const pocketbaseUrl =
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://5.53.125.238:8090';
  const newsIds = result.items.map((item) => item.id);

  let thumbnailMap = new Map<string, string>();
  if (newsIds.length > 0) {
    const allThumbs = await pb.collection('media').getFullList({
      filter: `newsId ~ "${newsIds.join('" || newsId ~ "')}" && type = "thumbnail"`,
      fields: 'newsId,id,file',
    });
    for (const thumb of allThumbs) {
      thumbnailMap.set(
        thumb.newsId as string,
        `${pocketbaseUrl}/api/files/media/${thumb.id}/${thumb.file}`
      );
    }
  }

  const newsItems = result.items.map(
    (
      item
    ): {
      id: string;
      title: string;
      content: string;
      source: string;
      url: string;
      publishedAt?: string;
      media?: Array<{
        type: string;
        file: string;
        order?: number;
        id: string;
        thumbnailUrl?: string;
      }>;
    } => {
      const media = item.expand?.['media(newsId)'] as
        | Array<{
            id: string;
            type: string;
            file: string;
            order: number;
          }>
        | undefined;

      const thumbUrl = thumbnailMap.get(item.id);
      const mediaWithThumb = media?.map((m, idx) => ({
        ...m,
        thumbnailUrl: idx === 0 && thumbUrl ? thumbUrl : undefined,
      }));

      return {
        id: item.id,
        title: item.title as string,
        content: item.content as string,
        source: item.source as string,
        url: item.url as string,
        publishedAt: item.publishedAt as string | undefined,
        media: mediaWithThumb,
      };
    }
  );

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
      <div className="flex min-h-dvh">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <PageContent
              title={pageTitle}
              statsText={statsText}
              showHint={!hasSubscriptions && !channel && !group}
              hasSubscriptions={hasSubscriptions}
              news={newsItems}
              isAdmin={isAdmin}
            />
          </div>
        </main>
      </div>
    </Wallpaper>
  );
}
