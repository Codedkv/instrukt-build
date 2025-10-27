import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { withAuth } from '@/lib/withAuth'
import { Layout } from '@/components/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Shield, User, Eye, Search } from 'lucide-react'

interface UserData {
  id: string
  email: string
  username: string
  role: 'admin' | 'student'
  averageProgress: number
  testAttempts: number
}

interface QuizAttemptDetail {
  id: string
  started_at: string
  completed_at: string | null
  score: number | null
  passed: boolean | null
  time_spent: number | null
  quiz: {
    title: string
    lesson: {
      title: string
    }
  }
}

interface UserDetailsData {
  email: string
  username: string
  role: 'admin' | 'student'
  averageProgress: number
  attempts: QuizAttemptDetail[]
}

const AdminUsers = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserDetailsData | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.email.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Получаем всех пользователей с их ролями
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          username,
          user_roles (
            role
          )
        `)
        .order('email')

      if (profilesError) throw profilesError

      // Получаем прогресс для всех пользователей
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('user_id, progress_percentage')

      if (progressError) throw progressError

      // Получаем количество попыток тестов для всех пользователей
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('user_id, id')

      if (attemptsError) throw attemptsError

      // Обрабатываем данные
      const usersWithStats: UserData[] = (profilesData || []).map((profile: any) => {
        // Роль пользователя
        const role = profile.user_roles?.[0]?.role || 'student'

        // Средний прогресс по всем урокам
        const userProgress = (progressData || []).filter(
          (p: any) => p.user_id === profile.id
        )
        const averageProgress =
          userProgress.length > 0
            ? Math.round(
                userProgress.reduce((sum: number, p: any) => sum + (p.progress_percentage || 0), 0) /
                  userProgress.length
              )
            : 0

        // Количество всех попыток тестов (включая неудачные)
        const testAttempts = (attemptsData || []).filter(
          (a: any) => a.user_id === profile.id
        ).length

        return {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          role,
          averageProgress,
          testAttempts,
        }
      })

      setUsers(usersWithStats)
      setFilteredUsers(usersWithStats)
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('adminUsersErrorLoad'),
        variant: 'destructive',
      })
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminRole = async (userId: string, currentRole: 'admin' | 'student') => {
    try {
      const newRole = currentRole === 'admin' ? 'student' : 'admin'

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)

      if (error) throw error

      toast({
        title: t('success'),
        description: t('adminUsersSuccessRoleChanged'),
      })

      // Обновляем локальное состояние
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      )
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('adminUsersErrorToggleRole'),
        variant: 'destructive',
      })
      console.error('Error toggling role:', error)
    }
  }

  const openUserDetails = async (userId: string) => {
    try {
      // Получаем детали пользователя
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          email,
          username,
          user_roles (
            role
          )
        `)
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Получаем прогресс
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('progress_percentage')
        .eq('user_id', userId)

      if (progressError) throw progressError

      const averageProgress =
        (progressData || []).length > 0
          ? Math.round(
              (progressData || []).reduce((sum: number, p: any) => sum + (p.progress_percentage || 0), 0) /
                (progressData || []).length
            )
          : 0

      // Получаем все попытки тестов с деталями
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          started_at,
          completed_at,
          score,
          passed,
          time_spent,
          quizzes (
            title,
            lessons (
              title
            )
          )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false })

      if (attemptsError) throw attemptsError

      // Форматируем данные попыток
      const formattedAttempts: QuizAttemptDetail[] = (attemptsData || []).map((attempt: any) => ({
        id: attempt.id,
        started_at: attempt.started_at,
        completed_at: attempt.completed_at,
        score: attempt.score,
        passed: attempt.passed,
        time_spent: attempt.time_spent,
        quiz: {
          title: attempt.quizzes?.title || 'Unknown Quiz',
          lesson: {
            title: attempt.quizzes?.lessons?.title || 'Unknown Lesson',
          },
        },
      }))

      setSelectedUser({
        email: profileData.email,
        username: profileData.username,
        role: profileData.user_roles?.[0]?.role || 'student',
        averageProgress,
        attempts: formattedAttempts,
      })

      setDetailsModalOpen(true)
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('adminUsersErrorLoad'),
        variant: 'destructive',
      })
      console.error('Error loading user details:', error)
    }
  }

  const formatTime = (seconds: number | null): string => {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">{t('adminUsersPageTitle')}</h1>
            </div>

            {/* Поиск */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder={t('adminUsersSearchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('adminUsersLoading')}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('adminUsersNoUsers')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">
                        {t('adminUsersTableEmail')}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        {t('adminUsersTableUsername')}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        {t('adminUsersTableProgress')}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        {t('adminUsersTableTestAttempts')}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        {t('adminUsersTableRole')}
                      </th>
                      <th className="text-right py-3 px-4 font-semibold">
                        {t('adminUsersTableActions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{user.username}</td>
                        <td className="py-3 px-4">{user.averageProgress}%</td>
                        <td className="py-3 px-4">{user.testAttempts}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                          >
                            {user.role === 'admin' ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                {t('adminUsersRoleAdmin')}
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3 mr-1" />
                                {t('adminUsersRoleStudent')}
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                                                        <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAdminRole(user.id, user.role)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              {t('adminUsersToggleAdmin')}
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openUserDetails(user.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t('adminUsersViewDetails')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Модальное окно с деталями пользователя */}
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('adminUsersModalTitle')}</DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* Общая информация */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {t('adminUsersModalEmail')}
                    </p>
                    <p className="text-base">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {t('adminUsersModalUsername')}
                    </p>
                    <p className="text-base">{selectedUser.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {t('adminUsersModalRole')}
                    </p>
                    <Badge
                      variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {selectedUser.role === 'admin' ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          {t('adminUsersRoleAdmin')}
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          {t('adminUsersRoleStudent')}
                        </>
                      )}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {t('adminUsersModalOverallProgress')}
                    </p>
                    <p className="text-base">{selectedUser.averageProgress}%</p>
                  </div>
                </div>

                {/* История попыток тестов */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {t('adminUsersModalTestAttemptsHistory')}
                  </h3>
                  {selectedUser.attempts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      {t('adminUsersModalNoAttempts')}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 text-sm font-semibold">
                              {t('adminUsersModalAttemptDate')}
                            </th>
                            <th className="text-left py-2 px-3 text-sm font-semibold">
                              {t('adminUsersModalAttemptQuiz')}
                            </th>
                            <th className="text-left py-2 px-3 text-sm font-semibold">
                              {t('adminUsersModalAttemptScore')}
                            </th>
                            <th className="text-left py-2 px-3 text-sm font-semibold">
                              {t('adminUsersModalAttemptPassed')}
                            </th>
                            <th className="text-left py-2 px-3 text-sm font-semibold">
                              {t('adminUsersModalAttemptTime')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUser.attempts.map((attempt) => (
                            <tr key={attempt.id} className="border-b hover:bg-muted/50">
                              <td className="py-2 px-3 text-sm">
                                {formatDate(attempt.started_at)}
                              </td>
                              <td className="py-2 px-3 text-sm">
                                <div>
                                  <p className="font-medium">{attempt.quiz.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {attempt.quiz.lesson.title}
                                  </p>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-sm">
                                {attempt.score !== null ? `${attempt.score}%` : '—'}
                              </td>
                              <td className="py-2 px-3 text-sm">
                                {attempt.passed === null ? (
                                  <Badge variant="outline">—</Badge>
                                ) : attempt.passed ? (
                                  <Badge variant="default">✓</Badge>
                                ) : (
                                  <Badge variant="destructive">✗</Badge>
                                )}
                              </td>
                              <td className="py-2 px-3 text-sm">
                                {formatTime(attempt.time_spent)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Кнопка закрытия */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDetailsModalOpen(false)}
                  >
                    {t('adminUsersModalClose')}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}

export default withAuth(AdminUsers, 'admin')

