#!/usr/bin/env python3
"""Fast batch-only estate insertion — no individual fallback."""
import json, os, re, urllib.request, sys

env = {}
with open('apps/mobile/.env.local') as f:
    for line in f:
        if '=' in line and not line.strip().startswith('#'):
            k, v = line.strip().split('=', 1)
            env[k] = v

SB_URL = env['EXPO_PUBLIC_SUPABASE_URL']
SB_KEY = open('/tmp/hemelval_service_key.txt').read().strip()

def fetch_existing():
    estates = []
    offset = 0
    while True:
        url = f"{SB_URL}/rest/v1/estates?select=id,slug,estate_name,region,wine_route,district,ward,founded_year,tasting_room,restaurant,famous_for,about,website_url&order=estate_name&limit=100&offset={offset}"
        req = urllib.request.Request(url, headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            batch = json.loads(resp.read())
        if not batch: break
        estates.extend(batch)
        if len(batch) < 100: break
        offset += 100
    return estates

def insert_batch(estates):
    url = f"{SB_URL}/rest/v1/estates"
    data = json.dumps(estates).encode()
    req = urllib.request.Request(url, data=data, method="POST", headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal,resolution=ignore-duplicates",
    })
    with urllib.request.urlopen(req, timeout=60) as resp:
        return True

def patch(slug, updates):
    url = f"{SB_URL}/rest/v1/estates?slug=eq.{slug}"
    data = json.dumps(updates).encode()
    req = urllib.request.Request(url, data=data, method="PATCH", headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "return=minimal",
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        return True

def slugify(name):
    s = re.sub(r'&', 'and', name.lower())
    s = re.sub(r"'", '', s)
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

def norm(name):
    return re.sub(r'[^a-z0-9]', '', name.lower())

def find_dup(r, estates):
    slug = r.get('slug') or slugify(r['name'])
    for e in estates:
        if e['slug'] == slug: return e
    t = norm(r['name'])
    for e in estates:
        ex = norm(e['estate_name'])
        if t == ex or (len(t)>5 and (t in ex or ex in t)): return e
    return None

with open('data/batch_research.json') as f:
    research = json.load(f)

existing = fetch_existing()
print(f"Existing: {len(existing)}")

# PHASE 1: Backfill
print("--- BACKFILL ---")
backfilled = 0
for r in research:
    m = find_dup(r, existing)
    if m:
        u = {}
        for field, val in [('region','region'),('wine_route','wine_route'),('district','district'),
                           ('ward','ward'),('founded_year','founded_year'),('famous_for','famous_for')]:
            if not m.get(field) and r.get(field): u[field] = r[field]
        if not m.get('tasting_room') and r.get('tasting_room'): u['tasting_room'] = True
        if not m.get('restaurant') and r.get('restaurant'): u['restaurant'] = True
        if not m.get('website_url') and r.get('website'): u['website_url'] = r['website']
        if r.get('about') and len(r.get('about','')) > len(m.get('about') or ''): u['about'] = r['about']
        if len(u) > 0:
            u['data_source'] = 'hemelval-research+batch'
            try: patch(m['slug'], u); backfilled += 1
            except: pass
print(f"Backfilled: {backfilled}")

# PHASE 2: Insert new
print("--- INSERT NEW ---")
new = []
for r in research:
    if not find_dup(r, existing + new):
        name = r['name']
        new.append({
            'name': name, 'estate_name': name,
            'slug': r.get('slug') or slugify(name),
            'region': r.get('region'), 'district': r.get('district'), 'ward': r.get('ward'),
            'wine_route': r.get('wine_route'), 'founded_year': r.get('founded_year'),
            'tasting_room': r.get('tasting_room', False), 'restaurant': r.get('restaurant', False),
            'famous_for': r.get('famous_for'), 'about': r.get('about', ''),
            'website_url': r.get('website'), 'province': 'Western Cape',
            'is_verified': False, 'currently_producing': True, 'data_source': 'batch-research',
        })

print(f"To insert: {len(new)}")
inserted = 0
for i in range(0, len(new), 50):
    batch = new[i:i+50]
    try:
        insert_batch(batch)
        inserted += len(batch)
        print(f"  Batch {i//50+1}: +{len(batch)} ({inserted} total)")
    except urllib.error.HTTPError as e:
        err = e.read().decode()[:150]
        print(f"  Batch {i//50+1} FAILED: {err}")
        # Try smaller batches
        for j in range(0, len(batch), 10):
            sub = batch[j:j+10]
            try:
                insert_batch(sub)
                inserted += len(sub)
            except: pass
print(f"Inserted: {inserted}")

# Verify
final = fetch_existing()
total = len(final)
from collections import Counter
print(f"\n{'='*60}")
print(f"FINAL: {total} estates (was 151, +{total-151})")
hr = sum(1 for e in final if e.get('region'))
hwr = sum(1 for e in final if e.get('wine_route'))
htr = sum(1 for e in final if e.get('tasting_room'))
hrest = sum(1 for e in final if e.get('restaurant'))
print(f"  region:       {hr}/{total} ({hr/total*100:.0f}%)")
print(f"  wine_route:   {hwr}/{total} ({hwr/total*100:.0f}%)")
print(f"  tasting_room: {htr}/{total} ({htr/total*100:.0f}%)")
print(f"  restaurant:   {hrest}/{total} ({hrest/total*100:.0f}%)")
print("\nRegions:")
for r, c in Counter(e.get('region') or '(NULL)' for e in final).most_common(15):
    print(f"  {c:4d}  {r}")
