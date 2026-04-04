import { redirect } from 'next/navigation';
import { getServerPocketBase } from '@/shared/lib/pocketbase.server';

export default async function ProfilePage() {
  const pb = await getServerPocketBase();

  if (!pb.authStore.isValid || !pb.authStore.record) {
    redirect('/auth/signin');
  }

  const user = pb.authStore.record as unknown as {
    name?: string;
    email: string;
    role?: string;
  } | null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Профиль</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <p>
          <strong>Имя:</strong> {user?.name || 'Не указано'}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Роль:</strong> {user?.role || 'user'}
        </p>
      </div>
    </div>
  );
}
