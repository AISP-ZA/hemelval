-- ─────────────────────────────────────────────────────────────────────────────
-- Kelder seed data — South African wine knowledge base
-- Sources: WOSA, SAWIS, Platter's, Tim Atkin, Wine Anorak, wine-route bodies.
-- See docs/SOURCES.md for the full citation list.
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══ Wine of Origin appellations (the 4-tier hierarchy) ═════════════════════
-- Geographical Units
insert into wo_appellations (name, level, slug, terroir_note) values
  ('Western Cape', 'unit', 'western-cape', 'Overarching geographical unit covering nearly all famous SA wine regions.'),
  ('Northern Cape', 'unit', 'northern-cape', 'Hot northern valley along the Orange River; volume plus old-vine pockets.'),
  ('Eastern Cape', 'unit', 'eastern-cape', 'Small emerging coastal unit.'),
  ('KwaZulu-Natal', 'unit', 'kwazulu-natal', 'High-altitude interior unit.'),
  ('Free State', 'unit', 'free-state', 'Small interior unit.');

-- Regions (children of Western Cape)
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Coastal Region', 'region', 'coastal-region', id, 'The prestige heartland: Stellenbosch, Paarl, Franschhoek, Constantia. Mediterranean climate, ocean-breeze moderated.' from wo_appellations where slug='western-cape';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Breede River Valley', 'region', 'breede-river-valley', id, 'Inland, warm, irrigated. Volume production plus pockets of excellence (Robertson limestone, Worcester brandy).' from wo_appellations where slug='western-cape';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Cape South Coast', 'region', 'cape-south-coast', id, 'Cool maritime frontier. SA''s best Pinot Noir & Chardonnay (Hemel-en-Aarde, Elgin, Elim).' from wo_appellations where slug='western-cape';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Klein Karoo', 'region', 'klein-karoo', id, 'Semi-arid inland. Fortified & sweet wines, brandy, Calitzdorp port-style from Portuguese varieties.' from wo_appellations where slug='western-cape';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Olifants River', 'region', 'olifants-river', id, 'Hot northern valley; large co-op volume + high-altitude/old-vine pockets (Piekenierskloof).' from wo_appellations where slug='western-cape';

-- Districts (children of Coastal Region)
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Stellenbosch', 'district', 'stellenbosch', id, 'SA''s leading fine-wine district. Hilly, mixed granite & sandstone, Mediterranean. Cabernet, Chenin, Bordeaux blends.' from wo_appellations where slug='coastal-region';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Paarl', 'district', 'paarl', id, 'Large warm valley under Paarl Rock. The "Red Route" — Pinotage, Shiraz, Cabernet. Granite soils.' from wo_appellations where slug='coastal-region';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Franschhoek', 'district', 'franschhoek', id, 'Bowl-shaped valley, Huguenot heritage. Bordeaux blends, Semillon, MCC.' from wo_appellations where slug='coastal-region';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Cape Town', 'district', 'cape-town', id, 'Includes Constantia (SA''s oldest, 1685), Durbanville, Hout Bay, Philadelphia.' from wo_appellations where slug='coastal-region';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Swartland', 'district', 'swartland', id, 'Warm dry rolling country; decomposed shale & granite. The dryland bush-vine revolution. Syrah, Chenin, Grenache.' from wo_appellations where slug='coastal-region';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Wellington', 'district', 'wellington', id, 'Hot inland valley; raisin/brandy and Pinotage roots; many rootstock nurseries.' from wo_appellations where slug='coastal-region';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Tulbagh', 'district', 'tulbagh', id, 'Basin surrounded by mountains; diverse (MCC, Shiraz).' from wo_appellations where slug='coastal-region';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Darling', 'district', 'darling', id, 'Cool coastal; Sauvignon Blanc, Pinot Noir.' from wo_appellations where slug='coastal-region';

-- Cape Town wards (the famous ones)
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Constantia', 'ward', 'constantia', id, 'SA''s oldest wine area (1685). Steep, cool, sea-facing slopes. Sauvignon Blanc, Semillon, Vin de Constance.' from wo_appellations where slug='cape-town';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Durbanville', 'ward', 'durbanville', id, 'Rolling hills near Cape Town, cool maritime. Sauvignon Blanc, Merlot.' from wo_appellations where slug='cape-town';

-- Cape South Coast districts
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Walker Bay', 'district', 'walker-bay', id, 'Includes Hemel-en-Aarde — SA''s premier Pinot Noir/Chardonnay terroir on Bokkeveld shale.' from wo_appellations where slug='cape-south-coast';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Elgin', 'district', 'elgin', id, 'Cool highland plateau in the Kogelberg Biosphere. Chardonnay, Pinot Noir, Sauvignon Blanc, Riesling.' from wo_appellations where slug='cape-south-coast';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Cape Agulhas', 'district', 'cape-agulhas', id, 'Africa''s southernmost vineyards; windswept, cool. Includes Elim ward.' from wo_appellations where slug='cape-south-coast';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Hemel-en-Aarde Valley', 'ward', 'hemel-en-aarde-valley', id, 'Three sub-valleys (Valley, Ridge, Upper) near Hermanus. Clay-rich Bokkeveld shale. World-class Pinot & Chardonnay.' from wo_appellations where slug='walker-bay';

-- Breede River Valley districts
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Robertson', 'district', 'robertson', id, 'Limestone-rich; famous for Chardonnay and MCC (Graham Beck) plus Shiraz.' from wo_appellations where slug='breede-river-valley';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Breedekloof', 'district', 'breedekloof', id, 'Chenin Blanc, Colombard, increasing quality.' from wo_appellations where slug='breede-river-valley';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Worcester', 'district', 'worcester', id, 'Largest wine-producing district by volume; brandy and bulk wine.' from wo_appellations where slug='breede-river-valley';

-- Klein Karoo / Olifants River
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Calitzdorp', 'district', 'calitzdorp', id, 'The "port capital" of SA. Tinta Barroca, Touriga Nacional from Portuguese varieties.' from wo_appellations where slug='klein-karoo';
insert into wo_appellations (name, level, slug, parent_id, terroir_note) select 'Citrusdal Mountain', 'district', 'citrusdal-mountain', id, 'Source of famed old-vine Chenin (Sadie Skurfberg, Piekenierskloof ward).' from wo_appellations where slug='olifants-river';

-- Stand-alone premium wards
insert into wo_appellations (name, level, slug, terroir_note) values
  ('Simonsberg-Stellenbosch', 'ward', 'simonsberg-stellenbosch', 'Benchmark Stellenbosch ward; Cabernet & Pinotage icons (Kanonkop, Rustenberg, Vergenoegd).'),
  ('Cederberg', 'ward', 'cederberg', 'High-altitude (1000m+) premium cool-climate estate ward.'),
  ('Elim', 'ward', 'elim', 'Africa''s southernmost vineyards; windswept, low yields, intense Sauvignon Blanc.'),
  ('Paardeberg', 'ward', 'paardeberg', 'Decomposed granite hill in Swartland; heart of the bush-vine revolution (Sadie, Mullineux, AA Badenhorst).');

-- ═══ Varietals (mirrors @kelder/engine VARIETALS) ═══════════════════════════
insert into varietals (slug, name, aliases, type, is_signature, character, typical_aromas) values
  ('chenin-blanc','Chenin Blanc','{Steen}','white',true,'SA''s most planted grape (~18% of vineyards). High acid, versatile: fresh & fruity to old-vine serious. Apple, quince, honey.','{apple,quince,honey,lemon,apricot}'),
  ('pinotage','Pinotage','{}','red',true,'SA''s own crossing (Pinot Noir × Cinsaut, 1925). Red fruit, earth, sometimes banana/coffee. Cape Blend backbone.','{cherry-red,plum,leather,tobacco,chocolate-dark}'),
  ('mcc','MCC (Méthode Cap Classique)','{}','sparkling',true,'SA traditional-method sparkling (bottle-fermented, lees-aged). Pinot Noir + Chardonnay.','{brioche,lemon,apple,almond,biscuit}'),
  ('cabernet-sauvignon','Cabernet Sauvignon','{}','red',false,'Cassis, cedar, graphite, firm tannin. Thrives on Simonsberg-Stellenbosch & Helderberg.','{cassis,cedar,blackberry,eucalyptus}'),
  ('shiraz','Shiraz / Syrah','{Syrah}','red',false,'Black pepper, dark berry, smoked meat. Swartland bush-vine Syrah is world-class.','{blackberry,black-pepper,smoke,leather,violet}'),
  ('pinot-noir','Pinot Noir','{}','red',false,'Finessed red fruit, earth, florality. Best from cool Hemel-en-Aarde & Elgin.','{cherry-red,raspberry,forest-floor,mushroom,rose}'),
  ('merlot','Merlot','{}','red',false,'Plum, blackberry, soft tannin. Bordeaux-blend partner.','{plum,blackberry,chocolate-dark}'),
  ('bordeaux-blend','Bordeaux Blend','{}','red',false,'Cabernet-led or Merlot-led blends. SA icons: Meerlust Rubicon, Kanonkop Paul Sauer, Vilafonté.','{cassis,cedar,blackberry,tobacco}'),
  ('grenache','Grenache','{Garnacha}','red',false,'Red fruit, white pepper, spice. Central to the Swartland Rhône movement.','{strawberry,raspberry,white-pepper,thyme,licorice}'),
  ('mourvedre','Mourvèdre','{Monastrell}','red',false,'Dark, meaty, structured. Swartland Rhône-blend component.','{blackberry,leather,black-pepper}'),
  ('cinsaut','Cinsaut','{Cinsault}','red',false,'Light, perfumed red fruit. Historic (parent of Pinotage).','{strawberry,rose,white-pepper}'),
  ('sauvignon-blanc','Sauvignon Blanc','{}','white',false,'Crisp, herbaceous, nettle/tropical. Constantia & Durbanville benchmarks.','{cut-grass,passionfruit,guava,lemon,asparagus}'),
  ('chardonnay','Chardonnay','{}','white',false,'Citrus to rich-oaked. Hemel-en-Aarde & Robertson limestone give world-class expressions.','{lemon,peach,butter,vanilla,brioche}'),
  ('semillon','Sémillon','{Semillon}','white',false,'Waxy, lanolin, fig. Constantia''s historic grape; revived by Boekenhoutskloof.','{fig,lemon,hay,honey}'),
  ('riesling','Riesling','{}','white',false,'Lime, petrol (with age), high acid. SA examples from Elgin & Hemel-en-Aarde.','{lime,lemon,petrol,honey}'),
  ('viognier','Viognier','{}','white',false,'Apricot, blossom, low acid, oily texture. Swartland & Franschhoek.','{apricot,orange-blossom,peach,ginger}'),
  ('colombard','Colombard','{Colombard}','white',false,'High acid, value whites & brandy base. Mostly Breedekloof & Robertson.','{lemon,cut-grass}'),
  ('touriga-nacional','Touriga Nacional','{}','red',false,'Port-style wines of Calitzdorp. Dark, floral, concentrated.','{blackberry,violet,plum,licorice}'),
  ('tinta-barroca','Tinta Barroca','{}','red',false,'Portuguese variety for Calitzdorp port-style wines.','{plum,cherry-black,chocolate-dark}')
on conflict (slug) do nothing;

-- ═══ Certifications / seals ═════════════════════════════════════════════════
insert into certifications (code, name, description, is_export_relevant) values
  ('WO','Wine of Origin','Guarantees certified origin (appellation), vintage year, and cultivar. Administered by the Wine & Spirit Board.',true),
  ('IPW','Integrated Production of Wine','Voluntary environmental sustainability scheme (est. 1998). Audited vineyard & cellar practices.',true),
  ('WIETA','Ethical Trade (WIETA)','SA ethical-trade standard; fair labour, human rights, dignified working conditions.',true),
  ('OVP','Old Vine Project (Heritage Vineyards)','World-first seal authenticating wines from vines 35+ years old; displays planting year.',false),
  ('FAIRTRADE','Fairtrade','International ethical premium; community development premium per bottle.',true),
  ('ROC','Regenerative Organic Certified','Newer regenerative standard. Sadie Family is SA''s first ROC vineyard.',true),
  ('BWI','Biodiversity & Wine Initiative','Partners estates with conservation of the Cape Floral Kingdom.',false)
on conflict (code) do nothing;

-- ═══ Award bodies ═══════════════════════════════════════════════════════════
insert into award_bodies (code, name, scale) values
  ('PLATTER','Platter''s SA Wine Guide','5-star'),
  ('VERITAS','Veritas Awards','20-point'),
  ('ATKIN','Tim Atkin MW SA Report','100-point'),
  ('DWWA','Decanter World Wine Awards','100-point'),
  ('IWSC','International Wine & Spirit Competition','100-point'),
  ('MICHELANGELO','Michelangelo International Wine & Spirits Awards','medal'),
  ('SUCKLING','James Suckling SA Top 100','100-point')
on conflict (code) do nothing;

-- ═══ Western Cape wine estates (~80, grouped by region) ═════════════════════
-- Constantia
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('groot-constantia', 'Groot Constantia', (select id from wo_appellations where slug='constantia'), 1685, 'South Africa''s oldest estate, established 1685. A Cape Town Big 7 attraction with a historic Cape Dutch manor.', 'Gouverneurs Reserve red; historic Cape Dutch architecture; tourism icon.', -34.0273, 18.4353, 'https://grootconstantia.co.za/'),
  ('klein-constantia', 'Klein Constantia', (select id from wo_appellations where slug='constantia'), 1685, 'Birthplace of the legendary Vin de Constance — the natural sweet wine loved by European royalty, Dickens and Jane Austen.', 'Vin de Constance (natural sweet); Sauvignon Blanc; cool steep slopes.', -34.0205, 18.4395, 'https://www.kleinconstantia.com/'),
  ('steenberg', 'Steenberg', (select id from wo_appellations where slug='constantia'), 1682, 'Oldest farm in Constantia (1682). Sauvignon Blanc, Nebbiolo, luxury hotel and golf.', 'Sauvignon Blanc; luxury hospitality.', -34.0447, 18.4367, 'https://www.steenbergfarm.com/'),
  ('buitenverwachting', 'Buitenverwachting', (select id from wo_appellations where slug='constantia'), 1773, '"Beyond Expectations". Sauvignon Blanc and Cape blends on the cool Constantia slopes.', 'Sauvignon Blanc; Cape blends.', -34.0411, 18.4311, 'https://www.buitenverwachting.co.za/'),
  ('beau-constantia', 'Beau Constantia', (select id from wo_appellations where slug='constantia'), , 'Modern estate with panoramic Cape Town views. Sauvignon Blanc and Syrah.', 'Sauvignon Blanc; Syrah; panoramic views.', -34.0297, 18.4256, 'https://www.beauconstantia.com/'),
  ('eagles-nest', 'Eagle''s Nest', (select id from wo_appellations where slug='constantia'), 1836, 'Steep, high-altitude Constantia. Viognier and Shiraz from a dramatic setting.', 'Viognier; Shiraz; high-altitude.', -34.0117, 18.4194, 'https://www.eaglesnestwines.co.za/'),
  ('constantia-glen', 'Constantia Glen', (select id from wo_appellations where slug='constantia'), , 'Boutique estate producing Bordeaux-style blends and Sauvignon Blanc.', 'Bordeaux blends; Sauvignon Blanc.', -34.0308, 18.4283, 'https://www.constantiaglen.com/');

-- Stellenbosch
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('kanonkop', 'Kanonkop', (select id from wo_appellations where slug='simonsberg-stellenbosch'), 1680, 'The "undisputed benchmark" for Pinotage. Famed for the Paul Sauer Bordeaux blend and Cabernet Sauvignon.', 'Pinotage (benchmark); Paul Sauer Bordeaux blend; Cabernet Sauvignon.', -33.8925, 18.8833, 'https://www.kanonkop.co.za/'),
  ('meerlust', 'Meerlust', (select id from wo_appellations where slug='stellenbosch'), 1693, 'Historic estate (Myburgh family since 1756). Home of Rubicon, the iconic SA Bordeaux blend.', 'Rubicon Bordeaux blend; Cabernet Sauvignon; historic estate.', -34.0086, 18.8306, 'https://www.meerlust.co.za/'),
  ('rustenberg', 'Rustenberg', (select id from wo_appellations where slug='stellenbosch'), 1682, 'Historic (1682). Chardonnay, Peter Barlow Cabernet, and the John X Merriman blend.', 'Chardonnay; Peter Barlow Cabernet; John X Merriman.', -33.875, 18.8583, 'https://www.rustenberg.co.za/'),
  ('rust-en-vrede', 'Rust en Vrede', (select id from wo_appellations where slug='stellenbosch'), 1694, 'Flagship red blends (Cabernet, Syrah, Merlot). A wine favored by Nelson Mandela.', 'Cabernet Sauvignon; Syrah; estate red blend.', -33.8833, 18.8333, 'https://www.rustenvrede.com/'),
  ('vergelegen', 'Vergelegen', (select id from wo_appellations where slug='stellenbosch'), 1700, 'Often ranked SA''s #1 iconic farm. Cabernet, Sauvignon Blanc, GVB Red.', 'Cabernet Sauvignon; GVB Red; Sauvignon Blanc.', -34.0833, 18.9167, 'https://www.vergelegen.co.za/'),
  ('boschendal', 'Boschendal', (select id from wo_appellations where slug='stellenbosch'), 1685, 'Iconic 1685 estate straddling Stellenbosch and Franschhoek. 1685 range, MCC, famous farm-to-table dining.', 'MCC; 1685 range; farm dining.', -33.8833, 18.95, 'https://www.boschendal.com/'),
  ('thelema', 'Thelema Mountain Vineyards', (select id from wo_appellations where slug='stellenbosch'), 1983, 'Helshoogte Pass estate. Bordeaux reds and Sauvignon Blanc.', 'Bordeaux reds; Sauvignon Blanc.', -33.9333, 18.9167, 'https://www.thelema.co.za/'),
  ('warwick', 'Warwick', (select id from wo_appellations where slug='stellenbosch'), 1771, 'Bordeaux-style blends including the Three Cape Ladies, and Pinotage.', 'Three Cape Ladies blend; Pinotage; Bordeaux blends.', -33.8833, 18.85, 'https://www.warwickwine.com/'),
  ('simonsig', 'Simonsig', (select id from wo_appellations where slug='stellenbosch'), 1688, 'MCC pioneer (first SA Cap Classique 1971). Pinotage and Chenin Blanc.', 'Cap Classique (pioneer); Pinotage; Chenin Blanc.', -33.8667, 18.85, 'https://www.simonsig.co.za/'),
  ('ken-forrester', 'Ken Forrester', (select id from wo_appellations where slug='stellenbosch'), 1689, '"Mr Chenin Blanc". The FMC, Old Vines Reserve, and Tatie — benchmark SA Chenin.', 'Chenin Blanc (The FMC); Old Vines Reserve.', -33.9333, 18.8333, 'https://www.kenforresterwines.com/'),
  ('raats', 'Raats Family', (select id from wo_appellations where slug='stellenbosch'), , 'Cabernet Franc specialist. MR de Compostella (top-10 SA Bordeaux blend).', 'Cabernet Franc; MR de Compostella.', -33.8667, 18.8667, 'https://www.raatswines.co.za/'),
  ('vilafonte', 'Vilafonté', (select id from wo_appellations where slug='stellenbosch'), , 'Premium Bordeaux blends (Series M, Series C). A Zelma Long/Phil Freese/Mike Ratcliffe collaboration.', 'Series M; Series C Bordeaux blends.', -33.8833, 18.85, 'https://www.vilafonte.com/'),
  ('waterford-estate', 'Waterford Estate', (select id from wo_appellations where slug='stellenbosch'), , 'Popular tasting room, the Jem blend, and chocolate & wine pairing.', 'Jem blend; chocolate & wine pairing.', -33.95, 18.85, 'https://www.waterfordestate.co.za/'),
  ('muratie', 'Muratie', (select id from wo_appellations where slug='stellenbosch'), 1685, 'Historic, traditional reds. Melck''s Right Saxon and old-vine Chenin.', 'Traditional reds; old-vine Chenin.', -33.8833, 18.8667, 'https://www.muratie.co.za/'),
  ('delheim', 'Delheim', (select id from wo_appellations where slug='stellenbosch'), , 'Established estate. Vera Cruz Shiraz and value wines.', 'Vera Cruz Shiraz.', -33.8833, 18.8833, 'https://www.delheim.com/'),
  ('tokara', 'Tokara', (select id from wo_appellations where slug='stellenbosch'), , 'Modern estate. Zondernaam Sauvignon Blanc, Director''s Reserve red.', 'Director''s Reserve; Zondernaam Sauvignon Blanc.', -33.9167, 18.9167, 'https://www.tokara.com/'),
  ('jordan', 'Jordan Wine Estate', (select id from wo_appellations where slug='stellenbosch'), , 'Chardonnay and the Nine Yards Chenin. Long-lived Stellenbosch whites.', 'Chardonnay; Nine Yards Chenin.', -33.95, 18.85, 'https://www.jordanwines.com/'),
  ('de-trafford', 'De Trafford', (select id from wo_appellations where slug='stellenbosch'), , 'Mountainous, low-yield. Cabernet and the famed Straw Wine.', 'Cabernet Sauvignon; Straw Wine.', -33.9667, 18.8833, 'https://www.detrafford.co.za/'),
  ('spier', 'Spier', (select id from wo_appellations where slug='stellenbosch'), 1692, 'Historic 1692 farm with broad range and major tourism.', 'Wide range; farm-to-table dining.', -33.9167, 18.85, 'https://www.spier.co.za/'),
  ('hartenberg', 'Hartenberg', (select id from wo_appellations where slug='stellenbosch'), 1692, 'Rhine Riesling, Shiraz, and Corkscrew Hill. Sustainably farmed.', 'Shiraz; Rhine Riesling; Chardonnay.', -33.9, 18.85, 'https://www.hartenberg.co.za/'),
  ('neethlingshof', 'Neethlingshof', (select id from wo_appellations where slug='stellenbosch'), 1692, 'Historic 1692 estate. Lord Neethling wines and Short Story collection.', 'Cabernet Sauvignon; Pinotage.', -33.8833, 18.85, 'https://www.neethlingshof.co.za/'),
  ('babylonstoren', 'Babylonstoren', (select id from wo_appellations where slug='stellenbosch'), 1692, 'Iconic farm with famous gardens, Babel restaurant, and estate wines.', 'MCC; Chenin Blanc; Babel dining.', -33.85, 18.8667, 'https://www.babylonstoren.com/'),
  ('delaire-graff', 'Delaire Graff', (select id from wo_appellations where slug='stellenbosch'), , 'Luxury Helshoogte estate. Botmaskop and lodges.', 'Botmaskop blend; luxury hospitality.', -33.9333, 18.9333, 'https://www.delaire.co.za/'),
  ('altima', 'Altima', (select id from wo_appellations where slug='stellenbosch'), , 'High-altitude Swartberg farm. Premium cool-climate sourcing.', 'Pinot Noir; Chardonnay.', -33.95, 18.8667, ''),
  ('le-riche', 'Le Riche', (select id from wo_appellations where slug='stellenbosch'), , 'Cabernet Sauvignon specialist family estate.', 'Cabernet Sauvignon.', -33.8833, 18.85, 'https://www.lerichefamilyvineyards.com/'),
  ('overgaauw', 'Overgaauw', (select id from wo_appellations where slug='stellenbosch'), 1905, 'Old Cabernet and Silver Mountains. Four generations.', 'Cabernet Sauvignon; Tria Corda.', -33.9, 18.85, 'https://www.overgaauw.co.za/');

-- Franschhoek
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('boekenhoutskloof', 'Boekenhoutskloof', (select id from wo_appellations where slug='franschhoek'), 1776, 'Est. 1776. The Chocolate Block, Syrah, single-vineyard Semillon, Porcupine Ridge — one of SA''s most successful modern brands.', 'The Chocolate Block; Syrah; Semillon; Porcupine Ridge.', -33.9167, 19.1167, 'https://www.boekenhoutskloof.co.za/'),
  ('haute-cabriere', 'Haute Cabrière', (select id from wo_appellations where slug='franschhoek'), , 'MCC and Pierre Jourdan bubbles; Pinot Noir & Chardonnay. The "best view in Franschhoek".', 'Pierre Jourdan MCC; Pinot Noir + Chardonnay.', -33.9094, 19.1272, 'https://www.cabriere.co.za/'),
  ('la-motte', 'La Motte', (select id from wo_appellations where slug='franschhoek'), 1695, 'Rupert family estate. Pierneef collection, Shiraz, Sauvignon Blanc, and an art museum.', 'Pierneef Shiraz; Sauvignon Blanc.', -33.9167, 19.1167, 'https://www.la-motte.co.za/'),
  ('leeu-passant', 'Leeu Passant', (select id from wo_appellations where slug='franschhoek'), , 'Mullineux-Leeu partnership; luxury old-vine sourced wines.', 'Old-vine Cinsault; Chardonnay.', -33.9167, 19.1167, 'https://www.leewineestate.com/'),
  ('franschhoek-cellar', 'Franschhoek Cellar', (select id from wo_appellations where slug='franschhoek'), , 'Co-op producing value wines with the Franschhoek story.', 'Value wines; Cabernet Sauvignon.', -33.9094, 19.1272, 'https://www.franschhoekcellar.co.za/'),
  ('grande-provence', 'Grande Provence', (select id from wo_appellations where slug='franschhoek'), 1694, 'Heritage estate with art gallery and boutique wines.', 'Chardonnay; Shiraz; gallery.', -33.9094, 19.1272, 'https://www.grandeprovence.co.za/'),
  ('chamonix', 'Chamonix', (select id from wo_appellations where slug='franschhoek'), , 'Cool-slope Franschhoek. Pinot Noir, Sauvignon Blanc, and the Grey Lace MCC.', 'Pinot Noir; Sauvignon Blanc; Grey Lace MCC.', -33.8833, 19.1167, 'https://www.chamonix.co.za/'),
  ('mont-rochelle', 'Mont Rochelle', (select id from wo_appellations where slug='franschhoek'), , 'Boutique estate and Virgin Limited Lodge.', 'Chardonnay; Syrah.', -33.9167, 19.1167, 'https://www.montrochelle.co.za/'),
  ('holden-manz', 'Holden Manz', (select id from wo_appellations where slug='franschhoek'), , 'Boutique estate producing Big G red blend and Sauvignon Blanc.', 'Big G red blend; Sauvignon Blanc.', -33.9094, 19.1272, 'https://www.holdenmanz.com/');

-- Paarl & Wellington
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('nederburg', 'Nederburg', (select id from wo_appellations where slug='paarl'), 1937, 'Most-awarded global SA brand; five-time "World''s Most Admired Wine Brands". Legacy auctions, Cabernet, Pinotage.', 'Cabernet Sauvignon; Pinotage; II Heroes.', -33.7333, 18.9667, 'https://www.nederburg.com/'),
  ('fairview', 'Fairview', (select id from wo_appellations where slug='paarl'), 1693, 'Charles Back''s estate. Wines + famous artisanal cheese. Pinotage, Shiraz, the Goatshed.', 'Pinotage; Shiraz; artisanal cheese.', -33.7667, 18.9333, 'https://www.fairview.co.za/'),
  ('kwv', 'KWV', (select id from wo_appellations where slug='paarl'), 1918, 'Historic co-op (founded 1918). Fortified wines, brandy, premium Cathedral Cellar. Emblematic of Paarl.', 'Brandy; Cathedral Cellar; fortified wines.', -33.7333, 18.9667, 'https://www.kvw.co.za/'),
  ('laborie', 'Laborie', (select id from wo_appellations where slug='paarl'), , 'MCC and a historic estate dining room.', 'MCC; Sauvignon Blanc.', -33.7333, 18.9667, 'https://www.laboriewines.co.za/'),
  ('avondale', 'Avondale', (select id from wo_appellations where slug='paarl'), , 'Organic/biodynamic estate on the Klein Drakenstein slopes.', 'Jonty''s Ducks Chenin; organic wines.', -33.75, 18.95, 'https://www.avondalewine.co.za/'),
  ('glen-carlou', 'Glen Carlou', (select id from wo_appellations where slug='paarl'), , 'Simonsberg-Paarl edge. Chardonnay benchmark.', 'Chardonnay; Grand Classique.', -33.8, 18.9167, 'https://www.glencarlou.co.za/'),
  ('backsberg', 'Backsberg', (select id from wo_appellations where slug='paarl'), , 'Early sustainability champion. Pinotage and Cabernet.', 'Pinotage; Cabernet Sauvignon; carbon-neutral.', -33.7833, 18.95, 'https://www.backsberg.co.za/'),
  ('diemersfontein', 'Diemersfontein', (select id from wo_appellations where slug='wellington'), , 'Famous for "coffee Pinotage" — the original chocolate/coffee style.', 'Coffee Pinotage; Carpe Diem.', -33.65, 18.9833, 'https://www.diemersfontein.co.za/');

-- Durbanville
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('durbanville-hills', 'Durbanville Hills', (select id from wo_appellations where slug='durbanville'), 1998, 'Co-op; top-10 cellar. Sauvignon Blanc from cool maritime hills.', 'Sauvignon Blanc; Rhinofields range.', -33.85, 18.6333, 'https://www.durbanvillehills.co.za/'),
  ('diemersdal', 'Diemersdal', (select id from wo_appellations where slug='durbanville'), 1698, 'Six generations. Sauvignon Blanc specialist.', 'Sauvignon Blanc.', -33.85, 18.6333, 'https://www.diemersdal.co.za/'),
  ('nitida', 'Nitida', (select id from wo_appellations where slug='durbanville'), , 'Boutique Durbanville estate. Sauvignon Blanc and Titan Semillon.', 'Sauvignon Blanc; Titan Semillon.', -33.85, 18.6333, 'https://www.nitida.co.za/'),
  ('meerendal', 'Meerendal', (select id from wo_appellations where slug='durbanville'), 1702, 'Historic 1702 farm. MCC, Pinotage, and heritage building.', 'MCC; Pinotage; Heritage Block.', -33.85, 18.6333, 'https://www.meerendal.co.za/'),
  ('de-grendel', 'De Grendel', (select id from wo_appellations where slug='durbanville'), 1720, 'Graaff family estate with sweeping Table Bay views.', 'Sauvignon Blanc; Pinotage; Koetshuis.', -33.85, 18.5833, 'https://www.degrendel.co.za/');

-- Swartland
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('sadie-family', 'Sadie Family Wines', (select id from wo_appellations where slug='paardeberg'), , 'Eben Sadie. Columella (Rhône-style red, top SA wine), Skurfberg & Mev. Kirsten old-vine Chenin. SA''s first ROC vineyard.', 'Columella; Skurfberg Chenin; Palladius; old-vine Chenin.', -33.3167, 18.7333, 'https://www.sadiefamilywines.com/'),
  ('mullineux', 'Mullineux', (select id from wo_appellations where slug='swartland'), , 'Chris & Andrea Mullineux. Mullineux Syrah, old-vine Chenin, Straw Wine. Part of Leeu Family Wines.', 'Syrah; old-vine Chenin; Straw Wine.', -33.3167, 18.7333, 'https://mullineuxwines.com/'),
  ('porseleinberg', 'Porseleinberg', (select id from wo_appellations where slug='swartland'), , 'Single-vineyard Syrah cult wine near Riebeek-Kasteel.', 'Porseleinberg Syrah.', -33.3667, 18.8667, ''),
  ('aa-badenhorst', 'AA Badenhorst Family Wines', (select id from wo_appellations where slug='swartland'), , 'Adi Badenhorst. Kalmoesfontein, Secateurs, old-vine Chenin.', 'Secateurs; Kalmoesfontein; old-vine Chenin.', -33.3667, 18.8667, 'https://www.aabadenhorst.com/'),
  ('lammershoek', 'Lammershoek', (select id from wo_appellations where slug='swartland'), , 'Old-vine, natural-leaning Swartland estate.', 'Old-vine Chenin; Syrah; natural wines.', -33.3167, 18.7333, 'https://www.lammershoek.co.za/'),
  ('testalonga', 'Testalonga', (select id from wo_appellations where slug='swartland'), , 'Craig Hawkins. Natural / Chenin / El Bandito range.', 'El Bandito Chenin; natural wines.', -33.3167, 18.7333, 'https://www.testalonga.com/'),
  ('duncan-savage', 'Duncan Savage', (select id from wo_appellations where slug='swartland'), , 'Savage reds; Syrah-led, sourced fruit, precise winemaking.', 'Savage Syrah; Follow the Line.', -33.3167, 18.7333, 'https://www.savagewines.co.za/'),
  ('vondeling', 'Vondeling', (select id from wo_appellations where slug='swartland'), , 'Voor-Paardeberg edge. Rhône blends and Monsonia.', 'Monsonia; Babiana; Rhône blends.', -33.75, 18.95, 'https://www.vondelingwines.co.za/'),
  ('rall', 'Rall Wines', (select id from wo_appellations where slug='swartland'), , 'Mariana Rall. Sourced-fruit Swartland whites and Syrah.', 'Chenin Blanc; Syrah; Grenache Blanc.', -33.3167, 18.7333, ''),
  ('craven', 'Craven Wines', (select id from wo_appellations where slug='swartland'), , 'Mick Craven. Sourced-fruit, minimal-intervention Swartland wines.', 'Pinot Noir; Chenin; Syrah.', -33.3167, 18.7333, 'https://www.cravenwines.com/');

-- Walker Bay / Hemel-en-Aarde
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('hamilton-russell', 'Hamilton Russell Vineyards', (select id from wo_appellations where slug='hemel-en-aarde-valley'), 1975, 'Founder of Hemel-en-Aarde (1975). Pinot Noir & Chardonnay benchmark; most southerly, maritime.', 'Pinot Noir; Chardonnay.', -34.4167, 19.2, 'https://hamiltonrussellvineyards.com/'),
  ('bouchard-finlayson', 'Bouchard Finlayson', (select id from wo_appellations where slug='hemel-en-aarde-valley'), 1989, 'Est. 1989. Pinot Noir, the Tinto blend, Galpin Peak.', 'Pinot Noir; Galpin Peak; Tinto.', -34.4167, 19.2, 'https://www.bouchardfinlayson.co.za'),
  ('creation-wines', 'Creation Wines', (select id from wo_appellations where slug='hemel-en-aarde-valley'), 2002, 'Wide cool-climate range with acclaimed food pairings. Pinot Noir, Chardonnay, Syrah.', 'Pinot Noir; Chardonnay; food-pairing tastings.', -34.4167, 19.2, 'https://www.creationwines.com'),
  ('newton-johnson', 'Newton Johnson Family Vineyards', (select id from wo_appellations where slug='hemel-en-aarde-valley'), , 'Pinot Noir, Chardonnay, Syrah with an acclaimed restaurant.', 'Pinot Noir; Chardonnay; Syrah.', -34.4167, 19.2, 'https://www.newtonjohnson.com'),
  ('crystallum', 'Crystallum', (select id from wo_appellations where slug='hemel-en-aarde-valley'), , 'Bower family. Pinot Noir & Chardonnay (Bona Fide, Paradisum, Agnus).', 'Pinot Noir; Chardonnay.', -34.4167, 19.2, 'https://www.crystallum.co.za/'),
  ('domaine-des-dieux', 'Domaine des Dieux', (select id from wo_appellations where slug='hemel-en-aarde-valley'), , 'MCC and Pinot Noir from Hemel-en-Aarde.', 'MCC; Pinot Noir.', -34.4167, 19.2, 'https://domainedesdieu.co.za/'),
  ('ataraxia', 'Ataraxia', (select id from wo_appellations where slug='hemel-en-aarde-valley'), , 'Kevin Grant. Chardonnay, Pinot Noir, Sauvignon Blanc.', 'Chardonnay; Pinot Noir; Sauvignon Blanc.', -34.4167, 19.2, 'https://www.ataraxia.co.za/'),
  ('southern-right', 'Southern Right', (select id from wo_appellations where slug='hemel-en-aarde-valley'), , 'Hamilton Russell''s second label. Pinotage and Sauvignon Blanc.', 'Pinotage; Sauvignon Blanc.', -34.4167, 19.2, 'https://southernright.co.za/'),
  ('beaumont', 'Beaumont', (select id from wo_appellations where slug='walker-bay'), 1731, 'Bot River estate. Pinotage and Whole Bunch Chenin.', 'Pinotage; Whole Bunch Chenin.', -34.3333, 19.1667, 'https://www.beaumont.co.za/');

-- Elgin
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('iona', 'Iona', (select id from wo_appellations where slug='elgin'), 1997, 'Cool-climate benchmark. Sauvignon Blanc, Chardonnay, Pinot Noir.', 'Sauvignon Blanc; Chardonnay; Pinot Noir.', -34.1667, 19.0, 'https://www.iona.co.za/'),
  ('paul-cluver', 'Paul Cluver Wines', (select id from wo_appellations where slug='elgin'), , 'Top-ranked Elgin cellar. Pinot Noir, Riesling, Chardonnay, Gewürztraminer.', 'Pinot Noir; Riesling; Chardonnay.', -34.1667, 19.0, 'https://www.paulcluver.com/'),
  ('oak-valley', 'Oak Valley', (select id from wo_appellations where slug='elgin'), 1898, 'Est. 1898. Cool-climate Pinot Noir, Chardonnay, Sauvignon Blanc + apple orchards.', 'Pinot Noir; Chardonnay; Sauvignon Blanc.', -34.1667, 19.0, 'https://www.oakvalley.co.za/');

-- Elim / Cape Agulhas
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('strandveld', 'Strandveld / First Sighting', (select id from wo_appellations where slug='elim'), , 'Dirk Human. Sauvignon Blanc and Pinot Noir from windswept Elim.', 'First Sighting Sauvignon Blanc; Pinot Noir.', -34.6333, 19.5333, ''),
  ('lomond', 'Lomond', (select id from wo_appellations where slug='cape-agulhas'), , 'Sauvignon Blanc (Single Vineyard) near Gansbaai.', 'Sauvignon Blanc (Sugarbush); Merlot.', -34.6667, 19.5333, 'https://www.lomond.co.za/'),
  ('ghost-corner', 'Ghost Corner', (select id from wo_appellations where slug='elim'), , 'Dirk Human brand. Elim Sauvignon Blanc.', 'Sauvignon Blanc; Semillon.', -34.6333, 19.5333, '');

-- Robertson
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('graham-beck', 'Graham Beck', (select id from wo_appellations where slug='robertson'), , 'Iconic MCC producer (also Stellenbosch). Brut, Rosé — the SA Cap Classique benchmark.', 'MCC Brut; MCC Rosé; Cap Classique.', -33.8, 19.8833, 'https://grahambeck.com/'),
  ('de-wetshof', 'De Wetshof', (select id from wo_appellations where slug='robertson'), 1972, 'Danie de Wet. Leading Chardonnay (Site of Origin, Bateleur), limestone-driven.', 'Chardonnay (Site of Origin, Bateleur).', -33.8, 19.8833, 'https://www.dewetshof.co.za/'),
  ('springfield', 'Springfield Estate', (select id from wo_appellations where slug='robertson'), , 'Sauvignon Blanc (Life from Stone, Wild Yeast), Méthode Ancienne Cabernet.', 'Life from Stone Sauvignon; Wild Yeast; Méthode Ancienne.', -33.8, 19.8833, 'https://www.springfieldestate.com/'),
  ('van-loveren', 'Van Loveren', (select id from wo_appellations where slug='robertson'), 1937, 'Popular brand; Christina, River Red. Family-run, garden-rich.', 'Christina; River Red; value wines.', -33.8, 19.8833, 'https://www.vanloveren.co.za/'),
  ('robertson-winery', 'Robertson Winery', (select id from wo_appellations where slug='robertson'), 1941, 'Large co-op. Broad range of value wines from the Breede River Valley.', 'Value wines; Chenin Blanc; Sweet Rosé.', -33.8, 19.8833, 'https://www.robertsonwinery.co.za/'),
  ('zandvliet', 'Zandvliet', (select id from wo_appellations where slug='robertson'), , 'Shiraz and Muscat specialist on limestone soils.', 'Shiraz; Muscat.', -33.8, 19.8833, 'https://www.zandvliet.co.za/');

-- Klein Karoo
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('boplaas', 'Boplaas', (select id from wo_appellations where slug='calitzdorp'), 1880, 'The "port" house of SA. Carel Nel. Tinta Barroca, Touriga Nacional, Cape pot-stilled brandy.', 'Cape Tawny; Vintage Reserve; brandy.', -33.4833, 21.6833, 'https://www.boplaas.co.za/'),
  ('de-krans', 'De Krans', (select id from wo_appellations where slug='calitzdorp'), , 'Port-style wines, MCC, and Chenin (Platter 5-star).', 'Cape Vintage Reserve; MCC; Chenin.', -33.4833, 21.6833, 'https://dekrans.co.za/');

-- Olifants River / Cederberg
insert into estates (slug, name, wo_appellation_id, founded_year, about, famous_for, latitude, longitude, website_url) values
  ('cederberg', 'Cederberg Private Cellar', (select id from wo_appellations where slug='cederberg'), , 'High-altitude (1000m+) benchmark for the ward. Cabernet Sauvignon, Sauvignon Blanc.', 'Cabernet Sauvignon; Sauvignon Blanc; Five Generations.', -32.5, 19.0, 'https://www.cederbergwine.com/'),
  ('namaqua', 'Namaqua Wines', (select id from wo_appellations where slug='olifants-river'), 1948, 'Large co-op, Vredendal. Volume wines from the Olifants River.', 'Value wines.', -31.6667, 18.1667, 'https://www.namaquawines.co.za/');

-- ═══ Wine routes (set wine_route on estates) ═══════════════════════════════
update estates set wine_route = 'Stellenbosch Wine Routes' where slug in ('kanonkop','meerlust','rustenberg','rust-en-vrede','vergelegen','boschendal','thelema','warwick','simonsig','ken-forrester','raats','vilafonte','waterford-estate','muratie','delheim','tokara','jordan','de-trafford','spier','hartenberg','neethlingshof','babylonstoren','delaire-graff','le-riche','overgaauw');
update estates set wine_route = 'Franschhoek Wine Valley' where slug in ('boekenhoutskloof','haute-cabriere','la-motte','leeu-passant','franschhoek-cellar','grande-provence','chamonix','mont-rochelle','holden-manz');
update estates set wine_route = 'Constantia Wine Route' where slug in ('groot-constantia','klein-constantia','steenberg','buitenverwachting','beau-constantia','eagles-nest','constantia-glen');
update estates set wine_route = 'Paarl Wine Route' where slug in ('nederburg','fairview','kwv','laborie','avondale','glen-carlou','backsberg');
update estates set wine_route = 'Wellington Wine Route' where slug in ('diemersfontein');
update estates set wine_route = 'Durbanville Wine Valley' where slug in ('durbanville-hills','diemersdal','nitida','meerendal','de-grendel');
update estates set wine_route = 'Swartland Wine & Olive Route' where slug in ('sadie-family','mullineux','porseleinberg','aa-badenhorst','lammershoek','testalonga','duncan-savage','vondeling','rall','craven');
update estates set wine_route = 'Hemel-en-Aarde' where slug in ('hamilton-russell','bouchard-finlayson','creation-wines','newton-johnson','crystallum','domaine-des-dieux','ataraxia','southern-right');
update estates set wine_route = 'Walker Bay Wine Route' where slug in ('beaumont');
update estates set wine_route = 'Elgin Wine Route' where slug in ('iona','paul-cluver','oak-valley');
update estates set wine_route = 'Cape Agulhas Wine Route' where slug in ('strandveld','lomond','ghost-corner');
update estates set wine_route = 'Robertson Wine Valley' where slug in ('graham-beck','de-wetshof','springfield','van-loveren','robertson-winery','zandvliet');
update estates set wine_route = 'Klein Karoo Wine Route' where slug in ('boplaas','de-krans');
update estates set wine_route = 'Olifants River Wine Route' where slug in ('cederberg','namaqua');

-- ═══ Estate certifications (a sample mapping) ═══════════════════════════════
-- Every estate carries the WO seal by definition. Add IPW/WIETA on the sustainable leaders.
insert into estate_certifications (estate_id, certification_id)
  select e.id, c.id from estates e, certifications c
  where c.code = 'WO'; -- all estates
insert into estate_certifications (estate_id, certification_id)
  select e.id, c.id from estates e, certifications c
  where c.code = 'IPW' and e.slug in ('vergelegen','backsberg','boschendal','groot-constantia','klein-constantia','steenberg');
insert into estate_certifications (estate_id, certification_id)
  select e.id, c.id from estates e, certifications c
  where c.code = 'WIETA' and e.slug in ('vergelegen','backsberg','boschendal','spier','fairview');
insert into estate_certifications (estate_id, certification_id)
  select e.id, c.id from estates e, certifications c
  where c.code = 'BWI' and e.slug in ('vergelegen','backsberg','boschendal');
insert into estate_certifications (estate_id, certification_id)
  select e.id, c.id from estates e, certifications c
  where c.code = 'OVP' and e.slug in ('sadie-family','mullineux','aa-badenhorst','ken-forrester','muratie');
insert into estate_certifications (estate_id, certification_id)
  select e.id, c.id from estates e, certifications c
  where c.code = 'ROC' and e.slug in ('sadie-family');

-- ═══ Wine events / festivals (Wine Town + major SA festivals) ═══════════════
insert into events (name, slug, description, starts_at, ends_at, recurring_month, venue_name, ticket_url, ticketing_platform, price_min_zar, price_max_zar, format, is_18_plus, website_url) values
  ('Wine Town Stellenbosch', 'wine-town-stellenbosch-2026', 'South Africa''s premier wine destination festival, marking the 55th anniversary of Stellenbosch Wine Routes. 60+ producers pouring 200+ wines; includes the flagship Stellenbosch Wine Festival grand tasting and a 9-day programme of cellar-door experiences across the region.', '2026-07-25 10:00+02', '2026-08-02 18:00+02', 7, 'Stellenbosch Town Hall + estates', 'https://visitstellenbosch.web.app', 'own-portal', 600, 650, 'grand-tasting', true, 'https://winetown.wineroute.co.za/'),
  ('Stellenbosch Wine Festival', 'stellenbosch-wine-festival-2026', 'The flagship grand tasting at the heart of Wine Town: 60+ producers, 200+ wines, bottomless food by Bertus Basson & Adele Grewar, 20 tasting tokens, Aquasky palate-cleansing station.', '2026-07-31 17:00+02', '2026-08-01 18:00+02', 7, 'Stellenbosch Town Hall', 'https://visitstellenbosch.web.app', 'own-portal', 600, 650, 'grand-tasting', true, 'https://winetown.wineroute.co.za/wine-festival/'),
  ('Hemel-en-Aarde Pinot Noir Celebration', 'hemel-en-aarde-pinot-2026', 'Premium Pinot Noir showcase — one of SA''s top cool-climate tastings, hosted by the Hemel-en-Aarde producers in Hermanus.', '2026-01-24 10:00+02', '2026-01-25 18:00+02', 1, 'Hermanus / Hemel-en-Aarde Valley', '', '', 0, 0, 'grand-tasting', true, 'https://www.hemelenaardewines.com/'),
  ('Swartland Revolution', 'swartland-revolution-2026', 'Iconic independent/artisan Swartland wine movement. After a ~10-year hiatus the revival edition returned in 2025; celebrates bold Swartland reds and old-vine Chenin.', '2026-11-07 10:00+02', '2026-11-07 22:00+02', 11, 'Riebeek-Kasteel / Paardeberg', '', 'Quicket', 450, 750, 'grand-tasting', true, 'https://swartlandwineandolives.co.za/'),
  ('Robertson Wacky Wine Weekend', 'wacky-wine-weekend-2026', 'Massive valley-wide open-cellars weekend in the Robertson Wine Valley. 40+ wineries, hop-between-estates format.', '2026-06-04 09:00+02', '2026-06-07 17:00+02', 6, 'Robertson / Breede River Valley', '', 'Webtickets', 250, 500, 'open-cellars', true, 'https://robertsonwinevalley.com/'),
  ('Robertson Sip & Savour at the River', 'sip-and-savour-river-2026', 'Riverside tasting at Viljoensdrift; free shuttle between wineries. Rebranded from "Wine on the River".', '2026-10-25 10:00+02', '2026-10-26 17:00+02', 10, 'Viljoensdrift, Robertson', '', 'Webtickets', 250, 450, 'hop-between', true, 'https://robertsonwinevalley.com/'),
  ('Franschhoek Bastille Festival', 'franschhoek-bastille-2026', 'French-themed food & wine weekend for Bastille Day. Cheese & wine pairings across Franschhoek estates.', '2026-07-11 10:00+02', '2026-07-12 18:00+02', 7, 'Franschhoek village', '', 'Webtickets', 350, 600, 'hop-between', true, 'https://franschhoek.org.za/'),
  ('Franschhoek Cap Classique & Champagne Festival', 'cap-classique-sunday-2026', 'Franschhoek''s flagship bubbly festival — "Cap Classique Sunday". MCC + Champagne at the Huguenot Monument.', '2026-11-29 11:00+02', '2026-11-30 18:00+02', 11, 'Huguenot Monument, Franschhoek', '', 'Webtickets', 450, 750, 'grand-tasting', true, 'https://franschhoekcapclassique.co.za/'),
  ('TOPS at SPAR Wine Show', 'tops-at-spar-wine-show-2026', 'Multi-city consumer walk-around tasting tour. 200+ wines, all-inclusive tasting glass. Visits Cape Town, Joburg, Pretoria, Durban, Gqeberha.', '2026-07-17 17:00+02', '2026-07-18 21:00+02', 7, 'Multi-city tour', '', 'Quicket', 200, 350, 'grand-tasting', true, 'https://www.topsatspar.co.za/'),
  ('Hermanus Wine & Food Festival', 'hermanus-wine-festival-2026', 'Walker Bay & Hemel-en-Aarde producers. Local-wine showcase in Sandbaai.', '2026-08-06 11:00+02', '2026-08-08 18:00+02', 8, 'Sandbaai (Curro grounds), Hermanus', '', 'Quicket', 250, 450, 'grand-tasting', true, 'https://www.hermanus-festivals.com/wine--food-festival.html'),
  ('Klein Karoo Klassique', 'klein-karoo-klassique-2026', 'Classical music + art + food & wine winter festival in Oudtshoorn.', '2026-08-07 10:00+02', '2026-08-09 18:00+02', 8, 'Oudtshoorn', '', 'Webtickets', 200, 500, 'grand-tasting', true, 'https://www.klassique.co.za/'),
  ('Franschhoek Cap Classique Safari', 'cap-classique-safari-2026', 'MCC / Cap Classique focus, hop-between-estates format across Franschhoek.', '2026-08-29 10:00+02', '2026-08-30 17:00+02', 8, 'Franschhoek estates', '', 'Webtickets', 350, 550, 'hop-between', true, 'https://franschhoek.org.za/'),
  ('Swartland Olive & Wine Festival', 'swartland-olive-festival-2026', 'SA''s largest olive festival — olive oil + local Swartland wines. Returns after a 6-year hiatus.', '2026-09-25 10:00+02', '2026-09-27 17:00+02', 9, 'Riebeek-Kasteel Town Square', '', 'Webtickets', 350, 750, 'grand-tasting', true, 'https://swartlandtourism.co.za/'),
  ('Breedekloof Outdoor & Wine Festival', 'breedekloof-festival-2026', 'Wine + outdoor/adventure activities; family-friendly in the Breedekloof Wine Valley.', '2026-10-09 09:00+02', '2026-10-11 17:00+02', 10, 'Rawsonville / Breedekloof', '', 'Quicket', 200, 400, 'open-cellars', true, 'https://www.breedekloof.com/'),
  ('Cape Wine', 'cape-wine-2026', 'WOSA''s flagship international trade-only exhibition for the SA wine industry. Triennial (next consumer edition 2028).', null, null, 9, 'CTICC, Cape Town', '', '', 0, 0, 'trade-show', true, 'https://capewine2025.com/')
on conflict (slug) do nothing;

-- Link Wine Town + Stellenbosch Wine Festival to participating estates (the 60 from winetown.wineroute.co.za)
insert into event_estates (event_id, estate_id)
  select ev.id, e.id from events ev, estates e
  where ev.slug = 'wine-town-stellenbosch-2026'
    and e.slug in ('kanonkop','meerlust','rustenberg','rust-en-vrede','warwick','simonsig','ken-forrester','raats','waterford-estate','muratie','delheim','neethlingshof','spier','hartenberg','overgaauw','boschendal','babylonstoren','delaire-graff','thelema','tokara','jordan')
on conflict do nothing;

-- ═══ Vintage reports (drought/rainfall context) ═════════════════════════════
insert into vintage_reports (year, quality_note, weather_summary, harvest_tonnes, is_recommended) values
  (2015, 'exceptional', 'Hot dry summer but good soil-water reserves prevented stress; balanced, concentrated wines. Often cited as one of SA''s best modern vintages.', null, true),
  (2016, 'challenging', 'Multi-year drought tightened; smaller crop, water stress in some regions.', null, false),
  (2017, 'strong', 'Dry/drought year, small crop, but high quality: cool ripening + absence of rain during harvest delivered healthy, concentrated grapes. A direct competitor to 2015 for vintage of the decade.', 1180000.0, true),
  (2018, 'drought peak', 'Drought''s peak; yields 15% below 2017, but hot conditions again concentrated flavours. Small volume, good-to-very-good quality.', null, false),
  (2019, 'recovery', 'Recovery year; good quality across regions.', null, true),
  (2020, 'exceptional', 'Hailed as "great season, remarkable wines" (WOSA). Strong across reds and whites.', null, true),
  (2021, 'exceptional', 'Increasingly regarded as an exceptional cool, balanced vintage for whites and Pinot Noir.', null, true),
  (2022, 'strong', 'Strong vintage with good balance.', null, true),
  (2023, 'strong', 'Cooler vintage; slow ripening delivered top quality (~1.18m tonnes).', 1180000.0, true),
  (2024, 'small but good', 'Small crop (1.099m t, -7% YoY) due to residual drought and heat; quality good but tight supply.', 1099051.0, false)
on conflict (year) do nothing;
