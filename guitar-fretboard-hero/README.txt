GUITAR FRETBOARD HERO — V2.2

Static browser game. No build step.

Files:
- index.html
- styles.css
- app.js
- manifest.webmanifest
- sw.js
- favicon.svg / favicon.ico
- apple-touch-icon.png
- icon-192.png / icon-512.png
- og.jpg
- robots.txt

Production target assumed by the package:
https://stupid-games.seignemorte.com/guitar-fretboard-hero/

Deploy the whole folder as:
/home/seignemo/games/guitar-fretboard-hero/

Main V2 features:
- Responsive fretboard: vertical on portrait phones, horizontal on tablet/desktop
- Selectable 12 / 15 / 17 / 21 fret view, standard E A D G B E tuning
- Major/minor pentatonic practice with 5 connected position overlays
- Root / 3rd / 5th color coding
- Playable triad shapes on adjacent 3-string sets, including inversions
- Compact 4-string chord voicings
- 10-round fretboard quiz: any correct occurrence validates the answer
- Attempts-based scoring and rank
- Native share + clipboard fallback
- Stupid Games + Ko-fi links
- PWA/mobile icon coverage and SEO metadata

V2 UI changes:
- 2px borders on all interactive controls for stronger contrast
- Rock typography via Google Fonts CDN (Metal Mania + Barlow Condensed)
- Guitar icon and richer Practice description on home
- Punchier Quiz copy
- Stupid Games footer link pinned to the bottom and more visible
- Practice header now identifies the current section
- Separate 7th and 9th degree colors in pentatonic visualization
- Centered icon buttons and Quiz shortcut icon
- Mobile Practice setup moved into a collapsible hamburger drawer so the fretboard gets the screen

V2.1 corrections:
- Removed the decorative home fretboard visual.
- Practice home icon is now a clear guitar-pick/fretboard symbol.
- Home CTA cards no longer move on hover/touch.
- Hero/section typography switched to a brush-style neon treatment closer to the visual direction.
- Corrected pentatonic box geometry. For G minor, Pattern 1 now correctly contains frets 3–6; subsequent boxes are 5–8, 7–10, 10–13 and 12–15.
- Pattern overlays now include the actual first-fret notes of each box rather than starting on the fret wire after them.


V2.2 changes:
- Practice menu order is now Root → Quality → Mode → Positions → Fretboard length.
- New fretboard length selector: 12 / 15 / 17 / 21 frets.
- Responsive defaults: 12 frets on phones, 15 on touch tablets/iPad-sized screens, 21 on desktop.
- Nothing is rendered beyond fret 21.
- Practice header now displays the live practiceTitle and practiceFormula instead of a generic PRACTICE label.
- Practice legend moved below the fretboard and aligned right.
- Pattern labels on portrait mobile moved into the outer gutter so P1/P2/etc. no longer cover the playable neck.
- Home Practice and Quiz icons redrawn as premium neon guitar-pick symbols.
- Practice header Quiz shortcut reuses the same Quiz symbol as the homepage.
