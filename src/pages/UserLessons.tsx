import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

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

  const markAsComplete = async (lessonId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('upsert_lesson_progress', {
        p_user_id: user.id,
        p_lesson_id: lessonId,
        p_progress_percentage: 100,
        p_completed: true
      });

      if (error) throw error;

      // Update local state
      setProgress({
        ...progress,
        [lessonId]: {
          lesson_id: lessonId,
          progress_percentage: 100,
          completed: true,
          last_accessed: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const markAsIncomplete = async (lessonId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('upsert_lesson_progress', {
        p_user_id: user.id,
        p_lesson_id: lessonId,
        p_progress_percentage: 0,
        p_completed: false
      });

      if (error) throw error;

      // Update local state
      setProgress({
        ...progress,
        [lessonId]: {
          lesson_id: lessonId,
          progress_percentage: 0,
          completed: false,
          last_accessed: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading lessons...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Lessons</h1>
          <p className="text-muted-foreground">
            Track your learning progress and complete lessons
          </p>
        </div>

        {lessons.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No lessons available yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {lessons.map((lesson) => {
              const lessonProgress = progress[lesson.id];
              const isCompleted = lessonProgress?.completed || false;
              const progressPercentage = lessonProgress?.progress_percentage || 0;

              return (
                <Card key={lesson.id} className={isCompleted ? 'border-green-500' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {lesson.title}
                        </CardTitle>
                        {lesson.description && (
                          <CardDescription className="mt-2">
                            {lesson.description}
                          </CardDescription>
                        )}
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-300" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {lesson.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{lesson.duration_minutes} min</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span>Progress: {progressPercentage}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isCompleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsIncomplete(lesson.id)}
                          >
                            Mark as Incomplete
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => markAsComplete(lesson.id)}
                          >
                            Mark as Complete
                          </Button>
                        )}
                      </div>
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
