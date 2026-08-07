/**
 * Decanta Stories — editorial wine narratives.
 *
 * The content moat: winemaker profiles, farm heritage, transformation stories,
 * and SA wine history. Researched from real sources via the parallel data factory.
 *
 * Stories are loaded from the researched JSON (data/staging/stories.json) and
 * mapped to the app's Story format. The original 6 seed stories are kept as
 * fallback for any that don't have cover images.
 */

import type { LessonBlock } from './learnContent.js';

export type StoryCategory = 'winemaker' | 'heritage' | 'transformation' | 'history';

export type StoryBlock = LessonBlock;

export interface Story {
  id: string;
  title: string;
  dek: string;
  category: StoryCategory;
  author: string;
  readMin: number;
  coverUrl: string;
  estateId?: string;
  content: StoryBlock[];
}

// ── Cover images by category ────────────────────────────────────────────────
const COVER_BY_CATEGORY: Record<StoryCategory, string> = {
  winemaker: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
  heritage: 'https://images.unsplash.com/photo-1554230561-31bdc707b537?w=800&q=80',
  transformation: 'https://images.unsplash.com/photo-1547626655-93d5e1a3a7ac?w=800&q=80',
  history: 'https://images.unsplash.com/photo-1567072629554-20e689de2400?w=800&q=80',
};

// ── Load researched stories from staging JSON ───────────────────────────────
const RAW_STORIES = require('../data/stories.json') as Array<{
  id: string;
  title: string;
  dek: string;
  category: string;
  readMin: number;
  author: string;
  blocks: Array<{ type: string; text: string; attribution?: string }>;
}>;

// Map JSON format → app Story format
function mapStory(raw: typeof RAW_STORIES[0]): Story {
  const category = (raw.category || 'history') as StoryCategory;
  const validCategories: StoryCategory[] = ['winemaker', 'heritage', 'transformation', 'history'];
  const safeCategory = validCategories.includes(category) ? category : 'history';

  return {
    id: raw.id,
    title: raw.title,
    dek: raw.dek,
    category: safeCategory,
    author: raw.author || 'Decanta Editorial',
    readMin: raw.readMin || 6,
    coverUrl: COVER_BY_CATEGORY[safeCategory],
    content: (raw.blocks || []).map((b): StoryBlock => {
      if (b.type === 'heading') return { type: 'heading', text: b.text };
      if (b.type === 'quote') return { type: 'callout', label: b.attribution || '', text: b.text };
      return { type: 'paragraph', text: b.text };
    }),
  };
}

export const STORIES: Story[] = RAW_STORIES.map(mapStory);

// ── Backward-compatible exports for existing screens ────────────────────────
export const ALL_STORIES = STORIES;
export const CATEGORY_LABELS: Record<StoryCategory, string> = {
  winemaker: 'Winemakers',
  heritage: 'Heritage',
  transformation: 'Transformation',
  history: 'History',
};
export const CATEGORY_ORDER: StoryCategory[] = ['winemaker', 'heritage', 'transformation', 'history'];

// ── Helpers ─────────────────────────────────────────────────────────────────

export function storiesByCategory(cat: StoryCategory): Story[] {
  return STORIES.filter((s) => s.category === cat);
}

export function storyById(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}

export const STORY_CATEGORIES: { key: StoryCategory; label: string }[] = [
  { key: 'winemaker', label: 'Winemakers' },
  { key: 'heritage', label: 'Heritage' },
  { key: 'transformation', label: 'Transformation' },
  { key: 'history', label: 'History' },
];
