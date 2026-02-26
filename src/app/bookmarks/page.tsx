import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');
  return <div>Здесь будут закладки</div>;
}
