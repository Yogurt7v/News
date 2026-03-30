'use client';

import { useEffect } from 'react';
import PocketBase from 'pocketbase';

interface UseNewsSubscriptionOptions {
  pbUrl: string;
  onNewNews: (news: Record<string, unknown>) => void;
  enabled?: boolean;
}

export function useNewsSubscription({
  pbUrl,
  onNewNews,
  enabled = true,
}: UseNewsSubscriptionOptions) {
  useEffect(() => {
    if (!enabled || !pbUrl) return;

    const pb = new PocketBase(pbUrl);

    const subscribe = async () => {
      await pb.collection('news').subscribe(
        '*',
        (e) => {
          if (e.action === 'create') {
            onNewNews(e.record as Record<string, unknown>);
          }
        },
        { sort: '-created' }
      );
    };

    subscribe();

    return () => {
      pb.collection('news').unsubscribe('*');
    };
  }, [pbUrl, onNewNews, enabled]);
}
