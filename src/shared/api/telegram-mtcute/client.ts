import 'dotenv/config';
import '@mtcute/wasm';
import {
  MemoryStorage,
  SqliteStorage,
  TelegramClient,
} from '@mtcute/node';
import QRcode from 'qrcode-terminal';
import path from 'path';
import fs from 'fs';

const sessionDir = path.join(process.cwd(), 'sessions');
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

// Читаем переменные окружения
const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH!;

const storage = new SqliteStorage(path.join(sessionDir, 'tg-session.db'));

// Создаём клиент с файловым хранилищем (сессия сохраняется в session/telegram.json)
const tg = new TelegramClient({
  apiId,
  apiHash,
  storage, // данные сохраняются в файл
});

// Функция для получения уже авторизованного клиента
export async function getTelegramClient(): Promise<TelegramClient> {
  // Если клиент ещё не запущен, запускаем
  if (!tg.isActive) {
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
      password: () => tg.input('Введите пароль 2FA (если есть): '),
    });

    console.log('\n✅ Авторизация успешна! Сессия сохранена в файл.');
  } else {
    console.log('🔑 Используется сохранённая сессия Telegram');
  }
  return tg;
}
