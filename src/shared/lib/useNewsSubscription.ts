'use client';

import { useEffect } from 'react';
import PocketBase from 'pocketbase';

interface UseNewsSubscriptionOptions {
  pbUrl: string;
  token?: string;
  onNewNews: (news: Record<string, unknown>) => void;
  enabled?: boolean;
}

export function useNewsSubscription({
  pbUrl,
  token,
  onNewNews,
  enabled = true,
}: UseNewsSubscriptionOptions) {
  useEffect(() => {
    if (!enabled || !pbUrl) return;

    const pb = new PocketBase(pbUrl);

    if (token) {
      pb.authStore.save(token, null);
    }

    const subscribe = async () => {
      try {
        await pb.collection('news').subscribe(
          '*',
          (e) => {
            if (e.action === 'create') {
              onNewNews(e.record as Record<string, unknown>);
            }
          },
          { sort: '-created' }
        );
      } catch {
        // Silent fail - subscription is optional
      }
    };

    subscribe();

    return () => {
      pb.collection('news').unsubscribe('*');
    };
  }, [pbUrl, token, onNewNews, enabled]);
}
