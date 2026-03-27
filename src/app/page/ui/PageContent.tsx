'use client';

import { PageHeader } from './PageHeader';
import { PageParserUI } from './PageParserUI';
import { useParserStatus } from './useParserStatus';
import { Toast, ToastType } from '@/shared/ui/Toast';
import { NewsList } from '@/widgets/news-card/ui/NewsList';
import { NoSubscriptions } from '@/widgets/sidebar/ui/NoSubscriptions';

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

  return (
    <>
      <PageHeader title={title} statsText={statsText} showHint={showHint}>
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
