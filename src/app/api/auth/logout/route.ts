import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function POST() {
  const pb = new PocketBase(
    process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
  );

  pb.authStore.clear();

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.headers.set(
    'Set-Cookie',
    pb.authStore.exportToCookie({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 0,
    })
  );
  return res;
}

