import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/db';
import { news, groups, groupChannels } from '@/db/schema';
import { desc, eq, inArray, and } from 'drizzle-orm';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  // 1. Проверяем авторизацию (главная страница доступна только залогиненным)
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Получаем параметры запроса
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');
  const channel = searchParams.get('channel'); // имя канала (без @)
  const groupId = searchParams.get('group'); // ID группы

  let newsQuery;

  // 3. Фильтрация по группе
  if (groupId) {
    // Проверяем, что группа принадлежит текущему пользователю
    const userGroup = await db.query.groups.findFirst({
      where: and(
        eq(groups.id, groupId),
        eq(groups.userId, session.user.id)
      ),
    });
    if (!userGroup) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Получаем все каналы, входящие в группу
    const groupChannelList = await db.query.groupChannels.findMany({
      where: eq(groupChannels.groupId, groupId),
      columns: { channelUsername: true },
    });

    // Преобразуем в массив строк вида "@username"
    const usernames = groupChannelList.map(
      (gc) => `@${gc.channelUsername}`
    );

    // Если группа пуста, можно вернуть пустой массив (нет каналов)
    if (usernames.length === 0) {
      return NextResponse.json([]);
    }

    // Фильтруем новости по всем каналам группы
    newsQuery = db.query.news.findMany({
      where: inArray(news.source, usernames),
      limit,
      offset,
      orderBy: [desc(news.publishedAt)],
      with: { media: true },
    });
  }
  // 4. Фильтрация по одному каналу
  else if (channel) {
    const source = `@${channel.replace(/^@/, '')}`; // добавляем @, если его нет
    newsQuery = db.query.news.findMany({
      where: eq(news.source, source),
      limit,
      offset,
      orderBy: [desc(news.publishedAt)],
      with: { media: true },
    });
  }
  // 5. Без фильтрации — все новости
  else {
    newsQuery = db.query.news.findMany({
      limit,
      offset,
      orderBy: [desc(news.publishedAt)],
      with: { media: true },
    });
  }

  // 6. Выполняем запрос
  const items = await newsQuery;
  return NextResponse.json(items);
}
