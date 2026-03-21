import { getTelegramClient } from '@/shared/api/telegram-mtcute/client';
import type { Chat } from '@mtcute/core';

interface SearchResult {
  id: string;
  title: string;
  username: string | null;
  participantsCount: number;
  type: 'channel' | 'group';
  isPrivate: boolean;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q || q.length < 2) return Response.json([]);

  try {
    const client = await getTelegramClient();

    const chats: Chat[] = [];
    for await (const dialog of client.iterDialogs({ limit: 300 })) {
      if ('title' in dialog.peer) {
        chats.push(dialog.peer as Chat);
      }
    }

    const query = q.toLowerCase();
    const results = chats
      .filter((chat) => chat.title.toLowerCase().includes(query))
      .sort((a, b) => {
        const aStarts = a.title.toLowerCase().startsWith(query);
        const bStarts = b.title.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.title.localeCompare(b.title);
      })
      .slice(0, 50);

    const searchResults: SearchResult[] = results.map((chat) => ({
      id: chat.id.toString(),
      title: chat.title,
      username: chat.username ?? null,
      participantsCount: chat.membersCount ?? 0,
      type: chat.chatType === 'channel' ? 'channel' : 'group',
      isPrivate: !chat.username,
    }));

    return Response.json(searchResults);
  } catch (error: unknown) {
    console.error('Telegram Search Error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
