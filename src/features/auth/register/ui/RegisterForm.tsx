'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const RegisterForm = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      router.push('/auth/signin?registered=true');
    } catch (err: any) {
      setError(err.message || 'Ошибка сети');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] dark:bg-black px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-sm border border-gray-100 dark:border-[#2a2a2c] p-8">
          {/* Лого-кружок */}
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 rounded-full bg-[#229ED9] flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white text-xl font-semibold">N</span>
            </div>
          </div>

          <h1 className="text-center text-xl font-semibold text-[#1c1c1e] dark:text-white mb-2">
            Регистрация
          </h1>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            Создайте новый аккаунт
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Имя */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm text-gray-500 mb-1"
              >
                Имя
              </label>
              <input
                id="name"
                name="name"
                required
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-white dark:bg-[#2a2a2c] px-4 py-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#229ED9] transition"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-500 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-white dark:bg-[#2a2a2c] px-4 py-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#229ED9] transition"
              />
            </div>

            {/* Пароль */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-gray-500 mb-1"
              >
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-white dark:bg-[#2a2a2c] px-4 py-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#229ED9] transition"
              />
            </div>

            {/* Подтверждение */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm text-gray-500 mb-1"
              >
                Подтвердите пароль
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-white dark:bg-[#2a2a2c] px-4 py-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#229ED9] transition"
              />
            </div>

            {/* Ошибка */}
            {error && (
              <p role="alert" className="text-sm text-red-500 text-center">
                {error}
              </p>
            )}

            {/* Кнопка */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#229ED9] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1b8ec2] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
