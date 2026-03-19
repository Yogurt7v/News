import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');

  if (!pbAuth) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const data = JSON.parse(pbAuth.value);
    return NextResponse.json({ user: data.model });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
