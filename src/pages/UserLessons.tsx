import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, BookOpen, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from '@/components/ProgressBar';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  duration_minutes: number | null;
  status: string;
}

interface Progress {
  lesson_id: string;
  progress_percentage: number;
  completed: boolean;
  last_accessed: string | null;
}

function UserLessonsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLessons();
    }
  }, [user]);

  const fetchLessons = async () => {
    try {
      // Fetch published lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('status', 'published')
        .order('order_index');

      if (lessonsError) throw lessonsError;

      // Fetch user progress
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressError) throw progressError;

        // Convert progress array to object for easy lookup
        const progressMap: Record<string, Progress> = {};
        progressData?.forEach((p) => {
          progressMap[p.lesson_id] = p;
        });
        setProgress(progressMap);
      }

      setLessons(lessonsData || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLessonUnlocked = (index: number): boolean => {
    if (index === 0) return true; // Первый урок всегда открыт
    const previousLesson = lessons[index - 1];
    return progress[previousLesson.id]?.completed === true;
  };

  const handleLessonClick = (lessonId: string, index: number) => {
    if (isLessonUnlocked(index)) {
      navigate(`/lessons/${lessonId}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">{t('loadingLessons')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('myLessons')}</h1>
          <p className="text-muted-foreground">
            {t('myLessonsDescription')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar />
        </div>

        {lessons.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {t('noLessonsAvailable')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {lessons.map((lesson, index) => {
              const lessonProgress = progress[lesson.id];
              const isCompleted = lessonProgress?.completed || false;
              const progressPercentage = lessonProgress?.progress_percentage || 0;
              const isUnlocked = isLessonUnlocked(index);

              return (
                <Card 
                  key={lesson.id} 
                  className={`transition-shadow ${
                    isUnlocked 
                      ? 'cursor-pointer hover:shadow-lg' 
                      : 'cursor-not-allowed opacity-60'
                  } ${isCompleted ? 'border-green-500' : ''}`}
                  onClick={() => handleLessonClick(lesson.id, index)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {lesson.title}
                          {!isUnlocked && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </CardTitle>
                        {lesson.description && (
                          <CardDescription className="mt-2">
                            {lesson.description}
                          </CardDescription>
                        )}
                        {!isUnlocked && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {t('completePreviousLesson')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {lesson.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duration_minutes} {t('minutes')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span>{t('progress')}: {progressPercentage}%</span>
                      </div>
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-green-500">
                          <span>✓ {t('completed')}</span>
                        </div>
                      )}
                      {!isUnlocked && (
                        <div className="flex items-center gap-1">
                          <span>🔒 {t('locked')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default UserLessonsPage;
