import { useState, useEffect } from 'react'
import { withAuth } from '@/lib/withAuth'
import { Layout } from '@/components/Layout'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, GripVertical, Trash2, Edit, Eye, EyeOff, Save, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { VideoUrlInput } from '@/components/VideoUrlInput'
import { VideoMetadata } from '@/types/quiz'

interface Lesson {
  id: string
  title: string
  description: string | null
  order_index: number
  status: 'draft' | 'published' | 'archived'
  duration_minutes: number | null
  video_url: string | null
  video_type: string | null
  video_thumbnail: string | null
  created_at: string
}

function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ 
    title: '', 
    description: '', 
    duration_minutes: 0, 
    video_url: '' 
  })
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' })
    } else {
      setLessons(data || [])
    }
    setLoading(false)
  }

  const createLesson = async () => {
    const maxOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index)) : -1
    const { error } = await supabase
      .from('lessons')
      .insert([{
        title: t('newLesson'),
        description: '',
        order_index: maxOrder + 1,
        status: 'draft',
        duration_minutes: 3,
        video_url: null,
        video_type: null,
        video_thumbnail: null,
      }])

    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' })
    } else {
      toast({ title: t('success'), description: t('lessonCreated') })
      fetchLessons()
    }
  }

  const deleteLesson = async (id: string) => {
    if (!confirm(t('deleteLessonConfirm'))) return

    const { error } = await supabase.from('lessons').delete().eq('id', id)

    if (error) {
      toast({ title: t('deletionError'), description: error.message, variant: 'destructive' })
    } else {
      toast({ title: t('success'), description: t('lessonDeleted') })
      fetchLessons()
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    const { error } = await supabase
      .from('lessons')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' })
    } else {
      fetchLessons()
    }
  }

  const startEdit = (lesson: Lesson) => {
    setEditingId(lesson.id)
    setEditForm({
      title: lesson.title,
      description: lesson.description || '',
      duration_minutes: lesson.duration_minutes || 0,
      video_url: lesson.video_url || ''
    })
    
    // Initialize video metadata if exists
    if (lesson.video_url) {
      setVideoMetadata({
        url: lesson.video_url,
        type: (lesson.video_type as VideoMetadata['type']) || 'direct',
        thumbnail: lesson.video_thumbnail || undefined,
      })
    } else {
      setVideoMetadata(null)
    }
  }

  const saveEdit = async () => {
    if (!editingId) return

    const updateData = {
      ...editForm,
      video_url: videoMetadata?.url || null,
      video_type: videoMetadata?.type || null,
      video_thumbnail: videoMetadata?.thumbnail || null,
    }

    const { error } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', editingId)

    if (error) {
      toast({ title: t('saveError'), description: error.message, variant: 'destructive' })
    } else {
      toast({ title: t('success'), description: t('changesSaved') })
      setEditingId(null)
      setVideoMetadata(null)
      fetchLessons()
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setVideoMetadata(null)
  }

  const moveLesson = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = lessons.findIndex(l => l.id === id)
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === lessons.length - 1)) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    const currentLesson = lessons[currentIndex]
    const swapLesson = lessons[newIndex]

    const updatedLessons = [...lessons]
    updatedLessons[currentIndex] = { ...swapLesson, order_index: currentLesson.order_index }
    updatedLessons[newIndex] = { ...currentLesson, order_index: swapLesson.order_index }

    setLessons(updatedLessons)

    try {
      const { error: error1 } = await supabase
        .from('lessons')
        .update({ order_index: swapLesson.order_index })
        .eq('id', currentLesson.id)

      const { error: error2 } = await supabase
        .from('lessons')
        .update({ order_index: currentLesson.order_index })
        .eq('id', swapLesson.id)

      if (error1 || error2) {
        setLessons(lessons)
        toast({ 
          title: t('error'), 
          description: error1?.message || error2?.message, 
          variant: 'destructive' 
        })
      } else {
        await fetchLessons()
      }
    } catch (error) {
      setLessons(lessons)
      toast({ title: t('error'), description: 'Failed to reorder lessons', variant: 'destructive' })
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t('adminLessons')}</h1>
            <p className="text-muted-foreground">{t('adminLessonsDesc')}</p>
          </div>
          <Button onClick={createLesson} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('addLesson')}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">{t('loading')}</div>
        ) : lessons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">{t('noLessonsYet')}</p>
              <Button onClick={createLesson}>
                <Plus className="w-4 h-4 mr-2" />
                {t('createFirstLesson')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {editingId === lesson.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full px-4 py-2 border rounded-md text-lg font-semibold bg-slate-800 text-white border-slate-600"
                        placeholder={t('lessonTitle')}
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full px-4 py-2 border rounded-md bg-slate-800 text-white border-slate-600"
                        rows={3}
                        placeholder={t('lessonDescription')}
                      />
                      <div className="flex gap-2 items-center">
                        <label className="text-sm font-medium">{t('lessonDuration')}</label>
                        <input
                          type="number"
                          value={editForm.duration_minutes}
                          onChange={(e) => setEditForm({...editForm, duration_minutes: parseInt(e.target.value)})}
                          className="w-24 px-3 py-1 border rounded-md bg-slate-800 text-white border-slate-600"
                          min="0"
                        />
                      </div>

                      {/* Video URL Input */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-3">{t('videoUpload')}</h4>
                        <VideoUrlInput
                          value={videoMetadata}
                          onChange={setVideoMetadata}
                        />
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <Button onClick={saveEdit} size="sm" className="gap-1">
                          <Save className="w-4 h-4" /> {t('save')}
                        </Button>
                        <Button onClick={cancelEdit} size="sm" variant="outline" className="gap-1">
                          <X className="w-4 h-4" /> {t('cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveLesson(lesson.id, 'up')} disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                          ▲
                        </button>
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <button onClick={() => moveLesson(lesson.id, 'down')} disabled={index === lessons.length - 1}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                          ▼
                        </button>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="text-muted-foreground mb-2">{lesson.description}</p>
                        )}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {lesson.duration_minutes && (
                            <span>⏱ {lesson.duration_minutes} {t('minutes')}</span>
                          )}
                          {lesson.video_url && (
                            <span>🎥 {lesson.video_type || 'video'}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          lesson.status === 'published' ? 'bg-green-100 text-green-800' :
                          lesson.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lesson.status === 'published' ? t('published') :
                           lesson.status === 'archived' ? t('archived') : t('draft')}
                        </span>
                        <div className="flex gap-2">
                          <Button onClick={() => startEdit(lesson)} size="sm" variant="outline" className="gap-1">
                            <Edit className="w-4 h-4" /> {t('edit')}
                          </Button>
                          <Button onClick={() => toggleStatus(lesson.id, lesson.status)} size="sm" variant="outline" className="gap-1">
                            {lesson.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {lesson.status === 'published' ? t('hide') : t('publish')}
                          </Button>
                          <Button onClick={() => deleteLesson(lesson.id)} size="sm" variant="destructive" className="gap-1">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default withAuth(AdminLessonsPage, 'admin')
