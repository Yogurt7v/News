'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CRON_SECRET = process.env.CRON_SECRET || '';

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useParserStatus() {
  const router = useRouter();
  const [parserStatus, setParserStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [currentLog, setCurrentLog] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(
    null
  );

  const runParser = async () => {
    setParserStatus('loading');
    setCurrentLog('🚀 Запуск парсера...');

    try {
      const res = await fetch('/api/cron/fetch-news', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${CRON_SECRET}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setParserStatus('error');
        setCurrentLog(data.error || 'Ошибка обновления');
        setToastMessage({
          message: data.error || 'Ошибка обновления',
          type: 'error',
        });
        setTimeout(() => {
          setParserStatus('idle');
          setCurrentLog('');
          setToastMessage(null);
        }, 5000);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.done) {
                setParserStatus('success');
                setToastMessage({
                  message: `Сохранено ${data.savedCount} постов`,
                  type: 'success',
                });
                router.refresh();
                setTimeout(() => {
                  setParserStatus('idle');
                  setCurrentLog('');
                  setToastMessage(null);
                }, 3000);
              } else if (data.error) {
                setParserStatus('error');
                setCurrentLog(data.error);
                setToastMessage({
                  message: data.error,
                  type: 'error',
                });
                setTimeout(() => {
                  setParserStatus('idle');
                  setCurrentLog('');
                  setToastMessage(null);
                }, 5000);
              } else if (data.message) {
                setCurrentLog(data.message);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Ошибка сети';
      setParserStatus('error');
      setCurrentLog(message);
      setToastMessage({
        message,
        type: 'error',
      });
      setTimeout(() => {
        setParserStatus('idle');
        setCurrentLog('');
        setToastMessage(null);
      }, 5000);
    }
  };

  return {
    parserStatus,
    currentLog,
    toastMessage,
    runParser,
  };
}
