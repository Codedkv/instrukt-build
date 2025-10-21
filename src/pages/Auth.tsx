import { useState, FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { withPublicOnly } from '@/lib/withAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const isSignUp = mode === 'signup';

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error('Пароли не совпадают');
          return;
        }

        if (password.length < 6) {
          toast.error('Пароль должен быть минимум 6 символов');
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        
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
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Регистрация успешна! Добро пожаловать.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          toast.error(error.message);
        }
      }
    } catch (err) {
      toast.error('Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Регистрация' : 'Вход'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Создайте аккаунт для доступа к урокам' : 'Войдите в свой аккаунт'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  placeholder="yourusername"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : isSignUp ? 'Зарегистрироваться' : 'Войти'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? (
              <>
                Уже есть аккаунт?{' '}
                <button
                  onClick={() => setSearchParams({})}
                  className="text-primary hover:underline"
                >
                  Войти
                </button>
              </>
            ) : (
              <>
                Нет аккаунта?{' '}
                <button
                  onClick={() => setSearchParams({ mode: 'signup' })}
                  className="text-primary hover:underline"
                >
                  Зарегистрироваться
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withPublicOnly(AuthPage);
