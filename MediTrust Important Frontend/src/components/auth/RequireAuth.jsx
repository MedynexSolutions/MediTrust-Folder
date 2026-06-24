import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';

export default function RequireAuth({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) {
      navigate(createPageUrl('Welcome'), { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  // App.jsx already shows the global auth spinner — avoid a second full-screen overlay.
  if (isLoadingAuth) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
