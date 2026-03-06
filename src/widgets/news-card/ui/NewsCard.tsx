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
      <article className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full">
        {/* Контейнер изображения (важно: relative + height) */}
        {firstImage && (
          <div
            className="relative h-52 w-full overflow-hidden cursor-zoom-in"
            onClick={() => setIsModalOpen(true)}
          >
            <Image
              src={firstImage.url}
              alt={news.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-sm font-medium">
                Смотреть {news.media.length} фото/видео
              </div>
            </div>
          </div>
        )}

        <div className="p-5 flex flex-col flex-grow">
          <h2 className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
            {news.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm flex-grow">
            {news.content}
          </p>

          <div className="flex items-center justify-between text-xs font-medium text-gray-400 dark:text-gray-500 mb-4">
            <span className="uppercase tracking-wider">{news.source}</span>
            <time dateTime={news.publishedAt.toISOString()}>
              {formatDate(news.publishedAt)}
            </time>
          </div>

          <button
            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 text-gray-900 dark:text-gray-100 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 active:scale-[0.98]"
            onClick={() => console.log('Анализировать', news.id)}
          >
            Анализировать
          </button>
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
