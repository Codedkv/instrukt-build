import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { withAuth } from '@/lib/withAuth';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Lesson } from '@/types/database';
import { ArrowLeft, Clock, Video, FileText, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function LessonDetailPage() {
  const { t } = useTranslation();
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      setLesson(data);
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLessons = () => {
    navigate('/my-lessons');  // ✅ ПРАВИЛЬНЫЙ URL
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t('lessonNotFound')}</h2>
            <Button onClick={handleBackToLessons}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToLessons')}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={handleBackToLessons}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToLessons')}
          </Button>
          {lesson.duration_minutes && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {lesson.duration_minutes} {t('minutes')}
            </div>
          )}
        </div>

        {/* Lesson Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-lg text-muted-foreground">{lesson.description}</p>
          )}
        </div>

        {/* Video Section */}
        {lesson.video_url && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                {t('lessonVideo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={lesson.video_url}
                  title={lesson.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transcription/Content Section */}
        {lesson.content && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('lessonTranscription')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{lesson.content}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Section - Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {t('lessonTest')}
            </CardTitle>
            <CardDescription>
              {t('lessonTestDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('testComingSoon')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default withAuth(LessonDetailPage);
