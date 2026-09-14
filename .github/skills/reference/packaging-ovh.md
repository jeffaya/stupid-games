# OVH production packaging, directory convention and file naming

## OVH production packaging and directory convention

The production web root for the Stupid Games ecosystem is:

`/home/seignemo/games`

This root represents the **Stupid Games portal**.

Current convention:

```text
/home/seignemo/games/
├── index.html                 # Stupid Games portal
├── og-stupid-games.jpg        # portal social image
├── favicon.svg
├── favicon.ico
├── apple-touch-icon.png
├── icon-192.png
├── icon-512.png
├── manifest.webmanifest
├── sw.js
├── robots.txt
├── sitemap.xml
├── flush/                     # Flush game
└── planet-defender/           # Planet Defender game
```

Every new game must be deployed as its own direct child directory:

`/home/seignemo/games/<game-slug>/`

Examples:
- `/home/seignemo/games/planet-defender/`
- `/home/seignemo/games/flush/`
- `/home/seignemo/games/<next-game>/`

### Meaning of "package everything"

When the user asks to **package everything**, **prepare the complete deployment**, or equivalent, produce a package that mirrors this production structure rather than only packaging the current game's files.

The complete package should contain:

```text
games/
├── index.html
├── og-stupid-games.jpg
├── favicon.svg
├── favicon.ico
├── apple-touch-icon.png
├── icon-192.png
├── icon-512.png
├── manifest.webmanifest
├── sw.js
├── robots.txt
├── sitemap.xml
├── <existing-game-1>/
├── <existing-game-2>/
└── <new-game>/
```

For a complete ecosystem package:
1. preserve all existing games unless explicitly asked to remove one,
2. place the new/updated game in `/games/<game-slug>/`,
3. update the Stupid Games portal `index.html` with the game's card/link,
4. derive/use the game's approved OG artwork for its portal thumbnail/icon,
5. update `sitemap.xml` with the new public game URL,
6. update `robots.txt` only if necessary,
7. keep portal-level assets at `/games/`,
8. keep game-specific assets inside that game's directory,
9. verify every relative path after packaging,
10. never flatten game assets into the portal root,
11. preserve portal favicon/PWA files in full deployment packages.

If the user asks only for **the game package**, package only that game's directory.
If the user asks for **everything / full Stupid Games deployment**, package the complete `/games` tree.

The `/games` directory is therefore the deployment boundary for **Stupid Games as a whole**, while each child directory is the deployment boundary for an individual game.

## File naming

Use stable descriptive production names.

Good:
- index.html
- logo.webp
- boss.webp
- asteroid-rock.webp
- manifest.webmanifest
- apple-touch-icon.png
- icon-192.png
- icon-512.png

Avoid names like:
- final-v17-really-final2.html
- logo-new-new.png

Versioning belongs in source control.
