import { withAuth } from '@/lib/withAuth';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function AdminPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{t('adminPanelTitle')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/lessons" className="transition hover:scale-105">
            <Card className="cursor-pointer hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {t('adminLessonsTitle')}
                </CardTitle>
                <CardDescription>{t('adminLessonsDescription')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/users" className="transition hover:scale-105">
            <Card className="cursor-pointer hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t('adminUsersTitle')}
                </CardTitle>
                <CardDescription>{t('adminUsersDescription')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/promo-codes" className="transition hover:scale-105">
            <Card className="cursor-pointer hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  {t('adminPromoCodesTitle')}
                </CardTitle>
                <CardDescription>{t('adminPromoCodesDescription')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(AdminPage, { requireAdmin: true });
