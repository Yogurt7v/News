import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

export default async function createServerClient() {
  const pb = new PocketBase('http://127.0.0.1:8090');
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth');

  if (authCookie) {
    pb.authStore.loadFromCookie(`${authCookie.name}=${authCookie.value}`);
  }

  return pb;
}
