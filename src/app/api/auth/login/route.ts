import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const pb = new PocketBase(
      process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
    );

    const authData = await pb.collection('users').authWithPassword(
      email,
      password
    );

    const res = NextResponse.json({ user: authData.record }, { status: 200 });
    res.headers.set(
      'Set-Cookie',
      pb.authStore.exportToCookie({
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
      })
    );
    return res;
  } catch {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
}

