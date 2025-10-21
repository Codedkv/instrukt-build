import { withAuth } from '@/lib/withAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Gift } from 'lucide-react';

function AdminPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Админ-панель</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/lessons" className="transition hover:scale-105">
            <Card className="cursor-pointer hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Уроки
                </CardTitle>
                <CardDescription>Управление уроками</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/users" className="transition hover:scale-105">
            <Card className="cursor-pointer hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Пользователи
                </CardTitle>
                <CardDescription>Управление пользователями</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/promo-codes" className="transition hover:scale-105">
            <Card className="cursor-pointer hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Промокоды
                </CardTitle>
                <CardDescription>Управление промокодами</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(AdminPage, { requireAdmin: true });
