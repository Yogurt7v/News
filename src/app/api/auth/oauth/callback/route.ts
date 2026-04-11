import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const cookieStore = await cookies();
  const oauthCookie = cookieStore.get('pb_oauth');

  if (!code || !oauthCookie) {
    return NextResponse.redirect(
      new URL('/auth/signin?error=no_data', request.nextUrl.origin)
    );
  }

  const payload = JSON.parse(oauthCookie.value);
  if (state !== payload.state) {
    return NextResponse.redirect(
      new URL('/auth/signin?error=state_mismatch', request.nextUrl.origin)
    );
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/collections/users/auth-with-oauth2`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: payload.provider,
          code,
          codeVerifier: payload.codeVerifier,
          redirectUrl: payload.redirectUrl,
        }),
      }
    );

    const authData = await res.json();
    if (!res.ok) throw new Error('PB Auth Failed');

    const finalResponse = NextResponse.redirect(
      new URL(payload.callbackUrl, request.nextUrl.origin)
    );

    // Сохраняем сессию в формате PocketBase
    finalResponse.cookies.set(
      'pb_auth',
      JSON.stringify({
        token: authData.token,
        model: authData.record,
      }),
      {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      }
    );

    finalResponse.cookies.delete('pb_oauth');
    return finalResponse;
  } catch {
    return NextResponse.redirect(
      new URL('/auth/signin?error=auth_failed', request.nextUrl.origin)
    );
  }
}
