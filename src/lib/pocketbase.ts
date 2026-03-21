'use server';
import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

// Это правильный экспорт для "use server"
export default async function createServerClient() {
  const pb = new PocketBase('http://127.0.0.1:8090');

  const cookieStore = await cookies();
  const authStore = cookieStore.get('pb_auth');

  if (authStore) {
    pb.authStore.loadFromCookie(authStore.value);
  }

  return pb;
}
