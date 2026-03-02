npx drizzle-kit studio
test@test.ru
123456

1. Получение API-ключей
   Перейди на https://my.telegram.org и войди под своим номером телефона.

Нажми API development tools.

создай "News Aggregator".

После создания ты получишь:

api_id (целое число)

api_hash (строка)

Сохрани эти данные.

В файл .env добавь следующие строки (подставь свои значения):

проверь работу
npm run telegram:test
