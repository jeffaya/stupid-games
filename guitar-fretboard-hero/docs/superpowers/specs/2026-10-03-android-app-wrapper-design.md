# Fretboard Hero — Android app wrapper (Capacitor) — Design

## Context

Fretboard Hero is a static HTML/CSS/JS web app (guitar, bass-4, ukulele, guitar-12
instrument profiles, single shared engine, selected via `site.config.json`). It is
already deployed as a PWA (manifest, service worker, icons).

The goal is to turn it into installable Android apps for manual testing (APK,
`adb install` / sideload), without rewriting any engine code, and without disturbing
the existing web deployment workflow (`deploy-latest-version.ps1`, which wipes and
recreates `guitar-fretboard-hero/` on every web update).

iOS is explicitly deferred: it requires Xcode/macOS, unavailable on the current
Windows machine. The iOS native project folder is scaffolded by Capacitor for
later use, but not built or tested as part of this work.

## Goals

- Reuse the existing Practice / Map / Circle of Fifths / Quiz engine unmodified.
- Produce installable Android APKs for **3 separate apps**: Guitar Fretboard Hero,
  Bass Fretboard Hero, Ukulele Fretboard Hero — each installable side-by-side on
  the same device.
- `guitar-12` is explicitly out of scope for its own app (shares the "Guitar
  Fretboard Hero" product identity per the existing README, and is not yet
  production-complete per the existing instrument-profile status notes).
- 100% offline: all web assets bundled into the APK, no network dependency to play.
- Native polish: proper launcher icon, splash screen, dark-theme-matching status
  bar, Android Back button mapped to in-app navigation (not an abrupt app kill),
  no parasitic pinch-zoom/overscroll.
- Never conflict with the existing web deployment flow.

## Non-goals (this iteration)

- Google Play Store publication (no AAB, no release signing, no store listing).
- iOS build/test (folder scaffolded only).
- Distinct per-instrument icons (placeholder: all 3 apps ship the existing generic
  icon set for now; distinct icons to be supplied and swapped in later).

## Architecture

A new, independent top-level folder is added to the repo, isolated from the
existing web deployment:

```
stupid-games/
├── guitar-fretboard-hero/             (existing web app — untouched)
└── guitar-fretboard-hero-app/         (new — Capacitor mobile wrapper)
    ├── instruments.json               (per-instrument appId / display name)
    ├── capacitor.config.json          (regenerated per build from instruments.json)
    ├── package.json
    ├── www/                           (generated — synced copy, never hand-edited)
    ├── android/                       (single native Android project, reconfigured per build)
    ├── ios/                           (scaffolded, not built this iteration)
    └── build-instrument.ps1           (-Instrument guitar|bass-4|ukulele)
```

`guitar-fretboard-hero-app/` is never touched by `deploy-latest-version.ps1`.

This spec itself lives under `guitar-fretboard-hero/docs/` (inside the web
folder, at explicit user request, rather than in the separate app wrapper
folder). Since `deploy-latest-version.ps1` normally wipes the entire
`guitar-fretboard-hero/` subfolder on every web deployment, the script was
updated to preserve a `docs/` allow-list entry (`$PreserveNames`) so this and
future docs survive web redeployments untouched.

### Why a single native Android project instead of 3

Keeping one `android/` project and reconfiguring it per build (appId, display
name, `www/` content) avoids maintaining 3 duplicate native projects. This
mirrors the existing web philosophy: "same package, only the config changes."
The trade-off is that only one instrument's APK can be actively built/installed
from a single `android/` checkout state at a time — this is acceptable since
builds are run one at a time via `build-instrument.ps1`.

### `instruments.json`

```json
{
  "guitar":  { "appId": "com.guitar.fretboardhero",  "name": "Guitar Fretboard Hero" },
  "bass-4":  { "appId": "com.bass.fretboardhero",    "name": "Bass Fretboard Hero" },
  "ukulele": { "appId": "com.ukulele.fretboardhero", "name": "Ukulele Fretboard Hero" }
}
```

## Build flow — `build-instrument.ps1 -Instrument <guitar|bass-4|ukulele>`

1. Copy `guitar-fretboard-hero/` → `guitar-fretboard-hero-app/www/` (fresh copy
   each time; `www/` is always disposable/regenerated, never a source of truth).
2. Overwrite `www/site.config.json` with `{ "instrument": "<chosen>" }`.
3. Look up the chosen instrument in `instruments.json`; update
   `capacitor.config.json` (`appId`, `appName`) accordingly.
4. Regenerate launcher icon/splash assets via `@capacitor/assets` from the
   existing generic `icon-512.png` / `icon-maskable-512.png` (same source for
   all 3 instruments in this iteration — see Non-goals).
5. `npx cap sync android` (copies `www/` into the native project, applies
   config changes).
6. `./gradlew assembleDebug` inside `android/` → produces a debug APK, renamed/
   copied out as `fretboard-hero-<instrument>-debug.apk`.

Output is an **unsigned debug APK** (no release signing — out of scope per
Non-goals). Installable directly via `adb install` or by copying the file to
the device and opening it (with "install unknown apps" allowed).

## Native polish details

- **Icon**: generated from existing `icon-512.png` / `icon-maskable-512.png` via
  `@capacitor/assets` for all required Android densities.
- **Splash screen**: dark background matching the app's existing dark theme
  (`styles.css`), centered logo, short duration (~300–500ms), via
  `@capacitor/splash-screen`.
- **Status bar**: dark background, light icons, via `@capacitor/status-bar`.
- **Android Back button**: intercepted via `@capacitor/app`'s `backButton`
  event; navigates the in-app history/back stack (e.g. Quiz → Home) instead of
  immediately killing the app; only exits the app from the Home screen.
- **Zoom/scroll**: pinch-zoom and overscroll bounce disabled at the Capacitor/
  WebView config level; existing viewport meta tag reviewed and adjusted if
  needed to prevent double-handling.
- **Offline**: no code change needed — all assets are bundled into `www/` and
  therefore into the APK; no network call is required to use any mode
  (Practice / Map / Circle / Quiz).

## Environment / tooling prerequisites

- Node.js and JDK 21 are already installed on this machine.
- **Android Studio must be installed** (provides Android SDK, Gradle wrapper
  support, AVD emulator manager) — not present at design time.
- Testing:
  - **Physical device**: USB debugging enabled on the Android phone, cable
    connection, `adb install <apk>`.
  - **Emulator**: an Android Virtual Device (AVD) created via Android Studio's
    AVD Manager (e.g. Pixel profile), used when no physical device is handy.
  - Both methods are set up, per explicit decision.

## Testing / validation plan

- Verify each of the 3 APKs installs and launches independently and
  side-by-side on the same device/emulator (distinct package IDs).
- Manually walk through Practice, Fretboard Map, Circle of Fifths and Quiz in
  the wrapped app for at least the `guitar` build, confirming no regression
  versus the web version.
- Confirm offline behavior: enable airplane mode, confirm the app still works
  fully.
- Confirm Android Back button behaves as in-app navigation, not an immediate
  app kill, from at least one non-Home screen.
- Confirm status bar / splash screen render with the dark theme, no visual
  flash of unstyled content.

## Open items deferred to a later iteration

- Distinct per-instrument app icons (placeholder generic icon used for now).
- iOS build and test (Mac or macOS CI required).
- Google Play Store publication (AAB, release signing, store listing).
- `guitar-12` as its own installable app (currently shares the Guitar identity
  and is not production-complete).
