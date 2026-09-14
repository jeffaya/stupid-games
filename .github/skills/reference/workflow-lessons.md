# Iteration rules, delivery workflow, architecture and reusable lessons

## Iteration rules

### Source of truth
Once the user validates a version, it becomes the new base.

Every subsequent change starts from that exact base.

### Minimal changes
When one thing is requested:
- change only that thing,
- preserve gameplay,
- preserve approved assets,
- preserve approved layout.

Do not silently reintroduce ideas from older branches.

### Failed experiments
If an experiment is rejected:
- discard it completely,
- return to the last approved base,
- do not leave fragments of rejected CSS or JS.

### Verification after changes
Always verify:
1. JavaScript syntax,
2. local file references,
3. intro/start interaction,
4. core mechanic,
5. game over,
6. restart,
7. mobile viewport,
8. favicon/icon URLs,
9. manifest availability,
10. Apple home-screen icon declaration,
11. Android shortcut/install icon,
12. canonical/OG metadata,
13. sitemap/robots when the release URL changed.

## Delivery workflow

During iteration:
- if only code changed, send only the modified file when requested;
- if assets changed, send the required assets;
- when asked for deployment, send a complete ZIP.

Do not make the user reconstruct dependencies manually.

## Default technical architecture

Unless the game specifically needs otherwise:
- HTML5
- CSS
- vanilla JavaScript
- Canvas 2D
- static hosting
- no framework
- no build step
- no unnecessary dependency

External libraries may use a CDN when they materially help, but avoid libraries for things easily handled natively.

The game should keep working even if analytics or optional third-party scripts fail.

## Reusable lessons from Planet Defender

Use these as defaults for future Stupid Games titles:
- core-mechanic intros can work better than a Play button,
- swipe/touch interactions must feel immediate,
- stable sprite identity avoids flicker,
- movement trails are not automatically better,
- subtle effects often outperform permanent glow,
- powers should be few and meaningful,
- bosses benefit from special rules,
- persistent visual damage can increase impact,
- native sharing must avoid duplicate URLs,
- simple home screens outperform busy menus,
- mobile browser quirks must be handled explicitly,
- external WebP assets outperform duplicated base64 data,
- CSS-only decorative backgrounds can be extremely efficient,
- approved branches must never be accidentally merged with rejected ones.

## Reusable lessons from Stupid Games portal / mobile shortcuts

Use these as defaults for future Stupid Games releases:
- a single SVG favicon is not sufficient for reliable mobile shortcut icons,
- always ship a 180×180 Apple touch icon for iPhone/iPad,
- always ship 192×192 and 512×512 PNG launcher icons,
- keep a legacy `.ico` fallback,
- explicitly declare all icon relationships in `<head>`,
- keep `manifest.webmanifest` in the deployment package,
- include `id`, `scope`, `start_url`, standalone display mode and maskable icon coverage in the manifest,
- missing manifest/icon files may cause Android/Chrome to show a generated initial instead of the intended icon,
- service workers must remain separate files and should not aggressively cache frequently updated game HTML,
- after icon changes, test by deleting and recreating old shortcuts because launchers cache icons,
- SEO/social metadata is part of the release, not a later cleanup task,
- every released game must update the portal catalog and structured data without changing the approved portal card design.
