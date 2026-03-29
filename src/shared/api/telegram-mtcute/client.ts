import 'dotenv/config';
import '@mtcute/wasm';
import { SqliteStorage, TelegramClient } from '@mtcute/node';
import QRcode from 'qrcode-terminal';
import path from 'path';
import fs from 'fs';

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH!;

// В production (Vercel) используем /tmp — единственная writable директория
// В локальной разработке — папка sessions в корне проекта
const isProduction =
  process.env.NODE_ENV === 'production' || process.env.VERCEL;
const sessionDir = isProduction
  ? '/tmp/sessions'
  : path.join(process.cwd(), 'sessions');

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

const storage = new SqliteStorage(path.join(sessionDir, 'tg-session.db'));

const tg = new TelegramClient({
  apiId,
  apiHash,
  storage,
});

export async function getTelegramClient(): Promise<TelegramClient> {
  if (!(tg as any).isActive) {
    console.log('\n🔐 Требуется авторизация в Telegram');
    console.log(
      'Отсканируйте QR-код в приложении Telegram (Настройки → Устройства → Сканировать QR-код)\n'
    );

    await tg.start({
      qrCodeHandler: (url) => {
        QRcode.generate(url, { small: true });
        console.log(
          '\nИли перейдите по ссылке (если QR не отображается):',
          url
        );
      },
      password: () =>
        (tg as any).input('Введите пароль 2FA (если есть): '),
    });

    console.log('\n✅ Авторизация успешна! Сессия сохранена в файл.');
  } else {
    console.log('🔑 Используется сохранённая сессия Telegram');
  }
  return tg;
}
