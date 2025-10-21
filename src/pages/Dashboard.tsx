import { useUser } from '@/contexts/UserContext';
import { withAuth } from '@/lib/withAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Gift } from 'lucide-react';

function DashboardPage() {
  const { profile } = useUser();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">
          Добро пожаловать, {profile?.username || profile?.email}!
        </h1>
        <p className="text-muted-foreground mb-8">Ваш личный кабинет</p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Perplexity Pro
              </CardTitle>
              <CardDescription>
                {profile?.has_perplexity_pro ? (
                  <span className="text-success">
                    ✅ Активен до{' '}
                    {profile.perplexity_pro_expires_at &&
                      new Date(profile.perplexity_pro_expires_at).toLocaleDateString('ru-RU')}
                  </span>
                ) : (
                  <span>Промокод ожидает активации</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard/perplexity-pro">
                <Button>
                  {profile?.has_perplexity_pro ? 'Управление' : 'Активировать'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Мои уроки
              </CardTitle>
              <CardDescription>
                Продолжайте обучение работе с AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/lessons">
                <Button>
                  Перейти к урокам
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(DashboardPage);
