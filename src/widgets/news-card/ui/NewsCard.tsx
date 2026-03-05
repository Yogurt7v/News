import Image from 'next/image';
import { NewsWithMedia } from '@/entities/news/types';
import { formatDate } from '@/shared/lib/date';

interface NewsCardProps {
  news: NewsWithMedia;
}

export function NewsCard({ news }: NewsCardProps) {
  // Берём первое изображение из медиа (если есть)
  const firstImage = news.media.find((m) => m.type === 'photo');

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition hover:shadow-lg">
      {firstImage && (
        <div className="relative h-48 w-full">
          <Image
            src={firstImage.url}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 line-clamp-2">
          {news.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
          {news.content}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{news.source}</span>
          <time dateTime={news.publishedAt.toISOString()}>
            {formatDate(news.publishedAt)}
          </time>
        </div>
        <button
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
          onClick={() => console.log('Анализировать', news.id)}
        >
          Анализировать
        </button>
      </div>
    </article>
  );
}
