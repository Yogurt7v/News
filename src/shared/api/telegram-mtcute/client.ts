import 'dotenv/config';
import '@mtcute/wasm';
import {
  MemoryStorage,
  SqliteStorage,
  TelegramClient,
} from '@mtcute/node';
import path from 'path';
import fs from 'fs';

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH!;

// В production (Vercel) используем MemoryStorage + сессию из переменной окружения
// В локальной разработке — SqliteStorage с файлом
const isProduction = process.env.VERCEL === '1';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 15000;

function createClient() {
  if (isProduction) {
    return new TelegramClient({
      apiId,
      apiHash,
      storage: new MemoryStorage(),
    });
  }

  const sessionDir = path.join(process.cwd(), 'sessions');
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  return new TelegramClient({
    apiId,
    apiHash,
    storage: new SqliteStorage(path.join(sessionDir, 'tg-session.db')),
  });
}

const tg = createClient();

export async function getTelegramClient(): Promise<TelegramClient> {
  const sessionString = process.env.MT_CUTE_SESSION_STRING;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (isProduction) {
        if (!sessionString) {
          throw new Error(
            'MT_CUTE_SESSION_STRING is not set. Run: npm run session:export'
          );
        }
        await tg.start({ session: sessionString });
      } else {
        await tg.start();
      }
      return tg;
    } catch (e) {
      const error = e as Error;
      const isTimeout =
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('ECONNRESET');

      if (isTimeout && attempt < MAX_RETRIES) {
        console.log(
          `⚠️ Подключение к Telegram (попытка ${attempt}/${MAX_RETRIES}): ${error.message}`
        );
        console.log(`⏳ Повтор через ${RETRY_DELAY_MS / 1000} сек...`);
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS)
        );
      } else if (attempt === MAX_RETRIES) {
        console.error(
          `❌ Не удалось подключиться к Telegram после ${MAX_RETRIES} попыток`
        );
        throw new Error(
          `Telegram connection failed after ${MAX_RETRIES} attempts: ${error.message}`
        );
      } else {
        throw error;
      }
    }
  }

  return tg;
}
