import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, ComponentType } from 'react';
import { useUser } from '@/contexts/UserContext';

interface WithAuthOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    requireAuth = true,
    requireAdmin = false,
    redirectTo = '/auth'
  } = options;

  return function ProtectedComponent(props: P) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile, loading, isAdmin } = useUser();

    useEffect(() => {
      if (loading) return;

      // Require authentication
      if (requireAuth && !user) {
        navigate(redirectTo, { state: { from: location.pathname } });
        return;
      }

      // Require admin
      if (requireAdmin && (!user || !profile || !isAdmin)) {
        navigate('/dashboard');
        return;
      }
    }, [user, profile, loading, isAdmin, navigate, location]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (requireAuth && !user) return null;
    if (requireAdmin && !isAdmin) return null;

    return <Component {...props} />;
  };
}

// Public pages only (redirect if already logged in)
export function withPublicOnly<P extends object>(Component: ComponentType<P>) {
  return function PublicOnlyComponent(props: P) {
    const navigate = useNavigate();
    const { user, loading } = useUser();

    useEffect(() => {
      if (!loading && user) {
        navigate('/dashboard');
      }
    }, [user, loading, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (user) return null;

    return <Component {...props} />;
  };
}
