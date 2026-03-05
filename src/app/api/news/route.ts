import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { news } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');

  const items = await db.query.news.findMany({
    limit,
    offset,
    orderBy: [desc(news.publishedAt)],
    with: {
      media: true,
    },
  });

  return NextResponse.json(items);
}
