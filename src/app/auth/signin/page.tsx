'use client';

import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [showCredentials, setShowCredentials] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Редирект, если сессия уже активна
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleCredentialsSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (res?.error) {
      setError('Неверный email или пароль');
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] dark:bg-[#0f0f10] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-sm border border-gray-100 dark:border-[#2a2a2c] p-8">
          {/* Логотип со стопкой газет */}
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 rounded-full bg-[#229ED9] flex items-center justify-center shadow-md shadow-blue-500/20">
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
                  stroke="#229ED9"
                  strokeWidth="1.5"
                />
                <line
                  x1="9"
                  y1="15"
                  x2="15"
                  y2="15"
                  stroke="#229ED9"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-center text-xl font-semibold text-[#1c1c1e] dark:text-white mb-2">
            {showCredentials ? 'Вход по почте' : 'Вход в аккаунт'}
          </h1>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            {showCredentials
              ? 'Введите логин и пароль'
              : 'Продолжите через удобный способ'}
          </p>

          <div className="space-y-3">
            {!showCredentials ? (
              /* Кнопки провайдеров */
              <div className="space-y-3 animate-in fade-in duration-300">
                <button
                  onClick={() => setShowCredentials(true)}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a2a2c] transition"
                >
                  Вход по логину
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t dark:border-[#2a2a2c]"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-[#1c1c1e] px-2 text-gray-400">
                      или
                    </span>
                  </div>
                </div>

                {/* Google */}
                <button
                  onClick={() => signIn('google', { callbackUrl })}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-white dark:bg-[#2a2a2c] px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#343437] transition active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                {/* Yandex */}
                <button
                  onClick={() => signIn('yandex', { callbackUrl })}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-white dark:bg-[#2a2a2c] px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#343437] transition active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 256 512">
                    <path
                      fill="#ca0707"
                      d="M153.1 315.8L65.7 512H2l96-209.8c-45.1-22.9-75.2-64.4-75.2-141.1C22.7 53.7 90.8 0 171.7 0H254v512h-55.1V315.8zm45.8-269.3h-29.4c-44.4 0-87.4 29.4-87.4 114.6c0 82.3 39.4 108.8 87.4 108.8h29.4z"
                    />
                  </svg>
                  <span>Яндекс</span>
                </button>

                {/* GitHub */}
                <button
                  onClick={() => signIn('github', { callbackUrl })}
                  className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#229ED9] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1b8ec2] active:scale-[0.98] shadow-sm shadow-blue-500/20"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            ) : (
              /* Форма логина */
              <form
                onSubmit={handleCredentialsSubmit}
                className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-gray-50 dark:bg-[#2a2a2c] px-4 py-3 text-sm focus:ring-2 focus:ring-[#229ED9] outline-none transition-all"
                />

                <input
                  name="password"
                  type="password"
                  placeholder="Пароль"
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-gray-50 dark:bg-[#2a2a2c] px-4 py-3 text-sm focus:ring-2 focus:ring-[#229ED9] outline-none transition-all"
                />

                <div className="flex items-center justify-between px-1 py-1">
                  <label className="group flex cursor-pointer items-center gap-2.5 select-none">
                    {/* Кастомный контейнер для чекбокса */}
                    <div className="relative flex h-5 w-5 items-center justify-center">
                      <input
                        type="checkbox"
                        name="remember"
                        className="peer h-full w-full appearance-none rounded-md border-2 border-gray-200 bg-white transition-all 
                   checked:border-[#229ED9] checked:bg-[#229ED9] 
                   hover:border-[#229ED9]/50 focus:outline-none focus:ring-2 focus:ring-[#229ED9]/20
                   dark:border-[#3a3a3c] dark:bg-[#2a2a2c]"
                      />
                      {/* Иконка галочки, которая появляется при checked */}
                      <svg
                        className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <span className="text-[13px] font-medium text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200">
                      Запомнить меня
                    </span>
                  </label>

                  {/* Можно добавить ссылку "Забыли пароль?" для баланса, если нужно */}
                  <Link
                    // href="/auth/forgot-password"
                    href=""
                    onClick={() => alert('ещё не добавлен функционал')}
                    className="text-[12px] font-medium text-[#229ED9] hover:text-[#1b8ec2] transition-colors"
                  >
                    Забыли?
                  </Link>
                </div>

                {error && (
                  <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl animate-in shake-in duration-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#229ED9] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1b8ec2] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Вход...' : 'Войти'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCredentials(false)}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-white dark:bg-[#2a2a2c] px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#343437] transition active:scale-[0.98]"
                >
                  Назад
                </button>
              </form>
            )}
          </div>

          <div className="flex items-center justify-center border-t border-gray-50 dark:border-[#2a2a2c] mt-8 pt-6">
            <Link
              href="/auth/register"
              className="text-center text-xs text-gray-400 dark:text-gray-500 hover:text-[#229ED9] transition underline-offset-4 hover:underline"
            >
              Создать новый аккаунт
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] dark:bg-[#0f0f10]">
          <div className="animate-pulse text-gray-400">Загрузка...</div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
