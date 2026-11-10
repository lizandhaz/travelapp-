import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { ageInYears, MIN_AGE_FOR_PUBLIC_PROFILE } from './age';
import { supabase } from './supabase';

export type Profile = {
  id: string;
  email: string;
  name: string;
  handle: string;
  isPublic: boolean;
  canGoPublic: boolean;
};

type AuthState = {
  /** True until we've checked the phone for a saved session. */
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  loading: true,
  session: null,
  profile: null,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

async function loadProfile(id: string, email: string): Promise<Profile | null> {
  const [{ data: profile }, { data: priv }] = await Promise.all([
    supabase.from('profiles').select('name, handle, is_public').eq('id', id).maybeSingle(),
    supabase.from('profile_private').select('date_of_birth').eq('id', id).maybeSingle(),
  ]);
  if (!profile) return null;
  const age = priv?.date_of_birth ? ageInYears(priv.date_of_birth) : null;
  return {
    id,
    email,
    name: profile.name,
    handle: profile.handle,
    isPublic: profile.is_public,
    canGoPublic: age !== null && age >= MIN_AGE_FOR_PUBLIC_PROFILE,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [loadedProfile, setLoadedProfile] = useState<Profile | null>(null);
  // Only show a profile that belongs to whoever is signed in right now.
  const profile = session && loadedProfile?.id === session.user.id ? loadedProfile : null;

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load the profile once per signed-in person (not on every token refresh).
  const userId = session?.user.id;
  const userEmail = session?.user.email ?? '';
  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadProfile(userId, userEmail)
      .then((p) => active && setLoadedProfile(p))
      .catch(() => active && setLoadedProfile(null));
    return () => {
      active = false;
    };
  }, [userId, userEmail]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ loading, session, profile, signOut }}>{children}</AuthContext.Provider>
  );
}
