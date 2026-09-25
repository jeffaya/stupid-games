# Fretboard Hero — configuration de déploiement

Le même package peut être déployé sur les différents sites. Pour changer d'instrument, modifier **uniquement** `site.config.json`.

## Valeurs disponibles

| `instrument` | Instrument | Produit chargé |
|---|---|---|
| `guitar` | Guitare 6 cordes | Guitar Fretboard Hero |
| `bass-4` | Basse 4 cordes | Bass Fretboard Hero |
| `ukulele` | Ukulélé standard G C E A | Ukulele Fretboard Hero |
| `guitar-12` | Guitare 12 cordes / 6 chœurs | 12-String Fretboard Hero |

## Exemple — guitare

```json
{
  "instrument": "guitar"
}
```

## Exemple — basse

```json
{
  "instrument": "bass-4"
}
```

## Exemple — ukulélé

```json
{
  "instrument": "ukulele"
}
```

## Exemple — guitare 12 cordes

```json
{
  "instrument": "guitar-12"
}
```

## Principe

`site.config.json` → profil `/instruments` → profil `/products` → moteur partagé `/core`.

Les différences propres à un instrument doivent rester dans `/instruments` ou `/products`. Le code de `/core` ne doit pas contenir de branche spéciale du type `if (instrument === "bass-4")`.

Le fichier de configuration est chargé avec `cache: "no-store"` afin qu'un changement de configuration ne reste pas bloqué par le cache du navigateur.

Si la valeur `instrument` est inconnue, le bootstrap affiche une erreur de configuration explicite au lieu de lancer silencieusement un autre instrument.

## État des profils

`guitar` est le profil de référence à tester pour la non-régression V10.3.

`bass-4`, `ukulele` et `guitar-12` sont déjà sélectionnables par le bootstrap afin de valider l'architecture, mais leurs contenus pédagogiques spécifiques ne sont pas encore déclarés production-complets. Le changement de configuration ne doit jamais être interprété comme une validation musicale de ces trois produits.


## Architecture V10.3

The application shell is shared. Instrument selection remains controlled only by `site.config.json`.

Reusable practice modes live in `/modes`. Instrument profiles only declare which plugins they expose and their instrument-specific context. Fretboard Map is rendered by `/core/fretboard-map.js`. Quiz timing/scoring limits and ranks belong to the product profile.

Architecture rule: adding or switching an instrument must not require an `if (instrument === ...)` branch in `/core`.


## V10.4 — Product identity

The selected instrument now also selects the complete product identity: Home branding, Home copy, SEO metadata, canonical URL, Open Graph/Twitter metadata, structured data, share identity, PWA name/manifest and configurable asset paths.

Product names are intentionally:
- Guitar Fretboard Hero
- Bass Fretboard Hero
- Ukulele Fretboard Hero

`guitar-12` is an instrument profile but uses the `Guitar Fretboard Hero` product identity. The deployment rule remains: same ZIP everywhere; edit only `site.config.json`.


## V10.4.2 — Completed instrument profiles

- `bass-4`: pentatonic P1–P5, triads, arpeggios, Bass-specific quiz ranks.
- `ukulele`: pentatonic P1–P5 for re-entrant G C E A, triads, chord families, arpeggios, Ukulele-specific quiz ranks.
- `guitar-12`: full Guitar pedagogy (pentatonic, triads, CAGED) on six courses, rendered as twelve physical strings; lower four courses are octave pairs and upper two are unison pairs.

The product names remain Guitar Fretboard Hero, Bass Fretboard Hero and Ukulele Fretboard Hero. String/course count stays an instrument-profile detail.

## Release notes

### V10.4.5
- Responsive CSS cleanup with no intentional visual or gameplay changes.
- Consolidated the mobile right-side hamburger/header layout into the canonical responsive control contract.
- Consolidated the right-anchored drawer behavior instead of keeping a late override patch.
- Removed redundant responsive override code and trailing CSS noise before adding new screens.


### V10.4.4
- Removed fullscreen button and fullscreen functionality.
- Mobile controls menu now uses the former fullscreen position on the right side of the header.
- The controls drawer is right-anchored and opens inward from right to left.
- Per-instrument SEO is configured for Guitar, Bass, Ukulele and 12-string Guitar.
- Bass, Ukulele and 12-string Guitar instrument profiles are supported from the same package through `site.config.json`.

### V10.4.7
- Fixed the V10.4.6 regression that forced Practice and Fretboard Map controls into the hamburger drawer on tablet/desktop.
- Restored the V9.3/V10.4.5 adaptive control contract: full buttons when space allows, progressive per-group selects when width tightens, hamburger drawer only on compact/mobile viewports.
- Kept the universal compact header without overriding responsive drawer/toolbar behavior.
- Fixed Back alignment by making Back, title and contextual hamburger real cells of the same header grid; removed absolute positioning from those header items.
- Practice keeps the simplified key title and active-mode context line.



### V10.4.8
- Moved each screen context into `section-heading` as a semantic `<small>` immediately after the title `<strong>`.
- Reordered the mobile header DOM to Back | section heading | Menu so the title is structurally centered between both controls.
- Replaced the custom inline Back SVG with the existing lightweight icon treatment and forced the Back glyph to white.
- Preserved the V9.3/V10.4.5 adaptive controls behavior: buttons → progressive selects → right-side hamburger only when required.


### V10.4.9
- Added horizontal breathing room to the inline responsive controls on tablet/desktop (20px side padding).
- No changes to responsive buttons → selects → right-side hamburger behavior.
- No changes to fretboard, theory, instruments, modes, products, or quiz mechanics.

### V10.5.0 — Circle of Fifths
- Added Circle of Fifths as the fourth learning area on Home: Practice → Fretboard Map → Circle of Fifths → Quiz.
- Added a reusable pure theory core for the 12 major keys, relative minors, key signatures, major scales, diatonic chords and common progressions.
- Added a responsive interactive SVG Circle of Fifths renderer.
- Added selected-key information and a shared Fretboard Core scale view for the active instrument.
- Responsive layout: vertical learning flow on mobile/tablet portrait; Circle + harmony information side-by-side on wider tablet/desktop; fretboard below.
- Existing V10.4.9 Practice, Map, Quiz, header and adaptive controls behavior remain unchanged.
