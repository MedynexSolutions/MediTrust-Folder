import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  getPostAuthPath,
  isAuthEntryPath,
  isSetupPath,
  isSetupComplete,
  isProtectedPath,
  getRole,
  DASHBOARD_PAGES,
} from './auth-routes';
import { createPageUrl } from '@/utils';

/**
 * Redirects authenticated users away from Welcome/SignIn to setup or dashboard.
 * This is the file that previously sent returning users to PatientDashboard
 * when user_metadata.setup_complete was true (even without a Supabase profile).
 * Routing now uses the profile row's setup_complete flag as source of truth.
 */
export default function AuthRedirect() {
  const { isAuthenticated, isLoadingAuth, user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoadingAuth) return;

    const path = location.pathname;

    if (isAuthenticated && user) {
      if (isAuthEntryPath(path)) {
        navigate(getPostAuthPath(user, profile), { replace: true });
        return;
      }

      if (profile && isSetupPath(path) && isSetupComplete(profile)) {
        const role = getRole(user);
        navigate(createPageUrl(DASHBOARD_PAGES[role]), { replace: true });
      }
      return;
    }

    if (!isAuthenticated && isProtectedPath(path)) {
      navigate(createPageUrl('Welcome'), { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, user, profile, location.pathname, navigate]);

  return null;
}
