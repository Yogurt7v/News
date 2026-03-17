import PocketBase from 'pocketbase';

// Клиент для клиентских компонентов (обычный).
// ВАЖНО: этот файл должен быть безопасен для импорта в client components,
// поэтому тут НЕЛЬЗЯ использовать `next/headers`.
const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'
);

export default pb;
