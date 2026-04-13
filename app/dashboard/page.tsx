// app/dashboard/page.tsx
import { getServerSession } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardPage() {
  const session = await getServerSession();
  
  // Убираем редирект отсюда — пусть middleware обрабатывает
  // if (!session) {
  //   redirect('/login');
  // }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Привет, {session?.user?.email || 'пользователь'}!
            </h1>
            <LogoutButton />
          </div>
          <p className="text-gray-600">
            Добро пожаловать в защищённую зону! Ты успешно авторизовался.
          </p>
        </div>
      </div>
    </div>
  );
}