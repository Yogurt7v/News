import { NextRequest, NextResponse } from 'next/server';
import { getTelegramClient } from '@/shared/api/telegram-mtcute/client';
import { Api } from 'telegram';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q) return Response.json([]);

  try {
    const client = await getTelegramClient();

    // В стандартном API поиск выполняется через invoke
    const result = await client.invoke(
      new Api.contacts.Search({
        q: q, // Поисковый запрос
        limit: 20, // Лимит результатов
      })
    );

    // Результат содержит массив chats и users.
    // Нам нужны chats, так как там лежат каналы и группы.
    const searchResults = result.chats.map((chat: any) => ({
      id: chat.id.toString(), // BigInt нужно превращать в строку для JSON
      title: chat.title,
      username: chat.username,
      participantsCount: chat.participantsCount || 0,
      isChannel: !!chat.broadcast, // broadcast === true означает канал
    }));

    return Response.json(searchResults);
  } catch (error: any) {
    console.error('Telegram Search Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
