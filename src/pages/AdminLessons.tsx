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
  const [editForm, setEditForm] = useState({ title: '', description: '', duration_minutes: 0 , video_url: ''})
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
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' })
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
        title: 'Новый урок',
        description: '',
        order_index: maxOrder + 1,
        status: 'draft',
        duration_minutes: 3,
                video_url: null,
      }])

    if (error) {
      toast({ title: 'Ошибка'
      toast({ title: 'Успешно', description: 'Урок создан' })
      fetchLessons()
    }
  }

  // Удаление урока
  const deleteLesson = async (id: string) => {
    if (!confirm('Удалить урок? Это действие необратимо.')) return

    const { error } = await supabase.from('lessons').delete().eq('id', id)

    if (error) {
      toast({ title: 'Ошибка'а удаления', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Успешно', description: 'Урок удалён' })
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
      toast({ title: 'Ошибка'а', description: error.message, variant: 'destructive' })
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
      duration_minutes: lesson.duration_minutes | 0| ,
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
      toast({ title: 'Ошибка сохранения', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Успешно', description: 'Изменения сохранены' })
      setEditingId(null)
      fetchLessons()
    }
  }

  // Изменение порядка (простая версия)
  const moveLesson = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = lessons.findIndex(l => l.id === id)
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === lessons.length - 1)) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const lessonsCopy = [...lessons]
    const [removed] = lessonsCopy.splice(currentIndex, 1)
    lessonsCopy.splice(newIndex, 0, removed)

    // Обновляем order_index для всех уроков
    const updates = lessonsCopy.map((lesson, index) => 
      supabase.from('lessons').update({ order_index: index }).eq('id', lesson.id)
    )

    await Promise.all(updates)
    fetchLessons()
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Управление уроками</h1>
            <p className="text-muted-foreground">Создавайте, редактируйте и упорядочивайте уроки</p>
          </div>
          <Button onClick={createLesson} className="gap-2">
            <Plus className="w-4 h-4" />
            Добавить урок
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : lessons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Уроков пока нет</p>
              <Button onClick={createLesson}>
                <Plus className="w-4 h-4 mr-2" />
                Создать первый урок
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
                        className="w-full px-4 py-2 border rounded-md text-lg font-semibold"
                        placeholder="Название урока"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full px-4 py-2 border rounded-md"
                        rows={3}
                        placeholder="Описание урока"
                      />
                      <div className="flex gap-2 items-center">
                        <label className="text-sm font-medium">Длительность (мин):</label>
                        <input
                          type="number"
                          value={editForm.duration_minutes}
                          onChange={(e) => setEditForm({...editForm, duration_minutes: parseInt(e.target.value)})}
                          className="w-24 px-3 py-1 border rounded-md"
                          min="0"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={saveEdit} size="sm" className="gap-1">
                          <Save className="w-4 h-4" /> Сохранить
                        </Button>
                        <Button onClick={() => setEditingId(null)} size="sm" variant="outline" className="gap-1">
                          <X className="w-4 h-4" /> Отмена
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
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{lesson.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            lesson.status === 'published' ? 'bg-green-100 text-green-800' :
                            lesson.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {lesson.status === 'published' ? 'Опубликован' :
                             lesson.status === 'archived' ? 'Архив' : 'Черновик'}
                          </span>
                        </div>
                        {lesson.description && (
                          <p className="text-muted-foreground mb-2">{lesson.description}</p>
                        )}
                        {lesson.duration_minutes && (
                          <p className="text-sm text-muted-foreground">⏱ {lesson.duration_minutes} минут</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => startEdit(lesson)} size="sm" variant="outline" className="gap-1">
                          <Edit className="w-4 h-4" /> Редактировать
                        </Button>
                        <Button onClick={() => toggleStatus(lesson.id, lesson.status)} size="sm" variant="outline" className="gap-1">
                          {lesson.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {lesson.status === 'published' ? 'Скрыть' : 'Опубликовать'}
                        </Button>
                        <Button onClick={() => deleteLesson(lesson.id)} size="sm" variant="destructive" className="gap-1">
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
