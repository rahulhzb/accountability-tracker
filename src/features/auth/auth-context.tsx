import { Session } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
