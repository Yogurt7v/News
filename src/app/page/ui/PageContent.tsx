'use client';

import type { PageContentProps } from './PageContent.types';
import { PageHeader } from './PageHeader';
import { PageParserUI } from './PageParserUI';
import { useParserStatus } from './useParserStatus';
import { Toast } from '@/shared/ui/Toast';
import type { ToastType } from '@/shared/ui/Toast.types';
import { NewsList } from '@/widgets/news-card/ui/NewsList';
import { NoSubscriptions } from '@/widgets/sidebar/ui/NoSubscriptions';

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
