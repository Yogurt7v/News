import PocketBase from 'pocketbase';

export async function createAdminClient() {
  const pb = new PocketBase(
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://5.53.125.238:8090'
  );

  // Обязательно добавляем await
  await pb
    .collection('_superusers')
    .authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!
    );

  return pb;
}
