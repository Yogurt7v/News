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

function createClient() {
  if (isProduction) {
    // Vercel: MemoryStorage, сессия загружается из env через tg.start({ session })
    return new TelegramClient({
      apiId,
      apiHash,
      storage: new MemoryStorage(),
    });
  }

  // Локально: SqliteStorage с файлом
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
  if (isProduction) {
    // На Vercel: загружаем сессию из переменной окружения
    const sessionString = process.env.MT_CUTE_SESSION_STRING;
    if (!sessionString) {
      throw new Error(
        'MT_CUTE_SESSION_STRING is not set. Run: npm run session:export'
      );
    }
    await tg.start({ session: sessionString });
    console.log('Telegram клиент запущен (сессия из env)');
  } else {
    // Локально: сессия в файле, при необходимости запрашиваем QR-код
    await tg.start();
  }

  return tg;
}
