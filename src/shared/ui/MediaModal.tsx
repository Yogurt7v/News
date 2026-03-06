'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom'; // Для рендеринга поверх всего
import { NewsWithMedia } from '@/entities/news/types';

interface MediaModalProps {
  media: NewsWithMedia['media'];
  onClose: () => void;
}

export function MediaModal({ media, onClose }: MediaModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((p) => (p + 1) % media.length);
    },
    [media.length]
  );

  const prev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((p) => (p - 1 + media.length) % media.length);
    },
    [media.length]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, next, prev]);

  const current = media[currentIndex];

  // Используем Portal, чтобы модалка не зависела от стилей родителя
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={onClose} // Клик по фону закроет окно
    >
      {/* Контейнер контента (останавливаем клик, чтобы не закрывалось при нажатии на фото) */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка Закрыть */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110] p-2 bg-white/10 rounded-full"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Навигация */}
        {media.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 md:left-10 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all z-[110]"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-4 md:right-10 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all z-[110]"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Отображение Медиа */}
        <div className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center">
          {current.type === 'photo' ? (
            <div className="relative w-full h-full">
              <Image
                src={current.url}
                alt="Full view"
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <video
              src={current.url}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-lg"
            />
          )}
        </div>

        {/* Индикатор */}
        <div className="absolute bottom-10 px-4 py-1 bg-white/10 rounded-full text-white/70 text-sm backdrop-blur-sm">
          {currentIndex + 1} / {media.length}
        </div>
      </div>
    </div>,
    document.body
  );
}
