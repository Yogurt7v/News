import { SqliteStorage, TelegramClient } from '@mtcute/node';
import * as dotenv from 'dotenv';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import readline from 'readline/promises';

dotenv.config();

// 1. Настройка путей (авто-создание папки)
const dbPath = './sessions/my-session.db';
const dbDir = dirname(dbPath);

if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// 2. Инициализация клиента
const client = new TelegramClient({
  apiId: Number(process.env.TELEGRAM_API_ID),
  apiHash: process.env.TELEGRAM_API_HASH!,
  storage: new SqliteStorage(dbPath),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  try {
    const phone = process.env.TELEGRAM_PHONE_NUMBER;
    if (!phone) throw new Error('Номер телефона не найден в .env!');

    const user = await client.start({
      // ИСПРАВЛЕНО: используем phone вместо phoneNumber
      phone: phone,

      code: async () => {
        const res = await rl.question('Введите код из Telegram: ');
        return res.trim();
      },

      password: process.env.TELEGRAM_2FA_PASSWORD,
    });

    console.log(`\n✅ Успех: ${user.displayName}`);
  } catch (err) {
    console.error('❌ Ошибка:', err);
  } finally {
    await client.close();
    rl.close();
  }
}

main();
