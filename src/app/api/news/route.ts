import { NextRequest, NextResponse } from 'next/server';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

interface NewsWithMedia {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: string;
  createdAt: string;
  media: Array<{
    id: string;
    type: string;
    file: string;
    order: number;
  }>;
}

async function fetchMediaFromPocketBase(
  pb: import('pocketbase').default,
  newsIds: string[]
): Promise<
  Map<
    string,
    Array<{ id: string; type: string; file: string; order: number }>
  >
> {
  const mediaMap = new Map<
    string,
    Array<{ id: string; type: string; file: string; order: number }>
  >();

  if (newsIds.length === 0) return mediaMap;

  const allMedia = await pb.collection('media').getFullList({
    filter: newsIds.map((id) => `newsId = "${id}"`).join(' || '),
  });

  for (const m of allMedia) {
    const newsId = m.get('newsId') as string;
    if (!mediaMap.has(newsId)) {
      mediaMap.set(newsId, []);
    }
    mediaMap.get(newsId)!.push({
      id: m.id,
      type: m.get('type') as string,
      file: m.get('file') as string,
      order: (m.get('order') as number) || 0,
    });
  }

  for (const [, arr] of mediaMap) {
    arr.sort((a, b) => a.order - b.order);
  }

  return mediaMap;
}

export async function GET(request: NextRequest) {
  const pb = await getServerPocketBase();
  const userId = pb.authStore.record?.id;
  if (!pb.authStore.isValid || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');
  const channel = searchParams.get('channel');
  const groupId = searchParams.get('group');

  let filter = '';

  if (groupId) {
    const group = await pb.collection('groups').getOne(groupId);
    if (!group || group.userId !== userId) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const groupChannels = await pb
      .collection('groupChannels')
      .getFullList({
        filter: `groupId = "${groupId}"`,
      });

    const usernames = groupChannels
      .map((gc) => `@${gc.channelUsername?.replace('@', '')}`)
      .filter(Boolean);

    if (usernames.length === 0) {
      return NextResponse.json([]);
    }

    filter = usernames.map((u) => `source = "${u}"`).join(' || ');
  } else if (channel) {
    const source = `@${channel.replace(/^@/, '')}`;
    filter = `source = "${source}"`;
  }

  const newsList = await pb.collection('news').getList<{
    id: string;
    title: string;
    content: string;
    source: string;
    url: string;
    publishedAt: string;
    createdAt: string;
  }>(offset + 1, limit, {
    sort: '-publishedAt',
    filter: filter || undefined,
  });

  const newsIds = newsList.items.map((item) => item.id);
  const mediaMap = await fetchMediaFromPocketBase(pb, newsIds);

  const result: NewsWithMedia[] = newsList.items.map((item) => ({
    ...item,
    media: mediaMap.get(item.id) || [],
  }));

  return NextResponse.json(result);
}
