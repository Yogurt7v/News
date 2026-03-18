import { createAdminClient } from '../shared/lib/pocketbase-admin';
import { TelegramParserService } from '../features/telegram-parser/parser.service';

async function run() {
  console.log('🚀 Инициализация системного парсера...');

  // 1. Создаем админ-клиент для доступа к базе
  const pb = await createAdminClient();
  const parser = new TelegramParserService();

  try {
    // 2. Получаем все уникальные подписки из коллекции 'subscriptions'
    // Предполагаем, что у тебя есть коллекция 'subscriptions' с полем 'name' или 'username'
    console.log('📂 Получаю список каналов из базы...');
    const subscriptions = await pb
      .collection('subscriptions')
      .getFullList({
        sort: '-created',
      });

    // Извлекаем только юзернеймы и убираем дубликаты
    const channelUsernames = [
      ...new Set(
        subscriptions
          .map((sub) => sub.channelUsername?.replace('@', '').trim()) // исправлено на channelUsername
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

    // 3. Запускаем парсинг для этих каналов
    const count = await parser.fetchAndSaveNews(channelUsernames);

    console.log(`\n✅ Готово! Сохранено новых постов: ${count}`);
    process.exit(0);
  } catch (e: any) {
    console.error('❌ Критическая ошибка при работе парсера:');
    console.error(e.message);
    process.exit(1);
  }
}

run();
