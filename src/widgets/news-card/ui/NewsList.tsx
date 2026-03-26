'use client';

import { useState, useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { NewsCard } from '@/widgets/news-card/ui/NewsCard';

interface NewsListProps {
  initialNews: Array<{
    id: string;
    title: string;
    content: string;
    source: string;
    url: string;
    imageUrl?: string;
    publishedAt?: string;
    expand?: Record<string, unknown>;
    media?: Array<{ type: string; url: string }>;
    [key: string]: unknown;
  }>;
}

export function NewsList({ initialNews }: NewsListProps) {
  const [news, setNews] = useState(initialNews);
  const [isPending, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(initialNews.length === 20);

  const searchParams = useSearchParams();
  const currentChannel = searchParams.get('channel');
  const currentGroup = searchParams.get('group');

  useEffect(() => {
    setNews(initialNews);
    setHasMore(initialNews.length === 20);
  }, [initialNews]);

  const loadMore = async () => {
    startTransition(async () => {
      const params = new URLSearchParams({
        offset: news.length.toString(),
        limit: '20',
      });
      if (currentChannel) {
        params.set('channel', currentChannel);
      } else if (currentGroup) {
        params.set('group', currentGroup);
      }
      const res = await fetch(`/api/news?${params.toString()}`);
      const newNews = await res.json();
      setNews((prev) => [...prev, ...newNews]);
      setHasMore(newNews.length === 20);
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {news.map((item, index) => (
        <div
          key={item.id}
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
        >
          <NewsCard news={item} />
        </div>
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isPending}
          className="w-full py-4 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 text-sm font-semibold text-foreground hover:bg-white/80 dark:hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-fade-in-up"
          style={{ animationDelay: `${news.length * 50 + 200}ms` }}
        >
          {isPending ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Загрузка...
            </>
          ) : (
            'Загрузить ещё'
          )}
        </button>
      )}

      {!hasMore && news.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-black/30 dark:text-white/30">
            Вы просмотрели все новости
          </p>
        </div>
      )}
    </div>
  );
}
