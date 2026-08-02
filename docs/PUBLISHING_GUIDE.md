# Kelder — Publishing Guide (App Store + Google Play)

> How to get Kelder from this Mac onto real iPhones and Android devices,
> and then into the App Store and Google Play.
>
> Build system: **EAS Build** (Expo Application Services) — the industry
> standard for Expo/React Native. It compiles one TypeScript codebase into
> native iOS (`.ipa`) and Android (`.aab`/`.apk`) binaries in the cloud,
> no Xcode/Android Studio required on your machine.

## Prereqs you'll need (one-time, ~30 min)

| Account | Cost | What for |
|---|---|---|
| **Expo account** (expo.dev) | Free | EAS Build runs here |
| **Apple Developer Program** | **$99/yr** | Required to publish to App Store |
| **Google Play Console** | **$25 once** | Required to publish to Play Store |

App IDs are already configured in `app.json`:
- iOS bundle ID: `za.co.kelder.app`
- Android package: `za.co.kelder.app`

---

## Step 1 — Install & log in to EAS (5 min)

```bash
cd ~/Documents/AISP/projects/kelder/apps/mobile
npm install -g eas-cli          # the EAS command-line tool
eas login                       # create a free expo.dev account if needed
```

## Step 2 — Configure the build (10 min, one-time)

```bash
eas build:configure             # generates eas.json (build profiles)
```

This creates an `eas.json` with three profiles: `development` (for testing on your phone), `preview` (builds an installable `.apk` for Android / ad-hoc iOS), and `production` (store-ready). I'll generate this file for you in the next step.

## Step 3 — Build for your own phone first (TEST BEFORE STORE)

**Fastest path — use Expo Go (no build needed):**
```bash
npx expo start
```
- Install the free **Expo Go** app on your iPhone/Android
- Scan the QR code in the terminal (from your phone's camera)
- The app loads **live** on your device over Wi-Fi — the camera, haptics, and AsyncStorage all work for real
- This is the fastest way to test on-device; no binary, no Apple wait

**For a real standalone binary (closer to store):**
```bash
# Android .apk — installs directly on any Android phone (sideload)
eas build --platform android --profile preview

# iOS — requires an Apple Developer account; builds an ad-hoc .ipa
eas build --platform ios --profile preview
```
EAS builds in the cloud (~10–15 min) and gives you a download link. The iOS build needs your device's UDID registered to the provisioning profile.

## Step 4 — Publish to the stores

### Google Play (faster, ~1–3 day review)
```bash
eas submit --platform android --profile production
```
- First run asks for your Play Console service-account JSON (EAS walks you through it)
- Uploads the `.aab` to the Play Console internal track → you promote to production
- Fill in: store listing, screenshots, content rating, data-safety form

### Apple App Store (slower, ~1–7 day review)
```bash
eas submit --platform ios --profile production
```
- Uses App Store Connect API key (EAS walks you through)
- Uploads the `.ipa` to App Store Connect → you submit for review from the portal
- Apple will ask about **alcohol content** — answer honestly: Kelder is a *catalog/ratings* app, it does **not sell alcohol** in v1, so it falls under the reference/lifestyle category (lower friction than an actual alcohol-sales app)

## Step 5 — Store listing assets you'll need to prepare

| Asset | iOS | Android | Notes |
|---|---|---|---|
| App icon (1024×1024) | ✓ | ✓ | The Wine-glass-K design we agreed on |
| Screenshots | 6.7" + 6.5" + 5.5" | Phone + 7" tablet | I can generate these from the running app |
| App name | "Kelder" | "Kelder" | |
| Subtitle / short desc | "SA wine: scan, taste, discover" | same | |
| Description | ✍️ | ✍️ | I'll draft this — SA-focused, the two-sided story |
| Privacy policy URL | required | required | Needs a simple page (POPIA + data handling) |
| Support URL | required | — | e.g. hello@kelder.co.za |
| Category | Lifestyle / Food & Drink | Lifestyle | |
| Age rating | 17+ (frequent alcohol references) | Teen+ | Apple is stricter here |

## Costs summary

| Item | Cost | Frequency |
|---|---|---|
| Apple Developer Program | $99 (~R1,800) | per year |
| Google Play Console | $25 (~R460) | once |
| EAS Build (free tier) | $0 | 15 iOS + 15 Android builds/mo |
| EAS Build (if you exceed free) | from $59/mo | only if scaling |
|expo.dev (the runtime) | $0 | free |

**Total to launch: ~$124 (~R2,300) one-off, then $99/yr Apple renewal.**

---

## What I'll do next (when you say go)

1. Generate `eas.json` (the build profiles)
2. Draft the App Store description + privacy policy text
3. Capture the 6 store screenshots at correct sizes from the running app
4. Create the app icon asset (Wine-glass-K, gold on merlot)
5. Run `eas build --profile preview` for Android so you get an installable `.apk` to test on your phone immediately (no Apple account needed for the Android test)

The iOS store submission genuinely requires your Apple Developer login — I'll walk you through that screen-by-screen when we get there.
