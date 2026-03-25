import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');

  if (!pbAuth) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const data = JSON.parse(pbAuth.value);
    return NextResponse.json({
      authenticated: !!data.model,
      user: data.model || null,
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
