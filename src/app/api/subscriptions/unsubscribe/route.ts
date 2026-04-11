import { NextRequest, NextResponse } from 'next/server';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const channelUsername = searchParams.get('channelUsername');

    if (!channelUsername) {
      return NextResponse.json(
        { error: 'Укажите username канала' },
        { status: 400 }
      );
    }

    const cleanUsername = channelUsername.replace(/^@/, '').trim();

    // Находим запись подписки
    const subscription = await pb
      .collection('subscriptions')
      .getFirstListItem(
        `userId = "${userId}" && channelUsername = "${cleanUsername}"`
      )
      .catch(() => null);

    if (subscription) {
      await pb.collection('subscriptions').delete(subscription.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Ошибка при отписке' },
      { status: 500 }
    );
  }
}
