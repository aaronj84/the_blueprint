# The Blueprint — Brighton Fresh/Soph Blue Team

Interactive 4-3-3 tactical learning site for Brighton’s Fresh/Soph Blue team (high premier / ECNL Regional level).

Vanilla HTML, CSS, and JavaScript. No build step. Opens from `index.html` and deploys to GitHub Pages.

## Use the site (public)

**Open the interactive app here:**

**[https://aaronj84.github.io/the_blueprint/](https://aaronj84.github.io/the_blueprint/)**

Works in any modern browser on phone or laptop. Progress is saved on that device only (no login).

Coach teaching from the front: add `?coach=1` —  
[https://aaronj84.github.io/the_blueprint/?coach=1](https://aaronj84.github.io/the_blueprint/?coach=1)

## Run locally

1. Clone the repo.
2. Open `index.html` in a modern browser  
   **or** serve the folder:

```bash
# Python
python3 -m http.server 8080

# then visit http://localhost:8080
```

Progress is stored in `localStorage` on that browser/device only.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment**
3. Source: **Deploy from a branch**
4. Branch: `main` (or `master`), folder: `/` (root)
5. Save. Site will be at `https://<user>.github.io/<repo>/`

A `.nojekyll` file is included so GitHub Pages serves files as-is.

### Coach mode

Add `?coach=1` to the URL:

`https://aaronj84.github.io/the_blueprint/?coach=1#attack-01`

Coach mode shows scenario IDs, correct answers, target areas, cues, prev/next controls, animation replay, and a module filter.

### Deep links

| Hash | Opens |
|------|--------|
| `#home` | Home |
| `#basics` | Basic 4-3-3 |
| `#attack` | Attack module |
| `#wide` | Wide attack (half-space run & rotation) |
| `#defense` | Defense module |
| `#corner` | Corner lab |
| `#challenge` | Mixed challenge |
| `#glossary` | Glossary |
| `#attack-01` | Specific scenario (any scenario `id`) |

## Project structure

```text
/
  index.html      # App shell
  styles.css      # Coaching-board UI
  app.js          # Navigation, pitch, interactions, progress, coach, challenge
  scenarios.js    # All tactical content (edit this)
  assets/logo.svg
  README.md
```

## How to add a scenario

1. Open `scenarios.js`.
2. Copy an existing object in `SCENARIOS` with the same `interactionType` you need.
3. Set a unique `id` (used in the URL hash).
4. Set `module` to `attack` | `wide` | `defense` | `corner`.
5. Fill `prompt`, `seeIt`, `players`, `opponents`, `ball`, `options` / zones, `correctAnswer`, `hint`, `explanation`, `coachingCue`.
6. Optional: `rationaleOptions` + `correctRationale` for a second “why?” step.
7. Optional: `animationSteps` for the “Watch it” replay.

Pitch coordinates:

- `x`: 0–68 (width)
- `y`: 0–105 (length)
- Team attacks toward the **top** of the screen (opponent goal near `y = 0`)

### Interaction types

| `interactionType` | What the player does |
|-------------------|----------------------|
| `multiple-choice` | Pick from options |
| `pitch-hotspot` | Tap a zone (`zones` + `correctAnswer` zone id) |
| `drag-player` | Drag `dragPlayerId` toward `dragTarget` (buttons via `altOptions`) |
| `match-responsibilities` | Pair our player → opponent (`matchPairs`) |
| `movement-and-pass` | Choose run then pass (`runOptions` / `passOptions`, `correctRun`, `correctPass`) |
| `formation-diagnosis` | Identify what is wrong with the shape |
| `ordered-decision` | Reorder `sequence` to match `correctOrder` |

## Adjust player positions

Edit `x` / `y` on any object in `players` or `opponents`. Keep numbers and roles consistent with the team model (1, 2, 3, 4/5, 6, 8, 10, 7, 9, 11).

## Edit glossary terms

Edit the `GLOSSARY` array in `scenarios.js`: `{ term, definition }` — keep definitions to one or two sentences.

## Change the corner routine

Edit `CORNER_ROLES` in `scenarios.js` for display labels, and update corner scenarios’ player `label` fields / coordinates to match your set-piece.

Decision rule taught in content:

> **Zero or one in the Golden Zone: Go Short. Two: Go Long.**
> **Zero or one high → go immediately** (Stockton runs; Malone feeds). **One tight → deliberate short** after Skittles.
> **Go Long:** non-striker curls before the ball is hit (rebound).

## Reset saved progress

In the app: **Settings (gear) → Reset all progress**.

Or in the browser console:

```js
localStorage.removeItem("brighton-soccer-iq-progress");
```

## Modules

Each of Attack, Wide, Defense, and Corners opens with an **optional overview** of the principles (hide/skip anytime). Then:

1. **Attack the Moment** — transition + 2-3-5 occupation (8 scenarios)
2. **Wide Attack** — half-space run after the switch, then rotation when tracked (8)  
   *(Patterns 3–4 — inverted rotation / third man — not yet in the first version.)*
3. **Defensive Responsibilities** — Part 1 matchups / plus-one / press-recover; Part 2 out-of-possession **4-4-2** (8 next to 6; 7 & 11 cover deep wide)
4. **Corner Decision Lab** — Unlock the play → Golden Zone read (Go Short / Go Long) → Malone/Stockton short + Skittles/Screen/Shield long roles
5. **Mixed Challenge** — 10 randomized unlabeled questions; results by concept

## Notes for coaches

- Content is data-driven: change wording and coordinates without rewriting the renderer.
- Challenge mode removes most labels/highlights and skips the first-hint path.
- Mastery bands: Learning &lt;60%, Developing 60–79%, Ready 80–89%, Mastered ≥90%.
