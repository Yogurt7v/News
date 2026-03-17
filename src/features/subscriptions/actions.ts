'use server';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

async function requireUserId(): Promise<string> {
  const pb = await getServerPocketBase();
  const userId = pb.authStore.record?.id;
  if (!pb.authStore.isValid || !userId) throw new Error('Не авторизован');
  return userId;
}

export async function getUserSubscriptions() {
  // 1. Проверяем, авторизован ли пользователь
  const userId = await requireUserId();

  // 2. Делаем запрос к базе: ищем все записи в таблице subscriptions, где userId равен текущему
  const userSubs = await db.query.subscriptions.findMany({
    where: eq(subscriptions.userId, userId),

    columns: {
      channelUsername: true,
      createdAt: true,
    },
    orderBy: (subs, { asc }) => [asc(subs.channelUsername)],
  });

  return userSubs.map((s) => s.channelUsername);
}

export async function subscribeToChannel(channelUsername: string) {
  // 1. Проверка авторизации
  const userId = await requireUserId();

  // 2. Очищаем ввод
  const cleanUsername = channelUsername.replace(/^@/, '').trim();
  if (!cleanUsername) {
    throw new Error('Имя канала не может быть пустым');
  }

  // 3. Пытаемся вставить запись в таблицу
  try {
    await db.insert(subscriptions).values({
      userId,
      channelUsername: cleanUsername,
    });
  } catch (error: any) {
    // 4. Обрабатываем возможные ошибки
    // Код 23505 в PostgreSQL означает "нарушение уникальности" (уже подписан)
    if (error.code === '23505') {
      throw new Error('Вы уже подписаны на этот канал');
    }
    // Любая другая ошибка
    throw new Error('Ошибка при подписке');
  }

  // 5. Сообщаем Next.js, что данные на страницах '/' и '/subscriptions' изменились,
  // и их нужно пересоздать (revalidate), чтобы пользователь увидел обновлённый список.
  revalidatePath('/');
  revalidatePath('/subscriptions');
}

export async function unsubscribeFromChannel(channelUsername: string) {
  const userId = await requireUserId();

  const cleanUsername = channelUsername.replace(/^@/, '').trim();

  // Удаляем из таблицы запись, где userId и channelUsername совпадают
  await db
    .delete(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.channelUsername, cleanUsername)
      )
    );

  // После удаления тоже обновляем кеш
  revalidatePath('/');
  revalidatePath('/subscriptions');
}
