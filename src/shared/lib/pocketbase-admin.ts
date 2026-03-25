import PocketBase from 'pocketbase';

export async function createAdminClient() {
  const pb = new PocketBase(
    process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
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
