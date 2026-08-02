/**
 * @kelder/shared — shared TypeScript types used by mobile + admin + engine.
 */

import type { WineType } from '@kelder/engine';

export interface WoAppellation {
  id: string;
  name: string;
  level: 'unit' | 'region' | 'district' | 'ward';
  parentId?: string;
  slug: string;
  terroirNote?: string;
}

export interface Varietal {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  type: WineType;
  isSignature: boolean;
  character?: string;
  typicalAromas: string[];
}

export interface Certification {
  id: string;
  code: string;
  name: string;
  description?: string;
  isExportRelevant: boolean;
}

export interface Estate {
  id: string;
  slug: string;
  name: string;
  woAppellationId?: string;
  appellationName?: string; // joined
  wineRoute?: string;
  foundedYear?: number;
  about?: string;
  famousFor?: string;
  latitude?: number;
  longitude?: number;
  websiteUrl?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  isVerified: boolean;
  subscriptionTier?: 'free' | 'small' | 'mid' | 'large';
  certifications?: Certification[]; // joined
}

export interface Wine {
  id: string;
  estateId: string;
  estateName?: string; // joined
  slug: string;
  name: string;
  type: WineType;
  blendType?: string;
  woAppellationId?: string;
  appellationName?: string; // joined
  avgStars: number;
  ratingCount: number;
  barcode?: string;
  imageUrl?: string;
  about?: string;
  varietalSlugs?: string[]; // joined
}

export interface Vintage {
  id: string;
  wineId: string;
  year: number;
  abv?: number;
  residualSugar?: number;
  ph?: number;
  drinkWindowStart?: number;
  drinkWindowEnd?: number;
  harvestNote?: string;
  labelImageUrl?: string;
}

export interface AwardBody { id: string; code: string; name: string; scale: string; }
export interface Award {
  id: string;
  vintageId: string;
  awardBody: AwardBody;
  year: number;
  result: string;
}

export interface WineEvent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  recurringMonth?: number;
  venueName?: string;
  appellationId?: string;
  latitude?: number;
  longitude?: number;
  ticketUrl?: string;
  ticketingPlatform?: string;
  priceMinZar?: number;
  priceMaxZar?: number;
  format?: string;
  is18Plus: boolean;
  coverImageUrl?: string;
  websiteUrl?: string;
}

export interface VintageReport {
  year: number;
  qualityNote?: string;
  weatherSummary?: string;
  harvestTonnes?: number;
  isRecommended: boolean;
}

export interface Profile {
  id: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  isPro: boolean;
  proSince?: string;
}
