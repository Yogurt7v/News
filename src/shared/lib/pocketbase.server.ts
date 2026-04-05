import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

export async function getServerPocketBase() {
  const pb = new PocketBase(
    process.env.POCKETBASE_URL || 'http://5.53.125.238:8090'
  );
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth');

  if (authCookie) {
    pb.authStore.loadFromCookie(`${authCookie.name}=${authCookie.value}`);
  }

  return pb;
}

export default getServerPocketBase;
