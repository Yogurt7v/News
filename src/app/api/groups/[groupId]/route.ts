import { NextRequest, NextResponse } from 'next/server';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const resolvedParams = await params;
  const { groupId } = resolvedParams;
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

    // Проверяем ownership группы
    const group = await pb.collection('groups').getOne(groupId);
    if (group.userId !== userId) {
      return NextResponse.json(
        { error: 'Группа не найдена' },
        { status: 404 }
      );
    }

    // Сначала удаляем все каналы из группы
    const channels = await pb.collection('groupChannels').getFullList({
      filter: `groupId = "${groupId}"`,
    });

    for (const ch of channels) {
      await pb.collection('groupChannels').delete(ch.id);
    }

    // Затем удаляем саму группу
    await pb.collection('groups').delete(groupId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete group error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении группы' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Укажите новое название группы' },
        { status: 400 }
      );
    }

    await pb.collection('groups').update(groupId, { name });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Rename group error:', error);
    return NextResponse.json(
      { error: 'Ошибка при переименовании группы' },
      { status: 500 }
    );
  }
}
