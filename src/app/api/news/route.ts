import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { news } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');
  const channel = searchParams.get('channel');

  let query = db.query.news.findMany({
    limit,
    offset,
    orderBy: [desc(news.publishedAt)],
    with: { media: true },
  });

  // Если передан канал, добавляем фильтр по источнику
  if (channel) {
    const source = `@${channel.replace(/^@/, '')}`;
    query = db.query.news.findMany({
      where: eq(news.source, source),
      limit,
      offset,
      orderBy: [desc(news.publishedAt)],
      with: { media: true },
    });
  }

  const items = await query;
  return NextResponse.json(items);
}
