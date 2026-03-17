import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function POST(request: Request) {
  try {
    const { email, password, passwordConfirm, name } =
      (await request.json()) as {
        email?: string;
        password?: string;
        passwordConfirm?: string;
        name?: string;
      };

    if (!email || !password || !passwordConfirm) {
      return NextResponse.json(
        { error: 'Email, password and passwordConfirm are required' },
        { status: 400 }
      );
    }

    const pb = new PocketBase(
      process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
    );

    await pb.collection('users').create({
      email,
      password,
      passwordConfirm,
      name,
    });

    const authData = await pb.collection('users').authWithPassword(
      email,
      password
    );

    const res = NextResponse.json(
      {
        user: authData.record,
      },
      { status: 201 }
    );

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
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || 'Registration failed',
        data: err?.data,
      },
      { status: 400 }
    );
  }
}

