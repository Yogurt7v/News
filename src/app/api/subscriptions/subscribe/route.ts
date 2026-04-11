import { NextRequest, NextResponse } from 'next/server';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

const MAX_SUBSCRIPTIONS = 10;

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

    const { channelUsername, channelTitle } = await request.json();

    if (!channelUsername) {
      return NextResponse.json(
        { error: 'Укажите username канала' },
        { status: 400 }
      );
    }

    const cleanUsername = channelUsername.replace(/^@/, '').trim();

    // Проверяем лимит подписок
    const currentCount = await pb
      .collection('subscriptions')
      .getList(1, 1, {
        filter: `userId = "${userId}"`,
      });

    if (currentCount.totalItems >= MAX_SUBSCRIPTIONS) {
      return NextResponse.json(
        {
          error: `Достигнут лимит подписок (${MAX_SUBSCRIPTIONS}). Удалите существующие подписки для добавления новых.`,
        },
        { status: 400 }
      );
    }

    // Создаем подписку
    await pb.collection('subscriptions').create({
      userId,
      channelUsername: cleanUsername,
      channelTitle: channelTitle || null,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Обрабатываем уникальное ограничение (уже подписан)
    if (
      error.status === 400 &&
      error.data?.data?.channelUsername?.code === 'unique'
    ) {
      return NextResponse.json(
        { error: 'Вы уже подписаны на этот канал' },
        { status: 400 }
      );
    }

    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Ошибка при подписке' },
      { status: 500 }
    );
  }
}
