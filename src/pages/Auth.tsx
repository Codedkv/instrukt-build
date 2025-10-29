import { useState, FormEvent } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { withPublicOnly } from '@/lib/withAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, AlertCircle } from 'lucide-react'

function AuthPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'login'
  const isSignUp = mode === 'signup'

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error(t('passwordsDontMatch'))
          return
        }

        if (password.length < 6) {
          toast.error(t('passwordMinLength'))
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
          toast.error(error.message)
        } else {
          // Показываем явное сообщение о подтверждении email
          setShowEmailConfirmation(true)
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          toast.error(error.message)
        }
      }
    } catch (err) {
      toast.error(t('errorOccurred'))
    } finally {
      setLoading(false)
    }
  }

  // Если показываем подтверждение email - показываем только его
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              {t('registrationSuccess')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle className="text-base font-semibold">
                {t('emailConfirmationSent')}
              </AlertTitle>
              <AlertDescription className="mt-2 text-sm">
                {t('checkSpamFolder')}
              </AlertDescription>
            </Alert>

            <div className="pt-4 space-y-3">
              <Button 
                onClick={() => setSearchParams({})}
                className="w-full"
                variant="outline"
              >
                {t('loginButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
