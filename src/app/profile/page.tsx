import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Профиль</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <p>
          <strong>Имя:</strong> {session.user?.name || 'Не указано'}
        </p>
        <p>
          <strong>Email:</strong> {session.user?.email}
        </p>
        <p>
          <strong>Роль:</strong> {session.user?.role || 'user'}
        </p>
      </div>
    </div>
  );
}
