export const telegramConfig = {
  apiId: process.env.TELEGRAM_API_ID
    ? parseInt(process.env.TELEGRAM_API_ID)
    : 0,
  apiHash: process.env.TELEGRAM_API_HASH || '',
  phoneNumber: process.env.TELEGRAM_PHONE_NUMBER || '',
  sessionString: process.env.TELEGRAM_SESSION_STRING || '',
};
