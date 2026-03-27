'use server';

import { revalidatePath } from 'next/cache';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

async function requireUserId(): Promise<string> {
  const pb = await getServerPocketBase();
  const userId = pb.authStore.record?.id;
  if (!pb.authStore.isValid || !userId) throw new Error('Не авторизован');
  return userId;
}

export async function createGroup(name: string) {
  const userId = await requireUserId();
  const pb = await getServerPocketBase();

  const group = await pb.collection('groups').create({
    userId,
    name,
  });

  revalidatePath('/');
  return group;
}

export async function getUserGroups() {
  const userId = await requireUserId();
  const pb = await getServerPocketBase();

  const groups = await pb.collection('groups').getFullList({
    filter: `userId = "${userId}"`,
    sort: 'name',
  });

  const groupsWithChannels = await Promise.all(
    groups.map(async (group) => {
      const channels = await pb.collection('groupChannels').getFullList({
        filter: `groupId = "${group.id}"`,
      });
      return {
        ...group,
        channels: channels.map((ch) => ({
          channelUsername: ch.channelUsername,
        })),
      };
    })
  );

  return groupsWithChannels;
}

export async function addChannelToGroup(
  groupId: string,
  channelUsername: string
) {
  const userId = await requireUserId();
  const pb = await getServerPocketBase();

  const group = await pb.collection('groups').getOne(groupId);
  if (!group || group.userId !== userId) {
    throw new Error('Группа не найдена');
  }

  const cleanUsername = channelUsername.replace(/^@/, '').trim();

  try {
    await pb.collection('groupChannels').create({
      groupId,
      channelUsername: cleanUsername,
    });
  } catch {
    // Ignore duplicates
  }

  revalidatePath('/');
}

export async function removeChannelFromGroup(
  groupId: string,
  channelUsername: string
) {
  const userId = await requireUserId();
  const pb = await getServerPocketBase();

  const group = await pb.collection('groups').getOne(groupId);
  if (!group || group.userId !== userId) {
    throw new Error('Группа не найдена');
  }

  const cleanUsername = channelUsername.replace(/^@/, '').trim();

  const channels = await pb.collection('groupChannels').getFullList({
    filter: `groupId = "${groupId}" && channelUsername = "${cleanUsername}"`,
  });

  for (const ch of channels) {
    await pb.collection('groupChannels').delete(ch.id);
  }

  revalidatePath('/');
}

export async function deleteGroup(groupId: string) {
  const userId = await requireUserId();
  const pb = await getServerPocketBase();

  const group = await pb.collection('groups').getOne(groupId);
  if (!group || group.userId !== userId) {
    throw new Error('Группа не найдена');
  }

  const channels = await pb.collection('groupChannels').getFullList({
    filter: `groupId = "${groupId}"`,
  });

  for (const ch of channels) {
    await pb.collection('groupChannels').delete(ch.id);
  }

  await pb.collection('groups').delete(groupId);

  revalidatePath('/');
}

export async function renameGroup(groupId: string, newName: string) {
  const userId = await requireUserId();
  const pb = await getServerPocketBase();

  const group = await pb.collection('groups').getOne(groupId);
  if (!group || group.userId !== userId) {
    throw new Error('Группа не найдена');
  }

  await pb.collection('groups').update(groupId, {
    name: newName,
  });

  revalidatePath('/');
}

export async function createGroupWithChannels(
  name: string,
  channelUsernames: string[]
) {
  const userId = await requireUserId();
  const pb = await getServerPocketBase();

  const group = await pb.collection('groups').create({
    userId,
    name,
  });

  if (channelUsernames.length > 0) {
    const values = channelUsernames.map((username) => ({
      groupId: group.id,
      channelUsername: username.replace(/^@/, '').trim(),
    }));

    for (const val of values) {
      try {
        await pb.collection('groupChannels').create(val);
      } catch {
        // Ignore duplicates
      }
    }
  }

  revalidatePath('/');
  return group;
}
