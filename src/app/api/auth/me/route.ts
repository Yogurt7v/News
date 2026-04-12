import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');

  if (!pbAuth) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      token: null,
    });
  }

  try {
    const decodedValue = decodeURIComponent(pbAuth.value);
    const data = JSON.parse(decodedValue);
    return NextResponse.json({
      authenticated: !!data.model,
      user: data.model || null,
      token: data.token || null,
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
      user: null,
      token: null,
    });
  }
}
