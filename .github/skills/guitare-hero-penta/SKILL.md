# Guitare Hero Penta --- Game Skill

## Mission

Build and maintain **Guitare Hero Penta**, a mobile-first Stupid Games
web app that teaches the guitar neck visually. The defining experience
is seeing the fretboard as **one connected musical map**, linking
pentatonic positions, intervals, triads and CAGED chord shapes.

Core promise: **learn, visualize and play the pentatonic system across
the whole guitar neck.**

## Product priorities

1.  Make the fretboard understandable at a glance.
2.  Make the five pentatonic positions immediately distinguishable.
3.  Show how the five positions connect.
4.  Transpose instantly to any key.
5.  Connect scales, root/3rd/5th, triads and CAGED.
6.  Stay usable with a guitar in hand.
7.  Keep a premium electric-guitar identity.

When visual decoration conflicts with fretboard readability, **fretboard
readability wins**.

## Platform and stack

Primary target is smartphone portrait, approximately 360--430 px wide,
including iPhone/iPad/Android and home-screen installation. Desktop is
secondary.

Default architecture: - HTML5 - Vanilla JavaScript ES6+ - Tailwind CSS
via CDN when useful - SVG for fretboard, notes, shapes, connections and
animations - static hosting - no backend/database - no framework/build
step unless a future requirement genuinely needs one - external
libraries preferably through CDN; game assets local

The Practice screen should preferably fit without page scrolling.

## Home

Keep Home extremely simple: - **PRACTICE** - **QUIZZ**

Do not add Settings, Progression, About or unnecessary navigation unless
explicitly requested.

Visual rules: - true black `#000000` - use the approved Guitare Hero
Penta logo asset - do not recreate the title in CSS when the logo
contains the identity - no decorative effects around the logo - buttons
may glow in neon - no glossy/glass treatment

Home-only footer: **Stupid Games · voir les autres jeux**

Portal: `https://stupid-games.seignemorte.com/`

## Visual identity

Premium electric-guitar / cyber-rock aesthetic. Deep black, neon,
energetic but readable, never childish or school-like.

Core accents: magenta/pink, cyan, violet, green, yellow/gold; red for
roots/errors when appropriate.

### Buttons

Current rule: **NEON, NOT GLOSS.** Use black/dark fill, thin neon
border, controlled outer glow, readable typography and a clear active
state. Avoid glassmorphism, plastic reflections and large glossy
highlights. Use the same language throughout the app.

## Identity / PWA assets

The approved identity is based on the **Guitare Hero Penta guitar-pick
logo**.

Release packages should include appropriate variants: - `logo.png` -
`favicon.ico` - `favicon-16.png` - `favicon-32.png` - `favicon-64.png` -
`apple-touch-icon.png` (180×180) - iPad/iOS variants when packaged -
`icon-96.png` - `icon-144.png` - `icon-192.png` - `app-icon-512.png` -
`app-icon.png` - `manifest.json` - `og.jpg`

Never rely only on favicon for mobile shortcuts. Wire favicon, PNG
favicons, Apple Touch icon, manifest/PWA icons and mobile theme metadata
so the approved game icon appears on iPhone, iPad and Android
home-screen shortcuts.

## Open Graph

`og.jpg` should be exactly **1200×630**, cyber-rock/neon, consistent
with the logo, and immediately recognizable as Guitare Hero Penta.
Preferred imagery: electric guitar/fretboard, luminous notes,
cyan/magenta/gold, black environment, strong branding.

## Practice

Practice is the core screen and the fretboard has priority over
secondary UI.

Header: - back - compact Practice title - `▶ SOLO` at top right

Bottom controls must clear the phone safe area and never feel glued to
the bottom.

### Fretboard

Portrait representation: - 6 vertical strings - frets descend down
screen - target around 15 visible frets - markers 3, 5, 7, 9, 12, 15 -
SVG preferred

## Pentatonic theory

Minor pentatonic: `1 – ♭3 – 4 – 5 – ♭7` Major pentatonic:
`1 – 2 – 3 – 5 – 6`

Derive notes from intervals and selected root rather than hard-coding
every key.

## Five pentatonic schemas --- HIGHEST PRIORITY

The app teaches five positions: - Schéma 1 / Position 1 --- violet -
Schéma 2 / Position 2 --- green - Schéma 3 / Position 3 --- red/coral -
Schéma 4 / Position 4 --- yellow - Schéma 5 / Position 5 --- cyan

This is the most important pedagogical feature.

Do **not** merely show five labels beside approximate rectangular fret
bands. The target is a true colored guitar-neck map where each schema
follows its real per-string fingering geometry.

A guitarist must instantly understand: - where each position
begins/ends - the familiar fingering shape - overlaps with adjacent
positions - how all five positions form one continuous system

Prefer true per-string SVG polygons/regions over generic horizontal
rectangles.

### Note hierarchy

-   Root / 1 → strong red neon
-   3rd  → cyan
-   5th → yellow/gold
-   other pentatonic notes → subdued neutral

Root must be unmistakable. Thin connecting lines are allowed only when
they improve understanding.

## Transposition

Mode: - MINOR - MAJOR

Root order: A, A#/Bb, B, C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab

Changing root/mode should visually move the system along the neck.
Preferred animation is a genuine slide/transposition rather than simple
replacement. Related layers remain musically synchronized.

## Practice bottom menu

Use compact selects: 
1. MINOR / MAJOR 
2. PENTA / TRIADES
3. CHORDS

In every mode, you should see the shape with color

## Triads

Major: `1 – 3 – 5` Minor: `1 – 3 – 5`

Teach practical triad shapes/inversions across string groups, not
arbitrary highlighted chord tones. Root, third and fifth remain visually
distinct. Triads transpose with root and mode.

You should see the neon linked between the Root, third and fifth on each position

## CHORDS / CAGED

CHORDS visualizes the selected chord over the whole neck using: - C
shape - A shape - G shape - E shape - D shape

A mature implementation must show **actual CAGED voicings/chord-tone
geometry**, not five equal colored bands. The player should understand
how the same chord repeats through all five forms and how CAGED relates
to roots, thirds, fifths, pentatonic positions and triads.

## Visual Solo

Secondary Practice action at top right: `▶ SOLO`. Current scope is
visual only: notes illuminate sequentially. No required audio engine and
no volume settings. Do not sacrifice fretboard space for Solo UI.

## Quiz

10-question visual fretboard quiz. Typical tasks: - FIND THE ROOT - FIND
THE 3RD - FIND THE 5TH

Randomize root, Major/Minor and requested interval.

Every tap counts as an **attempt**. Wrong answers allow retry but reset
streak. Correct answers give immediate positive feedback and advance.

Track total attempts, current streak and best streak. Do not use a naive
10/10 score.

Final level: - ≤11 attempts → **VIRTUOSE** - ≤14 → **EXPERT** - ≤18 →
**CONFIRMÉ** - ≤24 → **INTERMÉDIAIRE** - 25+ → **DÉBUTANT**

Result modal: - level - total attempts - best streak - REJOUER -
PARTAGER - BUY ME A COFFEE - other Stupid Games

Ko-fi: `https://ko-fi.com/jeffseignemorte`

## UX

Guitar fretboard responsive display: on mobile, display the fretboard in horizontal orientation. 
On iPad, PC, and any larger screen ("+"), display the fretboard in vertical orientation.

Avoid horizontal overflow, controls touching edges, tiny fret markers,
excessive legends and scrolling during fretboard interaction.

Practice information hierarchy: 1. Fretboard 2. Five pentatonic
schemas/current musical visualization 3. Notes 4. Root/mode/layer
controls 5. Solo 6. Secondary legends



## Deployment

Current game domain: `https://guitare-hero-penta.seignemorte.com/` Stupid Games
portal: `https://stupid-games.seignemorte.com/`

Keep deployment static-hosting friendly.

## Definition of done

Before validating a release: - Home has only intended core actions. -
Major/Minor and all 12 roots work. - Penta, Triads and Chords/CAGED
work. - Five pentatonic schemas correspond to real fingering geometry
and connect correctly. - Root/3rd/5th are clear. - Key changes transpose
correctly. - CAGED shows identifiable real forms, not arbitrary bands. -
Solo visual mode works. - Quiz completes 10 questions and attempt-based
level works. - Practice controls clear bottom safe area. - 360--430 px
layouts remain usable. - background/style follows black + neon, no
unwanted gloss. - favicon, Apple Touch and PWA icons resolve
correctly. - `og.jpg` is 1200×630 and referenced correctly. - version
number is updated and previous version preserved. - package deploys
statically without a build step.

## Guiding principle

Guitare Hero Penta is not simply "colored notes on a guitar."

It is **a visual system for seeing the guitar neck as one connected
musical map**.

Every evolution should make the relationship between pentatonic
positions, intervals, triads and CAGED chord shapes easier to see,
understand and play.
