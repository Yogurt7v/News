'use server';

import createServerClient from '@/lib/pocketbase';

export async function handlePasswordReset(email: string) {
  const pb = await createServerClient();
  try {
    await pb.collection('users').requestPasswordReset(email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
