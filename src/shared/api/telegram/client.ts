import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { telegramConfig } from '@/shared/config/telegram';
import * as readline from 'readline';

let client: TelegramClient | null = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

export async function getTelegramClient(): Promise<TelegramClient> {
  if (client) return client;

  const stringSession = new StringSession(telegramConfig.sessionString);

  client = new TelegramClient(
    stringSession,
    telegramConfig.apiId,
    telegramConfig.apiHash,
    { connectionRetries: 5 }
  );

  // Если нет сохранённой сессии, запускаем авторизацию
  if (!telegramConfig.sessionString) {
    console.log('Не найдена сессия Telegram. Начинаем авторизацию...');
    await client.start({
      phoneNumber: telegramConfig.phoneNumber,
      phoneCode: async () => {
        return await question(
          'Введите код подтверждения, отправленный в Telegram: '
        );
      },
      onError: (err) => console.error('Ошибка авторизации:', err),
    });

    console.log(
      'Авторизация успешна! Сохраните эту строку сессии в .env:'
    );
    const sessionString = client.session.save();
    console.log(sessionString);
    console.log(
      'Скопируйте её и вставьте в переменную TELEGRAM_SESSION_STRING в .env'
    );
    process.exit(0); // остановим процесс, чтобы пользователь сохранил сессию
  } else {
    // Если сессия есть, просто подключаемся
    await client.connect();
    console.log('Telegram client connected');
  }

  return client;
}
