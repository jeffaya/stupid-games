# Visual direction, mobile-first and performance

## Visual direction

Gameplay quality must match the promotional artwork.

Use:
- strong silhouettes,
- coherent asset style,
- restrained glow,
- readable contrast,
- short impactful feedback,
- subtle ambient animation.

Do not overload the screen with effects that compete with gameplay.

### Decorative backgrounds
Prefer lightweight CSS when practical.

For stars/space:
- use separate CSS layers,
- use pseudo-random explicit star positions,
- vary sizes and opacity,
- avoid repeating/tiled patterns,
- animate mostly opacity for subtle twinkling,
- keep the game canvas transparent above the background.

Avoid hundreds of animated DOM nodes.

## Mobile first

Every game should work first on:
- iPhone,
- iPad,
- Android phones,
- Android tablets.

Desktop comes afterward.

Required defaults:
- viewport-fit=cover,
- safe-area support,
- 100dvh,
- no accidental scroll,
- no pinch zoom during gameplay,
- no double-tap zoom,
- no selection during gestures,
- touch-action:none on gameplay surfaces,
- portrait and landscape resilience,
- thumb-reachable controls.

Prefer Pointer Events so mouse and touch can share logic.

## Performance

Performance is a feature.

### Images
Prefer:
- WebP for gameplay assets,
- right-sized images,
- transparent WebP when needed,
- external cacheable files.

Avoid:
- oversized PNGs,
- production base64 image duplication,
- shipping the same asset twice.

Useful targets:
- logo under ~150 KB when realistic,
- common sprite under ~50 KB when realistic,
- whole mini-game ideally around 1–3 MB or less.

### Rendering
Prefer:
- one canvas,
- requestAnimationFrame,
- lightweight particles,
- simple gradients,
- stable sprite identity.

Avoid:
- per-frame DOM creation,
- layout thrashing,
- huge blur effects everywhere,
- unnecessary shadows on every object.

### Animation
Prefer transform, opacity, and canvas properties.

Avoid expensive filters on large moving elements.
