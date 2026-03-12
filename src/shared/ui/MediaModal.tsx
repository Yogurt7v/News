'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка Закрыть */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110] p-2 bg-white/10 hover:bg-white/20 rounded-full"
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

        {/* Навигация (скрываем фон кнопок на мобилках для чистоты) */}
        {media.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 md:left-6 p-4 rounded-full bg-black/20 hover:bg-white/10 text-white transition-all z-[110]"
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
              className="absolute right-2 md:right-6 p-4 rounded-full bg-black/20 hover:bg-white/10 text-white transition-all z-[110]"
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

        {/* Основной контейнер медиа */}
        <div className="relative w-[95vw] h-[90vh] flex items-center justify-center">
          {current.type === 'photo' ? (
            <div className="relative w-full h-full">
              <Image
                src={current.url}
                alt="Full view"
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <video
                src={current.url}
                controls
                autoPlay
                className="w-full h-full object-contain outline-none"
              />
            </div>
          )}
        </div>

        {/* Индикатор */}
        <div className="absolute bottom-6 px-4 py-1.5 bg-black/40 border border-white/10 rounded-full text-white/90 text-sm backdrop-blur-md font-medium">
          {currentIndex + 1} / {media.length}
        </div>
      </div>
    </div>,
    document.body
  );
}
