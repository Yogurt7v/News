import { NextResponse } from 'next/server';
import { telegramParser } from '@/features/telegram-parser/parser.service';
import { getChannelsList } from '@/shared/config/telegram';

export async function POST(request: Request) {
  // Проверка авторизации (секретный ключ)
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const channels = getChannelsList();
    const savedCount = await telegramParser(channels, 10);
    return NextResponse.json({ success: true, savedCount });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
