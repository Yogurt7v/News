'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MediaModal } from '@/shared/ui/MediaModal';
import { FastVideo } from '@/shared/ui/FastVideo';
import { getMediaFileUrl } from '@/shared/lib/files';

import type { NewsCardProps } from './NewsCard.types';

const formatTimeAgo = (date: Date): string => {
  return date.toLocaleDateString('ru', {
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: 'numeric',
  });
};

export function NewsCard({ news }: NewsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const expandedMedia = news.expand?.['media(newsId)'] as
    | Array<{
        type: string;
        file: string;
        thumbnail?: string;
      }>
    | undefined;

  let mediaItems: { type: string; url: string; thumbnailUrl?: string }[] =
    [];

  if (news.media && Array.isArray(news.media)) {
    mediaItems = news.media.map((m) => {
      let url = m.file;
      if (!url?.startsWith('http') && !url?.startsWith('/api/files/')) {
        url = getMediaFileUrl(m);
      }
      return {
        type: m.type,
        url,
        thumbnailUrl: m.thumbnailUrl,
      };
    });
  } else if (Array.isArray(expandedMedia)) {
    mediaItems = expandedMedia.map((m) => ({
      type: m.type,
      url: getMediaFileUrl(m),
      thumbnailUrl: m.thumbnail
        ? getMediaFileUrl({ ...m, file: m.thumbnail })
        : undefined,
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
        <div className="bg-white dark:bg-gray-900 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-black/40 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              {news.avatar ? (
                <Image
                  src={news.avatar}
                  alt=""
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0071e3] to-[#5856d6] flex items-center justify-center text-white text-xs font-bold">
                  {(() => {
                    const displayTitle =
                      (news.channelTitle?.length ?? 0) > 0
                        ? news.channelTitle
                        : news.source;
                    return displayTitle?.charAt(1) === '@'
                      ? displayTitle.charAt(2).toUpperCase()
                      : displayTitle?.charAt(0).toUpperCase() || '?';
                  })()}
                </div>
              )}
              <span className="text-sm font-semibold text-[#0071e3]">
                {(news.channelTitle?.length ?? 0) > 0
                  ? news.channelTitle
                  : news.source}
              </span>
            </div>
            {timeAgo && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                {timeAgo}
              </span>
            )}
          </div>

          {/* Media */}
          {mainMedia && (
            <div
              className="relative w-full aspect-video overflow-hidden cursor-pointer group animate-media-load"
              onClick={() => setIsModalOpen(true)}
            >
              {mainMedia.type === 'video' ? (
                <FastVideo
                  src={mainMedia.url}
                  poster={mainMedia.thumbnailUrl}
                  className="w-full h-full"
                  lazy={true}
                />
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
              {news.title}...
            </h2>

            {news.content && (
              <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
                {news.content}
              </p>
            )}

            {/* Actions */}
            {/* <div className="flex items-center gap-2 pt-3">
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
            </div> */}
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
