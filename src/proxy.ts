// src/proxy.ts
import { withAuth } from 'next-auth/middleware';

// Вместо простого реэкспорта используем обертку withAuth
export default withAuth(
  function proxy(req) {
    // Здесь можно добавить свою логику, если нужно
    // Если оставить пустым, он просто будет проверять наличие сессии
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Список защищенных путей
  matcher: [
    '/',
    '/profile',
    '/bookmarks',
    '/subscriptions',
    '/admin/:path*',
  ],
};
