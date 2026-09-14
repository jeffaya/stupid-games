# Gameplay design: feedback, difficulty, powers, interface, footer, end-game loop, audio

## Gameplay feedback

Every important action should produce feedback.

Possible tools:
- scale pulse,
- particles,
- screen shake,
- sound,
- score popup,
- impact mark,
- flash,
- combo text.

Use stronger feedback for:
- level complete,
- boss hit,
- power activation,
- game over,
- victory.

Keep effects brief and readable.

## Difficulty and progression

The first level should demonstrate the fun quickly.

Increase difficulty through:
- speed,
- spawn rate,
- enemy combinations,
- enemy health,
- special behavior,
- boss mechanics.

Do not only increase enemy count.

Boss levels should feel structurally different, not just numerically harder.

## Powers and secondary mechanics

A power should:
- be immediately understandable,
- have a clear unlock or cost,
- feel meaningfully stronger than normal play,
- not replace the core mechanic.

Do not add powers merely because there is space in the UI.

Unavailable powers should be visibly unavailable.

Boss-specific rules may disable powers when that improves the confrontation.

## Interface

HUD priority:
1. health/survival,
2. mission,
3. score,
4. level,
5. multiplier,
6. powers.

The HUD must stay peripheral and not consume the play area.

Remove controls that duplicate another action.

Pause, restart, back, and home should exist only when genuinely useful.

## Home-screen ecosystem footer

Every game homepage should include a very lightweight footer/link that makes the Stupid Games ecosystem visible without cluttering the hero.

Default intent:
- subtle,
- peripheral,
- immediately understandable,
- available before starting the game.

Recommended copy:
- `Voir les autres jeux`
- or `Découvrir les autres Stupid Games`

Default destination:
`https://stupid-games.seignemorte.com/`

Rules:
- place it at the bottom of the home/intro screen,
- keep it visually secondary to the game title and start interaction,
- do not turn it into a large CTA,
- it must not overlap mobile safe areas,
- it should remain usable in portrait and landscape,
- use a normal HTTPS link,
- do not show it during active gameplay unless the game design explicitly calls for it.

Purpose:
the player should understand from the very first screen that this game belongs to a larger collection and can switch games immediately.

## End-of-game conversion loop

Every completed run — win or loss — should end with a clear modal that closes the loop without feeling like an ad.

Default end-game actions:
1. **Share my score** — use native Web Share when available; fallback to clipboard.
2. **Replay** — one-tap restart with no unnecessary navigation.
3. **See my other games** — link to the Stupid Games portal.
4. **Buy Me a Coffee** — link to the dedicated support section/page on the Stupid Games portal.

The portal URL is the canonical ecosystem destination for cross-promotion between games.

Current portal defaults:
- Stupid Games: `https://stupid-games.seignemorte.com/`
- Buy Me a Coffee: `https://ko-fi.com/jeffseignemorte`

Rules:
- keep sharing as the primary CTA,
- replay must remain immediately accessible,
- portal/support CTAs must be visually secondary,
- use normal HTTPS links so they work on iOS, Android and desktop,
- avoid intrusive popups before the game is over,
- never interrupt an active run with monetization,
- if the portal URL or support anchor changes, update the skill and all new games.

The end-game modal is part of the product loop:
**play → score → share → replay / discover another game → optionally support the project**.

## Audio

Audio is optional initially.

If added:
- keep clips short,
- avoid latency,
- preload only important sounds,
- provide mute,
- never block startup if audio fails,
- respect mobile autoplay restrictions.
