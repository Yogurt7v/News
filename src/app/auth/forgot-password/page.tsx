'use client';

import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f4f6f8] dark:bg-[#0f0f10] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-sm border border-gray-100 dark:border-[#2a2a2c] p-8">
          <h1 className="text-center text-xl font-semibold mb-2">
            Восстановление пароля
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Для восстановления пароля свяжитесь с администратором сайта. Мы
            поможем вам восстановить доступ к аккаунту.
          </p>
          <div className="bg-gray-50 dark:bg-[#2a2a2c] rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Напишите вы знаете кому.
            </p>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500">
            <Link
              href="/auth/signin"
              className="text-[#0071e3] hover:underline"
            >
              Вернуться ко входу
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
