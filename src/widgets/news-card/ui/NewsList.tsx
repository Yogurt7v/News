'use client';

import { useState, useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { NewsCard } from '@/widgets/news-card/ui/NewsCard';
import { NewsWithMedia } from '@/entities/news/types';

interface NewsListProps {
  initialNews: NewsWithMedia[];
}

export function NewsList({ initialNews }: NewsListProps) {
  const [news, setNews] = useState(initialNews);
  const [isPending, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(initialNews.length === 20);

  const searchParams = useSearchParams();
  const currentChannel = searchParams.get('channel');
  const currentGroup = searchParams.get('group');

  // Обновляем список при изменении параметров (например, клик по группе/каналу)
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
    <div className="space-y-6 max-w-175 mx-auto w-full py-4 px-2 sm:px-4">
      <div className="grid grid-cols-1 w-150 gap-6">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isPending}
          className="block mx-auto bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-6 rounded disabled:opacity-50"
        >
          {isPending ? 'Загрузка...' : 'Загрузить ещё'}
        </button>
      )}
    </div>
  );
}
