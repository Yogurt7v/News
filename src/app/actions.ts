'use server';

import { getServerPocketBase } from '@/shared/lib/pocketbase.server';
import { getErrorMessage } from '@/shared/types/error';

export async function handlePasswordReset(email: string) {
  const pb = await getServerPocketBase();
  try {
    await pb.collection('users').requestPasswordReset(email);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
