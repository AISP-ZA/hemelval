-- 0005_auto_profile_and_learn.sql
-- Decanta — auto-create profiles on signup + Learn module tables.
--
-- Two concerns:
--  1. Persistence fix: handle_new_user trigger so every new auth.user gets a
--     profiles row (the app never inserted one, so profiles was orphaned).
--  2. Learn module: lessons + lesson_progress tables for the education pillar.

-- ── 1. Auto-create profile on signup ────────────────────────────────────────

CREATE OR REPLACE FUNCTION decanta_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, preferences)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    '{}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION decanta_handle_new_user();

-- ── 2. Learn module ─────────────────────────────────────────────────────────
-- Structured wine education: lessons (editorial content) + progress tracking.

CREATE TABLE IF NOT EXISTS lessons (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text NOT NULL,
  -- 'foundation' = the core tasting journey; 'varietal' = varietal school;
  -- 'technique' = advanced skills (decanting, blind tasting).
  track text NOT NULL CHECK (track IN ('foundation', 'varietal', 'technique')),
  -- Ordered position within a track (1-based).
  position int NOT NULL DEFAULT 0,
  duration_min int NOT NULL DEFAULT 5,
  -- Hero cover image URL.
  cover_url text,
  -- Structured content blocks (rendered client-side).
  -- Each block: { type: 'paragraph'|'heading'|'callout'|'aroma'|'tip'|'quiz', ... }
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Optional varietal slug this lesson teaches (for varietal school linkage).
  varietal_slug text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_track_position ON lessons(track, position) WHERE is_published;

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id text REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  -- 'started' | 'completed'
  status text NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress owner all" ON lesson_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 3. Seed foundation lessons (the 6-step tasting journey) ─────────────────

INSERT INTO lessons (id, title, subtitle, track, position, duration_min, cover_url, content) VALUES
(
  'foundation-01',
  'How to Taste Like a Pro',
  'The WSET 4-step method: see, swirl, sniff, sip.',
  'foundation', 1, 8,
  'https://images.unsplash.com/photo-1585803085621-7eea6581caec?w=800&q=80',
  jsonb_build_array(
    jsonb_build_object('type','heading','text','Why taste systematically?'),
    jsonb_build_object('type','paragraph','text','Anyone can drink wine. Tasting is different — it''s a structured way to pay attention, so you can remember what you liked and describe it to a sommelier or a friend. The WSET Level 1 method has four steps. Master them and every bottle becomes a lesson.'),
    jsonb_build_object('type','callout','label','THE 4 STEPS','text','1. SEE — clarity, intensity, colour
2. SWIRL — open the aromas
3. SNIFF — identify what you smell
4. SIP — assess palate structure'),
    jsonb_build_object('type','heading','text','Step 1 — See'),
    jsonb_build_object('type','paragraph','text','Tilt the glass against a white surface. Look for three things: clarity (clear or hazy?), intensity (pale or opaque?), and colour. A young Syrah is deep purple with a pink rim; an aged one fades to brick at the edge. Colour tells you age and grape family.'),
    jsonb_build_object('type','tip','text','Hold the glass by the stem, not the bowl. Your hand warms the wine and leaves smudges that distort the colour.'),
    jsonb_build_object('type','heading','text','Step 2 — Swirl'),
    jsonb_build_object('type','paragraph','text','Swirling coats the glass and releases volatile aroma compounds. Practice with water first. The "legs" that run down the glass indicate alcohol and sweetness — thick slow legs often mean higher alcohol or residual sugar, but they don''t tell you about quality.'),
    jsonb_build_object('type','heading','text','Step 3 — Sniff'),
    jsonb_build_object('type','paragraph','text','This is where most of the flavour actually lives — your tongue only detects sweet, sour, bitter, salty, umami. Everything else is aroma. Put your nose fully in the glass and take a steady inhale. In the next lesson you''ll learn the Noble Aroma Wheel to name what you smell.'),
    jsonb_build_object('type','heading','text','Step 4 — Sip'),
    jsonb_build_object('type','paragraph','text','Take a small sip and let it spread across your tongue. Assess the structure: body (light to full), acidity (how much your mouth waters), tannin (that drying feeling — reds only), alcohol (warmth in the throat), and finish (how long the flavour lingers).'),
    jsonb_build_object('type','callout','label','REMEMBER','text','Structure is objective. Whether you like it is personal. Both matter — note both.')
  )
) ON CONFLICT (id) DO NOTHING,

(
  'foundation-02',
  'The Noble Aroma Wheel',
  'Name what you smell — 11 noble aromas every taster should know.',
  'foundation', 2, 10,
  'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&q=80',
  jsonb_build_array(
    jsonb_build_object('type','heading','text','The vocabulary problem'),
    jsonb_build_object('type','paragraph','text','"It smells like… wine" is where most people stop. The Noble Aroma Wheel fixes this by giving you a controlled vocabulary — a shared language so your "black cherry" is my "black cherry". Decanta uses the WSET SAT vocabulary with the Noble Aroma Wheel layered on top.'),
    jsonb_build_object('type','heading','text','The 11 noble aromas'),
    jsonb_build_object('type','aroma','label','Floral','items',jsonb_build_array('rose','violet','blossom','honeysuckle')),
    jsonb_build_object('type','aroma','label','Citrus','items',jsonb_build_array('lemon','grapefruit','orange-zest','lime')),
    jsonb_build_object('type','aroma','label','Tree Fruit','items',jsonb_build_array('apple','pear','peach','apricot')),
    jsonb_build_object('type','aroma','label','Tropical','items',jsonb_build_array('pineapple','mango','passionfruit','lychee')),
    jsonb_build_object('type','aroma','label','Red Berry','items',jsonb_build_array('strawberry','raspberry','cherry-red','red-currant')),
    jsonb_build_object('type','aroma','label','Black Fruit','items',jsonb_build_array('blackberry','black-cherry','black-currant','plum')),
    jsonb_build_object('type','aroma','label','Stone/Jammy','items',jsonb_build_array('prune','fig','fruitcake','jam')),
    jsonb_build_object('type','aroma','label','Spice','items',jsonb_build_array('black-pepper','cinnamon','clove','ginger','liquorice')),
    jsonb_build_object('type','aroma','label','Earth','items',jsonb_build_array('forest-floor','mushroom','earth','leather','tobacco')),
    jsonb_build_object('type','aroma','label','Oak','items',jsonb_build_array('vanilla','toast','smoke','coconut','cedar')),
    jsonb_build_object('type','aroma','label','Sweet/Bottle Age','items',jsonb_build_array('honey','caramel','butterscotch','wax','nuts')),
    jsonb_build_object('type','tip','text','You don''t need all 11. Pick the one or two that jump out. Over time your nose learns to separate them.'),
    jsonb_build_object('type','paragraph','text','When you log a tasting in Decanta, these are the exact descriptors you can choose from — the app builds your palate profile from what you repeatedly enjoy.')
  )
) ON CONFLICT (id) DO NOTHING,

(
  'foundation-03',
  'Reading a South African Label',
  'WO appellations, vintage, and what "single vineyard" really means.',
  'foundation', 3, 7,
  'https://images.unsplash.com/photo-1554230561-31bdc707b537?w=800&q=80',
  jsonb_build_array(
    jsonb_build_object('type','heading','text','The Wine of Origin (WO) system'),
    jsonb_build_object('type','paragraph','text','South Africa has a controlled appellation system — the Wine of Origin scheme, administered by the Wine and Spirit Board since 1973. When a bottle says "WO Stellenbosch", 100% of the grapes came from that region. This is stricter than many Old World systems.'),
    jsonb_build_object('type','callout','label','THE 4 TIERS','text','Region (e.g. Western Cape)
District (e.g. Stellenbosch)
Ward (e.g. Simonsberg-Stellenbosch)
Single Vineyard (named block)'),
    jsonb_build_object('type','heading','text','Vintage matters in the Cape'),
    jsonb_build_object('type','paragraph','text','Unlike much of Europe, the Western Cape has vintage variation driven by wind, drought, and heatwaves. A 2018 (cool, slow ripening) and a 2017 (hot, early harvest) Cabernet from the same estate can taste quite different. Decanta shows vintage on every wine for this reason.'),
    jsonb_build_object('type','heading','text','Terms that sell — and what they mean'),
    jsonb_build_object('type','paragraph','text','• Old Vines (member of the Old Vine Project, 35+ years) — concentrated, lower yields
• Single Vineyard — all grapes from one named block; maximum terroir expression
• Estate Wine — grown, made, and bottled on the same farm
• Reserve — no legal definition in SA; means what the winemaker decides it means'),
    jsonb_build_object('type','tip','text','"Reserve" is a marketing word in SA, not a quality guarantee. "Old Vine", "Single Vineyard", and "Estate" have legal teeth.')
  )
) ON CONFLICT (id) DO NOTHING,

(
  'foundation-04',
  'Red vs White vs MCC — Body, Tannin, Acid',
  'The structural building blocks that define every wine.',
  'foundation', 4, 8,
  'https://images.unsplash.com/photo-1567072629554-20e689de2400?w=800&q=80',
  jsonb_build_array(
    jsonb_build_object('type','heading','text','The three axes of structure'),
    jsonb_build_object('type','paragraph','text','Once you can see, smell, and sip, the next skill is assessing structure — the architecture of a wine. Three axes do most of the work: body, tannin, and acidity. Balance between them is what separates great wine from ordinary.'),
    jsonb_build_object('type','callout','label','BODY','text','Light: Pinot Noir, Sauvignon Blanc
Medium: Cinsaut, Chenin Blanc
Full: Cabernet Sauvignon, wooded Chardonnay'),
    jsonb_build_object('type','paragraph','text','Think of body like milk: skim (light) through full-cream (full). It''s the weight and viscosity of the wine in your mouth, driven mainly by alcohol and extract.'),
    jsonb_build_object('type','callout','label','TANNIN','text','Only in reds (and some orange/aged whites).
That drying feeling — like over-steeped tea.
High: Cabernet, Nebbiolo, Tannat
Low: Pinot Noir, Merlot, Cinsaut'),
    jsonb_build_object('type','paragraph','text','Tannin comes from grape skins, seeds, and oak. It''s a preservative — high-tannin wines age longer. Tannin feels different from acidity: tannin dries, acidity makes you salivate.'),
    jsonb_build_object('type','callout','label','ACIDITY','text','Whites and cool-climate reds shine here.
Crunchy Granny Smith = high acid.
Flabby canned peach = low acid.
SA Sauvignon Blanc and Elgin Pinot are naturally high-acid.'),
    jsonb_build_object('type','tip','text','A wine that feels "too sour" is high acid. "Too bitter/drying" is high tannin. "Too heavy" is full body. Naming the problem tells you what you like.')
  )
) ON CONFLICT (id) DO NOTHING,

(
  'foundation-05',
  'Food Pairing First Principles',
  'Why Chenin loves bobotie and Syrah belongs on the braai.',
  'foundation', 5, 8,
  'https://images.unsplash.com/photo-1554230561-31bdc707b537?w=800&q=80',
  jsonb_build_array(
    jsonb_build_object('type','heading','text','Match weight to weight'),
    jsonb_build_object('type','paragraph','text','The foundational rule: light food with light wine, rich food with full wine. A delicate line-caught kingklip will be obliterated by a wooded Cabernet. Pair it with a crisp Sauvignon Blanc instead.'),
    jsonb_build_object('type','callout','label','THE SA CLASSIC PAIRS','text','• Braai lamb → Syrah / Pinotage
• Bobotie → Chenin Blanc
• Sushi → MCC / Cap Classique
• Malva pudding → Vin de Constance
• Oysters → Sauvignon Blanc / MCC
• Biltong → Pinotage'),
    jsonb_build_object('type','heading','text','Three advanced moves'),
    jsonb_build_object('type','paragraph','text','1. CONTRAST — salty food with sweet wine (biltong with a late-harvest Riesling). The salt makes the wine taste fruitier.
2. BRIDGE — match a flavour in the wine to a flavour in the dish (peppery Syrah with black-pepper-crusted steak).
3. CUT — use acidity to cleanse richness ( Sauvignon Blanc cuts through creamy Cape Malay curry).'),
    jsonb_build_object('type','paragraph','text','Decanta''s pairing engine encodes these principles — when you search "braai lamb", it returns Syrah and Pinotage first because the varietal''s aromatic profile bridges to the smoke and pepper of the braai.'),
    jsonb_build_object('type','tip','text','In doubt? Reach for MCC (Cap Classique). Bubbles and acidity make it the most food-friendly wine in the world — it pairs with almost everything on a SA table.')
  )
) ON CONFLICT (id) DO NOTHING,

(
  'foundation-06',
  'Your Palate, Decoded',
  'How Decanta turns your tasting notes into a personal match score.',
  'foundation', 6, 6,
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
  jsonb_build_array(
    jsonb_build_object('type','heading','text','You''re already building a palate profile'),
    jsonb_build_object('type','paragraph','text','Every tasting note you log — the aromas you pick, the body you prefer, the stars you give — feeds Decanta''s engine. After five notes, your match scores stop being a cold-start guess and start reflecting what you actually enjoy.'),
    jsonb_build_object('type','callout','label','HOW THE ENGINE WORKS','text','It weighs four signals:
• Varietals you rate highly (35%)
• Wine types you favour (25%)
• Aroma descriptors you reach for (25%)
• Body & sweetness preferences (15%)'),
    jsonb_build_object('type','paragraph','text','The result is a 0–100 "Match for you" badge on every wine. A wine at 70%+ is a strong bet; below 40% the engine thinks you''ll find it unusual. Neither is a verdict — exploration is the point.'),
    jsonb_build_object('type','heading','text','Refine over time'),
    jsonb_build_object('type','paragraph','text','Your palate changes. The wine you loved at 22 might bore you at 40. Decanta''s engine weights recent notes more heavily than old ones, so as your taste evolves, so do your matches. Keep logging tastings — even the ones you didn''t love. A 2-star note teaches the engine as much as a 5-star one.'),
    jsonb_build_object('type','tip','text','Tap any match badge to see why. The engine is transparent — it shows you which of your past notes drove the score.')
  )
) ON CONFLICT (id) DO NOTHING;

-- ── 4. Seed varietal school lessons (signature SA grapes) ──────────────────

INSERT INTO lessons (id, title, subtitle, track, position, duration_min, varietal_slug, cover_url, content) VALUES
(
  'varietal-pinotage',
  'Pinotage — South Africa''s Own',
  'Love it or hate it, no grape divides a room like this.',
  'varietal', 1, 7,
  'pinotage',
  'https://images.unsplash.com/photo-1554230561-31bdc707b537?w=800&q=80',
  jsonb_build_array(
    jsonb_build_object('type','heading','text','Born in Stellenbosch, 1925'),
    jsonb_build_object('type','paragraph','text','Pinotage is a South African cross of Pinot Noir and Cinsaut (then called "Hermitage"). Professor Abraham Perold created it at Stellenbosch University. No other wine country grows it in commercial volume — it is unambiguously ours.'),
    jsonb_build_object('type','callout','label','TYPICAL AROMAS','text','Red & black berry, banana (divisive!), smoke, earth, sometimes coffee. The "Diemersfontein Coffee Pinotage" leans hard into roasted notes.'),
    jsonb_build_object('type','paragraph','text','Quality ranges enormously. Cheap Pinotage can taste of acetone or burnt rubber. But great Pinotage — Kanonkop, Simonsig, Diemersfontein Carpe Diem — is textured, smoky, and distinctly South African. Try a few before you decide.'),
    jsonb_build_object('type','tip','text','Pair Pinotage with biltong, bobotie, or anything off the braai. Its smoky edge loves fire.')
  )
) ON CONFLICT (id) DO NOTHING,

(
  'varietal-chenin-blanc',
  'Chenin Blanc — The Cape''s White Workhorse',
  'The most planted white grape in SA. Crisp, versatile, age-worthy.',
  'varietal', 2, 6,
  'chenin-blanc',
  'https://images.unsplash.com/photo-1567072629554-20e689de2400?w=800&q=80',
  jsonb_build_array(
    jsonb_build_object('type','heading','text','Old vines, new world'),
    jsonb_build_object('type','paragraph','text','Chenin Blanc originates in the Loire Valley (Vouvray, Savennières), but South Africa has more of it than anywhere on earth — and some of the oldest Chenin vines in the world, planted in the 1950s and ''60s. Old-vine Chenin makes wines of extraordinary concentration and minerality.'),
    jsonb_build_object('type','callout','label','STYLES','text','Fresh & fruity (unwooded): apple, guava, melon
Serious & wooded: baked apple, honey, beeswax
Noble rot / late harvest: marmalade, ginger (Vin de Constance style)'),
    jsonb_build_object('type','paragraph','text','Chenin''s high acidity makes it food-friendly. It''s the default white for Cape Malay cuisine — bobotie specifically. It also ages: a good wooded Chenin evolves for 10+ years.'),
    jsonb_build_object('type','tip','text','Look for "Old Vines" on the label. Sadie Family Skurfberg and Ken Forrester The FMC are benchmarks.')
  )
) ON CONFLICT (id) DO NOTHING,

(
  'varietal-mcc',
  'MCC — Méthode Cap Classique',
  'South Africa''s answer to Champagne. Same method, Cape grapes.',
  'varietal', 3, 6,
  'mcc',
  'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&q=80',
  jsonb_build_array(
    jsonb_build_object('type','heading','text','Method, not region'),
    jsonb_build_object('type','paragraph','text','Champagne can only come from Champagne. But the traditional method — second fermentation in the bottle — is used worldwide. South Africa calls its traditional-method sparkling "Méthode Cap Classique" (MCC). By law it must spend at least 12 months on the lees.'),
    jsonb_build_object('type','callout','label','WHAT TO EXPECT','text','Citrus, brioche, almond, fine bubbles.
Graham Beck, Simonsig Kaapse Vonkel, and Cap Classique producers like Villiera are benchmarks.'),
    jsonb_build_object('type','paragraph','text','MCC is usually a fraction of Champagne''s price for comparable quality. The Western Cape''s cool sites (Robertson, Elgin) give the grapes the acidity traditional method needs.'),
    jsonb_build_object('type','tip','text','MCC is the most food-friendly sparkling in the world. Try it with sushi, oysters, or Cape Malay — not just for celebrations.')
  )
) ON CONFLICT (id) DO NOTHING;

-- ── 5. updated_at trigger for lessons ───────────────────────────────────────

CREATE OR REPLACE FUNCTION decanta_lessons_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lessons_set_updated_at ON lessons;
CREATE TRIGGER lessons_set_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION decanta_lessons_set_updated_at();
