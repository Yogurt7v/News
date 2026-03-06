const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Получает прямую временную ссылку на файл через Telegram Bot API
 */
export async function getFileUrl(fileId: string): Promise<string | null> {
  if (!BOT_TOKEN) {
    console.error('[Bot API] Ошибка: TELEGRAM_BOT_TOKEN не задан');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
    );

    const data = await response.json();

    if (data.ok && data.result?.file_path) {
      return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
    }

    console.warn(
      `[Bot API] Не удалось получить путь для файла: ${data.description || 'unknown error'}`
    );
    return null;
  } catch (error) {
    console.error(`[Bot API] Критическая ошибка fetch:`, error);
    return null;
  }
}
