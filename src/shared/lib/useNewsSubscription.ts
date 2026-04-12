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

    // Авторизовать если есть токен
    if (token) {
      try {
        const authData = JSON.parse(atob(token.split('.')[1]));
        pb.authStore.save(token, authData);
      } catch (e) {
        console.error('Failed to parse token:', e);
      }
    }

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
  }, [pbUrl, token, onNewNews, enabled]);
}
