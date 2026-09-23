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
