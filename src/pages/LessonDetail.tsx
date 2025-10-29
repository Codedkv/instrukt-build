import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { withAuth } from '@/lib/withAuth';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Lesson } from '@/types/database';
import { ArrowLeft, Clock, Video, FileText, CheckCircle2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/AuthProvider';

function LessonDetailPage() {
  const { t } = useTranslation();
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [progressId, setProgressId] = useState<string | null>(null);

  useEffect(() => {
    if (lessonId && user) {
      loadLesson();
      loadProgress();
    }
  }, [lessonId, user]);

  // Debounce для автосохранения заметок
  useEffect(() => {
    if (!progressId && !notes) return; // Не сохраняем пустые заметки без прогресса

    const timeoutId = setTimeout(() => {
      saveNotes();
    }, 1500); // Сохранение через 1.5 секунды после прекращения ввода

    return () => clearTimeout(timeoutId);
  }, [notes, progressId]);

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

  const loadProgress = async () => {
    if (!user?.id || !lessonId) return;

    try {
      const { data, error } = await supabase
        .from('progress')
        .select('id, notes')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading progress:', error);
        return;
      }

      if (data) {
        setProgressId(data.id);
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveNotes = async () => {
    if (!user?.id || !lessonId) return;

    setNotesSaving(true);
    setNotesSaved(false);

    try {
      if (progressId) {
        // Обновляем существующую запись
        const { error } = await supabase
          .from('progress')
          .update({ 
            notes,
            updated_at: new Date().toISOString(),
            last_accessed: new Date().toISOString()
          })
          .eq('id', progressId);

        if (error) throw error;
      } else {
        // Создаём новую запись
        const { data, error } = await supabase
          .from('progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            notes,
            progress_percentage: 0,
            completed: false
          })
          .select('id')
          .single();

        if (error) throw error;
        if (data) {
          setProgressId(data.id);
        }
      }

      // Показываем индикатор "Сохранено"
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setNotesSaving(false);
    }
  };

  const handleBackToLessons = () => {
    navigate('/my-lessons');
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
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video and Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Section */}
            {lesson.video_url && (
              <Card>
                <CardContent className="p-6">
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

            {/* Notes Section */}
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setNotesExpanded(!notesExpanded)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('myNotes')}
                    {notesSaved && (
                      <span className="flex items-center gap-1 text-sm font-normal text-green-600">
                        <Check className="h-4 w-4" />
                        {t('saved')}
                      </span>
                    )}
                    {notesSaving && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {t('saving')}...
                      </span>
                    )}
                  </CardTitle>
                  {notesExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              {notesExpanded && (
                <CardContent>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-48 p-4 bg-muted border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('takeNotesHere')}
                  />
                </CardContent>
              )}
            </Card>
          </div>

          {/* Right Column - Transcription */}
          <div className="lg:col-span-1">
            {lesson.description && (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('lessonTranscription')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none overflow-y-auto" style={{ maxHeight: notesExpanded ? 'calc(100vh - 200px)' : 'calc(100vh - 450px)' }}>
                    <p className="whitespace-pre-wrap">{lesson.description}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Transcription/Content Section */}
        {lesson.content && (
          <Card className="mt-6">
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
        <Card className="mt-6">
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
