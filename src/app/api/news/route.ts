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
    thumbnailUrl?: string;
  }>;
}

interface MediaItem {
  id: string;
  type: string;
  file: string;
  order: number;
  thumbnailUrl?: string;
}

async function fetchMediaFromPocketBase(
  pb: import('pocketbase').default,
  newsIds: string[]
): Promise<Map<string, MediaItem[]>> {
  const mediaMap = new Map<string, MediaItem[]>();

  if (newsIds.length === 0) return mediaMap;

  const allMedia = await pb.collection('media').getFullList({
    filter: newsIds.map((id) => `newsId = "${id}"`).join(' || '),
  });

  const pocketbaseUrl =
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://5.53.125.238:8090';

  const thumbnailMap = new Map<string, string>();
  for (const m of allMedia) {
    if (m.type === 'thumbnail') {
      const newsId = m.newsId as string;
      const fileUrl = `${pocketbaseUrl}/api/files/media/${m.id}/${m.file}`;
      thumbnailMap.set(newsId, fileUrl);
    }
  }

  for (const m of allMedia) {
    if (m.type === 'thumbnail') continue;

    const newsId = m.newsId as string;
    const fileUrl = `${pocketbaseUrl}/api/files/media/${m.id}/${m.file}`;
    const thumbnailUrl = thumbnailMap.get(newsId) || undefined;

    if (!mediaMap.has(newsId)) {
      mediaMap.set(newsId, []);
    }
    mediaMap.get(newsId)!.push({
      id: m.id,
      type: m.type as string,
      file: fileUrl,
      order: (m.order as number) || 0,
      thumbnailUrl,
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
  const ids = searchParams.get('ids');

  // Endpoint для fetch конкретных новостей по IDs (для realtime updates)
  if (ids) {
    const newsIds = ids.split(',').filter(Boolean);
    if (newsIds.length === 0) {
      return NextResponse.json([]);
    }

    const newsList = await pb.collection('news').getList<{
      id: string;
      title: string;
      content: string;
      source: string;
      url: string;
      publishedAt: string;
      createdAt: string;
    }>(1, newsIds.length, {
      filter: newsIds.map((id) => `id = "${id}"`).join(' || '),
      sort: '-created',
    });

    const mediaMap = await fetchMediaFromPocketBase(pb, newsIds);

    const result: NewsWithMedia[] = newsList.items.map((item) => ({
      ...item,
      media: mediaMap.get(item.id) || [],
    }));

    return NextResponse.json(result);
  }

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
  }>(Math.floor(offset / limit) + 1, limit, {
    sort: '-created',
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
