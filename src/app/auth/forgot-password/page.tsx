'use client';

import { useState } from 'react';
import Link from 'next/link';
import pb from '@/lib/pocketbase';
import { handlePasswordReset } from '@/app/actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      setLoading(true);
      setError('');
      handlePasswordReset(email);

      // Успех (даже если пользователя нет, лучше отвечать так для безопасности)
      setMessage(
        'Инструкции по сбросу пароля отправлены на ваш email, если аккаунт существует.'
      );
    } catch (err: any) {
      // Логируем для отладки
      console.error('Reset Error:', err);

      // Если SMTP не настроен, ошибка упадет сюда
      if (err.message.includes('sendmail') || err.status === 0) {
        setError(
          'Ошибка почтового сервиса на сервере. Пожалуйста, свяжитесь с поддержкой.'
        );
      } else {
        setError(
          err.data?.message ||
            'Не удалось отправить запрос. Попробуйте позже.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] dark:bg-[#0f0f10] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-sm border border-gray-100 dark:border-[#2a2a2c] p-8">
          <h1 className="text-center text-xl font-semibold mb-2">
            Восстановление пароля
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Введите email, указанный при регистрации. Мы пришлём ссылку для
            сброса пароля.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-gray-50 dark:bg-[#2a2a2c] px-4 py-3 text-sm focus:ring-2 focus:ring-[#229ED9] outline-none"
            />
            {error && <div className="text-sm text-red-500">{error}</div>}
            {message && (
              <div className="text-sm text-green-600">{message}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#229ED9] text-white py-3 rounded-xl font-medium hover:bg-[#1b8ec2] disabled:opacity-50"
            >
              {loading ? 'Отправка...' : 'Отправить'}
            </button>
          </form>
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
