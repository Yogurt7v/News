import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import PocketBase from 'pocketbase';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ИСКЛЮЧЕНИЯ (Пути, которые не трогаем)
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/sw') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const pb = new PocketBase(
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://5.53.125.238:8090'
  );

  // 2. ЗАГРУЗКА СЕССИИ
  // Получаем значение куки напрямую
  const authCookie = request.cookies.get('pb_auth')?.value;

  if (authCookie) {
    try {
      // КРИТИЧЕСКИЙ МОМЕНТ:
      // SDK ожидает строку формата "имя=значение", чтобы правильно распарсить её в AuthStore
      pb.authStore.loadFromCookie(`pb_auth=${authCookie}`, 'pb_auth');
    } catch (e) {
      console.error('Middleware Cookie Parse Error:', e);
      pb.authStore.clear();
    }
  }

  // 3. ПРОВЕРКА АВТОРИЗАЦИИ
  if (!pb.authStore.isValid) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', pathname);

    const response = NextResponse.redirect(url);
    response.cookies.delete('pb_auth');
    return response;
  }

  const response = NextResponse.next();

  try {
    // Обновляем токен (authRefresh) для продления сессии
    // Это вызывает /api/auth/refresh и получает новый токен
    await pb.collection('users').authRefresh();

    // Устанавливаем обновлённую куку с новым токеном
    const cookieStr = pb.authStore.exportToCookie({ httpOnly: true });
    const [, cookieValue] = cookieStr.split('=');

    // 7 дней в секундах (604800 сек) — соответствует настройке PB
    const SESSION_DURATION = 604800;

    response.cookies.set('pb_auth', cookieValue, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: SESSION_DURATION,
    });
  } catch (err) {
    console.error('Session refresh failed:', err);
    // Если обновление не удалось - пробуем продлить без refresh
    // (может токен ещё свежий)
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Обрабатываем все пути, кроме статики и картинок
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
