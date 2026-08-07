/**
 * PalateProvider — global tasting-note store + derived palate profile.
 *
 * Holds the user's tasting history in React context, persists to AsyncStorage,
 * and exposes:
 *   - notes (the tasting history)
 *   - addNote (the write path from the tasting flow)
 *   - profile (live-derived via @kelder/engine buildPalateProfile)
 *   - matchFor(wine) → 0–100 score for a candidate wine
 *
 * This is what makes the "scan → log → rate → refine palate" cycle functional:
 * every addNote re-derives the profile, which feeds the Match badges across the app.
 */

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buildPalateProfile,
  matchScore,
  validateTastingNote,
  type TastingNote,
  type PalateProfile,
} from '@kelder/engine';
import { MOCK_WINES, type MockWine } from '../lib/mockData.js';
import { supabase } from '../lib/supabase.js';
import { saveTastingNote, fetchTastingNotes } from '../lib/dataAccessor.js';

const STORAGE_KEY = 'decanta.tastingNotes.v1';

// Users start with an EMPTY cellar. No fake seed data — the palate and
// match scores build organically from real tasting notes.
const EMPTY_NOTES: TastingNote[] = [];

// Metadata maps the engine needs to build a profile: vintageId → varietal + type.
function buildVintageMeta() {
  const varietalByVintage: Record<string, string> = {};
  const typeByVintage: Record<string, any> = {};
  for (const w of MOCK_WINES) {
    varietalByVintage[w.id] = w.varietals[0];
    typeByVintage[w.id] = w.type;
  }
  return { varietalByVintage, typeByVintage };
}

interface PalateContextValue {
  notes: TastingNote[];
  profile: PalateProfile;
  addNote: (note: Omit<TastingNote, 'id' | 'userId' | 'tastedAt'>) => { ok: boolean; error?: string };
  removeNote: (id: string) => void;
  /** Seed synthetic notes from onboarding quiz answers. Replaces any prior seed. */
  setOnboardingSeed: (seed: TastingNote[]) => void;
  /** Match score 0–100 for a candidate wine against the current palate. */
  matchFor: (wine: MockWine) => number;
  /** Lookup wine metadata for a note's vintage. */
  wineForNote: (note: TastingNote) => MockWine | undefined;
}

const PalateContext = createContext<PalateContextValue | null>(null);

export function PalateProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<TastingNote[]>(EMPTY_NOTES);
  const [loaded, setLoaded] = useState(false);

  // Load notes: local cache first (instant), then merge live Supabase notes
  useEffect(() => {
    (async () => {
      // 1. Load local cache immediately
      let localNotes: TastingNote[] = EMPTY_NOTES;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as TastingNote[];
          if (Array.isArray(parsed) && parsed.length > 0) localNotes = parsed;
        }
      } catch { /* fall back to seed */ }
      setNotes(localNotes);
      setLoaded(true);

      // 2. If user is logged in, fetch their live notes from Supabase
      //    and merge with local (dedup by id, server takes priority)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // not logged in — local cache is enough

        const serverNotes = await fetchTastingNotes();
        if (serverNotes && serverNotes.length > 0) {
          // Map server notes → TastingNote shape
          const mapped: TastingNote[] = serverNotes.map((sn: any) => ({
            id: sn.id,
            wineVintageId: sn.vintage_id,
            userId: sn.user_id,
            tastedAt: sn.tasted_at,
            stars: Number(sn.stars),
            nose: sn.nose,
            palate: sn.palate,
            freeText: sn.free_text,
          }));
          // Merge: server notes first, then any local-only notes (by id)
          const serverIds = new Set(mapped.map(n => n.id));
          const localOnly = localNotes.filter(n => !serverIds.has(n.id));
          const merged = [...mapped, ...localOnly];
          setNotes(merged);
          // Persist merged to local cache
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
        }
      } catch { /* network failure — local cache stays */ }
    })();
  }, []);

  // Persist on change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes)).catch(() => {});
  }, [notes, loaded]);

  const { varietalByVintage, typeByVintage } = useMemo(buildVintageMeta, []);

  const profile = useMemo(
    () => buildPalateProfile('guest', notes, varietalByVintage, typeByVintage),
    [notes, varietalByVintage, typeByVintage],
  );

  const addNote = useCallback<PalateContextValue['addNote']>((note) => {
    const err = validateTastingNote(note);
    if (err) return { ok: false, error: err };
    const full: TastingNote = {
      ...note,
      id: `note-${Date.now()}`,
      userId: 'guest',
      tastedAt: new Date().toISOString(),
    };
    setNotes((prev) => [full, ...prev]);
    // Also persist to live Supabase if user is logged in (fire-and-forget)
    saveTastingNote({
      vintageId: note.wineVintageId,
      stars: note.stars,
      nose: note.nose,
      palate: note.palate,
      freeText: note.freeText,
    }).catch(() => {});
    return { ok: true };
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Onboarding quiz seed: insert synthetic notes (replacing any prior seed),
  // keeping them at the back so real notes always surface first in the journal.
  const ONBOARD_SEED_IDS = new Set(['onboard-type-red', 'onboard-type-white']);
  const setOnboardingSeed = useCallback((seed: TastingNote[]) => {
    setNotes((prev) => {
      const real = prev.filter((n) => !ONBOARD_SEED_IDS.has(n.id));
      const oldSeed = prev.filter((n) => ONBOARD_SEED_IDS.has(n.id) && false); // always drop old seed
      void oldSeed;
      return [...real, ...seed];
    });
  }, []);

  const matchFor = useCallback(
    (wine: MockWine): number => {
      return matchScore(profile, {
        varietalSlug: wine.varietals[0],
        type: wine.type,
        descriptorIds: [], // mock wines don't carry descriptor ids; engine handles gracefully
        body: undefined,
      });
    },
    [profile],
  );

  const wineForNote = useCallback(
    (note: TastingNote): MockWine | undefined => MOCK_WINES.find((w) => w.id === note.wineVintageId),
    [],
  );

  const value: PalateContextValue = {
    notes,
    profile,
    addNote,
    removeNote,
    setOnboardingSeed,
    matchFor,
    wineForNote,
  };

  return <PalateContext.Provider value={value}>{children}</PalateContext.Provider>;
}

export function usePalate(): PalateContextValue {
  const ctx = useContext(PalateContext);
  if (!ctx) throw new Error('usePalate must be used within a PalateProvider');
  return ctx;
}
