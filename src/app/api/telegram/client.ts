import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import input from 'input';

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH || '';

const sessionString = process.env.TELEGRAM_SESSION || '';

const stringSession = new StringSession(sessionString);

export const getTelegramClient = async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  // Если сессии нет, запустится процесс авторизации в консоли
  await client.start({
    phoneNumber: async () => await input.text('Введите номер телефона: '),
    password: async () => await input.text('Введите пароль (2FA): '),
    phoneCode: async () => await input.text('Введите код из Telegram: '),
    onError: (err) => console.log('Ошибка авторизации:', err),
  });

  console.log('✅ Соединение установлено.');

  if (!sessionString) {
    console.log('--- ВАША НОВАЯ СЕССИЯ (сохраните её) ---');
    console.log(client.session.save());
    console.log('---------------------------------------');
  }

  return client;
};
