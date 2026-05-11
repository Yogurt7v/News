'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PendingPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) {
          router.replace('/auth/signin');
          return;
        }
        const data = await res.json();
        if (!data.authenticated) {
          router.replace('/auth/signin');
        }
      } catch {
        router.replace('/auth/signin');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f4f6f8] dark:bg-[#0f0f10] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-sm border border-gray-100 dark:border-[#2a2a2c] p-8 animate-scale-in">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#0071e3] animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-xl font-semibold text-[#1c1c1e] dark:text-white mb-3 text-center">
              Дождитесь одобрения администрации
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              Обычно это занимает до 24 часов
            </p>

            <div className="mt-6 flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full bg-[#0071e3] animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-[#0071e3] animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-[#0071e3] animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
