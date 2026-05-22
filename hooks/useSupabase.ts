import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useUserStore } from '@/store/user';

export function useSupabaseAuth() {
  const { setUser, setAuthenticated } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapAndSetUser(session.user);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        mapAndSetUser(session.user);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function mapAndSetUser(supabaseUser: SupabaseUser) {
    setUser({
      id: supabaseUser.id,
      phone: supabaseUser.phone,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name,
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
      createdAt: supabaseUser.created_at,
      level: 1,
    });
    setAuthenticated(true);
  }

  return { isLoading };
}

export async function signInWithPhone(phone: string) {
  const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
  return { error };
}

export async function verifyOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: `+91${phone}`,
    token,
    type: 'sms',
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
