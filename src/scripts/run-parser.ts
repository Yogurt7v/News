import { createAdminClient } from '../shared/lib/pocketbase-admin';
import { TelegramParserService } from '../features/telegram-parser/parser.service';
import { getErrorMessage } from '../shared/types/error';

async function run() {
  console.log('🚀 Инициализация системного парсера...');

  const pb = await createAdminClient();
  const parser = new TelegramParserService();

  try {
    console.log('📂 Получаю список каналов из базы...');
    const subscriptions = await pb
      .collection('subscriptions')
      .getFullList({
        sort: '-created',
      });

    const channelUsernames = [
      ...new Set(
        subscriptions
          .map((sub) => sub.channelUsername?.replace('@', '').trim())
          .filter(Boolean)
      ),
    ];

    if (channelUsernames.length === 0) {
      console.log(
        '⚠️ Список подписок пуст. Добавьте каналы через интерфейс.'
      );
      process.exit(0);
    }

    console.log(
      `📡 Список каналов к парсингу: [ ${channelUsernames.join(', ')} ]`
    );

    const count = await parser.fetchAndSaveNews(channelUsernames);

    console.log(`\n✅ Готово! Сохранено новых постов: ${count}`);
    process.exit(0);
  } catch (e: unknown) {
    console.error('❌ Критическая ошибка при работе парсера:');
    console.error(getErrorMessage(e));
    process.exit(1);
  }
}

run();
