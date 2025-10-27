import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { withAuth } from '@/lib/withAuth';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Lesson } from '@/types/database';
import { Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from '@/components/ProgressBar';

function LessonsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lessonId: string, isPublished: boolean) => {
    if (isPublished) {
      navigate(`/lessons/${lessonId}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProgressBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">{t('lessonsTitle')}</h1>
        <p className="text-muted-foreground mb-8">
          {t('lessonsSubtitle')}
        </p>

        <div className="space-y-4">
          {lessons.map((lesson) => (
            <Card 
              key={lesson.id} 
              className={`${!lesson.is_published ? 'opacity-60' : 'cursor-pointer hover:shadow-lg transition-shadow'}`}
              onClick={() => handleLessonClick(lesson.id, lesson.is_published)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {lesson.title}
                      {!lesson.is_published && (
                        <Badge variant="secondary">{t('comingSoon')}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {lesson.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {lesson.duration_minutes && (
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {lesson.duration_minutes} {t('minutes')}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(LessonsPage);
