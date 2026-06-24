import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { ROLE_STORAGE_KEY, getRole, syncRoleToUser } from './auth-routes';
import {
  ensureProfile,
  fetchProfile,
  getDisplayName,
  saveProfileAndCompleteSetup,
  isProfileSetupComplete,
} from './profiles';

const AuthContext = createContext(null);
const AUTH_INIT_TIMEOUT_MS = 10000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const initialAuthSettledRef = useRef(false);

  const hydrateFromSession = useCallback(async (newSession) => {
    if (!newSession) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      return;
    }

    const currentUser = newSession.user;
    const role = getRole(currentUser);
    localStorage.setItem(ROLE_STORAGE_KEY, role);

    setSession(newSession);
    setUser(currentUser);
    setIsAuthenticated(true);

    try {
      const userProfile = await fetchProfile(currentUser.id, role);
      setProfile(userProfile);
    } catch (error) {
      console.error('fetchProfile failed:', error);
      setProfile(null);
    }

    // Never await updateUser during initial hydration — it can deadlock getSession on refresh.
    void syncRoleToUser(currentUser).then((synced) => {
      if (synced) {
        setUser(synced);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.removeItem('meditrust_demo_user');
  }, []);

  useEffect(() => {
    let mounted = true;
    let initialLoadComplete = false;

    const completeInitialLoad = () => {
      if (!mounted || initialLoadComplete) return;
      initialLoadComplete = true;
      initialAuthSettledRef.current = true;
      setIsLoadingAuth(false);
    };

    const runInitialHydration = async (session) => {
      try {
        if (mounted) {
          await hydrateFromSession(session);
        }
      } catch (error) {
        console.error('Auth hydration failed:', error);
        if (mounted) {
          setAuthError({ type: 'auth_error', message: error.message });
        }
      } finally {
        completeInitialLoad();
      }
    };

    const safetyTimer = setTimeout(() => {
      if (!initialLoadComplete) {
        console.warn('Auth init timed out — releasing loading state');
        completeInitialLoad();
      }
    }, AUTH_INIT_TIMEOUT_MS);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        if (!mounted) return;

        if (event === 'INITIAL_SESSION') {
          void runInitialHydration(session);
          return;
        }

        if (!initialLoadComplete) {
          return;
        }

        if (event === 'SIGNED_OUT' || !session) {
          void hydrateFromSession(null);
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session.user);
          return;
        }

        void hydrateFromSession(session);
      }, 0);
    });

    return () => {
      mounted = false;
      initialAuthSettledRef.current = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [hydrateFromSession]);

  const logout = useCallback(async () => {
    localStorage.removeItem(ROLE_STORAGE_KEY);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAuthenticated(false);
  }, []);

  const navigateToLogin = useCallback(() => {
    window.location.href = '/SignIn';
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { user: refreshed }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (refreshed) {
      const role = getRole(refreshed);
      const userProfile = await fetchProfile(refreshed.id, role);
      setUser(refreshed);
      setProfile(userProfile);
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    }
    return refreshed;
  }, []);

  const completeSetup = useCallback(async (profileFields = {}, roleOverride) => {
    if (!user) throw new Error('Not signed in');

    const role = roleOverride || getRole(user);
    const updatedProfile = await saveProfileAndCompleteSetup(user, role, profileFields);

    const { data, error } = await supabase.auth.updateUser({
      data: { role },
    });
    if (error) throw error;

    if (data.user) {
      setUser(data.user);
    }
    setProfile(updatedProfile);
    return updatedProfile;
  }, [user]);

  const ensureRoleProfile = useCallback(async (roleOverride) => {
    if (!user) return null;
    const role = roleOverride || getRole(user);
    const userProfile = await ensureProfile(user, role);
    setProfile(userProfile);
    return userProfile;
  }, [user]);

  const displayName = user ? getDisplayName(user, profile) : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        displayName,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        appPublicSettings: null,
        logout,
        navigateToLogin,
        refreshUser,
        completeSetup,
        ensureRoleProfile,
        isProfileComplete: isProfileSetupComplete(profile),
        role: user ? getRole(user) : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
