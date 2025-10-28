import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { withAuth } from '@/lib/withAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, BookOpen, CheckCircle2, XCircle, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/use-toast'
import VideoUrlInput from '@/components/VideoUrlInput'
import { VideoMetadata } from '@/types/quiz'

interface Lesson {
  id: string
  title: string
  description: string
  video_url: string
  transcript_text: string
  course_id: string
}

function LessonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { toast } = useToast()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    fetchLesson()
    fetchNotes()
  }, [id])

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setLesson(data)
    } catch (error) {
      console.error('Error fetching lesson:', error)
      toast({
        title: t('error'),
        description: t('failedToLoadLesson'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('lesson_notes')
        .select('content')
        .eq('lesson_id', id)
        .eq('user_id', user.id)
        .single()

      if (data) {
        setNotes(data.content)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const saveNotes = async () => {
    setSavingNotes(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          lesson_id: id,
          user_id: user.id,
          content: notes,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: t('success'),
        description: t('notesSaved'),
      })
    } catch (error) {
      console.error('Error saving notes:', error)
      toast({
        title: t('error'),
        description: t('failedToSaveNotes'),
        variant: 'destructive',
      })
    } finally {
      setSavingNotes(false)
    }
  }

  const downloadTranscript = () => {
    if (!lesson?.transcript_text) return

    const element = document.createElement('a')
    const file = new Blob([lesson.transcript_text], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${lesson.title}-transcript.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('loading')}</div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('lessonNotFound')}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        {t('back')}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Video and Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Section */}
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {lesson.video_url ? (
                  <iframe
                    src={lesson.video_url}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    {t('noVideoAvailable')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <CardTitle>{t('myNotes')}</CardTitle>
                </div>
                <Button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  size="sm"
                >
                  {savingNotes ? t('saving') : t('saveNotes')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-48 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('takeNotesHere')}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Transcript */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <CardTitle>{t('transcript')}</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTranscript}
                  disabled={!lesson.transcript_text}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none h-[calc(100vh-300px)] overflow-y-auto">
                {lesson.transcript_text ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {lesson.transcript_text}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm">{t('noTranscriptAvailable')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default withAuth(LessonDetail)
