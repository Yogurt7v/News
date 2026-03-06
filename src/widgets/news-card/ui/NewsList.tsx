'use client';

import { useState, useTransition } from 'react';
import { NewsCard } from '@/widgets/news-card/ui/NewsCard';
import { NewsWithMedia } from '@/entities/news/types';

interface NewsListProps {
  initialNews: NewsWithMedia[];
}

export function NewsList({ initialNews }: NewsListProps) {
  const [news, setNews] = useState(initialNews);
  const [isPending, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(initialNews.length >= 10);

  console.log(news);

  const loadMore = async () => {
    startTransition(async () => {
      const res = await fetch(`/api/news?offset=${news.length}&limit=10`);
      const newNews = await res.json();
      setNews((prev) => [...prev, ...newNews]);
      setHasMore(newNews.length === 10);
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-10">
      {news.map((item) => (
        // Контейнер для имитации "бабла" сообщения
        <div
          key={item.id}
          className="transition-transform active:scale-[0.99]"
        >
          <NewsCard news={item} />
        </div>
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isPending}
          className="mt-4 block mx-auto py-2 px-8 rounded-full bg-white dark:bg-[#242424] text-[#2481cc] shadow-sm hover:shadow-md transition-all text-sm font-medium disabled:opacity-50"
        >
          {isPending ? 'Загрузка...' : 'Показать еще'}
        </button>
      )}
    </div>
  );
}
