import { NextResponse } from 'next/server';
import createServerClient from '@/shared/lib/pocketbase.server';

export async function POST(request: Request) {
  try {
    const pb = await createServerClient();

    if (!pb.authStore.isValid || !pb.authStore.model?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = pb.authStore.model.id;

    await pb.collection('users').update(userId, {
      personalDataConsentAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Consent API error:', error);
    return NextResponse.json(
      { error: 'Failed to save consent' },
      { status: 500 }
    );
  }
}
