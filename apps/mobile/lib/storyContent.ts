/**
 * Decanta Stories — editorial wine narratives.
 *
 * The content moat: winemaker profiles, farm heritage, transformation stories,
 * and "This Day in Wine History." No competitor does this. SOURCES.md §4 and
 * INGESTION_PLAYBOOK.md §B1 define the editorial direction; this is the seed.
 *
 * Story blocks reuse the LessonBlock type from learnContent.ts so the reader
 * (StoryScreen) shares the renderer with LessonScreen. Stories add:
 *   - A category (winemaker | heritage | transformation | history)
 *   - A read-time estimate
 *   - An optional estateId link (tap → estate detail)
 *   - A pull-quote block type (the one new block)
 */

import type { LessonBlock } from './learnContent.js';

export type StoryCategory = 'winemaker' | 'heritage' | 'transformation' | 'history';

// Stories reuse the same content blocks as lessons (heading/paragraph/callout/tip/aroma).
export type StoryBlock = LessonBlock;

export interface Story {
  id: string;
  title: string;
  dek: string; // subtitle / standfirst
  category: StoryCategory;
  author: string;
  readMin: number;
  coverUrl: string;
  /** Optional estate this story is about — enables "VISIT ESTATE →" link. */
  estateId?: string;
  content: StoryBlock[];
}

// ── Winemaker profiles ──────────────────────────────────────────────────────

const SADIE_STORY: Story = {
  id: 'story-sadie-philosophy',
  title: 'The Sadie Philosophy',
  dek: 'How a sommelier became the loudest voice in the Swartland revolution.',
  category: 'winemaker',
  author: 'Decanta Editorial',
  readMin: 8,
  coverUrl: 'https://images.unsplash.com/photo-1554230561-31bdc707b537?w=800&q=80',
  estateId: 'e3',
  content: [
    { type: 'paragraph', text: 'Eben Sadie does not look like a revolutionary. He is quiet, deliberate, and speaks about soil the way other winemakers speak about scores. But in the late 1990s, when South African wine was still defined by cooperative volume and Stellenbosch orthodoxy, Sadie looked past all of it — to the parched, un-irrigated bush vines of the Swartland and the Paardeberg.' },
    { type: 'heading', text: 'From sommelier to vineyard' },
    { type: 'paragraph', text: 'Sadie started as a sommelier — pouring other people\'s wine, learning the vocabulary of the great regions. That background shows in everything he makes. He doesn\'t talk about "terroir" as a marketing word; he talks about specific parcels of 60-year-old dryland Chenin, each one fermented separately, each one a different argument about what this soil can do.' },
    { type: 'callout', label: 'COLUMELLA', text: 'His 2000 vintage Columella — a Rhône-style blend from old Swartland bush vines — was the first South African wine seriously compared to the great reds of the northern Rhône. It changed the international perception of what SA wine could be.' },
    { type: 'heading', text: 'Old vines, new religion' },
    { type: 'paragraph', text: 'The Skurfberg Chenin Blanc comes from a vineyard planted in 1962 on the Citrusdal Mountain, 70km from the nearest paved road. The vines are unirrigated, untrellised, farmed by hand. Sadie argues — and critics agree — that these old dryland vines produce fruit of a concentration and minerality that no young irrigated vineyard can match.' },
    { type: 'paragraph', text: 'He was instrumental in founding the Old Vine Project (OVP), the South African initiative to identify, protect, and certify vines older than 35 years. The "Certified Heritage" seal on a bottle of old-vine SA wine exists partly because of Sadie\'s advocacy.' },
    { type: 'tip', text: 'Try the Skurfberg Chenin Blanc and the Columella side by side — they are two different arguments for the same philosophy: that South Africa\'s greatest resource is its old vines.' },
    { type: 'heading', text: 'Regenerative, not just organic' },
    { type: 'paragraph', text: 'In 2021, Sadie Family Wines became South Africa\'s first Regenerative Organic Certified (ROC) vineyard — a global standard that goes beyond organic to require verified soil health, animal welfare, and fair labour practices. For Sadie, this is not marketing; it is the logical extension of a farming philosophy that starts with the soil microbiome.' },
  ],
};

const MULLINEUX_STORY: Story = {
  id: 'story-mullineux-partnership',
  title: 'The Mullineux Partnership',
  dek: 'A Californian, a South African, and the old vines that brought them together.',
  category: 'winemaker',
  author: 'Decanta Editorial',
  readMin: 6,
  coverUrl: 'https://images.unsplash.com/photo-1567072629554-20e689de2400?w=800&q=80',
  estateId: 'e8',
  content: [
    { type: 'paragraph', text: 'Andrea Mullineux grew up in California, studied winemaking, and came to South Africa for a harvest. She stayed. She met Chris Mullineux, a South African winemaker working in the Swartland, and together they became central figures in the same revolution Eben Sadie sparked.' },
    { type: 'heading', text: 'Parcel by parcel' },
    { type: 'paragraph', text: 'The Mullineux approach is meticulous: they source from a handful of old dryland bush-vine growers across the Swartland, vinify each parcel separately, and blend only at the end. The result is a Syrah that tastes like the place — pepper, meat, violet, granite — not like a recipe.' },
    { type: 'callout', label: 'STRAW WINE', text: 'Their Straw Wine — Chenin Blanc grapes air-dried on straw mats for two weeks before pressing — is a modern South African classic. Honeyed, concentrated, endlessly complex. It revived an ancient technique.' },
    { type: 'paragraph', text: 'The Mullineux & Leeu Family portfolio now includes the Leeu Passant label, made from Stellenbosch and Franschhoek fruit. But the heart remains the Swartland: old vines, minimal intervention, and an insistence that great wine is made in the vineyard, not the cellar.' },
    { type: 'tip', text: 'The Mullineux Syrah is one of SA\'s most awarded reds. Tastings are by appointment at Leeu Estate — book ahead.' },
  ],
};

// ── Heritage stories ────────────────────────────────────────────────────────

const VIN_DE_CONSTANCE_STORY: Story = {
  id: 'story-vin-de-constance',
  title: 'Napoleon\'s Deathbed Wine',
  dek: 'How a lost 18th-century legend was reborn on a Constantia hillside.',
  category: 'heritage',
  author: 'Decanta Editorial',
  readMin: 7,
  coverUrl: 'https://images.unsplash.com/photo-1554230561-31bdc707b537?w=800&q=80',
  estateId: 'e2',
  content: [
    { type: 'paragraph', text: 'On 5 May 1821, on the remote Atlantic island of St Helena, Napoleon Bonaparte lay dying. His last request, according to his valet, was a glass of Constantia wine — the sweet Muscat wine from the Cape that had been the most celebrated wine in Europe for over a century.' },
    { type: 'heading', text: 'The first great wine of the New World' },
    { type: 'paragraph', text: 'The Constantia estate was established in 1685 by Simon van der Stel, the Governor of the Cape Colony. Its sweet wine — made from Muscat de Frontignan grapes, left on the vine to raisin — became the first Southern Hemisphere wine to achieve international fame. Jane Austen wrote of it in "Sense and Sensibility." Charles Dickens mentioned it in "The Mystery of Edwin Drood." Frederick the Great of Prussia imported it.' },
    { type: 'callout', label: 'THE DECLINE', text: 'In the 1860s, phylloxera — the root louse that devastated European vineyards — reached the Cape. The Constantia estates were ruined. The legendary sweet wine vanished. For over a century, it existed only in literature.' },
    { type: 'heading', text: 'The rebirth' },
    { type: 'paragraph', text: 'In the 1980s, the Klein Constantia estate — which occupies the original 1685 land — began a painstaking project to recreate Vin de Constance. They traced the original Muscat varieties, studied historical records, and replanted the steep, sea-facing slopes that had made the wine famous.' },
    { type: 'paragraph', text: 'The result, first released in 1986, is one of the great revival stories of world wine. Vin de Constance is now served at state banquets, collected by connoisseurs, and — as one journalist noted — "still fit for an emperor." Napoleon would approve.' },
    { type: 'tip', text: 'Vin de Constance is a dessert wine — serve it chilled (8–10°C) with malva pudding, or simply on its own as a meditation.' },
  ],
};

const KANONKOP_STORY: Story = {
  id: 'story-kanonkop-pinotage',
  title: 'The Cannon Hill that Made Pinotage Noble',
  dek: 'Four generations of the Sauer family turned a controversial cross into SA\'s most collectible red.',
  category: 'heritage',
  author: 'Decanta Editorial',
  readMin: 6,
  coverUrl: 'https://images.unsplash.com/photo-1554230561-31bdc707b537?w=800&q=80',
  estateId: 'e1',
  content: [
    { type: 'paragraph', text: 'Kanonkop means "cannon hill." The name comes from the signal cannon that once warned Cape Town of approaching ships, fired from a knoll above the Simonsberg vineyards. The Sauer family has farmed this land for four generations — and their stubborn belief in Pinotage changed South African wine.' },
    { type: 'heading', text: 'The grape nobody respected' },
    { type: 'paragraph', text: 'Pinotage — the South African cross of Pinot Noir and Cinsaut — was, for decades, a problem child. Planted widely for bulk wine, it was prone to odd flavours (paint thinner, burnt rubber) and dismissed by serious critics. Most estates treated it as a commodity.' },
    { type: 'paragraph', text: 'Kanonkop did the opposite. They planted Pinotage on their best sites, aged it in French oak, and vinified it with the same seriousness as a First Growth Bordeaux. The result — the Kanonkop Pinotage and the Paul Sauer Bordeaux blend — proved that Pinotage could be noble, age-worthy, and distinctly South African.' },
    { type: 'callout', label: 'ABRIE BEESLAAR', text: 'The current winemaker, Abrie Beeslaar, has won the International Winemaker of the Year award at the IWSC in London — multiple times. Under his stewardship, Kanonkop Pinotage is considered the benchmark for the variety.' },
    { type: 'paragraph', text: 'Tastings are by appointment, and the cellar still feels like a family farm rather than a tourist attraction. If you want to understand what Pinotage can be at its best, this is where you start.' },
  ],
};

// ── Transformation story ────────────────────────────────────────────────────

const SEVEN_SISTERS_STORY: Story = {
  id: 'story-seven-sisters',
  title: 'Seven Sisters, One Vineyard',
  dek: 'The Vivian Kleynhans story — from farmworker\'s daughter to wine brand owner.',
  category: 'transformation',
  author: 'Decanta Editorial',
  readMin: 9,
  coverUrl: 'https://images.unsplash.com/photo-1585803085621-7eea6581caec?w=800&q=80',
  content: [
    { type: 'paragraph', text: 'Vivian Kleynhans grew up on a wine farm in the Breedekloof, the seventh of eight children. Her father was a farmworker. In apartheid South Africa, the idea that a Black woman could own a wine brand — let alone one named after her family — was, as she puts it, "not even a dream, because we didn\'t know it was possible."' },
    { type: 'heading', text: 'The Seven Sisters' },
    { type: 'paragraph', text: 'In 2004, Vivian and her six sisters (the eighth sibling, a brother, gave the brand its complete name: Seven Sisters) founded their wine company. They didn\'t own a vineyard yet — they sourced grapes and made wine at a custom-crush facility. But the brand, with each wine named for a sister, was the first in South Africa to be wholly Black-woman-owned.' },
    { type: 'callout', label: 'WHY IT MATTERS', text: 'In an industry where land ownership remains deeply skewed by apartheid\'s legacy, Seven Sisters is more than a brand. It is a statement: that the people who have always worked the Cape\'s vineyards can also own them.' },
    { type: 'heading', text: 'From sourcing to soil' },
    { type: 'paragraph', text: 'For years, the sisters sourced their grapes. In 2019, they acquired their own vineyard land in the Stellenbosch region — a milestone Vivian describes as the hardest-won moment of her career. "When you own the land," she says, "you own the story from soil to bottle. That is what changes everything."' },
    { type: 'paragraph', text: 'Seven Sisters wines are now exported to the United States, the UK, and Germany. The brand has been featured at the London Wine Fair and profiled by the BBC. But for Vivian, the measure of success is simpler: "When a young Black woman walks into a tasting room and sees herself in the winemaker, that is the revolution."' },
    { type: 'tip', text: 'Seven Sisters wines are available at major SA retailers. Each bottle carries a sister\'s name — try Yolanda (the Pinotage) or Twena (the Chenin Blanc).' },
  ],
};

// ── This Day in Wine History ────────────────────────────────────────────────

const VAN_RIEBEECK_STORY: Story = {
  id: 'story-van-riebcek-1659',
  title: '2 February 1659 — "Today, praise be to God"',
  dek: 'The diary entry that marks the birth of South African wine.',
  category: 'history',
  author: 'Decanta Editorial',
  readMin: 4,
  coverUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
  estateId: 'e2',
  content: [
    { type: 'paragraph', text: 'On 2 February 1659, Jan van Riebeeck — the first Commander of the Dutch Cape Colony — wrote a single sentence in his diary that would echo through 367 years of South African wine history:' },
    { type: 'callout', label: 'THE DIARY ENTRY', text: '"Today, praise be to God, wine was pressed from Cape grapes for the first time — 2 February 1659."' },
    { type: 'paragraph', text: 'Van Riebeeck had planted vines in 1655, just three years after establishing the refreshment station at the Cape of Good Hope for the Dutch East India Company. The grapes were a mix of French Muscat and other varieties, planted in the Company Gardens (now in central Cape Town). The 1659 pressing produced a tiny quantity — but it was the first wine made in the Southern Hemisphere from European vines.' },
    { type: 'heading', text: 'Why it matters' },
    { type: 'paragraph', text: 'South Africa is the only major wine country that can pinpoint the exact day wine was first made. 2 February 1659 is the Cape\'s "birthday" as a wine region — older than the first plantings in Australia (1788), New Zealand (1819), or Chile (1554 by some counts, but less precisely documented).' },
    { type: 'paragraph', text: 'Every year, the industry commemorates the date. The Wine Harvest Commemorative Event, held at Groot Constantia (the farm established by Van der Stel on Van Riebeeck\'s original land), brings together winemakers, farmworkers, and dignitaries to mark the occasion.' },
    { type: 'tip', text: 'Groot Constantia — the estate on Van Riebeeck\'s original 1685 land — is open to the public and is the oldest wine farm in the Southern Hemisphere still in production.' },
  ],
};

// ── Export ──────────────────────────────────────────────────────────────────

export const ALL_STORIES: Story[] = [
  SADIE_STORY,
  SEVEN_SISTERS_STORY,
  VIN_DE_CONSTANCE_STORY,
  MULLINEUX_STORY,
  KANONKOP_STORY,
  VAN_RIEBEECK_STORY,
];

export const CATEGORY_LABELS: Record<StoryCategory, string> = {
  winemaker: 'WINEMAKER',
  heritage: 'HERITAGE',
  transformation: 'TRANSFORMATION',
  history: 'THIS DAY IN HISTORY',
};

export const CATEGORY_ORDER: StoryCategory[] = ['winemaker', 'transformation', 'heritage', 'history'];
