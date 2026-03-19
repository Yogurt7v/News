import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const cookieStore = await cookies();
  const oauthCookie = cookieStore.get('pb_oauth');

  if (!code || !state || !oauthCookie) {
    return NextResponse.json(
      { error: 'Session expired or invalid request' },
      { status: 400 }
    );
  }

  let payload: any;
  try {
    payload = JSON.parse(oauthCookie.value);
  } catch {
    return NextResponse.json(
      { error: 'Invalid session data' },
      { status: 400 }
    );
  }

  // Проверка CSRF (state из URL должен совпасть со state из куки)
  if (payload.state !== state) {
    return NextResponse.json({ error: 'State mismatch' }, { status: 400 });
  }

  const pb = new PocketBase(
    process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
  );

  try {
    // Финальный шаг авторизации в PocketBase
    await pb.collection('users').authWithOAuth2({
      provider: payload.provider,
      code,
      codeVerifier: payload.codeVerifier,
      redirectUrl: payload.redirectUrl,
    });

    // Редирект на главную или туда, откуда пришли
    const response = NextResponse.redirect(
      new URL(payload.callbackUrl || '/', url.origin)
    );

    // Очищаем временную OAuth куку
    response.cookies.delete('pb_oauth');

    // Экспортируем сессию PocketBase в основную куку pb_auth
    // httpOnly: false позволяет клиентскому SDK видеть токен (нужно для фото и т.д.)
    response.headers.set(
      'Set-Cookie',
      pb.authStore.exportToCookie({
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
      })
    );

    return response;
  } catch (err: any) {
    console.error('PB Auth Callback Error:', err);
    return NextResponse.json(
      { error: err.message, details: err.data },
      { status: 400 }
    );
  }
}
