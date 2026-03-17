import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import PocketBase from 'pocketbase';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ОПРЕДЕЛЯЕМ ИСКЛЮЧЕНИЯ (Пути, которые не требуют проверки)
  // Добавьте сюда всё, что должно быть доступно без входа
  if (
    pathname.startsWith('/auth') || // страницы входа и регистрации
    pathname.startsWith('/_next') || // служебные файлы Next.js
    pathname.startsWith('/api') ||   // ваши API роуты
    pathname === '/favicon.ico'      // иконка
  ) {
    return NextResponse.next();
  }

  // 2. ПРОВЕРКА АВТОРИЗАЦИИ
  const pb = new PocketBase('http://127.0.0.1:8090');
  // PocketBase ожидает строку cookie заголовка вида "a=b; c=d"
  pb.authStore.loadFromCookie(request.headers.get('cookie') ?? '');

  // 3. РЕДИРЕКТ ТОЛЬКО ЕСЛИ НЕТ СЕССИИ
  if (!pb.authStore.isValid) {
    const url = new URL('/auth/signin', request.url);
    // Сохраняем путь, куда хотел попасть пользователь
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 4. ОПЦИОНАЛЬНО: Используйте matcher для производительности
export const config = {
  matcher: [
    /*
     * Исключаем стандартные пути, чтобы middleware не срабатывал на картинки и скрипты
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};