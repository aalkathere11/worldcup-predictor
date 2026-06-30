'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setState({ user: null, loading: false, isAdmin: false });
        return;
      }

      const { data: profile } = await (supabase as any)
    .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      setState({
        user: profile,
        loading: false,
        isAdmin: (profile as any)?.role === 'admin',
      });
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setState({ user: null, loading: false, isAdmin: false });
      } else {
        await loadUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

