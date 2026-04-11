import { NextRequest, NextResponse } from 'next/server';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { groupId } = resolvedParams;
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

    // Проверяем ownership группы
    const group = await pb.collection('groups').getOne(groupId);
    if (group.userId !== userId) {
      return NextResponse.json(
        { error: 'Группа не найдена' },
        { status: 404 }
      );
    }

    const { channelUsername, channelTitle } = await request.json();

    if (!channelUsername) {
      return NextResponse.json(
        { error: 'Укажите username канала' },
        { status: 400 }
      );
    }

    const cleanUsername = channelUsername.replace(/^@/, '').trim();

    try {
      await pb.collection('groupChannels').create({
        groupId,
        channelUsername: cleanUsername,
      });
    } catch (error: any) {
      // Игнорируем дубликаты (уникальное ограничение)
      if (
        error.status !== 400 ||
        error.data?.data?.channelUsername?.code !== 'unique'
      ) {
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Add channel to group error:', error);
    return NextResponse.json(
      { error: 'Ошибка при добавлении канала в группу' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { groupId } = resolvedParams;
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

    // Проверяем ownership группы
    const group = await pb.collection('groups').getOne(groupId);
    if (group.userId !== userId) {
      return NextResponse.json(
        { error: 'Группа не найдена' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const channelUsername = searchParams.get('channelUsername');

    if (!channelUsername) {
      return NextResponse.json(
        { error: 'Укажите username канала' },
        { status: 400 }
      );
    }

    const cleanUsername = channelUsername.replace(/^@/, '').trim();

    // Находим и удаляем запись связи группы с каналом
    const channels = await pb.collection('groupChannels').getFullList({
      filter: `groupId = "${groupId}" && channelUsername = "${cleanUsername}"`,
    });

    for (const ch of channels) {
      await pb.collection('groupChannels').delete(ch.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Remove channel from group error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении канала из группы' },
      { status: 500 }
    );
  }
}
