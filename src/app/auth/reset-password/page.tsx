'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { pb } from '@/shared/lib/pocketbase';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Неверная или отсутствующая ссылка для сброса пароля.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await pb
        .collection('users')
        .confirmPasswordReset(token, password, confirmPassword);
      setMessage('Пароль успешно изменён. Теперь вы можете войти.');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Ошибка при сбросе пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] dark:bg-[#0f0f10] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-sm border border-gray-100 dark:border-[#2a2a2c] p-8">
          <h1 className="text-center text-xl font-semibold mb-2">
            Новый пароль
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Введите новый пароль для вашей учётной записи.
          </p>
          {error && (
            <div className="text-sm text-red-500 mb-4">{error}</div>
          )}
          {message && (
            <div className="text-sm text-green-600 mb-4">{message}</div>
          )}
          {!error && !message && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Новый пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-gray-50 dark:bg-[#2a2a2c] px-4 py-3 text-sm focus:ring-2 focus:ring-[#229ED9] outline-none"
              />
              <input
                type="password"
                placeholder="Подтвердите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-gray-50 dark:bg-[#2a2a2c] px-4 py-3 text-sm focus:ring-2 focus:ring-[#229ED9] outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#229ED9] text-white py-3 rounded-xl font-medium hover:bg-[#1b8ec2] disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить пароль'}
              </button>
            </form>
          )}
          <div className="mt-6 text-center text-sm text-gray-500">
            <Link
              href="/auth/signin"
              className="text-[#229ED9] hover:underline"
            >
              Вернуться ко входу
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] dark:bg-[#0f0f10] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-sm border border-gray-100 dark:border-[#2a2a2c] p-8">
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 dark:bg-[#2a2a2c] rounded-xl animate-pulse mx-auto w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-[#2a2a2c] rounded-xl animate-pulse mx-auto w-full" />
            <div className="h-12 bg-gray-100 dark:bg-[#2a2a2c] rounded-xl animate-pulse" />
            <div
              className="h-12 bg-gray-100 dark:bg-[#2a2a2c] rounded-xl animate-pulse"
              style={{ animationDelay: '100ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoader />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
