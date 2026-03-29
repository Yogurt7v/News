'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from './PageHeader';
import { PageParserUI } from './PageParserUI';
import { useParserStatus } from './useParserStatus';
import { Toast, ToastType } from '@/shared/ui/Toast';
import { NewsList } from '@/widgets/news-card/ui/NewsList';
import { NoSubscriptions } from '@/widgets/sidebar/ui/NoSubscriptions';

const AUTO_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

interface NewsItem {
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
    id: string;
  }>;
  [key: string]: unknown;
}

interface PageContentProps {
  title: string;
  statsText?: string;
  showHint: boolean;
  hasSubscriptions: boolean;
  news: NewsItem[];
  isAdmin?: boolean;
}

export function PageContent({
  title,
  statsText,
  showHint,
  hasSubscriptions,
  news,
  isAdmin,
}: PageContentProps) {
  const { toastMessage } = useParserStatus();
  const [secondsLeft, setSecondsLeft] = useState(
    AUTO_REFRESH_INTERVAL / 1000
  );

  const refresh = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          refresh();
          return AUTO_REFRESH_INTERVAL / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refresh]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <>
      <PageHeader title={title} statsText={statsText} showHint={showHint}>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-black/30 dark:text-white/30">
            Автообновление через {minutes}:
            {seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <PageParserUI isAdmin={isAdmin} />
      </PageHeader>
      {news.length > 0 ? (
        <NewsList initialNews={news} />
      ) : (
        <NoSubscriptions hasSubscriptions={hasSubscriptions} />
      )}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type as ToastType}
          onClose={() => {}}
        />
      )}
    </>
  );
}
