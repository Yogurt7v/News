import { getTelegramClient } from '@/shared/api/telegram-mtcute/client';

interface SearchResult {
  id: string;
  title: string;
  username: string | null;
  participantsCount: number;
  type: 'channel' | 'group';
  isPrivate: boolean;
}

interface ChatLike {
  _: string;
  id: string | number;
  title?: string;
  username?: string | null;
  participantsCount?: number | null;
}

function isChannelOrGroup(chat: unknown): chat is ChatLike {
  const c = chat as ChatLike;
  return (
    c && typeof c === 'object' && (c._ === 'channel' || c._ === 'chat')
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q || q.length < 2) return Response.json([]);

  try {
    const client = await getTelegramClient();

    // Глобальный поиск через contacts.search
    const result = await client.call({
      _: 'contacts.search',
      q: q.trim(),
      limit: 10,
    });

    const searchResults: SearchResult[] = (result.chats as unknown[])
      .filter(isChannelOrGroup)
      .map((chat) => {
        const username = chat.username ?? null;
        const title = chat.title ?? '';
        const participantsCount = chat.participantsCount ?? 0;

        return {
          id: chat.id.toString(),
          title,
          username,
          participantsCount,
          type: (chat._ === 'channel' ? 'channel' : 'group') as
            | 'channel'
            | 'group',
          isPrivate: !username,
        };
      })
      .filter((r) => r.title)
      .slice(0, 50);

    return Response.json(searchResults);
  } catch (error: unknown) {
    console.error('Telegram Search Error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
