export const telegramConfig = {
  apiId: process.env.TELEGRAM_API_ID
    ? parseInt(process.env.TELEGRAM_API_ID)
    : 0,
  apiHash: process.env.TELEGRAM_API_HASH || '',
  phoneNumber: process.env.TELEGRAM_PHONE_NUMBER || '',
  sessionString: process.env.TELEGRAM_SESSION_STRING || '',
};

// Функция для получения списка каналов из переменной окружения
export function getChannelsList(): string[] {
  const channels = process.env.TELEGRAM_CHANNELS || '';
  return channels
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
