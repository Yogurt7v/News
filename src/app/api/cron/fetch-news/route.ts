import { NextResponse } from 'next/server';
import {
  telegramParser,
  ParserCallbacks,
} from '@/features/telegram-parser/parser.service';
import { createAdminClient } from '@/shared/lib/pocketbase-admin';

function isAuthorized(request: Request): boolean {
  // Vercel Cron добавляет заголовок x-vercel-cron: 1
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader === '1') return true;

  // Ручной запуск с кнопки — проверяем CRON_SECRET
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!authHeader || !secret) return false;
  const token = authHeader.split(' ')[1];
  return token === secret;
}

async function getChannelsFromDatabase(): Promise<string[]> {
  const pb = await createAdminClient();

  const subscriptions = await pb.collection('subscriptions').getFullList({
    sort: '-created',
  });

  const channelUsernames = [
    ...new Set(
      subscriptions
        .map((sub) => sub.channelUsername?.replace('@', '').trim())
        .filter(Boolean)
    ),
  ];

  return channelUsernames.map((ch) => `@${ch}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const channels = await getChannelsFromDatabase();

  if (channels.length === 0) {
    return NextResponse.json(
      { error: 'No subscriptions found in database' },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const callbacks: ParserCallbacks = {
        onLog: (message: string) => {
          const data = JSON.stringify({ message });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        },
      };

      try {
        const limit = parseInt(process.env.POST_LIMIT!);
        const result = await telegramParser(channels, limit, callbacks);

        const doneData = JSON.stringify({
          done: true,
          savedCount: result.savedCount,
          logs: result.logs,
        });
        controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
        controller.close();
      } catch (error) {
        const errorData = JSON.stringify({
          error: 'Internal server error',
          details: String(error),
        });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function POST() {
  return NextResponse.json({ error: 'Use GET for SSE' }, { status: 405 });
}
