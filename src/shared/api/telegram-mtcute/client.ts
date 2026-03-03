import { TelegramClient } from '@mtcute/node';
import { MemoryStorage } from '@mtcute/core'; // Используем память, а не файл
import QRcode from 'qrcode-terminal';
import 'dotenv/config';

const tg = new TelegramClient({
  apiId: Number(process.env.TELEGRAM_API_ID),
  apiHash: process.env.TELEGRAM_API_HASH!,
  storage: new MemoryStorage(), // Данные не сохраняются в файл
});

async function generateSessionString() {
  try {
    await tg.start({
      qrCodeHandler: (url) => {
        console.log('--- ОТСКАНИРУЙТЕ QR-КОД В TELEGRAM ---');
        QRcode.generate(url, { small: true });
      },
      password: () => tg.input('Введите пароль 2FA (если есть): '),
    });

    // Генерируем строку сессии
    const sessionString = await tg.exportSession();

    console.log('\n✅ АВТОРИЗАЦИЯ УСПЕШНА!');
    console.log('\n--- ВАША СТРОКА СЕССИИ (СКОПИРУЙТЕ ПОЛНОСТЬЮ) ---');
    console.log(sessionString);
    console.log('--------------------------------------------------\n');

    await tg.close();
  } catch (err) {
    console.error('❌ Ошибка:', err);
  }
}

generateSessionString();
