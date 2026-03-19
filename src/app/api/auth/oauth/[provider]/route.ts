import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const url = new URL(request.url);

  // Базовый URL вашего сайта (из env или текущий origin)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const callbackUrl = url.searchParams.get('callbackUrl') || '/';

  const pb = new PocketBase(
    process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
  );

  // Этот адрес должен быть указан в настройках Google/Yandex/GitHub
  const redirectUrl = `${siteUrl}/api/auth/oauth/callback`;

  try {
    const methods = await pb.collection('users').listAuthMethods();

    // Используем путь из твоего лога: oauth2.providers
    const providers = methods?.oauth2?.providers || [];
    const p = providers.find((x: any) => x.name === provider);

    if (!p) {
      return NextResponse.json(
        {
          error: `Provider "${provider}" not found`,
          available: providers.map((x: any) => x.name),
        },
        { status: 400 }
      );
    }

    // Твой authUrl заканчивается на "redirect_uri=", просто приклеиваем наш адрес
    const finalAuthUrl = p.authUrl + encodeURIComponent(redirectUrl);

    const response = NextResponse.redirect(finalAuthUrl);

    // Сохраняем PKCE данные в куку для проверки в callback
    response.cookies.set(
      'pb_oauth',
      JSON.stringify({
        provider: p.name,
        state: p.state,
        codeVerifier: p.codeVerifier,
        redirectUrl,
        callbackUrl,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 600, // 10 минут
      }
    );

    return response;
  } catch (err: any) {
    console.error('OAuth Init Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
