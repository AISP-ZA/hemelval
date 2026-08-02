-- ─────────────────────────────────────────────────────────────────────────────
-- Decanta MWKB — Seed Data (0002)
-- Reference data: wine routes, WO regions, varietals, certifications, awards
-- Run AFTER migration 0003_mwkb_full_schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══ WINE ROUTES ═══════════════════════════════════════════════════════════
INSERT INTO wine_routes (name, slug, description, website, region) VALUES
  ('Stellenbosch Wine Routes', 'stellenbosch', 'Founded 1971 — the oldest wine route in SA. 200+ wine farms across 5 sub-routes.', 'https://wineroute.co.za/', 'Stellenbosch'),
  ('Franschhoek Wine Valley', 'franschhoek', 'Huguenot heritage valley. ~50 wineries, the Wine Tram, world-class dining.', 'https://franschhoek.org.za/', 'Franschhoek'),
  ('Constantia Wine Route', 'constantia', 'SA''s oldest wine region (1685). 8-10 estates, closest to Cape Town.', 'https://constantiawineroute.com/', 'Constantia'),
  ('Paarl Wine Route', 'paarl', 'The "Red Route" — Pinotage, Shiraz, Cabernet. Paarl Rock, granite soils.', 'https://www.paarlwine.co.za/', 'Paarl'),
  ('Robertson Wine Valley', 'robertson', '"Valley of Wine & Roses." 40+ wineries, Chardonnay & MCC, Breede River.', 'https://robertsonwinevalley.com/', 'Robertson'),
  ('Durbanville Wine Valley', 'durbanville', '12 wineries, cool maritime, Sauvignon Blanc specialist.', 'https://durbanvillewine.co.za/', 'Durbanville'),
  ('Swartland Wine & Olive Route', 'swartland', 'The bush-vine revolution. Syrah, Chenin, Grenache. Artisan producers.', 'https://swartlandwineandolives.co.za/', 'Swartland'),
  ('Elgin Wine Route', 'elgin', 'SA''s coolest region. High-altitude Pinot Noir, Chardonnay, Riesling.', 'https://www.winesofelgin.co.za/', 'Elgin'),
  ('Hemel-en-Aarde', 'hemel-en-aarde', 'Three valleys of premium Pinot Noir & Chardonnay near Hermanus.', 'https://www.hemelenaardewines.com/', 'Walker Bay'),
  ('Walker Bay Wine Route', 'walker-bay', 'Cool-climate wines around Hermanus. Pinot Noir, Chardonnay, Sauvignon Blanc.', '', 'Walker Bay'),
  ('Darling Wine Route', 'darling', 'Cool coastal wines near the West Coast. Sauvignon Blanc, Pinot Noir.', 'https://www.darlingwine.co.za/', 'Darling'),
  ('Tulbagh Wine Route', 'tulbagh', 'Basin surrounded by mountains. MCC, Shiraz, diverse varieties.', '', 'Tulbagh'),
  ('Breedekloof Wine Valley', 'breedekloof', 'Chenin Blanc, Colombard. Outdoor & Wine Festival host.', 'https://www.breedekloof.com/', 'Breedekloof'),
  ('Wellington Wine Route', 'wellington', 'Hot inland valley. Pinotage roots, brandy, raisins. Rootstock nurseries.', '', 'Wellington'),
  ('Bot River Wine Route', 'bot-river', '20+ producers. BOTFEST festival. Cool-climate reds and whites.', '', 'Bot River'),
  ('Cape Agulhas Wine Route', 'cape-agulhas', 'Africa''s southernmost vineyards. Windswept Sauvignon Blanc, Pinot Noir.', 'https://agulhaswinetriangle.co.za/', 'Cape Agulhas'),
  ('Worcester Wine Route', 'worcester', 'Largest wine-producing district by volume. Brandy, value wines.', '', 'Worcester'),
  ('Klein Karoo Wine Route', 'klein-karoo', 'Port-style wines (Calitzdorp), Muscadel, brandy. Route 62.', '', 'Klein Karoo'),
  ('Olifants River Wine Route', 'olifants-river', 'Hot northern valley. Volume + high-altitude old-vine pockets.', '', 'Olifants River'),
  ('Cederberg Wine Route', 'cederberg', 'Highest vineyards in the Cape (1000m+). Single estate ward.', '', 'Cederberg')
ON CONFLICT (slug) DO NOTHING;

-- ═══ WINE REGIONS (WO Appellation Hierarchy) ═══════════════════════════════
-- Geographical Units
INSERT INTO wine_regions (name, slug, level, terroir_note) VALUES
  ('Western Cape', 'western-cape', 'unit', 'Overarching geographical unit covering nearly all famous SA wine regions.'),
  ('Northern Cape', 'northern-cape', 'unit', 'Hot northern valley along the Orange River.'),
  ('Eastern Cape', 'eastern-cape', 'unit', 'Small emerging coastal unit.'),
  ('KwaZulu-Natal', 'kwazulu-natal', 'unit', 'High-altitude interior. Summer rainfall.'),
  ('Free State', 'free-state', 'unit', 'Small interior unit.')
ON CONFLICT (slug) DO NOTHING;

-- Regions (children of Western Cape)
INSERT INTO wine_regions (name, slug, level, parent_id, terroir_note)
  SELECT name, slug, 'region', parent_id, terroir_note FROM (VALUES
    ('Coastal Region', 'coastal-region', 'western-cape', 'The prestige heartland: Stellenbosch, Paarl, Constantia.'),
    ('Breede River Valley', 'breede-river-valley', 'western-cape', 'Inland, warm, irrigated. Robertson limestone, Worcester brandy.'),
    ('Cape South Coast', 'cape-south-coast', 'western-cape', 'Cool maritime frontier. Pinot Noir, Chardonnay, Sauvignon Blanc.'),
    ('Klein Karoo', 'klein-karoo-region', 'western-cape', 'Semi-arid. Fortified wines, Calitzdorp port-style.'),
    ('Olifants River', 'olifants-river-region', 'western-cape', 'Hot northern valley. Volume + old-vine pockets.')
  ) AS v(name, slug, parent_slug, terroir_note)
  JOIN wine_regions wr ON wr.slug = v.parent_slug
ON CONFLICT (slug) DO NOTHING;

-- Districts
INSERT INTO wine_regions (name, slug, level, parent_id, terroir_note)
  SELECT name, slug, 'district', parent_id, terroir_note FROM (VALUES
    ('Stellenbosch', 'stellenbosch', 'coastal-region', 'SA''s leading fine-wine district. Hilly, granite & sandstone.'),
    ('Paarl', 'paarl', 'coastal-region', 'Warm valley. Pinotage, Shiraz, Cabernet. Granite soils.'),
    ('Franschhoek', 'franschhoek', 'coastal-region', 'Bowl valley, Huguenot heritage. Bordeaux blends, Semillon, MCC.'),
    ('Swartland', 'swartland', 'coastal-region', 'Warm, dry. Bush-vine revolution. Syrah, Chenin, Grenache.'),
    ('Wellington', 'wellington', 'coastal-region', 'Hot inland. Pinotage roots, brandy, nurseries.'),
    ('Tulbagh', 'tulbagh', 'coastal-region', 'Basin surrounded by mountains. Diverse.'),
    ('Darling', 'darling', 'coastal-region', 'Cool coastal. Sauvignon Blanc, Pinot Noir.'),
    ('Cape Town', 'cape-town', 'coastal-region', 'Includes Constantia, Durbanville, Philadelphia.'),
    ('Robertson', 'robertson', 'breede-river-valley', 'Limestone-rich. Chardonnay, MCC, Shiraz.'),
    ('Breedekloof', 'breedekloof', 'breede-river-valley', 'Chenin Blanc, Colombard.'),
    ('Worcester', 'worcester', 'breede-river-valley', 'Largest by volume. Brandy, bulk wine.'),
    ('Walker Bay', 'walker-bay', 'cape-south-coast', 'Includes Hemel-en-Aarde. Premier Pinot Noir/Chardonnay.'),
    ('Elgin', 'elgin', 'cape-south-coast', 'Cool highland plateau. Kogelberg Biosphere.'),
    ('Cape Agulhas', 'cape-agulhas', 'cape-south-coast', 'Southernmost vineyards. Windswept, cool.'),
    ('Calitzdorp', 'calitzdorp', 'klein-karoo-region', 'SA''s port capital. Portuguese varieties.'),
    ('Citrusdal Mountain', 'citrusdal-mountain', 'olifants-river-region', 'Old-vine Chenin source (Skurfberg, Piekenierskloof).')
  ) AS v(name, slug, parent_slug, terroir_note)
  JOIN wine_regions wr ON wr.slug = v.parent_slug
ON CONFLICT (slug) DO NOTHING;

-- ═══ VARIETALS (comprehensive — all planted in SA) ═════════════════════════
INSERT INTO varietals (slug, name, aliases, type, color, origin, is_signature, character, typical_aromas) VALUES
  -- Signature SA
  ('chenin-blanc', 'Chenin Blanc', '{Steen}', 'white', 'white', 'France (Loire)', true, 'SA''s most planted. High acid, versatile: fresh to old-vine serious.', '{apple,quince,honey,lemon,apricot}'),
  ('pinotage', 'Pinotage', '{}', 'red', 'red', 'South Africa', true, 'SA''s own crossing (Pinot Noir x Cinsaut, 1925).', '{cherry-red,cherry-black,leather,tobacco,chocolate-dark}'),
  ('mcc', 'MCC (Méthode Cap Classique)', '{}', 'sparkling', 'white', 'South Africa', true, 'SA traditional-method sparkling. Bottle-fermented, lees-aged.', '{brioche,lemon,apple,almond,biscuit}'),
  -- Major reds
  ('cabernet-sauvignon', 'Cabernet Sauvignon', '{}', 'red', 'red', 'France', true, 'World''s most planted noble red. Thrives on Simonsberg.', '{cassis,cedar,blackberry,eucalyptus,mint}'),
  ('shiraz', 'Shiraz / Syrah', '{Syrah}', 'red', 'red', 'France (Rhône)', true, 'Swartland bush-vine Syrah is world-class.', '{blackberry,black-pepper,smoke,leather,violet}'),
  ('pinot-noir', 'Pinot Noir', '{}', 'red', 'red', 'France (Burgundy)', true, 'Heartbreak grape. Hemel-en-Aarde & Elgin.', '{cherry-red,red-raspberry,forest-floor,mushroom,rose}'),
  ('merlot', 'Merlot', '{}', 'red', 'red', 'France (Bordeaux)', false, 'Plum, soft tannin. Bordeaux partner.', '{cherry-black,blackberry,chocolate-dark,vanilla}'),
  ('malbec', 'Malbec', '{}', 'red', 'red', 'France (Cahors)', false, 'Deep colour, plush, violet.', '{cherry-black,blackberry,violet,licorice}'),
  ('bordeaux-blend', 'Bordeaux Blend', '{}', 'red', 'red', 'France', false, 'Cab or Merlot-led blends. SA icons: Rubicon, Paul Sauer.', '{cassis,cedar,blackberry,mint,tobacco}'),
  ('grenache', 'Grenache', '{Garnacha}', 'red', 'red', 'Spain', false, 'Red fruit, white pepper. Swartland Rhône movement.', '{strawberry,red-raspberry,white-pepper,thyme}'),
  ('mourvedre', 'Mourvèdre', '{Monastrell}', 'red', 'red', 'Spain', false, 'Dark, meaty, structured.', '{blackberry,leather,black-pepper}'),
  ('cinsaut', 'Cinsaut', '{Cinsault}', 'red', 'red', 'France', false, 'Light, perfumed. Parent of Pinotage.', '{strawberry,rose,white-pepper}'),
  ('petit-verdot', 'Petit Verdot', '{}', 'red', 'red', 'France', false, 'Bordeaux blender. Dark, tannic, violet.', '{blackberry,violet,licorice}'),
  ('tannat', 'Tannat', '{}', 'red', 'red', 'France (Madiran)', false, 'Very tannic. Small SA plantings.', '{blackberry,dark-chocolate,leather}'),
  ('carignan', 'Carignan', '{}', 'red', 'red', 'Spain', false, 'High acid, tannic. Old-vine Swartland.', '{red-cherry,blackberry,spice}'),
  ('tempranillo', 'Tempranillo', '{}', 'red', 'red', 'Spain', false, 'Small SA plantings. Cherry, leather, tobacco.', '{cherry-red,leather,tobacco,vanilla}'),
  ('nebbiolo', 'Nebbiolo', '{}', 'red', 'red', 'Italy (Piedmont)', false, 'Rare SA planting. Tannic, rose, tar.', '{rose,tar,red-cherry,truffle}'),
  ('sangiovese', 'Sangiovese', '{}', 'red', 'red', 'Italy (Tuscany)', false, 'Rare SA planting. Cherry, herb, earth.', '{red-cherry,herb,earth,tobacco}'),
  ('barbera', 'Barbera', '{}', 'red', 'red', 'Italy (Piedmont)', false, 'Rare SA. High acid, cherry.', '{red-cherry,almond,sour-cherry}'),
  ('zinfandel', 'Zinfandel', '{}', 'red', 'red', 'Croatia/USA', false, 'Rare SA (Blaauwklippen). Bramble, spice.', '{blackberry,bramble,black-pepper}'),
  ('touriga-nacional', 'Touriga Nacional', '{}', 'red', 'red', 'Portugal', false, 'Calitzdorp port-style. Dark, floral.', '{blackberry,violet,plum,licorice}'),
  ('tinta-barroca', 'Tinta Barroca', '{}', 'red', 'red', 'Portugal', false, 'Calitzdorp port-style.', '{plum,cherry-black,chocolate-dark}'),
  ('tinta-roriz', 'Tinta Roriz', '{Aragonez}', 'red', 'red', 'Portugal', false, 'Portuguese for Tempranillo.', '{cherry-red,leather,tobacco}'),
  -- Major whites
  ('sauvignon-blanc', 'Sauvignon Blanc', '{}', 'white', 'white', 'France (Loire)', true, 'Cool-climate benchmarks. Constantia, Durbanville, Elgin, Elim.', '{cut-grass,passionfruit,guava,lemon,lime}'),
  ('chardonnay', 'Chardonnay', '{}', 'white', 'white', 'France (Burgundy)', true, 'Hemel-en-Aarde & Robertson world-class.', '{lemon,peach,butter,vanilla,brioche}'),
  ('semillon', 'Sémillon', '{Semillon}', 'white', 'white', 'France (Bordeaux)', false, 'Constantia''s historic grape. Waxy, lanolin, fig.', '{fig,lemon,hay,honey}'),
  ('riesling', 'Riesling', '{}', 'white', 'white', 'Germany', false, 'Few SA examples. Elgin & Hemel-en-Aarde.', '{lime,lemon,petrol,honey,jasmine}'),
  ('viognier', 'Viognier', '{}', 'white', 'white', 'France (Rhône)', false, 'Apricot, blossom, low acid. Swartland.', '{apricot,orange-blossom,peach,ginger}'),
  ('roussanne', 'Roussanne', '{}', 'white', 'white', 'France (Rhône)', false, 'Rare SA. Herbal, honeyed.', '{herb,honey,apricot,almond}'),
  ('marsanne', 'Marsanne', '{}', 'white', 'white', 'France (Rhône)', false, 'Rare SA. Nutty, low acid.', '{almond,pear,honey}'),
  ('gewurztraminer', 'Gewürztraminer', '{}', 'white', 'white', 'Germany/Alsace', false, 'Very rare SA. Lychee, rose, spice.', '{rose,lychee,ginger,blossom}'),
  ('verdelho', 'Verdelho', '{}', 'white', 'white', 'Portugal', false, 'Rare SA. Crisp, tropical.', '{pineapple,lemon,honey}'),
  ('pinot-gris', 'Pinot Gris', '{Pinot Grigio}', 'white', 'white', 'France', false, 'Small SA plantings.', '{pear,apple,honey,almond}'),
  ('pinot-blanc', 'Pinot Blanc', '{}', 'white', 'white', 'France', false, 'Very rare SA.', '{apple,pear,almond,butter}'),
  ('colombard', 'Colombard', '{Colombard}', 'white', 'white', 'France', false, 'High acid, value whites & brandy.', '{lemon,cut-grass,green-apple}'),
  ('hanepoot', 'Hanepoot', '{Muscat d''Alexandrie}', 'white', 'white', 'Egypt', false, 'SA sweet wines, fortified.', '{grape,honey,orange-blossom,apricot}'),
  ('muscadel', 'Muscadel', '{Muscat Blanc}', 'white', 'white', 'Greece', false, 'Klein Karoo tradition. Sweet, grapey.', '{grape,honey,orange-blossom,rose}'),
  ('petit-manseng', 'Petit Manseng', '{}', 'white', 'white', 'France (Jurançon)', false, 'Rare SA. High acid, tropical.', '{mango,passion-fruit,honey,spice}'),
  ('taminga', 'Taminga', '{}', 'white', 'white', 'Australia', false, 'Very rare SA crossing.', '{muscat,honey,blossom}')
ON CONFLICT (slug) DO NOTHING;

-- ═══ CERTIFICATIONS ════════════════════════════════════════════════════════
INSERT INTO certifications (code, name, description, is_export_relevant) VALUES
  ('WO', 'Wine of Origin', 'Guarantees certified origin, vintage, cultivar. Wine & Spirit Board.', true),
  ('IPW', 'Integrated Production of Wine', 'Environmental sustainability scheme since 1998.', true),
  ('WIETA', 'WIETA Ethical Trade', 'Fair labour, human rights, dignified working conditions.', true),
  ('OVP', 'Old Vine Project (Heritage Vineyards)', 'Seal for vines 35+ years old. Displays planting year.', false),
  ('FAIRTRADE', 'Fairtrade', 'International ethical premium.', true),
  ('ROC', 'Regenerative Organic Certified', 'Soil health, animal welfare, social fairness.', true),
  ('BWI', 'Biodiversity & Wine Initiative', 'Cape Floral Kingdom conservation.', false),
  ('SAWLS', 'SA Wine & Spirit Board', 'Official certification body.', true),
  ('DEMETER', 'Demeter Biodynamic', 'Biodynamic certification.', true),
  ('ECOCERT', 'Ecocert Organic', 'Organic certification.', true)
ON CONFLICT (code) DO NOTHING;

-- ═══ AWARD BODIES ═════════════════════════════════════════════════════════
INSERT INTO award_bodies (code, name, scale) VALUES
  ('PLATTER', 'Platter''s by Diners Club SA Wine Guide', '5-star'),
  ('VERITAS', 'Veritas Awards', '20-point'),
  ('ATKIN', 'Tim Atkin MW SA Special Report', '100-point'),
  ('DWWA', 'Decanter World Wine Awards', '100-point'),
  ('IWSC', 'International Wine & Spirit Competition', '100-point'),
  ('MICHELANGELO', 'Michelangelo International Wine & Spirits Awards', 'medal'),
  ('SUCKLING', 'James Suckling SA Top 100', '100-point'),
  ('TROPHY', 'Old Mutual Trophy Wine Show', '20-point'),
  ('TOP100', 'Top 100 SA Wines Challenge', 'selection'),
  ('CWG', 'Cape Winemakers Guild', 'auction')
ON CONFLICT (code) DO NOTHING;

-- ═══ VINTAGE REPORTS ═══════════════════════════════════════════════════════
INSERT INTO vintage_reports (year, quality_note, weather_summary, harvest_tonnes, is_recommended) VALUES
  (2015, 'exceptional', 'Hot dry summer, good reserves. Balanced, concentrated.', null, true),
  (2016, 'challenging', 'Multi-year drought tightened crop.', null, false),
  (2017, 'strong', 'Dry year, small crop, high quality. Cool ripening.', 1180000.0, true),
  (2018, 'drought peak', 'Yields 15% below 2017. Hot conditions concentrated flavours.', null, false),
  (2019, 'recovery', 'Good quality across regions.', null, true),
  (2020, 'exceptional', 'Great season, remarkable wines (WOSA).', null, true),
  (2021, 'exceptional', 'Cool, balanced vintage for whites and Pinot Noir.', null, true),
  (2022, 'strong', 'Strong vintage with good balance.', null, true),
  (2023, 'strong', 'Cooler vintage; slow ripening delivered top quality.', 1180000.0, true),
  (2024, 'small but good', 'Small crop (-7% YoY). Residual drought and heat.', 1099051.0, false)
ON CONFLICT (year) DO NOTHING;

-- ═══ DONE ═══════════════════════════════════════════════════════════════════
