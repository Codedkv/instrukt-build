import { useUser } from '@/contexts/UserContext';
import { withAuth } from '@/lib/withAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from '@/components/ProgressBar';

function DashboardPage() {
  const { profile } = useUser();
  const { t, i18n } = useTranslation();

  return (
    <Layout>
            <ProgressBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">
          {t('welcomeUser', { name: profile?.username || profile?.email })}
        </h1>
        <p className="text-muted-foreground mb-8">{t('yourDashboard')}</p>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                {t('perplexityPro')}
              </CardTitle>
              <CardDescription>
                {profile?.has_perplexity_pro ? (
                  <span className="text-success">
                    ✅ {t('activeUntil', { 
                      date: profile.perplexity_pro_expires_at &&
                        new Date(profile.perplexity_pro_expires_at).toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US')
                    })}
                  </span>
                ) : (
                  <span>{t('promoWaiting')}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard/perplexity-pro">
                <Button>
                  {profile?.has_perplexity_pro ? t('manage') : t('activate')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {t('myLessons')}
              </CardTitle>
              <CardDescription>
                {t('continueWithAI')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/my-lessons">
                <Button>
                  {t('goToLessons')}
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
