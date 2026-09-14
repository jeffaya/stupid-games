# SEO, social sharing and Stupid Games catalog integration

SEO and sharing metadata are mandatory production work, not optional polish.

Every game must have correctly populated:
- `<title>` with the real game name,
- meta description written for the game,
- meta robots allowing indexing unless intentionally private,
- canonical URL pointing to the production URL,
- `og:title`,
- `og:description`,
- `og:type`,
- `og:url`,
- `og:image` using an absolute production HTTPS URL,
- `og:image:type` when known,
- `og:image:width` and `og:image:height` when known,
- `og:image:alt`,
- Twitter Card metadata,
- theme color,
- Apple web-app metadata,
- JSON-LD using the `VideoGame` type when appropriate.

Never ship placeholder titles, descriptions, domains, or metadata copied from another game.

## Recommended SEO head baseline

Use a production-ready baseline similar to:

```html
<title>GAME NAME — Free Browser Game | Stupid Games</title>
<meta name="description" content="A concise, human-readable description of the game.">
<meta name="robots" content="index,follow">

<link rel="canonical" href="https://REAL-PRODUCTION-URL/">

<meta property="og:title" content="GAME NAME">
<meta property="og:description" content="A concise social description.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://REAL-PRODUCTION-URL/">
<meta property="og:image" content="https://REAL-PRODUCTION-URL/og.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="GAME NAME social preview">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="GAME NAME">
<meta name="twitter:description" content="A concise social description.">
<meta name="twitter:image" content="https://REAL-PRODUCTION-URL/og.jpg">
```

Use real values. Do not cargo-cult the example title or description.

## Structured data

For released games, include JSON-LD with `VideoGame` when appropriate.

Recommended fields:
- `@context`
- `@type: "VideoGame"`
- `name`
- `url`
- `description`
- `image`
- `gamePlatform: "Web browser"`
- `applicationCategory: "Game"`
- `operatingSystem: "Any"`
- `isAccessibleForFree: true`
- `genre`

For the Stupid Games portal, use structured data appropriate to the portal itself, such as:
- `WebSite`
- creator/person data when useful,
- `ItemList` for released games,
- nested `VideoGame` entries for individual games.

When a new game is published, update the portal ItemList/structured data as part of the same release.

## robots.txt and sitemap.xml

Production SEO packaging must include:
- `robots.txt`
- `sitemap.xml`

Default `robots.txt` should:
- allow crawling,
- point to the production sitemap URL.

Example:

```text
User-agent: *
Allow: /

Sitemap: https://stupid-games.seignemorte.com/sitemap.xml
```

The sitemap must contain the real public URLs for released pages/games and be updated when a new game is released.

Do not list development, preview or obsolete URLs.

## OG image

Every released game must have a dedicated social-sharing image.

Default:
- filename: `og.jpg`,
- recommended social size: 1200×630,
- visually representative of the game,
- include the game identity/logo when useful,
- designed to remain understandable in a social preview,
- optimized for web delivery,
- referenced by an absolute HTTPS URL in Open Graph metadata.

Before deployment, verify that the live OG URL actually returns the image and is publicly accessible.

The OG artwork is also the default visual source for representing the game in the Stupid Games catalog unless a dedicated catalog thumbnail is intentionally created.

## Mixed-content and HTTPS rule

All runtime resources and metadata URLs must use HTTPS in production.

Check:
- scripts/CDNs,
- fonts,
- images,
- OG URLs,
- game links,
- portal links,
- support links,
- manifest references where absolute URLs are used.

Do not confuse XML/SVG namespace identifiers such as `http://www.w3.org/2000/svg` or the sitemap XML namespace with mixed-content requests; those are identifiers, not fetched resources.

If Chrome reports “other resources which are not secure”, inspect DevTools Console/Network and identify the exact insecure request instead of guessing.

## Stupid Games site integration

Publishing a new game is not complete until the main Stupid Games site is updated.

For every new released game:
1. add the game to the Stupid Games homepage/catalog,
2. add its name and production URL,
3. use the approved OG artwork as the default card visual unless a dedicated card image exists,
4. add the game's description/tagline/tags,
5. add appropriate alt text/accessibility labeling,
6. verify the card/link works on mobile and desktop,
7. update portal JSON-LD/ItemList,
8. update sitemap when needed,
9. preserve the approved portal card design.

Do not redesign existing game cards merely to add another game.

The portal's game-card design is a stable template. New games should be added by changing game data/configuration, not by rewriting the card layout.

Do not reuse an unrelated generic icon when the game already has approved OG artwork.

If the Stupid Games site has its own manifest, sitemap, structured data, game list, or navigation data source, update those too when relevant.

A deploy ZIP must be self-contained.

Before delivery:
- verify every local `src`/`href`,
- validate JavaScript syntax,
- confirm referenced assets exist,
- verify canonical and social metadata use the real production URL,
- verify the OG image exists and is referenced with an absolute HTTPS URL,
- verify no metadata from another game remains,
- verify all favicon/PWA files are present,
- verify `manifest.webmanifest` is included in the package,
- verify manifest icon paths resolve,
- verify Apple touch icon declaration and file exist,
- verify service-worker registration/file when PWA installability is intended,
- confirm the Stupid Games catalog integration is prepared/updated for a released game,
- avoid stale filenames,
- avoid version numbers in production asset names.
