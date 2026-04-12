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

    console.log('[SSE] Init with pbUrl:', pbUrl);
    console.log('[SSE] Token:', token ? 'present' : 'missing');

    const pb = new PocketBase(pbUrl);

    // Авторизовать если есть токен
    if (token) {
      console.log('[SSE] Setting auth token');
      pb.authStore.save(token, null);
      console.log('[SSE] Auth valid:', pb.authStore.isValid);
    }

    const subscribe = async () => {
      console.log('[SSE] Subscribing to news...');
      try {
        await pb.collection('news').subscribe(
          '*',
          (e) => {
            console.log('[SSE] Event:', e.action, e.record);
            if (e.action === 'create') {
              onNewNews(e.record as Record<string, unknown>);
            }
          },
          { sort: '-created' }
        );
        console.log('[SSE] Subscribed successfully');
      } catch (err) {
        console.error('[SSE] Subscribe error:', err);
      }
    };

    subscribe();

    return () => {
      console.log('[SSE] Unsubscribing');
      pb.collection('news').unsubscribe('*');
    };
  }, [pbUrl, token, onNewNews, enabled]);
}
