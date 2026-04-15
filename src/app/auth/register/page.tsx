'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function RegisterContent() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    if (password !== passwordConfirm) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, passwordConfirm, name }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          data?: { data?: { email?: { code: string } } };
        };
        const pocketbaseError = data?.data?.data;
        if (pocketbaseError?.email?.code === 'validation_invalid_email') {
          setError('Некорректный формат Email');
        } else if (
          pocketbaseError?.email?.code === 'validation_not_unique'
        ) {
          setError('Этот Email уже зарегистрирован');
        } else if (typeof data?.error === 'string') {
          setError(data.error);
        } else {
          setError('Ошибка при регистрации');
        }
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при регистрации';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f4f6f8] dark:bg-[#0f0f10] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-sm border border-gray-100 dark:border-[#2a2a2c] p-8 animate-scale-in">
          <div className="flex justify-center mb-6 animate-fade-in-up">
            <div className="h-14 w-14 rounded-full bg-[#0071e3] flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="5" width="14" height="10" rx="2" />
                <rect
                  x="6"
                  y="8"
                  width="14"
                  height="10"
                  rx="2"
                  fill="currentColor"
                  stroke="none"
                />
                <line
                  x1="9"
                  y1="12"
                  x2="17"
                  y2="12"
                  stroke="#0071e3"
                  strokeWidth="1.5"
                />
                <line
                  x1="9"
                  y1="15"
                  x2="15"
                  y2="15"
                  stroke="#0071e3"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-center text-xl font-semibold text-[#1c1c1e] dark:text-white mb-2">
            Создать аккаунт
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            Присоединяйтесь к агрегатору новостей
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div>
              <input
                name="name"
                type="text"
                placeholder="Ваше имя"
                required
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-gray-50 dark:bg-[#2a2a2c] px-4 py-3 text-sm focus:ring-2 focus:ring-[#0071e3] outline-none transition-all"
              />
            </div>

            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-gray-50 dark:bg-[#2a2a2c] px-4 py-3 text-sm focus:ring-2 focus:ring-[#0071e3] outline-none transition-all"
              />
            </div>

            <div>
              <input
                name="password"
                type="password"
                placeholder="Пароль"
                required
                minLength={8}
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-gray-50 dark:bg-[#2a2a2c] px-4 py-3 text-sm focus:ring-2 focus:ring-[#0071e3] outline-none transition-all"
              />
            </div>

            <div>
              <input
                name="passwordConfirm"
                type="password"
                placeholder="Подтвердите пароль"
                required
                minLength={8}
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-gray-50 dark:bg-[#2a2a2c] px-4 py-3 text-sm focus:ring-2 focus:ring-[#0071e3] outline-none transition-all"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0071e3] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#005bb5] disabled:opacity-60 active:scale-[0.98] shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                'Зарегистрироваться и войти'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 flex flex-col items-center gap-2">
            <span className="text-xs text-gray-400">
              Уже есть аккаунт?
            </span>
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-[#0071e3] hover:underline"
            >
              Войти в систему
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#f4f6f8] dark:bg-[#0f0f10]">
          <div className="animate-pulse text-gray-400 text-sm">
            Загрузка формы...
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
