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
  const [hasMore, setHasMore] = useState(initialNews.length >= 10);

  const searchParams = useSearchParams();
  const currentChannel = searchParams.get('channel');

  useEffect(() => {
    setNews(initialNews);
    setHasMore(initialNews.length >= 10);
  }, [initialNews]);

  const loadMore = async () => {
    startTransition(async () => {
      const params = new URLSearchParams({
        offset: news.length.toString(),
        limit: '10',
      });
      if (currentChannel) params.set('channel', currentChannel);

      const res = await fetch(`/api/news?${params.toString()}`);
      const newNews = await res.json();
      setNews((prev) => [...prev, ...newNews]);
      setHasMore(newNews.length >= 10);
    });
  };

  return (
    // Максимальная ширина 700px — золотой стандарт для читаемости постов
    <div className="max-w-[700px] mx-auto w-full py-4 px-2 sm:px-4 space-y-4">
      <div className="flex flex-col gap-4">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isPending}
          className="w-full py-3 text-[#229ED9] font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending ? 'Загрузка...' : 'Показать еще сообщения'}
        </button>
      )}
    </div>
  );
}
