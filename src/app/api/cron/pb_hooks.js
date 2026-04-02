/**
 * PocketBase Hooks - Cron Jobs
 *
 * Установить в: /opt/pocketbase/pb_hooks/pb_hooks.js
 *
 * Для работы нужно:
 * 1. Создать папку pb_hooks если её нет
 * 2. Создать этот файл
 * 3. Перезапустить PocketBase: sudo systemctl restart pocketbase
 */

const SITE_URL = 'https://be-informed.ru';
const CRON_SECRET = 'CXf1mnRi012uFB0HaiNIgUTbfdATHx4t14aVJgPK0mI=';

// Парсер новостей - каждые 15 минут
cronAdd('fetch_news', '*/15 * * * *', async () => {
  try {
    const response = await fetch(`${SITE_URL}/api/cron/fetch-news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });
    console.log(
      `[${new Date().toISOString()}] Parser result: ${response.status}`
    );
  } catch (e) {
    console.error(
      `[${new Date().toISOString()}] Parser error:`,
      e.message
    );
  }
});

// Сжатие медиа - каждые 5 минут, видео в приоритете
cronAdd('compress_media', '*/5 * * * *', async () => {
  try {
    const response = await fetch(`${SITE_URL}/api/cron/compress-media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CRON_SECRET}`,
      },
      body: JSON.stringify({
        limit: 5,
        priority: 'video',
      }),
    });
    const result = await response.json();
    console.log(
      `[${new Date().toISOString()}] Compress result: processed=${result.processed}, errors=${result.errors}`
    );
  } catch (e) {
    console.error(
      `[${new Date().toISOString()}] Compress error:`,
      e.message
    );
  }
});

console.log(
  'PocketBase hooks loaded: fetch_news (15min), compress_media (5min)'
);
