import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

type ProviderInfo = {
  name: string;
  authUrl: string;
  state?: string;
  codeVerifier?: string;
};

function getProviders(methods: any): ProviderInfo[] {
  if (Array.isArray(methods?.authProviders)) return methods.authProviders;
  if (Array.isArray(methods?.oauth2?.providers)) return methods.oauth2.providers;
  return [];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get('callbackUrl') || '/';

  const pb = new PocketBase(
    process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
  );

  const redirectUrl = `${url.origin}/api/auth/oauth/callback`;

  const methods = await pb.collection('users').listAuthMethods();
  const providers = getProviders(methods);
  const p = providers.find((x) => x.name === provider);

  if (!p?.authUrl || !p.state || !p.codeVerifier) {
    return NextResponse.json(
      { error: `OAuth provider "${provider}" is not configured in PocketBase` },
      { status: 400 }
    );
  }

  // Persist PKCE verifier + state for callback verification
  const res = NextResponse.redirect(p.authUrl);
  res.cookies.set({
    name: `pb_oauth_${provider}`,
    value: JSON.stringify({
      state: p.state,
      codeVerifier: p.codeVerifier,
      redirectUrl,
      callbackUrl,
    }),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  });

  return res;
}

