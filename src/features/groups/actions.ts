'use server';

import { db } from '@/db';
import { groups, groupChannels } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

async function requireUserId(): Promise<string> {
  const pb = await getServerPocketBase();
  const userId = pb.authStore.record?.id;
  if (!pb.authStore.isValid || !userId) throw new Error('Не авторизован');
  return userId;
}

export async function createGroup(name: string) {
  const userId = await requireUserId();

  const [group] = await db
    .insert(groups)
    .values({
      userId,
      name,
    })
    .returning();

  revalidatePath('/');

  return group;
}

export async function getUserGroups() {
  const userId = await requireUserId();

  const userGroups = await db.query.groups.findMany({
    where: eq(groups.userId, userId),
    orderBy: (g, { asc }) => [asc(g.name)], // сортируем по имени
    with: {
      channels: {
        columns: { channelUsername: true }, // берём только имена каналов
      },
    },
  });

  return userGroups;
}

export async function addChannelToGroup(
  groupId: string,
  channelUsername: string
) {
  const userId = await requireUserId();

  // Проверяем, что группа принадлежит текущему пользователю
  const group = await db.query.groups.findFirst({
    where: and(eq(groups.id, groupId), eq(groups.userId, userId)),
  });
  if (!group) throw new Error('Группа не найдена');

  // Очищаем имя канала от @ и лишних пробелов
  const cleanUsername = channelUsername.replace(/^@/, '').trim();

  // Вставляем связь. onConflictDoNothing игнорирует попытку добавить дубликат
  await db
    .insert(groupChannels)
    .values({
      groupId,
      channelUsername: cleanUsername,
    })
    .onConflictDoNothing();

  revalidatePath('/');
}

export async function removeChannelFromGroup(
  groupId: string,
  channelUsername: string
) {
  const userId = await requireUserId();

  await db
    .delete(groupChannels)
    .where(
      and(
        eq(groupChannels.groupId, groupId),
        eq(
          groupChannels.channelUsername,
          channelUsername.replace(/^@/, '').trim()
        )
      )
    );

  revalidatePath('/');
}

export async function deleteGroup(groupId: string) {
  const userId = await requireUserId();

  await db
    .delete(groups)
    .where(
      and(eq(groups.id, groupId), eq(groups.userId, userId))
    );

  revalidatePath('/');
}

export async function renameGroup(groupId: string, newName: string) {
  const userId = await requireUserId();

  await db
    .update(groups)
    .set({ name: newName, updatedAt: new Date() })
    .where(
      and(eq(groups.id, groupId), eq(groups.userId, userId))
    );

  revalidatePath('/');
}

export async function createGroupWithChannels(
  name: string,
  channelUsernames: string[]
) {
  const userId = await requireUserId();

  return await db.transaction(async (tx) => {
    // 1. Создаем группу
    const [group] = await tx
      .insert(groups)
      .values({
        userId,
        name,
      })
      .returning();

    // 2. Если есть каналы, привязываем их
    if (channelUsernames.length > 0) {
      const values = channelUsernames.map((username) => ({
        groupId: group.id,
        channelUsername: username.replace(/^@/, '').trim(),
      }));
      await tx.insert(groupChannels).values(values);
    }

    revalidatePath('/');
    return group;
  });
}
