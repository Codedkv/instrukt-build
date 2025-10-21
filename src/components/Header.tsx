import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const { user, profile, loading, isAdmin } = useUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {user ? (
            <span className="text-2xl font-bold text-foreground">PerplexitySchool</span>
          ) : (
            <Link to="/">
              <span className="text-2xl font-bold text-foreground hover:text-primary transition cursor-pointer">
                PerplexitySchool
              </span>
            </Link>
          )}

          <nav className="flex gap-3">
            {loading ? (
              <div className="h-10 w-20 bg-muted animate-pulse rounded"></div>
            ) : user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      <Shield className="mr-2 h-4 w-4" />
                      Админ
                    </Button>
                  </Link>
                )}
                <Button onClick={handleLogout} size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Войти
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button size="sm">
                    Регистрация
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
