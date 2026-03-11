'use client';

import { useState } from 'react';
import Image from 'next/image';
import { NewsWithMedia } from '@/entities/news/types';
import { formatDate } from '@/shared/lib/date';
import { MediaModal } from '@/shared/ui/MediaModal';

interface NewsCardProps {
  news: NewsWithMedia;
}

export function NewsCard({ news }: NewsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const firstImage = news.media.find((m) => m.type === 'photo');
  const hasMedia = news.media.length > 0;

  return (
    <>
      <article className="flex flex-col max-w-full animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* Контейнер сообщения */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a2a2c] overflow-hidden">
          {/* Источник (шапка поста) */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-gray-50 dark:border-[#2a2a2c]">
            <span className="text-[#229ED9] font-bold text-sm hover:underline cursor-pointer">
              {news.source || 'Канал'}
            </span>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 5v.01M12 12v.01M12 19v.01"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Изображение */}
          {firstImage && (
            <div
              className="relative aspect-video w-full overflow-hidden cursor-zoom-in"
              onClick={() => setIsModalOpen(true)}
            >
              <Image
                src={firstImage.url}
                alt={news.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 700px"
              />
              {news.media.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-bold">
                  1 / {news.media.length}
                </div>
              )}
            </div>
          )}

          {/* Контент */}
          <div className="p-4 relative">
            <h2 className="text-[17px] font-bold mb-1.5 text-gray-900 dark:text-white leading-tight">
              {news.title}
            </h2>
            <p className="text-[15px] text-gray-800 dark:text-[#f5f5f5] leading-normal whitespace-pre-wrap">
              {news.content}
            </p>

            {/* Подвал сообщения с временем */}
            <div className="mt-2 flex items-center justify-end gap-1">
              <time className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                {formatDate(news.publishedAt)}
              </time>
              {/* Иконка "прочитано" как в ТГ */}
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-[#229ED9]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  d="M4 12l4.5 4.5L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Кнопка действия (в стиле встроенных кнопок TG) */}
          <div className="p-2 pt-0 grid grid-cols-1">
            <button
              className="w-full bg-blue-50 dark:bg-[#229ED9]/10 hover:bg-blue-100 dark:hover:bg-[#229ED9]/20 text-[#229ED9] text-[14px] font-bold py-2.5 rounded-xl transition-all active:scale-[0.99]"
              onClick={() => console.log('Анализировать', news.id)}
            >
              🤖 Анализировать новость
            </button>
          </div>
        </div>
      </article>

      {isModalOpen && hasMedia && (
        <MediaModal
          media={news.media}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
