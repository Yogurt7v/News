import { NextRequest, NextResponse } from 'next/server';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

export async function GET(request: NextRequest) {
  try {
    const pb = await getServerPocketBase();

    // Проверяем авторизацию
    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const userId = pb.authStore.record?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    const records = await pb.collection('groups').getFullList({
      filter: `userId = "${userId}"`,
      sort: 'name',
    });

    // Для каждой группы получаем каналы
    const groupsWithChannels = await Promise.all(
      records.map(async (group) => {
        try {
          const channels = await pb
            .collection('groupChannels')
            .getFullList({
              filter: `groupId = "${group.id}"`,
            });

          return {
            ...group,
            channels: channels.map((ch) => ({
              channelUsername: ch.channelUsername,
            })),
          };
        } catch {
          // Если коллекция groupChannels не существует или пуста
          return {
            ...group,
            channels: [],
          };
        }
      })
    );

    return NextResponse.json(groupsWithChannels);
  } catch (error: any) {
    console.error('Get groups error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении групп' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const pb = await getServerPocketBase();

    // Проверяем авторизацию
    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const userId = pb.authStore.record?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Укажите название группы' },
        { status: 400 }
      );
    }

    const group = await pb.collection('groups').create({
      userId,
      name,
    });

    return NextResponse.json(group);
  } catch (error: any) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании группы' },
      { status: 500 }
    );
  }
}
