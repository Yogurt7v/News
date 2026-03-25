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
    process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
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
    // Сохраняем путь для возврата после логина
    url.searchParams.set('callbackUrl', pathname);

    const response = NextResponse.redirect(url);
    // На всякий случай чистим битую куку при редиректе
    response.cookies.delete('pb_auth');
    return response;
  }

  // 4. ОБНОВЛЕНИЕ ТОКЕНА (Опционально, для продления сессии)
  const response = NextResponse.next();

  try {
    // Если токен валиден, мы можем попытаться его освежить
    // Это гарантирует, что сессия не прервется во время работы
    if (pb.authStore.isValid) {
      // Мы не делаем await здесь, чтобы не замедлять каждый запрос,
      // либо делаем только если нужно обновить данные профиля
    }

    // Передаем куку дальше, чтобы браузер её обновил (Path, HttpOnly и т.д.)
    response.cookies.set(
      'pb_auth',
      pb.authStore.exportToCookie({ httpOnly: true }).split('=')[1],
      {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true,
      }
    );
  } catch (err) {
    console.error('Session refresh failed:', err);
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
