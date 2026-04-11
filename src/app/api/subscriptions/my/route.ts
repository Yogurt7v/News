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

    const records = await pb.collection('subscriptions').getFullList({
      filter: `userId = "${userId}"`,
      sort: 'channelTitle',
    });

    const subscriptions = records.map((r) => ({
      id: r.id,
      username: r.channelUsername,
      title: r.channelTitle || r.channelUsername,
      avatar: r.avatar || undefined,
    }));

    return NextResponse.json(subscriptions);
  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении подписок' },
      { status: 500 }
    );
  }
}
