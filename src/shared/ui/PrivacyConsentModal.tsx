'use client';

import { useEffect } from 'react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel?: () => void;
  isRequired?: boolean;
}

export function PrivacyConsentModal({
  isOpen,
  onAccept,
  onCancel,
  isRequired = true,
}: PrivacyConsentModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={isRequired ? undefined : onCancel}
      />
      <div className="relative w-full max-w-sm bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 p-6 animate-scale-in">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[#0071e3]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center mb-3 text-[#1c1c1e] dark:text-white">
          Согласие на обработку данных
        </h2>

        <div className="bg-gray-50 dark:bg-[#2a2a2c] rounded-2xl p-4 mb-5">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Нажимая &laquo;Принять&raquo;, вы соглашаетесь на обработку
            персональных данных (email, имя) в соответствии с политикой
            конфиденциальности.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
            Данные хранятся на защищённых серверах и не передаются третьим
            лицам.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 px-5 py-3 rounded-2xl bg-[#0071e3] hover:bg-[#005bb5] text-sm font-semibold text-white transition-all shadow-lg shadow-[#0071e3]/25"
          >
            Принять
          </button>
          {!isRequired && onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-5 py-3 rounded-2xl bg-black/5 dark:bg-white/10 text-sm font-semibold hover:bg-black/10 dark:hover:bg-white/15 transition-all"
            >
              Отмена
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
