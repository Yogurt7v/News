'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';

import { Logo } from './ui/Logo';
import { AuthDivider } from './ui/AuthDivider';
import { OAuthButton } from './ui/OAuthButton';
import { CredentialsForm } from './ui/CredentialsForm';
import type { SignInContentProps } from './SignInContent.types';

function SignInContent({
  callbackUrl: initialCallbackUrl,
}: SignInContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = decodeURIComponent(
    initialCallbackUrl || searchParams.get('callbackUrl') || '/'
  );

  const [showCredentials, setShowCredentials] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<
    null | 'google' | 'yandex' | 'github'
  >(null);

  useEffect(() => {
    let alive = true;
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!alive) return;
        if (data.authenticated) {
          await new Promise((r) => setTimeout(r, 0));
          router.push(callbackUrl);
        }
      } catch (err) {
        console.error('Auth check failed', err);
      }
    };
    checkAuth();
    return () => {
      alive = false;
    };
  }, [router, callbackUrl]);

  const handleCredentialsSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError('Неверный email или пароль');
        return;
      }
      setIsNavigating(true);
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Ошибка сети при входе');
    } finally {
      setLoading(false);
    }
  };

  const startOAuth = async (provider: 'google' | 'yandex' | 'github') => {
    setError('');
    setOauthLoading(provider);
    try {
      window.location.href = `/api/auth/oauth/${provider}?callbackUrl=${encodeURIComponent(
        callbackUrl
      )}`;
    } catch {
      setError('Не удалось начать OAuth вход');
      setOauthLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] dark:bg-[#0f0f10] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-sm border border-gray-100 dark:border-[#2a2a2c] p-8 animate-scale-in">
          <div className="animate-fade-in-up">
            <Logo />
          </div>

          <h1
            className="text-center text-xl font-semibold text-[#1c1c1e] dark:text-white mb-2 animate-fade-in-up"
            style={{ animationDelay: '50ms' }}
          >
            {showCredentials ? 'Вход по почте' : 'Вход в аккаунт'}
          </h1>

          <p
            className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {showCredentials
              ? 'Введите логин и пароль'
              : 'Продолжите через удобный способ'}
          </p>

          <div
            className="space-y-3 animate-fade-in-up"
            style={{ animationDelay: '150ms' }}
          >
            {!showCredentials ? (
              <div className="space-y-3 animate-in fade-in duration-300">
                <button
                  onClick={() => setShowCredentials(true)}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a2a2c] transition"
                >
                  Вход по логину
                </button>

                <AuthDivider />

                <OAuthButton
                  provider="google"
                  onClick={() => startOAuth('google')}
                  isLoading={oauthLoading === 'google'}
                />

                <OAuthButton
                  provider="yandex"
                  onClick={() => startOAuth('yandex')}
                  isLoading={oauthLoading === 'yandex'}
                />

                {error && (
                  <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl animate-in shake-in duration-300">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <CredentialsForm
                onSubmit={handleCredentialsSubmit}
                loading={loading}
                isNavigating={isNavigating}
                error={error}
                onBack={() => setShowCredentials(false)}
              />
            )}
          </div>

          <div className="flex items-center justify-center border-t border-gray-50 dark:border-[#2a2a2c] mt-8 pt-6">
            <Link
              href="/auth/register"
              className="text-center text-xs text-gray-400 dark:text-gray-500 hover:text-[#0071e3] transition underline-offset-4 hover:underline"
            >
              Создать новый аккаунт
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInWithParams() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  return <SignInContent callbackUrl={callbackUrl} />;
}

function SignInLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] dark:bg-[#0f0f10] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-sm border border-gray-100 dark:border-[#2a2a2c] p-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#1a8bc2] animate-pulse shadow-lg shadow-[#0071e3]/20" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#1a8bc2] animate-ping opacity-20" />
            </div>

            <div className="space-y-3 w-full">
              <div className="h-11 bg-gray-100 dark:bg-[#2a2a2c] rounded-xl animate-pulse" />
              <div
                className="h-11 bg-gray-100 dark:bg-[#2a2a2c] rounded-xl animate-pulse"
                style={{ animationDelay: '100ms' }}
              />
              <div
                className="h-11 bg-gray-100 dark:bg-[#2a2a2c] rounded-xl animate-pulse"
                style={{ animationDelay: '200ms' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoader />}>
      <SignInWithParams />
    </Suspense>
  );
}
