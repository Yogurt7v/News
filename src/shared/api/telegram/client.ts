import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { telegramConfig } from '@/shared/config/telegram';
import * as readline from 'readline';

let client: TelegramClient | null = null;

// Создаем интерфейс только когда он нужен, или закрываем его после использования
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

export async function getTelegramClient(): Promise<TelegramClient> {
  if (client) return client;

  const stringSession = new StringSession(
    telegramConfig.sessionString || ''
  );

  client = new TelegramClient(
    stringSession,
    telegramConfig.apiId,
    telegramConfig.apiHash,
    { connectionRetries: 5 }
  );

  try {
    // Если нет сохранённой сессии, запускаем авторизацию
    if (!telegramConfig.sessionString) {
      console.log('Не найдена сессия Telegram. Начинаем авторизацию...');

      await client.start({
        phoneNumber: telegramConfig.phoneNumber,
        phoneCode: async () => {
          const code = await question(
            'Введите код из Telegram (или SMS): '
          );
          return code;
        },
        onError: async (err: any) => {
          console.error('Ошибка:', err.message);

          // Если ошибка связана с кодом, можно предложить resend
          if (err.message.includes('PHONE_CODE_INVALID')) {
            console.log('Код не подошел. Попробуйте запросить SMS...');
            // Здесь можно добавить логику повторного запроса
          }
          throw err;
        },
      });

      console.log(
        '✅ Авторизация успешна! Сохраните эту строку сессии в .env:'
      );
      const sessionString = client.session.save();
      console.log('\n' + sessionString + '\n');
      console.log(
        'Скопируйте её и вставьте в переменную TELEGRAM_SESSION_STRING в .env'
      );

      rl.close(); // Закрываем readline перед выходом
      process.exit(0);
    } else {
      // Если сессия есть, подключаемся
      console.log('Подключение к Telegram...');
      await client.connect();

      // Проверка: действительно ли мы авторизованы?
      try {
        await client.getMe();
        console.log('✅ Telegram client connected and authorized');
      } catch (authError: any) {
        console.error('❌ Сессия недействительна:', authError.message);
        console.log(
          'Удалите TELEGRAM_SESSION_STRING из .env и запустите скрипт заново.'
        );
        rl.close();
        process.exit(1);
      }
    }
  } catch (error: any) {
    console.error('❌ Ошибка подключения:', error.message);
    rl.close();
    throw error;
  }

  return client;
}

// Экспорт функции для корректного закрытия ресурсов при завершении приложения
export async function disconnectTelegram() {
  if (client) {
    await client.disconnect();
    rl.close();
    client = null;
  }
}
