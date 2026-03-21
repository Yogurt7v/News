import { redirect } from 'next/navigation';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

export default async function BookmarksPage() {
  const pb = await getServerPocketBase();
  if (!pb.authStore.isValid) redirect('/auth/signin');
  return <div>Здесь будут закладки</div>;
}
