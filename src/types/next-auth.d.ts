import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Возвращается функцией `useSession`, `getSession` и в колбэке `session`
   */
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  /**
   * Объект пользователя, возвращаемый провайдерами или из БД
   */
  interface User {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  /** Возвращается в колбэках `jwt` и `session` при использовании JWT стратегии */
  interface JWT {
    id: string;
    role: string;
  }
}
