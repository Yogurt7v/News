'use client';

import {
  useState,
  useTransition,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { NewsCard } from '@/widgets/news-card/ui/NewsCard';
import { useNewsSubscription } from '@/shared/lib/useNewsSubscription';

import type { NewsListProps } from './NewsList.types';

export function NewsList({ initialNews }: NewsListProps) {
  const [news, setNews] = useState(initialNews);
  const [isPending, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(initialNews.length >= 5);
  const [newNewsCount, setNewNewsCount] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const currentChannel = searchParams.get('channel');
  const currentGroup = searchParams.get('group');

  useEffect(() => {
    setNews(initialNews);
    setHasMore(initialNews.length >= 5);
  }, [initialNews]);

  const handleNewNews = useCallback(
    (newNews: Record<string, unknown>) => {
      if (!currentChannel || newNews.source === `@${currentChannel}`) {
        setNewNewsCount((prev) => prev + 1);
      }
    },
    [currentChannel]
  );

  useNewsSubscription({
    pbUrl:
      process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://5.53.125.238:8090',
    onNewNews: handleNewNews,
    enabled: true,
  });

  const showNewNews = () => {
    setNews((prev) =>
      [initialNews[0] || news[0], ...prev].filter(Boolean)
    );
    setNewNewsCount(0);
  };

  const loadMore = async () => {
    startTransition(async () => {
      const params = new URLSearchParams({
        offset: news.length.toString(),
        limit: '5',
      });
      if (currentChannel) {
        params.set('channel', currentChannel);
      } else if (currentGroup) {
        params.set('group', currentGroup);
      }
      const res = await fetch(`/api/news?${params.toString()}`);
      const newNewsItems = await res.json();
      setNews((prev) => [...prev, ...newNewsItems]);
      setHasMore(newNewsItems.length >= 5);
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5" ref={listRef}>
      {newNewsCount > 0 && (
        <button
          onClick={showNewNews}
          className="w-full py-3 rounded-2xl bg-[#0071e3] text-white font-semibold hover:bg-[#005bb5] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 animate-fade-in-up"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Показать {newNewsCount} нов
          {newNewsCount === 1 ? 'ую' : newNewsCount < 5 ? 'ые' : 'ых'}{' '}
          новост{newNewsCount === 1 ? 'ь' : 'ей'}
        </button>
      )}

      {news.map((item, index) => (
        <div
          key={item.id}
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
        >
          <NewsCard news={item} />
        </div>
      ))}

      {(hasMore || (!hasMore && news.length > 0)) && (
        <div className="flex gap-3">
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isPending}
              className="flex-1 py-4 rounded-2xl bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm font-semibold text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-fade-in-up"
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
          {hasMore && (
            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
              className="py-4 px-4 rounded-2xl bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out flex items-center justify-center animate-fade-in-up"
              style={{ animationDelay: `${news.length * 50 + 250}ms` }}
              title="Наверх"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {!hasMore && news.length > 0 && (
        <div className="flex justify-center text-center py-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="py-4 px-4 gap-2 rounded-2xl bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out flex items-center justify-center animate-fade-in-up"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            Вы просмотрели все новости{' '}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
