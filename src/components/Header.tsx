import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Shield, Menu } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { BurgerMenu } from '@/components/BurgerMenu'
import { useTranslation } from 'react-i18next'

export function Header() {
  const navigate = useNavigate()
  const { user, profile, loading, isAdmin } = useUser()
  const { t } = useTranslation()
  
  // Состояние для управления отображением бургер-меню
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false)

  const handleLogout = async () => {
    
  try {
            // Пытаемся выйти глобально (со всех устройств)
      const { error } = await supabase.auth.signOut({ scope: 'global' })
            if (error) {
                // Если сессия уже invalid - делаем local logout
        if (error.message?.includes('session') || error.message?.includes('Session')) {
          console.log('Session already invalid, doing local logout')
          await supabase.auth.signOut({ scope: 'local' })
          navigate('/')
          return
        }
        console.error('Logout error:', error)
        toast.error(t('logoutError') || 'Ошибка выхода')
        return
      }
      navigate('/')
    } catch (err) {
          console.error('Logout error:', err)
    // При любой ошибке принудительно очищаем все и перенаправляем
    console.log('Force clearing localStorage and redirecting')
    
    // Очищаем localStorage напрямую
    localStorage.removeItem('sb-pekekbphrsvpjnbxkhpi-auth-token')
    localStorage.removeItem('supabase.auth.token')
    
    // Принудительно делаем local logout для очистки остальных данных
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (localErr) {
      console.log('Local logout also failed, clearing manually:', localErr)
    }
    
    // В любом случае перенаправляем
    navigate('/)/
  const handleAdminClick = async () => {
    // Дополнительная проверка admin-роли (живой запрос в Supabase)
    const { data: roleData, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!error && roleData) {
      navigate('/admin')
    } else {
      toast.error('Нет прав администратора!')
      navigate('/dashboard')
    }
  }

  // Обработчик открытия/закрытия бургер-меню
  const toggleBurgerMenu = () => {
    setIsBurgerMenuOpen(!isBurgerMenuOpen)
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Левая часть: логотип/название */}
          <Link to="/" className="text-xl font-bold text-primary hover:text-primary/80">
            PerplexitySchool
          </Link>

          {/* Центральная часть: навигация для авторизованных пользователей */}
          {user && (
            <nav className="hidden md:flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('dashboard')}
              </Link>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAdminClick}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {t('adminPanel')}
                </Button>
              )}
            </nav>
          )}

          {/* Правая часть: кнопки регистрации/входа или профиль + бургер */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="text-sm text-muted-foreground">{t('loading')}</div>
            ) : user ? (
              // Авторизованный пользователь: имя и кнопка выхода
              <>
                <span className="hidden md:inline text-sm text-muted-foreground">
                  {profile?.full_name || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">{t('logout')}</span>
                </Button>
              </>
            ) : (
              // Неавторизованный пользователь: кнопки входа и регистрации
              <>
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button
                    variant="default"
                    size="sm"
                  >
                    {t('registration')}
                  </Button>
                </Link>
              </>
            )}

            {/* Кнопка-бургер (всегда видна) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBurgerMenu}
              className="p-2"
              aria-label={t('openMenu')}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Компонент бургер-меню (overlay) */}
      {isBurgerMenuOpen && (
        <BurgerMenu
          isOpen={isBurgerMenuOpen}
          onClose={() => setIsBurgerMenuOpen(false)}
        />
      )}
    </header>
  )
}
