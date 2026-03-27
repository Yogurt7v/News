'use server';

import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

export async function handlePasswordReset(email: string) {
  const pb = await getServerPocketBase();
  try {
    await pb.collection('users').requestPasswordReset(email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
