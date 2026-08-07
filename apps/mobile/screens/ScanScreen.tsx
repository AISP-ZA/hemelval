/**
 * Scan — photo label, barcode camera, and QR camera recognition.
 *
 * Three real capture paths:
 *  1. PHOTO LABEL  — gallery picker → Gemini Vision edge function → structured extraction → DB match
 *                    (fallback: client-side Tesseract.js OCR → fuzzy match)
 *  2. BARCODE      — live camera scan via react-zxing (ZXing WASM) → DB lookup
 *                    (fallback: manual text entry)
 *  3. QR CODE      — live camera scan via react-zxing → URL decode → wine/estate lookup
 *
 * On match: routes to the tasting-note flow.
 *
 * Scanning stack:
 *  - Label: Gemini 2.0 Flash multimodal vision (structured JSON extraction)
 *  - Barcode/QR: ZXing compiled to WebAssembly (react-zxing), client-side, zero cost
 *  - DB: live Supabase wines table with fuzzy name/estate matching
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Image, Text, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Card, Button, Chip, Divider } from '../components/index.js';
import { BarcodeScanner } from '../components/BarcodeScanner.js';
import { CameraIcon, BarcodeIcon, QrIcon } from '../components/ScanIcons.js';
import { color, font, space, radius } from '../theme/tokens.js';
import { MOCK_WINES, type MockWine } from '../lib/mockData.js';
import { isSupabaseConfigured } from '../lib/supabase.js';
import { useAuth } from '../hooks/useAuth.js';
import { TastingNoteScreen } from './TastingNoteScreen.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ScanMode = 'photo' | 'barcode' | 'qr';
type ScanState = 'idle' | 'capturing' | 'processing' | 'matched' | 'nomatch';

interface WineAlternative {
  slug: string;
  name: string;
  estateName: string;
}

const DAILY_SCAN_LIMIT = 10;
const SCAN_COUNT_KEY = 'decanta.scanCount';

export function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const isPro = profile.isPro;
  const [mode, setMode] = useState<ScanMode | null>(null);
  const [state, setState] = useState<ScanState>('idle');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [matched, setMatched] = useState<MockWine | null>(null);
  const [alternatives, setAlternatives] = useState<WineAlternative[]>([]);
  const [tasting, setTasting] = useState<MockWine | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [extractedInfo, setExtractedInfo] = useState<string>('');
  const [scanCount, setScanCount] = useState(0);
  const [showScanLimit, setShowScanLimit] = useState(false);

  // Load today's scan count
  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const stored = await AsyncStorage.getItem(SCAN_COUNT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === today) {
          setScanCount(parsed.count);
        } else {
          // New day — reset
          await AsyncStorage.setItem(SCAN_COUNT_KEY, JSON.stringify({ date: today, count: 0 }));
        }
      }
    })();
  }, []);

  function incrementScanCount() {
    if (isPro) return; // Pro = unlimited
    const today = new Date().toISOString().slice(0, 10);
    const newCount = scanCount + 1;
    setScanCount(newCount);
    AsyncStorage.setItem(SCAN_COUNT_KEY, JSON.stringify({ date: today, count: newCount }));
  }

  // ── PHOTO LABEL PATH ──
  async function capturePhoto() {
    if (!isPro && scanCount >= DAILY_SCAN_LIMIT) {
      setShowScanLimit(true);
      return;
    }
    incrementScanCount();
    setState('capturing');
    try {
      const ImagePicker = await import('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.7,
      });
      if (result.canceled || !result.assets?.length) {
        setState('idle');
        return;
      }
      const asset = result.assets[0];
      setCapturedUri(asset.uri);
      setState('processing');

      // Compress before sending to API
      let compressedUri = asset.uri;
      try {
        const ImageManipulator = await import('expo-image-manipulator');
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 1024 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG },
        );
        compressedUri = manipulated.uri;
      } catch { /* compression optional */ }

      // Convert to base64
      const base64 = await imageToBase64(compressedUri);
      if (base64) {
        // Primary path: Gemini Vision edge function (structured extraction)
        const result = await callGeminiEdgeFunction(base64);
        if (result.match) {
          setExtractedInfo(result.extractedText);
          setMatched(result.match);
          setAlternatives(result.alternatives);
          setState('matched');
          return;
        } else if (result.extractedText) {
          // Gemini extracted data but no DB match — keep alternatives for "did you mean?"
          setExtractedInfo(result.extractedText);
          setOcrText(`Detected: ${result.extractedText}`);
          setAlternatives(result.alternatives);
          setState('nomatch');
          return;
        }

        // Fallback: client-side Tesseract.js OCR
        const tesseractText = await runTesseractOCR(compressedUri);
        if (tesseractText && tesseractText.length > 5) {
          const match = await fuzzyMatchWine(tesseractText);
          if (match) {
            setOcrText(`Label text: ${tesseractText.slice(0, 200)}`);
            setMatched(match);
            setState('matched');
            return;
          } else {
            setOcrText(`Label text: ${tesseractText.slice(0, 200)}`);
            setState('nomatch');
            return;
          }
        }
      }

      // No match found — honest "couldn't read" state (never fabricate a random wine)
      setOcrText(extractedInfo || ocrText || '');
      setState('nomatch');
    } catch (err) {
      // Error — honest failure, not a simulated match
      setOcrText('');
      setState('nomatch');
    }
  }

  // ── BARCODE PATH: camera scan or manual entry → DB lookup ──
  async function lookupBarcode(code: string) {
    setState('processing');
    try {
      const match = await lookupWineByBarcode(code);
      if (match) {
        setMatched(match);
        setState('matched');
      } else {
        setState('nomatch');
      }
    } catch {
      setState('nomatch');
    }
  }

  // ── QR PATH: camera scan → decode URL → wine/estate lookup ──
  async function handleQrScanned(qrText: string) {
    setState('processing');
    try {
      // Extract slug from QR URL patterns:
      // decanta.co.za/w/:slug  or  decanta.co.za/e/:slug  or  raw slug
      const wineMatch = qrText.match(/\/w\/([a-z0-9-]+)/i);
      const estateMatch = qrText.match(/\/e\/([a-z0-9-]+)/i);
      const slug = wineMatch?.[1] || estateMatch?.[1] || (qrText.match(/^[a-z0-9-]+$/i)?.[0]);

      if (!slug) {
        setState('nomatch');
        return;
      }

      // Try wine lookup first, then estate
      const wine = await lookupWineBySlug(slug);
      if (wine) {
        setMatched(wine);
        setState('matched');
        return;
      }

      // If it was an estate QR, try finding the estate's wines
      const estateWine = await lookupWineByEstateSlug(slug);
      if (estateWine) {
        setMatched(estateWine);
        setState('matched');
        return;
      }

      setState('nomatch');
    } catch {
      setState('nomatch');
    }
  }

  // ── Client-side OCR via Tesseract.js (fallback) ──
  async function runTesseractOCR(uri: string): Promise<string | null> {
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(uri);
      await worker.terminate();
      return text?.trim() || null;
    } catch {
      return null;
    }
  }

  // ── Gemini Vision edge function call ──
  async function callGeminiEdgeFunction(base64Image: string): Promise<{
    extractedText: string;
    match: MockWine | null;
    alternatives: WineAlternative[];
  }> {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) return { extractedText: '', match: null, alternatives: [] };

      const res = await fetch(`${supabaseUrl}/functions/v1/ocr-wine-label`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ image: base64Image }),
      });
      if (!res.ok) {
        // Surface the failure so the user knows why we fell back to Tesseract/OCR.
        // (A 503 = GOOGLE_API_KEY not set on the edge function; 502 = Gemini API error.)
        console.warn('[scan] edge function returned', res.status);
        return { extractedText: '', match: null, alternatives: [] };
      }
      const data = await res.json();

      // Build extracted text from Gemini's structured output
      const ex = data.extracted || {};
      const parts = [ex.producer, ex.wine_name, ex.vintage, ex.varietal, ex.region]
        .filter(Boolean).join(' · ');

      // Map match to MockWine shape
      if (data.match) {
        const m = data.match;
        return {
          extractedText: parts || m.name,
          match: {
            id: m.id, slug: m.slug, name: m.name, estateId: '', estateName: m.estateName ?? '',
            type: m.type ?? 'red', varietals: [], region: ex.region ?? '',
            avgStars: m.avgStars ?? 0, ratingCount: m.ratingCount ?? 0,
            about: m.about ?? '', pairings: [], serving: '', year: ex.vintage ? Number(ex.vintage) : 0,
          },
          alternatives: Array.isArray(data.alternatives) ? data.alternatives : [],
        };
      }

      return {
        extractedText: parts,
        match: null,
        alternatives: Array.isArray(data.alternatives) ? data.alternatives : [],
      };
    } catch {
      return { extractedText: '', match: null, alternatives: [] };
    }
  }

  // ── Fuzzy match Tesseract OCR text against live DB ──
  async function fuzzyMatchWine(ocrText: string): Promise<MockWine | null> {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) return null;

      const lines = ocrText.split('\n').filter((l: string) => l.trim().length > 2);
      for (const line of lines.slice(0, 8)) {
        const clean = line.trim();
        if (clean.length < 3) continue;
        const res = await fetch(
          `${supabaseUrl}/rest/v1/wines?select=id,slug,name,type,avg_stars,rating_count,about,estates!inner(name)&name=ilike.%${encodeURIComponent(clean)}%&limit=1`,
          { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const w = data[0];
          return {
            id: w.id, slug: w.slug, name: w.name, estateId: '', estateName: w.estates?.name ?? '',
            type: w.type ?? 'red', varietals: [], region: '',
            avgStars: Number(w.avg_stars) || 0, ratingCount: w.rating_count || 0,
            about: w.about ?? '', pairings: [], serving: '', year: 0,
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // ── DB lookups for barcode/QR ──
  async function lookupWineByBarcode(barcode: string): Promise<MockWine | null> {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) {
        // Fallback to mock data
        return MOCK_WINES.find((w) => w.barcode === barcode.trim()) ?? null;
      }
      const res = await fetch(
        `${supabaseUrl}/rest/v1/wines?select=id,slug,name,type,avg_stars,rating_count,about,barcode,estates!inner(name,slug)&barcode=eq.${encodeURIComponent(barcode.trim())}&limit=1`,
        { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const w = data[0];
        return {
          id: w.id, slug: w.slug, name: w.name, estateId: '', estateName: w.estates?.name ?? '',
          type: w.type ?? 'red', varietals: [], region: '',
          avgStars: Number(w.avg_stars) || 0, ratingCount: w.rating_count || 0,
          about: w.about ?? '', pairings: [], serving: '', year: 0,
          barcode: w.barcode,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  async function lookupWineBySlug(slug: string): Promise<MockWine | null> {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) return null;
      const res = await fetch(
        `${supabaseUrl}/rest/v1/wines?select=id,slug,name,type,avg_stars,rating_count,about,estates!inner(name)&slug=eq.${encodeURIComponent(slug)}&limit=1`,
        { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const w = data[0];
        return {
          id: w.id, slug: w.slug, name: w.name, estateId: '', estateName: w.estates?.name ?? '',
          type: w.type ?? 'red', varietals: [], region: '',
          avgStars: Number(w.avg_stars) || 0, ratingCount: w.rating_count || 0,
          about: w.about ?? '', pairings: [], serving: '', year: 0,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  async function lookupWineByEstateSlug(estateSlug: string): Promise<MockWine | null> {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) return null;
      const res = await fetch(
        `${supabaseUrl}/rest/v1/wines?select=id,slug,name,type,avg_stars,rating_count,about,estates!inner(name,slug)&estates.slug=eq.${encodeURIComponent(estateSlug)}&order=avg_stars.desc&limit=1`,
        { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const w = data[0];
        return {
          id: w.id, slug: w.slug, name: w.name, estateId: '', estateName: w.estates?.name ?? '',
          type: w.type ?? 'red', varietals: [], region: '',
          avgStars: Number(w.avg_stars) || 0, ratingCount: w.rating_count || 0,
          about: w.about ?? '', pairings: [], serving: '', year: 0,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  // ── Helpers ──
  async function imageToBase64(uri: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        const res = await fetch(uri);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      return null;
    } catch {
      return null;
    }
  }

  function reset() {
    setMode(null);
    setState('idle');
    setCapturedUri(null);
    setMatched(null);
    setAlternatives([]);
    setOcrText('');
    setExtractedInfo('');
  }

  // ── Tasting flow ──
  if (tasting) {
    return <TastingNoteScreen wine={tasting} onClose={() => { setTasting(null); reset(); }} />;
  }

  // ── Match result ──
  if (state === 'matched' && matched) {
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top + 16, padding: space.xl }}>
        <Eyebrow>✓ MATCH FOUND</Eyebrow>
        <Headline size="lg" style={{ marginTop: space.sm }}>{matched.name}</Headline>
        <BodyText muted style={{ marginTop: space.xs }}>
          {matched.estateName}
          {matched.region ? ` · ${matched.region}` : ''}
          {matched.year > 0 ? ` · ${matched.year}` : ''}
        </BodyText>
        <Divider />
        {capturedUri && (
          <View style={styles.capturedWrap}>
            <Image source={{ uri: capturedUri }} style={styles.capturedImg} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Eyebrow>GEMINI DETECTED</Eyebrow>
              <BodyText size="sm" muted>{extractedInfo || ocrText}</BodyText>
            </View>
          </View>
        )}
        {matched.about && <Divider />}
        {matched.about && <BodyText>{matched.about.slice(0, 160)}{matched.about.length > 160 ? '…' : ''}</BodyText>}
        <Divider />
        <Eyebrow>IS THIS YOUR WINE?</Eyebrow>
        <BodyText muted size="sm" style={{ marginTop: space.sm }}>
          Confirm to log a tasting and refine your palate.
        </BodyText>
        <Button variant="primary" style={{ marginTop: space.lg }} onPress={() => setTasting(matched)}>
          ✓ YES — RATE & LOG
        </Button>
        <Button variant="outline" style={{ marginTop: space.md }} onPress={reset}>NO — TRY AGAIN</Button>

        {/* Did you mean? — alternative candidates from the DB match */}
        {alternatives.length > 0 && (
          <>
            <Divider style={{ marginTop: space.xl }} />
            <Eyebrow>DID YOU MEAN?</Eyebrow>
            {alternatives.map((alt) => (
              <Pressable
                key={alt.slug}
                hitSlop={6}
                onPress={async () => {
                  // Fetch the full wine record for the chosen alternative
                  const w = await lookupWineBySlug(alt.slug);
                  if (w) { setMatched(w); setAlternatives([]); }
                }}
                style={styles.altRow}
              >
                <View style={{ flex: 1 }}>
                  <BodyText size="sm">{alt.name}</BodyText>
                  <BodyText size="sm" muted>{alt.estateName}</BodyText>
                </View>
                <Text style={[font.captionMonoSm, { color: color.gold }]}>SELECT →</Text>
              </Pressable>
            ))}
          </>
        )}
      </View>
    );
  }

  // ── Scan limit reached (non-Pro) ──
  if (showScanLimit) {
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas, justifyContent: 'center', alignItems: 'center', padding: space.xl, paddingTop: insets.top + 40 }}>
        <Headline size="md" style={{ textAlign: 'center' }}>You're tasting a lot today. 🍷</Headline>
        <BodyText muted style={{ textAlign: 'center', marginTop: space.md, maxWidth: 300, lineHeight: 22 }}>
          You've used all {DAILY_SCAN_LIMIT} free scans today. Come back tomorrow, or go Pro for unlimited scans.
        </BodyText>
        <View style={{ marginTop: space.xl, backgroundColor: color.canvasCard, borderWidth: 1, borderColor: 'rgba(212,148,44,0.15)', borderRadius: radius.sm, padding: space.lg, width: '100%', maxWidth: 320 }}>
          <Text style={[font.captionMonoSm, { color: color.gold, letterSpacing: 1.5 }]}>DECANTA PRO · R89/MO</Text>
          <View style={{ marginTop: space.md, gap: space.sm }}>
            <BodyText size="sm">✓ Unlimited label & barcode scans</BodyText>
            <BodyText size="sm">✓ Advanced palate analytics</BodyText>
            <BodyText size="sm">✓ Cellar vault with ageability alerts</BodyText>
          </View>
          <Text style={[font.captionMonoSm, { color: color.bodyMid, marginTop: space.md }]}>14-day free trial · Cancel anytime</Text>
        </View>
        <Button variant="primary" style={{ marginTop: space.lg, alignSelf: 'center' }} onPress={() => setShowScanLimit(false)}>MAYBE LATER</Button>
      </View>
    );
  }

  // ── No match ──
  if (state === 'nomatch') {
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top + 16, padding: space.xl }}>
        <Eyebrow>NO MATCH FOUND</Eyebrow>
        <Headline size="md" style={{ marginTop: space.sm }}>We couldn't identify that wine.</Headline>
        {ocrText || extractedInfo ? (
          <Card style={{ marginTop: space.md }}>
            <Eyebrow>WHAT WE READ</Eyebrow>
            <BodyText size="sm" muted style={{ marginTop: space.xs }}>{ocrText || extractedInfo}</BodyText>
          </Card>
        ) : null}
        <BodyText muted size="sm" style={{ marginTop: space.md }}>
          Try a clearer photo or scan the barcode instead. For rare SA boutique wines, our database may not have it yet.
        </BodyText>
        <Button variant="primary" style={{ marginTop: space.lg }} onPress={reset}>TRY ANOTHER SCAN</Button>
        <Button variant="outline" style={{ marginTop: space.md }} onPress={() => { reset(); setMode('barcode'); }}>ENTER BARCODE</Button>
      </View>
    );
  }

  // ── Processing ──
  if (state === 'processing' || state === 'capturing') {
    return (
      <View style={[styles.centerWrap, { paddingTop: insets.top }]}>
        {capturedUri && <Image source={{ uri: capturedUri }} style={styles.processingImg} resizeMode="cover" />}
        <View style={styles.processingOverlay} />
        <ActivityIndicator size="large" color={color.gold} />
        <Headline size="md" style={{ marginTop: space.lg }}>Identifying your wine…</Headline>
        <BodyText muted size="sm" style={{ marginTop: space.xs }}>
          {mode === 'barcode' ? 'Looking up the barcode in our SA wine database' :
           mode === 'qr' ? 'Decoding the QR code' :
           'Reading the label with Gemini Vision + matching our database'}
        </BodyText>
      </View>
    );
  }

  // ── Barcode scan mode ──
  if (mode === 'barcode') {
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top + 16, padding: space.xl }}>
        <Pressable onPress={reset} hitSlop={8}>
          <Text style={[font.captionMono, { color: color.bodyMid }]}>← BACK</Text>
        </Pressable>
        <Eyebrow>SCAN BARCODE</Eyebrow>
        <Headline size="md" style={{ marginTop: space.sm }}>Point at the bottle's barcode</Headline>
        <BodyText muted size="sm" style={{ marginTop: space.md, marginBottom: space.md }}>
          Most SA wines carry a 13-digit EAN on the back label. Hold steady — it scans automatically.
        </BodyText>
        <BarcodeScanner
          onDetected={(result) => lookupBarcode(result.text)}
          onManualEntry={(text) => lookupBarcode(text)}
          manualPlaceholder="Or type the EAN-13…"
        />
      </View>
    );
  }

  // ── QR scan mode ──
  if (mode === 'qr') {
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top + 16, padding: space.xl }}>
        <Pressable onPress={reset} hitSlop={8}>
          <Text style={[font.captionMono, { color: color.bodyMid }]}>← BACK</Text>
        </Pressable>
        <Eyebrow>SCAN QR CODE</Eyebrow>
        <Headline size="md" style={{ marginTop: space.sm }}>Point at the QR code</Headline>
        <BodyText muted size="sm" style={{ marginTop: space.md, marginBottom: space.md }}>
          Some estates print QR codes on tasting menus, bottle necks, or event signage. Point and scan.
        </BodyText>
        <BarcodeScanner
          onDetected={(result) => handleQrScanned(result.text)}
          onManualEntry={(text) => handleQrScanned(text)}
          manualPlaceholder="Or paste the QR link…"
        />
      </View>
    );
  }

  // ── Main scan hub ──
  return (
    <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top + 16, padding: space.xl }}>
      <Eyebrow>SCAN // IDENTIFY ANY SA WINE</Eyebrow>
      <Headline size="xl" style={{ marginTop: space.sm }}>What did you drink?</Headline>
      <BodyText muted style={{ marginTop: space.md }}>
        Photograph the bottle, scan its barcode, or scan a QR code. Decanta identifies the wine and helps you log a proper tasting.
      </BodyText>

      <View style={{ gap: space.md, marginTop: space.xl }}>
        <Pressable onPress={capturePhoto} style={styles.optionCard} hitSlop={8}>
          <View style={styles.optionIcon}><CameraIcon size={24} color={color.gold} /></View>
          <View style={{ flex: 1 }}>
            <BodyText>Photograph the label</BodyText>
            <BodyText size="sm" muted>AI reads the label — producer, wine, vintage.</BodyText>
          </View>
          <Text style={[font.captionMonoSm, { color: color.gold }]}>BEST</Text>
        </Pressable>

        <Pressable hitSlop={8} onPress={() => { setMode('barcode'); setState('idle'); }} style={styles.optionCard}>
          <View style={styles.optionIcon}><BarcodeIcon size={24} color={color.gold} /></View>
          <View style={{ flex: 1 }}>
            <BodyText>Scan the barcode</BodyText>
            <BodyText size="sm" muted>Live camera scan of the EAN-13 code.</BodyText>
          </View>
        </Pressable>

        <Pressable hitSlop={8} onPress={() => { setMode('qr'); setState('idle'); }} style={styles.optionCard}>
          <View style={styles.optionIcon}><QrIcon size={24} color={color.gold} /></View>
          <View style={{ flex: 1 }}>
            <BodyText>Scan a QR code</BodyText>
            <BodyText size="sm" muted>Estate tasting menus, bottle neck labels, event posters.</BodyText>
          </View>
        </Pressable>
      </View>

      {!isSupabaseConfigured && (
        <BodyText size="sm" muted style={{ marginTop: space.lg }}>
          ℹ Demo mode — scanning is simulated. Production uses Gemini Vision + live camera.
        </BodyText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerWrap: { flex: 1, backgroundColor: color.canvas, justifyContent: 'center', alignItems: 'center', padding: space.xl },
  processingImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4 },
  processingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.overlayMid },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: color.canvasCard, borderWidth: 1, borderColor: color.cardBorder, borderRadius: radius.sm, padding: space.md },
  optionIcon: { width: 48, height: 48, borderRadius: 9999, backgroundColor: color.canvasSoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: color.hairline },
  capturedWrap: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  capturedImg: { width: 80, height: 100, borderRadius: radius.sm, borderWidth: 1, borderColor: color.hairline },
  altRow: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: 1, borderBottomColor: color.hairline,
  },
});
