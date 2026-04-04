'use server';

import { revalidatePath } from 'next/cache';
import createServerClient from '@/shared/lib/pocketbase.server';

const MAX_SUBSCRIPTIONS = 10;

interface ChannelInfo {
  id: string;
  username: string;
  title: string;
  avatar?: string;
}

interface GroupWithChannels {
  id: string;
  name: string;
  channels: ChannelInfo[];
}

// Вспомогательная функция для получения авторизованного пользователя
async function getCurrentUserId(): Promise<string> {
  const pb = await createServerClient();
  const userId = pb.authStore.record?.id;
  if (!pb.authStore.isValid || !userId) throw new Error('Не авторизован');
  return userId;
}

// Подписаться на канал
export async function subscribeToChannel(
  channelUsername: string,
  channelTitle?: string
) {
  const userId = await getCurrentUserId();
  const cleanUsername = channelUsername.replace(/^@/, '').trim();

  const pb = await createServerClient();

  // Проверка лимита подписок
  const currentCount = await pb.collection('subscriptions').getList(1, 1, {
    filter: `userId = "${userId}"`,
  });
  if (currentCount.totalItems >= MAX_SUBSCRIPTIONS) {
    throw new Error(
      `Достигнут лимит подписок (${MAX_SUBSCRIPTIONS}). Удалите существующие подписки для добавления новых.`
    );
  }

  try {
    await pb.collection('subscriptions').create({
      userId,
      channelUsername: cleanUsername,
      channelTitle: channelTitle || null,
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      (error as { status?: number }).status === 400 &&
      (
        error as {
          data?: { data?: { channelUsername?: { code?: string } } };
        }
      ).data?.data?.channelUsername?.code === 'unique'
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
export async function getUserSubscriptions(): Promise<ChannelInfo[]> {
  const userId = await getCurrentUserId();
  const pb = await createServerClient();
  const records = await pb.collection('subscriptions').getFullList({
    filter: `userId = "${userId}"`,
    sort: 'channelTitle',
  });
  return records.map((r) => ({
    id: r.id,
    username: r.channelUsername,
    title: r.channelTitle || r.channelUsername,
    avatar: r.avatar || undefined,
  }));
}

// Создать группу
export async function createGroup(name: string) {
  const userId = await getCurrentUserId();
  const pb = await createServerClient();
  const group = await pb.collection('groups').create({
    userId,
    name,
    channels: [],
  });
  revalidatePath('/');
  return group;
}

// Получить группы пользователя с каналами
export async function getUserGroups(): Promise<GroupWithChannels[]> {
  const userId = await getCurrentUserId();
  const pb = await createServerClient();
  const records = await pb.collection('groups').getFullList({
    filter: `userId = "${userId}"`,
    sort: 'name',
  });
  return records.map((r) => {
    const rawChannels = r.channels || [];
    const channels: ChannelInfo[] = rawChannels.map(
      (ch: string | ChannelInfo) => {
        if (typeof ch === 'string') {
          return { id: '', username: ch, title: ch };
        }
        return { ...(ch as ChannelInfo), id: '' };
      }
    );
    return {
      id: r.id,
      name: r.name,
      channels,
    };
  });
}

// Добавить канал в группу
export async function addChannelToGroup(
  groupId: string,
  channelUsername: string,
  channelTitle?: string
) {
  const userId = await getCurrentUserId();
  const cleanUsername = channelUsername.replace(/^@/, '').trim();

  const pb = await createServerClient();
  const group = await pb.collection('groups').getOne(groupId);
  if (group.userId !== userId) throw new Error('Группа не найдена');

  const rawChannels = group.channels || [];
  const channels: ChannelInfo[] = rawChannels.map(
    (ch: string | ChannelInfo) => {
      if (typeof ch === 'string') {
        return { id: '', username: ch, title: ch };
      }
      return ch as ChannelInfo;
    }
  );

  const exists = channels.some((ch) => ch.username === cleanUsername);
  if (!exists) {
    channels.push({
      id: '',
      username: cleanUsername,
      title: channelTitle || cleanUsername,
    });
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

  const rawChannels = group.channels || [];
  const channels: ChannelInfo[] = rawChannels
    .map((ch: string | ChannelInfo) => {
      if (typeof ch === 'string') {
        return { id: '', username: ch, title: ch };
      }
      return ch as ChannelInfo;
    })
    .filter((ch: ChannelInfo) => ch.username !== cleanUsername);

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
