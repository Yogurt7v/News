'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { NewsCard } from '@/widgets/news-card/ui/NewsCard';
import { useNewsSubscription } from '@/shared/lib/useNewsSubscription';

import type { NewsListProps } from './NewsList.types';

type NewsItem = NewsListProps['initialNews'][number];

interface PendingNews extends NewsItem {
  _pending?: boolean;
}

export function NewsList({ initialNews }: NewsListProps) {
  const [news, setNews] = useState<PendingNews[]>(
    initialNews as PendingNews[]
  );
  const [isPending, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(initialNews.length >= 5);
  const [newNewsCount, setNewNewsCount] = useState(0);
  const [pendingNewNews, setPendingNewNews] = useState<NewsItem[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.token) {
          setAuthToken(data.token);
        } else {
          const match = document.cookie.match(/pb_auth=([^;]+)/);
          if (match) {
            try {
              const decoded = decodeURIComponent(match[1]);
              const cookieData = JSON.parse(decoded);
              if (cookieData.token) {
                setAuthToken(cookieData.token);
              }
            } catch {
              // Silent fail
            }
          }
        }
      } catch {
        // Silent fail
      }
    };
    fetchToken();
  }, []);

  const searchParams = useSearchParams();
  const currentChannel = searchParams.get('channel');
  const currentGroup = searchParams.get('group');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNews((prev) => {
      if (prev.length === 0 && initialNews.length > 0) {
        return initialNews as PendingNews[];
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMore((prev) => {
      if (!prev && initialNews.length >= 5) {
        return initialNews.length >= 5;
      }
      return prev;
    });
  }, [initialNews]);

  const handleNewNews = useCallback(
    (newNews: Record<string, unknown>) => {
      const shouldShow =
        !currentChannel || newNews.source === `@${currentChannel}`;
      if (shouldShow) {
        setPendingNewNews((prev) => [...prev, newNews as NewsItem]);
        setNewNewsCount((prev) => prev + 1);
      }
    },
    [currentChannel]
  );

  useNewsSubscription({
    pbUrl:
      process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://5.53.125.238:8090',
    token: authToken || undefined,
    onNewNews: handleNewNews,
    enabled: true,
  });

  const showNewNews = async () => {
    const pending = pendingNewNews as PendingNews[];
    const newIds = pending.map((n) => n.id);

    // Добавляем сразу с флагом _pending
    setNews((prev) => [
      ...pending.map((n) => ({ ...n, _pending: true })),
      ...prev,
    ]);
    setPendingNewNews([]);
    setNewNewsCount(0);

    // Fetch полных данных с media
    try {
      const res = await fetch(`/api/news?ids=${newIds.join(',')}`);
      if (res.ok) {
        const fullNews = await res.json();

        // Плавно обновляемmedia
        setNews((prev) =>
          prev.map((item) => {
            if (newIds.includes(item.id)) {
              const updated = fullNews.find(
                (n: NewsItem) => n.id === item.id
              );
              if (updated) {
                return { ...updated, _pending: false };
              }
            }
            return item;
          })
        );
      }
    } catch {
      // Fallback - убираем флаг pending
      setNews((prev) =>
        prev.map((item) =>
          newIds.includes(item.id) ? { ...item, _pending: false } : item
        )
      );
    }
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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
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
                document
                  .getElementById('page-header')
                  ?.scrollIntoView({ behavior: 'smooth' })
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
            onClick={() =>
              document
                .getElementById('page-header')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
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
