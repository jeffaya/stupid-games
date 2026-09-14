# PWA, icons, shortcuts and deployment

A production package should contain at minimum:
- `index.html`
- `manifest.webmanifest`
- `favicon.svg`
- `favicon.ico`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `sw.js` when installable-PWA behavior is wanted
- social preview image such as `og.jpg`
- all local game assets

## Mandatory icon coverage

Do not rely on a single favicon. Browser tabs, bookmarks, iPad/iPhone home-screen shortcuts and Android launchers do not all use the same source.

For every released game and for the Stupid Games portal, provide the following by default:

- `favicon.svg`
  - modern browser favicon,
  - lightweight,
  - should use the approved game/brand identity.

- `favicon.ico`
  - compatibility fallback,
  - ideally containing 16×16, 32×32 and 48×48 sizes.

- `apple-touch-icon.png`
  - PNG,
  - 180×180,
  - required for a reliable iPhone/iPad home-screen icon,
  - never assume Safari/iPadOS will derive a good icon from the SVG favicon.

- `icon-192.png`
  - PNG,
  - 192×192,
  - Android/PWA icon.

- `icon-512.png`
  - PNG,
  - 512×512,
  - Android/PWA install icon and high-resolution launcher source.

All icon variants must represent the same approved visual identity.

Never ship only a letter fallback such as the first letter of the site title when a real icon exists.

## Required HTML icon/mobile declarations

Include explicit declarations in `<head>` rather than relying on browser inference:

```html
<meta name="theme-color" content="#000000">
<meta name="application-name" content="GAME NAME">
<meta name="mobile-web-app-capable" content="yes">

<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="GAME NAME">
<meta name="apple-mobile-web-app-status-bar-style" content="black">

<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
```

Use the real production path when the game lives in a subdirectory. Do not blindly use `/icon-192.png` if that would resolve to the portal root instead of the game directory.

## Web app manifest

Use `manifest.webmanifest` by default.

It should contain at least:
- `name`
- `short_name`
- `id`
- `start_url`
- `scope`
- `display: "standalone"`
- `background_color`
- `theme_color`
- 192×192 icon
- 512×512 icon

For the 192 and 512 icons, include separate `purpose` coverage for:
- `any`
- `maskable`

Example:

```json
{
  "name": "GAME NAME",
  "short_name": "GAME NAME",
  "id": "./",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {"src":"icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},
    {"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},
    {"src":"icon-192.png","sizes":"192x192","type":"image/png","purpose":"maskable"},
    {"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}
  ]
}
```

When a game is hosted below `/games/<slug>/`, use relative manifest paths or correct absolute paths so install/shortcut behavior remains scoped to that game.

## Service worker

A service worker must be a separate JavaScript resource. It cannot be replaced by an inline `<script>` in `index.html`.

If installable PWA behavior is required, ship `sw.js` and register it from `index.html`.

For Stupid Games, prefer a minimal network-first/no-cache service worker unless offline behavior is intentionally designed. Do not let an aggressive cache hide fresh deployments.

Example minimal behavior:

```js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
```

Registration:

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(console.error);
    });
  }
</script>
```

Important:
- shortcut/home-screen icons do not depend solely on the service worker,
- if Chrome still shows a generated initial/letter icon, first verify manifest and icon URLs,
- missing `manifest.webmanifest` can make Chrome fall back to a generated letter icon,
- after replacing icons, old Android/iOS launchers may cache the previous icon; delete the old shortcut/app and recreate it for validation.

## Shortcut/install verification

Before release, test all of these:
1. browser tab favicon on desktop,
2. browser tab/favicon on Android,
3. “Create shortcut / Add to Home screen” on Chrome Android,
4. install prompt when applicable,
5. iPhone/iPad “Add to Home Screen” icon,
6. app name shown under the icon,
7. standalone launch uses the expected start URL/scope,
8. no fallback initial/letter icon appears.

Verify the icon URLs directly over HTTPS:
- `favicon.ico`
- `favicon.svg`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `manifest.webmanifest`
- `sw.js` if used

A complete deployment package must include every file referenced by `index.html` and the manifest.
