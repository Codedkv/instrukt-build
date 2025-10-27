import { useState, useEffect } from 'react'
import { withAuth } from '@/lib/withAuth'
import { Layout } from '@/components/Layout'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, GripVertical, Trash2, Edit, Eye, EyeOff, Save, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

interface Lesson {
  id: string
  title: string
  description: string | null
  order_index: number
  status: 'draft' | 'published' | 'archived'
  duration_minutes: number | null
  video_url: string | null
  created_at: string
}

function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', duration_minutes: 0, video_url: '' })
  const { toast } = useToast()
  const { t } = useTranslation()

  // Загрузка уроков
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

  // Создание нового урока
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
      }])

    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' })
    } else {
      toast({ title: t('success'), description: t('lessonCreated') })
      fetchLessons()
    }
  }

  // Удаление урока
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

  // Изменение статуса
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

  // Начать редактирование
  const startEdit = (lesson: Lesson) => {
    setEditingId(lesson.id)
    setEditForm({
      title: lesson.title,
      description: lesson.description || '',
      duration_minutes: lesson.duration_minutes || 0,
      video_url: lesson.video_url || ''
    })
  }

  // Сохранить изменения
  const saveEdit = async () => {
    if (!editingId) return

    const { error } = await supabase
      .from('lessons')
      .update(editForm)
      .eq('id', editingId)

    if (error) {
      toast({ title: t('saveError'), description: error.message, variant: 'destructive' })
    } else {
      toast({ title: t('success'), description: t('changesSaved') })
      setEditingId(null)
      fetchLessons()
    }
  }

  // НОВЫЙ ПОДХОД: Изменение порядка двух уроков
  const moveLesson = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = lessons.findIndex(l => l.id === id)
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === lessons.length - 1)) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    // Получаем два урока, которые меняются местами
    const currentLesson = lessons[currentIndex]
    const swapLesson = lessons[newIndex]

    // Оптимистичное обновление UI
    const updatedLessons = [...lessons]
    updatedLessons[currentIndex] = { ...swapLesson, order_index: currentLesson.order_index }
    updatedLessons[newIndex] = { ...currentLesson, order_index: swapLesson.order_index }
    setLessons(updatedLessons)

    try {
      // Обновляем только два урока в базе данных
      const { error: error1 } = await supabase
        .from('lessons')
        .update({ order_index: swapLesson.order_index })
        .eq('id', currentLesson.id)

      const { error: error2 } = await supabase
        .from('lessons')
        .update({ order_index: currentLesson.order_index })
        .eq('id', swapLesson.id)

      if (error1 || error2) {
        // Откатываем изменения в UI при ошибке
        setLessons(lessons)
        toast({ 
          title: t('error'), 
          description: error1?.message || error2?.message, 
          variant: 'destructive' 
        })
      } else {
        // Перезагружаем данные для синхронизации
        await fetchLessons()
      }
    } catch (error) {
      // Откатываем при любой ошибке
      setLessons(lessons)
      toast({ title: t('error'), description: 'Failed to reorder lessons', variant: 'destructive' })
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t('adminLessonsPageTitle')}</h1>
            <p className="text-muted-foreground">{t('adminLessonsPageDesc')}</p>
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
