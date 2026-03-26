import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { news, groups, groupChannels } from '@/db/schema';
import { desc, eq, inArray, and } from 'drizzle-orm';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

interface NewsWithMedia {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: Date;
  createdAt: Date;
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

  // Fetch media for all news IDs from PocketBase
  const allMedia = await pb.collection('media').getFullList({
    filter: newsIds.map((id) => `newsId = "${id}"`).join(' || '),
  });

  // Group by newsId
  for (const m of allMedia) {
    const newsId = m.get('newsId');
    if (!mediaMap.has(newsId)) {
      mediaMap.set(newsId, []);
    }
    mediaMap.get(newsId)!.push({
      id: m.id,
      type: m.get('type'),
      file: m.get('file'),
      order: m.get('order') || 0,
    });
  }

  // Sort by order
  for (const [_, arr] of mediaMap) {
    arr.sort((a, b) => a.order - b.order);
  }

  return mediaMap;
}

export async function GET(request: NextRequest) {
  // 1. Проверяем авторизацию
  const pb = await getServerPocketBase();
  const userId = pb.authStore.record?.id;
  if (!pb.authStore.isValid || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Получаем параметры запроса
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');
  const channel = searchParams.get('channel');
  const groupId = searchParams.get('group');

  let newsQuery;

  // 3. Фильтрация по группе
  if (groupId) {
    const userGroup = await db.query.groups.findFirst({
      where: and(eq(groups.id, groupId), eq(groups.userId, userId)),
    });
    if (!userGroup) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const groupChannelList = await db.query.groupChannels.findMany({
      where: eq(groupChannels.groupId, groupId),
      columns: { channelUsername: true },
    });

    const usernames = groupChannelList.map(
      (gc) => `@${gc.channelUsername}`
    );

    if (usernames.length === 0) {
      return NextResponse.json([]);
    }

    newsQuery = db.query.news.findMany({
      where: inArray(news.source, usernames),
      limit,
      offset,
      orderBy: [desc(news.publishedAt)],
    });
  }
  // 4. Фильтрация по одному каналу
  else if (channel) {
    const source = `@${channel.replace(/^@/, '')}`;
    newsQuery = db.query.news.findMany({
      where: eq(news.source, source),
      limit,
      offset,
      orderBy: [desc(news.publishedAt)],
    });
  }
  // 5. Без фильтрации
  else {
    newsQuery = db.query.news.findMany({
      limit,
      offset,
      orderBy: [desc(news.publishedAt)],
    });
  }

  // 6. Выполняем запрос
  const items = await newsQuery;

  // 7. Получаем медиа из PocketBase
  const newsIds = items.map((item) => item.id);
  const mediaMap = await fetchMediaFromPocketBase(pb, newsIds);

  // 8. Объединяем
  const result: NewsWithMedia[] = items.map((item) => ({
    ...item,
    media: mediaMap.get(item.id) || [],
  }));

  return NextResponse.json(result);
}
