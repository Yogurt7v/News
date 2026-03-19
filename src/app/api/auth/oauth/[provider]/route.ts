import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const pb = new PocketBase(
    process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
  );
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const redirectUrl = `${siteUrl}/api/auth/oauth/callback`;

  try {
    const methods = await pb.collection('users').listAuthMethods();
    const p = methods?.oauth2?.providers.find(
      (x: any) => x.name === provider
    );

    if (!p)
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 400 }
      );

    const response = NextResponse.redirect(
      p.authUrl + encodeURIComponent(redirectUrl)
    );

    response.cookies.set(
      'pb_oauth',
      JSON.stringify({
        provider: p.name,
        state: p.state,
        codeVerifier: p.codeVerifier,
        redirectUrl,
        callbackUrl:
          request.nextUrl.searchParams.get('callbackUrl') || '/',
      }),
      {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600,
      }
    );

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
