import 'dotenv/config';
import '@mtcute/wasm';
import { SqliteStorage, TelegramClient } from '@mtcute/node';
import path from 'path';
import fs from 'fs';

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH!;

const sessionDir = path.join(process.cwd(), 'sessions');
const sessionPath = path.join(sessionDir, 'tg-session.db');

if (!fs.existsSync(sessionPath)) {
  console.error('Файл сессии не найден:', sessionPath);
  process.exit(1);
}

const storage = new SqliteStorage(sessionPath);

const tg = new TelegramClient({
  apiId,
  apiHash,
  storage,
});

async function exportSession() {
  console.log('Подключаемся к Telegram...');

  await tg.start();
  console.log('Подключено!');

  const sessionString = await tg.exportSession();
  console.log('\n--- СКПИРОВАТЬ ВСЁ ВНУТРИ ---\n');
  console.log(sessionString);
  console.log('\n--- КОНЕЦ ---\n');

  await tg.disconnect();
  console.log(
    'Готово. Добавь эту строку в Vercel как MT_CUTE_SESSION_STRING'
  );
}

exportSession().catch((err) => {
  console.error('Ошибка:', err);
  process.exit(1);
});
