import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code') || '';
  const state = url.searchParams.get('state') || '';
  const provider = url.searchParams.get('provider') || '';

  if (!code || !state || !provider) {
    return NextResponse.json(
      { error: 'Missing code/state/provider' },
      { status: 400 }
    );
  }

  const pb = new PocketBase(
    process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
  );

  const cookieName = `pb_oauth_${provider}`;
  const raw = request.headers.get('cookie') || '';
  const stored = raw
    .split(';')
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${cookieName}=`));

  if (!stored) {
    return NextResponse.json({ error: 'OAuth flow not started' }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(decodeURIComponent(stored.split('=')[1] || ''));
  } catch {
    return NextResponse.json({ error: 'Invalid OAuth cookie' }, { status: 400 });
  }

  if (payload?.state !== state) {
    return NextResponse.json({ error: 'Invalid OAuth state' }, { status: 400 });
  }

  const redirectUrl =
    payload?.redirectUrl || `${url.origin}/api/auth/oauth/callback`;

  try {
    await pb.collection('users').authWithOAuth2({
      provider,
      code,
      codeVerifier: payload?.codeVerifier,
      redirectUrl,
    });

    const next = NextResponse.redirect(new URL(payload?.callbackUrl || '/', url.origin));
    next.cookies.set({
      name: cookieName,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    next.headers.set(
      'Set-Cookie',
      pb.authStore.exportToCookie({
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
      })
    );
    return next;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'OAuth callback failed', data: err?.data },
      { status: 400 }
    );
  }
}

