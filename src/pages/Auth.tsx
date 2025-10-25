import { useState, FormEvent } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { withPublicOnly } from '@/lib/withAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'login'
  const isSignUp = mode === 'signup'

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
                                            const [message, setMessage] = useState<{text: string; type: 'success' | 'error'} | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
                  setMessage({ text: t('passwordsDontMatch'), type: 'error' })
          return
        }

        if (password.length < 6) {
                  setMessage({ text: t('passwordMinLength'), type: 'error' })
          return
        }

        const redirectUrl = `${window.location.origin}/`
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username,
              full_name: ''
            }
          }
        })

        if (error) {
                  setMessage({ text: error.message, type: 'error' })
        } else {
        setMessage({
          text: t('emailConfirmationSent'),
          type: 'success'
        })
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
                  setMessage({ text: error.message, type: 'error' })
        }
      }
    } catch (err) {
      setMessage({ text: error.message, type: 'error' })    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? t('authSignup') : t('authLogin')}</CardTitle>
          <CardDescription>
            {isSignUp ? t('authSignupDesc') : t('authLoginDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
                  {message && (
          <div className={`p-4 mb-4 rounded-md border ${
            message.type === 'success' 
              ? 'bg-teal-50 border-teal-200 text-teal-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="text-sm font-medium">
              {message.type === 'success' ? '✓ ' : '⚠ '}
              {message.text}
              {message.type === 'success' && (
                <span className="block text-xs mt-1 text-teal-600">
                  {t('checkSpamFolder')}
                </span>
              )}
            </p>
          </div>
        )}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
             <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('emailPlaceholder')}
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  placeholder={t('usernamePlaceholder')}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder={t('passwordPlaceholder')}
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder={t('passwordPlaceholder')}
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('loading') : isSignUp ? t('signupButton') : t('loginButton')}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? (
              <>
                {t('alreadyHaveAccount')}{' '}
                <button
                  onClick={() => setSearchParams({})}
                  className="text-primary hover:underline"
                >
                  {t('loginButton')}
                </button>
              </>
            ) : (
              <>
                {t('noAccount')}{' '}
                <button
                  onClick={() => setSearchParams({ mode: 'signup' })}
                  className="text-primary hover:underline"
                >
                  {t('signupButton')}
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default withPublicOnly(AuthPage)
