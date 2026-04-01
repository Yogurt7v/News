import { getTelegramClient } from '@/shared/api/telegram-mtcute/client';

interface SearchResult {
  id: string;
  title: string;
  username: string | null;
  participantsCount: number;
  type: 'channel' | 'group';
  isPrivate: boolean;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: unknown) {
      lastError = e instanceof Error ? e : new Error('Unknown error');

      const isNetworkError =
        lastError.message.includes('ECONNRESET') ||
        lastError.message.includes('ETIMEDOUT') ||
        lastError.message.includes('ECONNREFUSED');

      if (isNetworkError && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }

  throw lastError;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q || q.length < 2) return Response.json([]);

  try {
    const client = await getTelegramClient();

    const searchQuery = q.replace('@', '').trim();

    const result = await withRetry(() =>
      client.call({
        _: 'contacts.search',
        q: searchQuery,
        limit: 20,
      })
    );

    const searchResults: SearchResult[] = [];

    const chats = (result.chats as unknown[]) || [];

    for (const chat of chats) {
      const chatType = (chat as { _?: string })._;
      if (chatType !== 'channel' && chatType !== 'chat') continue;

      const username =
        (chat as { username?: string | null }).username ?? null;
      const title = (chat as { title?: string }).title ?? '';
      const participantsCount =
        (chat as { participantsCount?: number | null })
          .participantsCount ?? 0;

      searchResults.push({
        id: (chat as { id: string | number }).id.toString(),
        title,
        username,
        participantsCount,
        type: chatType === 'channel' ? 'channel' : 'group',
        isPrivate: !username,
      });
    }

    return Response.json(searchResults.slice(0, 50));
  } catch (error: unknown) {
    console.error('Telegram Search Error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
