'use server';
import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const pb = new PocketBase('http://127.0.0.1:8090');

  // Ждем разрешения Promise из cookies()
  const cookieStore = await cookies(); 
  const authCookie = cookieStore.get('pb_auth');

  if (authCookie) {
    pb.authStore.loadFromCookie(authCookie.value);
  }

  return pb;
}