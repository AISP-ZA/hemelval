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
import { saveTastingNote } from '../lib/dataAccessor.js';

const STORAGE_KEY = 'hemelval.tastingNotes.v1';

// Seed a small history on first run so the app demonstrates a non-empty palate.
// (Real users start empty; the seed makes the demo meaningful.)
const SEED_NOTES: TastingNote[] = [
  {
    id: 'seed-1',
    wineVintageId: 'w1',
    userId: 'guest',
    tastedAt: '2026-07-15T19:00:00Z',
    stars: 4.5,
    nose: { aromas: ['cherry-red', 'leather', 'tobacco'] },
    palate: { body: 'medium-plus', flavors: ['plum', 'chocolate-dark'], finish: 'long' },
    freeText: 'Rich plum, banana, earth. Paired with braai lamb chops.',
  },
  {
    id: 'seed-2',
    wineVintageId: 'w5',
    userId: 'guest',
    tastedAt: '2026-07-12T20:00:00Z',
    stars: 5,
    nose: { aromas: ['cherry-red', 'forest-floor', 'rose'] },
    palate: { body: 'medium', flavors: ['cherry-red', 'mushroom'], finish: 'very-long' },
    freeText: 'Finessed, forest floor. My new benchmark for SA Pinot.',
  },
  {
    id: 'seed-3',
    wineVintageId: 'w6',
    userId: 'guest',
    tastedAt: '2026-07-08T18:30:00Z',
    stars: 4,
    nose: { aromas: ['blackberry', 'black-pepper', 'smoke'] },
    palate: { body: 'full', flavors: ['blackberry', 'leather'], finish: 'long' },
    freeText: 'Crowd-pleaser. Smoked meat, white pepper. Great value.',
  },
  {
    id: 'seed-4',
    wineVintageId: 'w4',
    userId: 'guest',
    tastedAt: '2026-06-28T21:00:00Z',
    stars: 5,
    nose: { aromas: ['apple', 'honey', 'quince'] },
    palate: { body: 'full', flavors: ['apricot', 'honey'], finish: 'very-long' },
    freeText: 'Extraordinary. Honeyed, mineral, infinite length.',
  },
];

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
  /** Match score 0–100 for a candidate wine against the current palate. */
  matchFor: (wine: MockWine) => number;
  /** Lookup wine metadata for a note's vintage. */
  wineForNote: (note: TastingNote) => MockWine | undefined;
}

const PalateContext = createContext<PalateContextValue | null>(null);

export function PalateProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<TastingNote[]>(SEED_NOTES);
  const [loaded, setLoaded] = useState(false);

  // Load persisted notes on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as TastingNote[];
          if (Array.isArray(parsed)) setNotes(parsed);
        }
      } catch {
        // ignore — fall back to seed
      }
      setLoaded(true);
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
