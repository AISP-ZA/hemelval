/**
 * AuthProvider — live Supabase Auth (email/password).
 *
 * Replaced the AsyncStorage mock with real supabase.auth calls:
 *  - register → supabase.auth.signUp(email, password)
 *  - signIn   → supabase.auth.signInWithPassword(email, password)
 *  - signOut  → supabase.auth.signOut()
 *  - session  → supabase.auth.onAuthStateChange listener
 *
 * Tasting preferences still cache to AsyncStorage for instant load,
 * but the auth session is managed by Supabase (persists across
 * devices once the user logs in).
 *
 * Tasting notes save to the `tasting_notes` table with the real
 * auth user_id — so they travel between devices.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TastePreferences } from '@kelder/engine';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const PREFS_KEY = 'hemelval.preferences.v1';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUri?: string;
  bio?: string;
  joinedAt: string;
  isPro: boolean;
  proSince?: string;
  preferences: TastePreferences;
}

const DEFAULT_PREFS: TastePreferences = {
  sulphiteSensitivity: 'none',
  veganOnly: false,
  organicOnly: false,
  lowSulphurOnly: false,
  preservativeFreeOnly: false,
};

const GUEST: UserProfile = {
  id: 'guest',
  displayName: '',
  email: '',
  joinedAt: '',
  isPro: false,
  preferences: DEFAULT_PREFS,
};

interface AuthContextValue {
  profile: UserProfile;
  isRegistered: boolean;
  loading: boolean;
  authError: string | null;
  register: (email: string, password: string, name?: string) => Promise<{ ok: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updatePreferences: (prefs: Partial<TastePreferences>) => void;
  upgradeToPro: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(GUEST);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Load cached preferences on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (raw) {
          const prefs = JSON.parse(raw) as TastePreferences;
          setProfile((p) => ({ ...p, preferences: prefs }));
        }
      } catch { /* ignore */ }

      // Check for existing Supabase session
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setProfile((p) => ({
              ...p,
              id: session.user.id,
              email: session.user.email ?? '',
              displayName: session.user.user_metadata?.name ?? session.user.email?.split('@')[0] ?? '',
              joinedAt: session.user.created_at ?? '',
            }));
          }
        } catch { /* ignore */ }
      }
      setLoading(false);
    })();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setProfile((p) => ({
          ...p,
          id: session.user.id,
          email: session.user.email ?? '',
          displayName: session.user.user_metadata?.name ?? session.user.email?.split('@')[0] ?? '',
          joinedAt: session.user.created_at ?? '',
        }));
        setAuthError(null);
      } else if (event === 'SIGNED_OUT') {
        setProfile((p) => ({ ...GUEST, preferences: p.preferences }));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Cache preferences locally
  useEffect(() => {
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(profile.preferences)).catch(() => {});
  }, [profile.preferences]);

  const register = useCallback(async (email: string, password: string, name?: string): Promise<{ ok: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      // Fallback for demo mode (no Supabase)
      setProfile({
        id: `local-${Date.now()}`,
        displayName: name || email.split('@')[0],
        email,
        joinedAt: new Date().toISOString(),
        isPro: false,
        preferences: DEFAULT_PREFS,
      });
      return { ok: true };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split('@')[0] } },
      });
      if (error) return { ok: false, error: error.message };
      if (data.user) {
        const u = data.user;
        setProfile((p) => ({
          ...p,
          id: u.id,
          email: u.email ?? email,
          displayName: name || email.split('@')[0],
          joinedAt: u.created_at ?? new Date().toISOString(),
        }));
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message ?? 'Registration failed' };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      setProfile({
        id: `local-${Date.now()}`,
        displayName: email.split('@')[0],
        email,
        joinedAt: new Date().toISOString(),
        isPro: false,
        preferences: DEFAULT_PREFS,
      });
      return { ok: true };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      if (data.user) {
        setProfile((p) => ({
          ...p,
          id: data.user.id,
          email: data.user.email ?? email,
          displayName: data.user.user_metadata?.name ?? email.split('@')[0],
          joinedAt: data.user.created_at ?? '',
        }));
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message ?? 'Sign in failed' };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setProfile((p) => ({ ...GUEST, preferences: p.preferences }));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<TastePreferences>) => {
    setProfile((p) => ({ ...p, preferences: { ...p.preferences, ...prefs } }));
  }, []);

  const upgradeToPro = useCallback(() => {
    setProfile((p) => ({ ...p, isPro: true, proSince: new Date().toISOString() }));
  }, []);

  return (
    <AuthContext.Provider value={{
      profile,
      isRegistered: profile.id !== 'guest' && Boolean(profile.email),
      loading,
      authError,
      register, signIn, signOut, updatePreferences, upgradeToPro,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
