import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { cache } from 'react';

// Серверный клиент PocketBase (с куками из запроса).
export async function getServerPocketBase() {
  const pb = new PocketBase(
    process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
  );

  // PocketBase ожидает строку cookie header вида "a=b; c=d"
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  if (cookieHeader) pb.authStore.loadFromCookie(cookieHeader);
  return pb;
}

