'use server';

import { revalidatePath } from 'next/cache';
import createServerClient from '@/shared/lib/pocketbase.server';

// Вспомогательная функция для получения авторизованного пользователя
async function getCurrentUserId(): Promise<string> {
  const pb = await createServerClient();
  const userId = pb.authStore.record?.id;
  if (!pb.authStore.isValid || !userId) throw new Error('Не авторизован');
  return userId;
}

// Подписаться на канал
export async function subscribeToChannel(channelUsername: string) {
  const userId = await getCurrentUserId();
  const cleanUsername = channelUsername.replace(/^@/, '').trim();

  try {
    const pb = await createServerClient();
    await pb.collection('subscriptions').create({
      userId,
      channelUsername: cleanUsername,
    });
  } catch (error: any) {
    if (
      error.status === 400 &&
      error.data?.data?.channelUsername?.code === 'unique'
    ) {
      throw new Error('Вы уже подписаны на этот канал');
    }
    throw new Error('Ошибка при подписке');
  }

  revalidatePath('/');
}

// Отписаться от канала
export async function unsubscribeFromChannel(channelUsername: string) {
  const userId = await getCurrentUserId();
  const cleanUsername = channelUsername.replace(/^@/, '').trim();

  // Находим запись подписки
  const pb = await createServerClient();
  const subscription = await pb
    .collection('subscriptions')
    .getFirstListItem(
      `userId = "${userId}" && channelUsername = "${cleanUsername}"`
    )
    .catch(() => null);

  if (subscription) {
    await pb.collection('subscriptions').delete(subscription.id);
  }

  revalidatePath('/');
}

// Получить список подписок текущего пользователя
export async function getUserSubscriptions(): Promise<string[]> {
  const userId = await getCurrentUserId();
  const pb = await createServerClient();
  const records = await pb.collection('subscriptions').getFullList({
    filter: `userId = "${userId}"`,
    sort: 'channelUsername',
  });
  return records.map((r) => r.channelUsername);
}

// Создать группу
export async function createGroup(name: string) {
  const userId = await getCurrentUserId();
  const pb = await createServerClient();
  const group = await pb.collection('groups').create({
    userId,
    name,
    channels: [], // пустой массив по умолчанию
  });
  revalidatePath('/');
  return group;
}

// Получить группы пользователя с каналами
export async function getUserGroups() {
  const userId = await getCurrentUserId();
  const pb = await createServerClient();
  const records = await pb.collection('groups').getFullList({
    filter: `userId = "${userId}"`,
    sort: 'name',
  });
  return records.map((r) => ({
    id: r.id,
    name: r.name,
    channels: r.channels || [],
  }));
}

// Добавить канал в группу
export async function addChannelToGroup(
  groupId: string,
  channelUsername: string
) {
  const userId = await getCurrentUserId();
  const cleanUsername = channelUsername.replace(/^@/, '').trim();

  // Проверим, что группа принадлежит пользователю
  const pb = await createServerClient();
  const group = await pb.collection('groups').getOne(groupId);
  if (group.userId !== userId) throw new Error('Группа не найдена');

  // Добавляем канал в массив, если его там ещё нет
  const channels = group.channels || [];
  if (!channels.includes(cleanUsername)) {
    channels.push(cleanUsername);
    await pb.collection('groups').update(groupId, { channels });
  }
  revalidatePath('/');
}

// Удалить канал из группы
export async function removeChannelFromGroup(
  groupId: string,
  channelUsername: string
) {
  const userId = await getCurrentUserId();
  const cleanUsername = channelUsername.replace(/^@/, '').trim();

  const pb = await createServerClient();
  const group = await pb.collection('groups').getOne(groupId);
  if (group.userId !== userId) throw new Error('Группа не найдена');

  const channels = (group.channels || []).filter(
    (ch: string) => ch !== cleanUsername
  );
  await pb.collection('groups').update(groupId, { channels });
  revalidatePath('/');
}

// Удалить группу
export async function deleteGroup(groupId: string) {
  const userId = await getCurrentUserId();
  const pb = await createServerClient();
  const group = await pb.collection('groups').getOne(groupId);
  if (group.userId !== userId) throw new Error('Группа не найдена');
  await pb.collection('groups').delete(groupId);
  revalidatePath('/');
}

// Переименовать группу
export async function renameGroup(groupId: string, newName: string) {
  const userId = await getCurrentUserId();
  const pb = await createServerClient();
  const group = await pb.collection('groups').getOne(groupId);
  if (group.userId !== userId) throw new Error('Группа не найдена');
  await pb.collection('groups').update(groupId, { name: newName });
  revalidatePath('/');
}
