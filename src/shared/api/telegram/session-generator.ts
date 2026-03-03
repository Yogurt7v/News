import input from 'input';
import * as dotenv from 'dotenv';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

dotenv.config();

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const phoneNumber = process.env.TELEGRAM_PHONE_NUMBER;

if (!apiId || !apiHash || !phoneNumber) {
  console.error(
    '❌ Ошибка: Проверь .env! Не найдены API_ID, API_HASH или PHONE_NUMBER.'
  );
  process.exit(1);
}

(async () => {
  console.log('🚀 Запуск генератора сессии...');

  const client = new TelegramClient(
    new StringSession(''),
    apiId,
    apiHash,
    {
      connectionRetries: 5,
    }
  );

  try {
    await client.start({
      phoneNumber: async () => phoneNumber,
      password: async () =>
        await input.text(
          'Введите пароль 2FA (если есть, иначе просто Enter): '
        ),
      phoneCode: async () => await input.text('Введите код из Telegram: '),
      onError: (err) => console.error('Ошибка GramJS:', err.message),
    });

    const sessionString = client.session.save() as unknown as string;

    console.log('\n✅ УСПЕХ! Скопируй эту строку в свой .env файл:\n');
    console.log(`TELEGRAM_STRING_SESSION="${sessionString}"`);
    console.log('\n------------------------------------------\n');
  } catch (error) {
    console.error('❌ Произошла ошибка при авторизации:', error);
  } finally {
    await client.disconnect();
    process.exit(0);
  }
})();
