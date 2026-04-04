import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { getErrorMessage } from '@/shared/types/error';

interface RegisterRequest {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  name?: string;
}

interface PocketBaseError {
  message?: string;
  data?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const { email, password, passwordConfirm, name } =
      (await request.json()) as RegisterRequest;

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

    const authData = await pb
      .collection('users')
      .authWithPassword(email, password);

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
  } catch (err: unknown) {
    const pbError = err as PocketBaseError;
    return NextResponse.json(
      {
        error: getErrorMessage(err),
        data: pbError.data,
      },
      { status: 400 }
    );
  }
}
