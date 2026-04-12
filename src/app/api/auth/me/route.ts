import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  console.log('[auth/me] Cookie header:', cookieHeader.substring(0, 200));

  // Найти pb_auth куку напрямую из заголовка
  const pbAuthMatch = cookieHeader.match(/pb_auth=([^;]+)/);
  console.log(
    '[auth/me] pbAuthMatch:',
    pbAuthMatch ? 'found' : 'not found'
  );

  if (!pbAuthMatch) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      token: null,
    });
  }

  const cookieValue = pbAuthMatch[1];
  console.log(
    '[auth/me] Cookie value (first 100):',
    cookieValue.substring(0, 100)
  );

  // URL decode если нужно
  let data;
  try {
    // Попробовать как есть
    data = JSON.parse(cookieValue);
    console.log('[auth/me] Parsed without decode');
  } catch (e1) {
    console.log(
      '[auth/me] Parse failed without decode, trying URL decode...'
    );
    try {
      // Попробовать с URL decode
      data = JSON.parse(decodeURIComponent(cookieValue));
      console.log('[auth/me] Parsed with URL decode');
    } catch (e2) {
      console.log('[auth/me] Parse failed with URL decode too');
      return NextResponse.json({
        authenticated: false,
        user: null,
        token: null,
      });
    }
  }

  // Проверить структуру данных - PocketBase может хранить как {token, model} и {token, record}
  console.log('[auth/me] Parsed data keys:', Object.keys(data));
  const token = data.token || null;
  const model = data.model || data.record || null;

  return NextResponse.json({
    authenticated: !!model,
    user: model,
    token: token,
  });
}
