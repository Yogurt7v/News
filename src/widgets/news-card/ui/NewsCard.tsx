'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MediaModal } from '@/shared/ui/MediaModal';
import { pb } from '@/shared/lib/pocketbase';

interface NewsCardProps {
  news: {
    id: string;
    title: string;
    content: string;
    source: string;
    url: string;
    imageUrl?: string;
    publishedAt?: string;
    expand?: Record<string, unknown>;
    media?: Array<{
      type: string;
      file: string;
      order?: number;
      id?: string;
    }>;
    [key: string]: unknown;
  };
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин`;
  if (hours < 24) return `${hours} ч`;
  if (days < 7) return `${days} д`;
  return date.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
};

export function NewsCard({ news }: NewsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const expandedMedia = news.expand?.['media(newsId)'] as
    | Array<{
        type: string;
        file: string;
      }>
    | undefined;

  let mediaItems: { type: string; url: string }[] = [];

  // Handle new format from API (media array with file field)
  if (news.media && Array.isArray(news.media)) {
    mediaItems = news.media.map((m) => ({
      type: m.type,
      url: pb.files.getURL({ collectionId: 'media', id: m.id }, m.file),
    }));
  } else if (Array.isArray(expandedMedia)) {
    mediaItems = expandedMedia.map((m) => ({
      type: m.type,
      url: pb.files.getURL(m, m.file),
    }));
  }

  const mainMedia = mediaItems.length > 0 ? mediaItems[0] : null;
  const publishedDate = news.publishedAt
    ? new Date(news.publishedAt)
    : null;
  const timeAgo = publishedDate ? formatTimeAgo(publishedDate) : '';

  return (
    <>
      <article className="animate-fade-in">
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-white/10 shadow-lg shadow-black/5 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 flex items-center justify-between bg-white/40 dark:bg-white/5 backdrop-blur-sm border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#229ED9]/10 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-[#229ED9]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  <path d="M9 9l6 3-6 3V9z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#229ED9]">
                @{news.source.replace('@', '')}
              </span>
            </div>
            {timeAgo && (
              <span className="text-xs font-medium text-black/40 dark:text-white/40 px-2 py-1 rounded-full bg-black/5 dark:bg-white/10">
                {timeAgo}
              </span>
            )}
          </div>

          {/* Media */}
          {mainMedia && (
            <div
              className="relative w-full aspect-video overflow-hidden cursor-pointer group"
              onClick={() => setIsModalOpen(true)}
            >
              {mainMedia.type === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={mainMedia.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <svg
                        className="w-7 h-7 text-[#229ED9] ml-1"
                        viewBox="0 0 24 24"
                        fill="currentColor"
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
                  className="object-contain"
                  loading="eager"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              )}

              {mediaItems.length > 1 && (
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold">
                  1 / {mediaItems.length}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {/* Content */}
          <div className="p-5 space-y-3">
            <h2 className="text-[17px] font-bold leading-tight text-foreground">
              {news.title}
            </h2>

            {news.content && (
              <p className="text-[15px] leading-relaxed text-black/60 dark:text-white/60 line-clamp-3">
                {news.content}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 text-sm font-semibold text-foreground hover:bg-white/80 dark:hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Анализ', news.id);
                }}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Анализ
              </button>
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 text-foreground hover:bg-white/80 dark:hover:bg-white/15 hover:scale-105 active:scale-[0.98] transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </article>

      {isModalOpen && mainMedia && (
        <MediaModal
          media={mediaItems}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
