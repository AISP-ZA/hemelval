/**
 * AuthProvider — user registration / login / profile persistence.
 *
 * For the MVP this is a local-only mock (AsyncStorage) — no backend.
 * At production this swaps to Supabase Auth (email/password + Apple/Google)
 * by replacing the four methods. The profile schema and preference model
 * stay identical, so the migration is plumbing-only.
 *
 * Persists: identity (name, email, avatar) + TastePreferences (sulphite
 * sensitivity, vegan/organic filters, price band, loved/avoided varietals).
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TastePreferences } from '@kelder/engine';

const PROFILE_KEY = 'hemelval.profile.v1';

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
  register: (name: string, email: string) => Promise<void>;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  updatePreferences: (prefs: Partial<TastePreferences>) => void;
  upgradeToPro: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(GUEST);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as UserProfile;
          if (parsed && parsed.id) setProfile(parsed);
        }
      } catch { /* ignore */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile)).catch(() => {});
  }, [profile, loaded]);

  const register = useCallback(async (name: string, email: string) => {
    const newProfile: UserProfile = {
      id: `u-${Date.now()}`,
      displayName: name,
      email,
      joinedAt: new Date().toISOString(),
      isPro: false,
      preferences: DEFAULT_PREFS,
    };
    setProfile(newProfile);
  }, []);

  const signIn = useCallback(async (email: string) => {
    setProfile((p) => p.id !== 'guest' ? p : { ...p, email, displayName: p.displayName || email.split('@')[0] });
  }, []);

  const signOut = useCallback(() => setProfile(GUEST), []);

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
