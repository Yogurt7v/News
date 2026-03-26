import { NextResponse } from 'next/server';
import { getChannelsList } from '@/shared/config/telegram';
import { telegramParser } from '@/features/telegram-parser/parser.service';

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!authHeader || !secret) return false;
  const token = authHeader.split(' ')[1];
  return token === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const channels = getChannelsList();
    if (channels.length === 0) {
      return NextResponse.json(
        { error: 'No channels configured' },
        { status: 400 }
      );
    }

    const limit = 5;
    const result = await telegramParser(channels, limit);

    return NextResponse.json({
      success: true,
      savedCount: result.savedCount,
      logs: result.logs,
      channels,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
