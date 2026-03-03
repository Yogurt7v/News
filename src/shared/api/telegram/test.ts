import { TelegramClient } from 'gramjs';
import { StringSession } from 'gramjs/sessions';
import * as dotenv from 'dotenv';

dotenv.config();

const stringSession = new StringSession(
  process.env.TELEGRAM_STRING_SESSION || ''
);

async function start() {
  const client = new TelegramClient(
    stringSession,
    Number(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH!,
    {}
  );

  await client.connect();
  console.log('Вы онлайн без ввода кода!');
}

start();
