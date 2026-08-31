# Brighton Varsity Shot Tracker

Sideline shot / play recording for Brighton varsity — games, lineups, history, maps, and Explore.

Vanilla HTML, CSS, and JavaScript + Supabase. No build step for the client.

Tactical learning packs (BHS Blueprint, CFC Red) live in a separate repo: [`blueprint_soccer`](https://github.com/aaronj84/blueprint_soccer).

## Use the site

**[https://aaronj84.github.io/the_blueprint/](https://aaronj84.github.io/the_blueprint/)**

Staff PIN gates write access (default documented in `shots-config.example.js`).

## Run locally

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

Copy `shots-config.example.js` → `shots-config.js` and fill in Supabase URL, anon key, and PIN.

## Deep links

| Hash | Opens |
|------|--------|
| `#shots` | Record |
| `#shots-games` | Games / schedule |
| `#shots-history` | Cross-game history |
| `#shots-explore` | Explore (LLM) |
| `#shots-map` | Full-field shot map |

## Project structure

```text
/
  index.html
  styles.css
  app.js                  # Thin hash router / chrome
  shots.js                # Tracker UI
  shots-api.js            # Supabase access
  shots-config.js         # Local secrets (gitignored if desired)
  shots-config.example.js
  supabase/               # Schema, migrations, Explore Edge Function
  benchmark/              # Explore LLM harness
  scripts/                # CSV → SQL helpers
  recorded data/          # Import sources
```

## Supabase & Explore

See `supabase/README.md` and `benchmark/README.md`.

## Deploy

GitHub Pages from the repo root (`main`, `/`). `.nojekyll` is included.
