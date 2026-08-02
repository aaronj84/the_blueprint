# Brief for Claude: High-level slides — The Blueprint

Use this document as source material. Produce a short slide deck (roughly 8–12 slides) that explains **(1) our core game-model principles** and **(2) how The Blueprint app works** for players, parents, or staff who have never opened it.

---

## What I want from you

1. **Slide outline** with title + 3–6 bullets max per slide (or one clear diagram description).
2. **Speaker notes** under each slide (2–4 sentences I can say out loud).
3. Keep language **coach-simple** — short cues players will hear on the field, not academic jargon.
4. Prefer **decision trees and patterns** over long lists.
5. Optional: suggest 1–2 simple visuals per slide (pitch sketch, triangle, 3-run diagram) I can recreate on a tactics board or in Keynote/Google Slides.
6. Do **not** invent new principles. Stay faithful to the content below.

**Audience options** (ask me which if unclear; default to mixed staff + older players):
- Players (Fresh/Soph)
- Parents night
- Coaching staff alignment

**Tone:** Brighton Fresh/Soph Blue — clear, confident, teachable. Not corporate; not meme-y.

---

## Product snapshot

| | |
|---|---|
| **Name** | The Blueprint |
| **Team** | Brighton Fresh/Soph Blue |
| **What it is** | A browser-based tactical teaching app: see a pitch diagram → choose the decision → (often) explain why → get a coaching cue |
| **Stack** | Static site (HTML/CSS/JS), progress saved on-device in localStorage |
| **URL pattern** | GitHub Pages when enabled; local = any static server |
| **Learning loop** | See it → Choose it → Explain it → Remember the cue |

### How a session works in the app

1. Open a **module** (Attacking Shape, Wide Attack Patterns, Supporting Runs, Defensive Shape, Corners).
2. Read the **module overview** (principles + cues) — can dismiss and revisit.
3. Open a **scenario**: pitch on one side, question/options on the other.
4. Answer the decision (and sometimes a follow-up rationale).
5. Replay animation to lock the picture.
6. Progress/mastery tracked per scenario on that device.
7. **Mixed Challenge** = 10 unlabeled questions across modules; results by concept.
8. **Coach mode** (`?coach=1`) shows answers/targets for teaching from the front.

### Navigation (top bar)

- **Home**
- **Basic 4-3-3**
- **Attack** → Attacking Shape · Wide Attack Patterns · Supporting Runs
- **Defense** → Defensive Shape
- **Set Pieces** → Corners
- **Challenge** · **Glossary**

### Pitch symbology (keep consistent on slides)

- **Blue ▲** = us (attacking toward top of diagram)
- **Red ▼** = opponent
- Number **inside** triangle; role abbrev **below**
- Shirt map: 1 GK · 2 RB · 3 LB · 4 RCB · 5 LCB · 6 DM · 7 RW · 8 CM · 9 CF · 10 AM · 11 LW
- Wide patterns use **A / B / C** as *spaces* (wide / half-space / deep), not fixed jersey numbers

---

## Core principles to teach (by module)

### 1. Attacking Shape — *Win it → look forward → occupy five lanes*

**Headline cues**
- Look to go long. If it’s not on — build wide.
- Inside winger, outside fullback.
- Five lanes, not five statues.
- The 6 connects the attack and protects the turnover.

**Principles**
1. **After we win it:** Look to go long (free drive, runner with advantage, disorganized back line). If it’s not on — build to wide places to create scoring opportunities.
2. **2-3-5 is an occupation map**, not a second formation: two deepest, three central support/rest defense, five attacking lanes. Players rotate into spaces.
3. **Fullbacks read the winger:** winger wide → FB tucks/underneath; winger inside → FB becomes width; far-side FB stays connected.
4. **The 6** in the attacking third = deepest central connector + first central defender (often around Zone 14).

---

### 2. Wide Attack Patterns — *Triangle → gap pass → finish, rotate, or switch*

**Decision tree (this is slide-gold)**

```
Find wide triangle (A wide / B half-space / C deep)
        ↓
Gap pass: B runs BEHIND their 3; ball travels IN FRONT of their 3
        ↓
As B runs: C follows, A rotates underneath
        ↓
    ┌─── Ideal: B shoots / crosses / cutback ───┐
    │                                            │
Tracked?                              Chance gone / defense set?
B back to the corner                  Switch to the other side
→ new half-space run + gap pass       → rebuild triangle there
```

**Headline cues**
- Find the triangle → look half-space.
- Run behind the 3. Pass in front of the 3.
- B runs → C follows, A underneath.
- Tracked? B to the corner — new gap pass.
- Blocked / organized? Switch sides.

**Key teaching points**
- A/B/C are **roles in space**, not fixed numbers.
- Gap pass = different gaps for run vs ball (one defender can’t solve both).
- Rotation keeps the triangle alive so we can try again without forcing traffic.

---

### 3. Supporting Runs — *Near · Far · Cutback* (every cross)

**One pattern, three jobs — always**
1. **Near post** — attack the front post; arrive with the ball.
2. **Far post** — arrive across the face at the back post (often late).
3. **Cutback** — on/around the **penalty spot** when the wide player drives the goal line.

**Applies to:** wide-attack cross · set-piece serve · breakaway pull-back.

**Headline cues**
- Near. Far. Cutback.
- Don’t ball-watch — fill a post or the spot.
- Goal-line drive → someone on the penalty spot.
- Same three runs: open play, set piece, breakaway.

---

### 4. Defensive Shape — *Know your player → fill the 4-4-2*

**Headline cues**
- Know your player; protect the shape.
- Out of possession: 4-4-2.
- 8 next to 6. 7 and 11 cover deep wide.
- Pressure plus cover equals plus-one.

**Principles**
1. **Base matchups vs 4-3-3:** FBs↔wingers; both CBs on 9 (plus-one); 6 on highest CM threat; 8 on second advancing mid; 10 on their 6; wingers on opposing FBs.
2. **4-4-2 is defensive occupation** (mirror of attacking 2-3-5): back four, flat midfield four (`7-8-6-11` or `7-6-8-11`), two higher.
3. **8 drops beside 6**; **7 and 11 drop** to cover deep wide attackers.
4. **Plus-one** = pressure + cover (not two shadows glued to one player everywhere).
5. **Pass runners off** when chasing opens central space.
6. **After we lose it:** numbers + cover → counterpress; stretched/escaped → recover. 9 presses with a plan.

---

### 5. Corners (Set Pieces)

**Read (Golden Zone):** 0–1 defenders in the near-post corner of the 18 → **Go Short**. 2 defenders → **Go Long**.

**Sequence before the ball**
- Malone raises her hand.
- Everyone stares at Skittles — she makes the run.
- Only after Skittles arrives: Go Short or Go Long from the read.
- Targets hold until they can react to the ball.

**Go Short**
- Malone touches, then bends to the Golden Zone.
- Stockton keeps the ball and dribbles **parallel to the goal line** (holds onside for cutbacks).
- Others start at back post to clear near space.

**Go Long**
- Skittles clears first (back post → across → D).
- Stockton delivers across the face.
- While ball is in air: Spot → penalty spot, Shield → D, Front/Back Targets attack, Screen screens keeper, Corner Defense +1 behind.

**Cue:** Roles are jobs, not fixed jersey numbers. Supporting-run idea (near/far/spot) still applies on deliveries.

---

## Suggested slide sequence (edit freely)

1. Title — The Blueprint · Brighton Fresh/Soph Blue
2. Why this exists — same language on the field and in the app
3. How the app works — See / Choose / Explain / Cue (+ Challenge + Coach mode)
4. Map of the curriculum — Attack / Defense / Set Pieces
5. Attacking Shape — look to go long + 2-3-5 occupation
6. Wide Patterns — the decision tree (biggest “aha” slide)
7. Supporting Runs — near / far / cutback
8. Defensive Shape — matchups + 4-4-2 occupation
9. Corners — short vs long in one diagram
10. One week on the pitch — how we’d use the app (homework → film → training)
11. Closing cues — 5–7 one-liners to leave on screen

---

## Closing cue bank (good for a final slide)

- Look to go long. If it’s not on — build wide.
- Five lanes, not five statues.
- Run behind. Pass in front.
- B runs → C follows, A underneath.
- Near. Far. Cutback.
- Out of possession: 4-4-2.
- Zero or one in the Golden Zone: Go Short. Two: Go Long.

---

## Constraints / don’t invent

- Do not invent a second formation story for 2-3-5 or 4-4-2 — both are **occupation maps**.
- Do not treat A/B/C as fixed players.
- Do not say the gap pass and the runner use the *same* gap.
- Do not collapse supporting runs into “everyone crash the box.”
- Keep defense “man-oriented with connection,” not pure man-mark chaos.

---

## Optional ask to Claude after the outline

> Turn this outline into a Google Slides / Keynote-ready script with suggested layout (title placement, one diagram zone, cue callout). Keep each slide to one idea.
