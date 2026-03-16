'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MediaModal } from '@/shared/ui/MediaModal';
import pb from '@/lib/pocketbase';
import { formatDate } from '@/shared/lib/date';

interface NewsCardProps {
  news: any;
}

export function NewsCard({ news }: NewsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Извлекаем медиа из PocketBase (ключ 'media(newsId)')
  const expandedMedia = news.expand?.['media(newsId)'];

  let mediaItems: { type: string; url: string }[] = [];

  if (Array.isArray(expandedMedia)) {
    mediaItems = expandedMedia.map((m: any) => ({
      type: m.type,
      // В PocketBase SDK метод называется getURL (все заглавные)
      url: pb.files.getURL(m, m.file),
    }));
  } else if (news.media && Array.isArray(news.media)) {
    // Поддержка старого формата
    mediaItems = news.media;
  }

  const mainMedia = mediaItems.length > 0 ? mediaItems[0] : null;
  const publishedDate = news.publishedAt
    ? new Date(news.publishedAt)
    : null;

  return (
    <>
      <article className="flex flex-col max-w-full animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a2a2c] overflow-hidden">
          {/* Шапка поста */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-gray-50 dark:border-[#2a2a2c]">
            <span className="text-[#229ED9] font-bold text-sm">
              {news.source}
            </span>
          </div>

          {/* Медиа-блок */}
          {mainMedia && (
            <div
              className="relative aspect-video w-full overflow-hidden cursor-zoom-in bg-gray-200 dark:bg-[#121214] flex items-center justify-center"
              onClick={() => setIsModalOpen(true)}
            >
              {mainMedia.type === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={mainMedia.url}
                    className="w-full h-full object-contain"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-8 h-8 fill-white"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <Image
                  src={mainMedia.url}
                  alt={news.title || 'Изображение новости'}
                  fill
                  // КРИТИЧНО: unoptimized позволяет загружать картинки с 127.0.0.1
                  unoptimized
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 700px"
                  priority={false}
                />
              )}

              {mediaItems.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-bold">
                  1 / {mediaItems.length}
                </div>
              )}
            </div>
          )}

          {/* Текст */}
          <div className="p-4 relative">
            <h2 className="text-[17px] font-bold mb-1.5 text-gray-900 dark:text-white leading-tight">
              {news.title}
            </h2>
            <p className="text-[15px] text-gray-800 dark:text-[#f5f5f5] leading-normal whitespace-pre-wrap">
              {news.content}
            </p>

            <div className="mt-2 flex items-center justify-end gap-1">
              <time className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                {publishedDate ? formatDate(publishedDate) : ''}
              </time>
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

          {/* Кнопка действия */}
          <div className="p-2 pt-0">
            <button
              className="w-full bg-blue-50 dark:bg-[#229ED9]/10 hover:bg-blue-100 dark:hover:bg-[#229ED9]/20 text-[#229ED9] text-[14px] font-bold py-2.5 rounded-xl transition-all"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Анализ', news.id);
              }}
            >
              🤖 Анализировать новость
            </button>
          </div>
        </div>
      </article>

      {/* Модалка */}
      {isModalOpen && mainMedia && (
        <MediaModal
          media={mediaItems}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
