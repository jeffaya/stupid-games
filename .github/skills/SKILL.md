---
name: stupid-games-game-builder
description: Reusable design and engineering principles for polished, fast, mobile-first HTML5 mini-games in the Stupid Games project.
---

# Stupid Games — Game Builder Skill

## Goal

Build browser mini-games that are immediately understandable, fun in the first seconds, visually polished, mobile-first, fast to load, easy to replay, and easy to deploy as static files.

Use the latest approved version of a game as the source of truth. Never merge back abandoned branches unless explicitly requested.

## Product principles

### Immediate comprehension
The player should understand what to do within a few seconds.

Prefer:
- one clear interaction,
- one clear objective,
- one visible threat,
- minimal text,
- immediate feedback.

Avoid long tutorials.

### One strong mechanic
Start with one satisfying core interaction such as swipe, tap, drag, hold, dodge, or aim.

Do not add secondary mechanics until the main interaction already feels good.

### Short and replayable
Prefer short levels, quick restarts, visible progression, score/combo systems, escalating challenge, and a memorable final encounter.

Do not artificially lengthen early levels.

## Home screen

The default home should be very simple:
1. logo,
2. short tagline,
3. one strong visual,
4. one obvious way to start.

When possible, start the game using the core mechanic itself rather than a generic Play button.

Avoid long copy, menus, duplicated controls, or navigation that does not help the game.

## Reference material

This skill is split into focused reference files. Load the one relevant to the current task instead of reading everything at once:

- `reference/visual-mobile.md` — visual direction, mobile-first requirements, performance (images, rendering, animation).
- `reference/gameplay.md` — gameplay feedback, difficulty/progression, powers, interface/HUD, ecosystem footer, end-of-game conversion loop, audio.
- `reference/pwa-deployment.md` — PWA package contents, icon coverage, HTML head icon declarations, web app manifest, service worker, shortcut/install verification.
- `reference/seo-integration.md` — SEO head baseline, structured data, robots.txt/sitemap.xml, OG image, HTTPS/mixed-content rule, Stupid Games site/catalog integration.
- `reference/packaging-ovh.md` — OVH production directory convention (`/home/seignemo/games`), meaning of "package everything", file naming.
- `reference/workflow-lessons.md` — iteration rules, delivery workflow, default technical architecture, reusable lessons from past games.

## Quality bar

Before calling a game finished, ask:
- Is the first interaction obvious?
- Does the first 10 seconds feel good?
- Is it smooth on a phone?
- Does it look intentional rather than generated?
- Are assets visually coherent?
- Is the HUD readable?
- Is the first level short enough?
- Is restarting frictionless?
- Is the final challenge memorable?
- Is the deployment package complete?
- Are favicon, Apple touch icon, Android/PWA icons and manifest all present?
- Does Add to Home Screen show the real icon instead of a generated letter?
- Are title, description, canonical, OG/Twitter and structured data correct?
- Are robots.txt and sitemap.xml correct for production?
- Does the end-game modal offer share, replay, Stupid Games portal, and Buy Me a Coffee?
- Could we remove anything without making the game worse?

If yes, remove it.

## Continuous evolution

This skill is intentionally iterative.

When a new game teaches a reusable lesson:
1. confirm the lesson is general rather than game-specific,
2. add it to the relevant `reference/*.md` file (or this file if it is a core principle),
3. use it as a default in future games.

Game-specific mechanics stay in the game.
Reusable design and engineering principles go into this skill.
