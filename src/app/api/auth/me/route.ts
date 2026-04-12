import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';

  const pbAuthMatch = cookieHeader.match(/pb_auth=([^;]+)/);

  if (!pbAuthMatch) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      token: null,
    });
  }

  const cookieValue = pbAuthMatch[1];

  let data;
  try {
    data = JSON.parse(cookieValue);
  } catch {
    try {
      data = JSON.parse(decodeURIComponent(cookieValue));
    } catch {
      return NextResponse.json({
        authenticated: false,
        user: null,
        token: null,
      });
    }
  }

  const token = data.token || null;
  const model = data.model || data.record || null;

  return NextResponse.json({
    authenticated: !!model,
    user: model,
    token: token,
  });
}
