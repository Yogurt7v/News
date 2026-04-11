import { NextRequest, NextResponse } from 'next/server';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';
import { getErrorMessage } from '@/shared/types/error';

export async function POST(request: NextRequest) {
  try {
    const pb = await getServerPocketBase();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Укажите email' },
        { status: 400 }
      );
    }

    await pb.collection('users').requestPasswordReset(email);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
