/**
 * CFC Red — U12 Boys 9v9 — scenario data & config
 * Base shape: 4-1-2-1. Attack: 2-3-3. Defend: 4-3-1.
 * Pitch: x 0–68 (width), y 0–105 (length). Attack toward TOP (y→0).
 * Peer pack to BHS Blueprint (scenarios.js); same engine in app.js.
 */
(function () {
  "use strict";

  const CONFIG = {
    teamName: "CFC Red",
    appName: "CFC Red",
    storageKey: "cfc-red-soccer-iq-progress",
    packId: "cfcRed",
    colors: {
      ours: "#8b1a1a",
      oursStroke: "#4a0d0d",
      oursText: "#ffffff",
      opp: "#1a4d7c",
      oppStroke: "#0b2a47",
      oppText: "#ffffff",
      ball: "#ffffff",
      highlight: "#f0c14b",
      correct: "#2d6a4f",
      incorrect: "#9b2226",
      zone: "rgba(196, 86, 86, 0.28)"
    },
    pitch: {
      width: 68,
      length: 105
    },
    scoring: {
      decisionPoint: 1,
      rationalePoint: 1
    },
    mastery: {
      learning: 60,
      developing: 80,
      ready: 90
    },
    challengeCount: 8
  };

  /** 4-1-2-1 shirt map — no 7 / 11; width from wingbacks */
  const SHIRT_MAP =
    "1 GK · 2 RWB · 3 LWB · 4 RCB · 5 LCB · 6 DM · 8 CM · 10 AM · 9 CF";

  function base4121(overrides = {}) {
    const players = [
      { id: "our-1", team: "ours", number: 1, role: "Goalkeeper", x: 34, y: 98 },
      { id: "our-2", team: "ours", number: 2, role: "Right wingback", x: 58, y: 70 },
      { id: "our-4", team: "ours", number: 4, role: "Right center back", x: 42, y: 78 },
      { id: "our-5", team: "ours", number: 5, role: "Left center back", x: 26, y: 78 },
      { id: "our-3", team: "ours", number: 3, role: "Left wingback", x: 10, y: 70 },
      { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 34, y: 56 },
      { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 44, y: 40 },
      { id: "our-10", team: "ours", number: 10, role: "Attacking midfielder", x: 24, y: 40 },
      { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 34, y: 22 }
    ];
    return players.map((p) => Object.assign({}, p, overrides[p.id] || {}));
  }

  function attack233(overrides = {}) {
    const players = [
      { id: "our-1", team: "ours", number: 1, role: "Goalkeeper", x: 34, y: 96 },
      { id: "our-4", team: "ours", number: 4, role: "Right center back", x: 42, y: 78 },
      { id: "our-5", team: "ours", number: 5, role: "Left center back", x: 26, y: 78 },
      { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 34, y: 52 },
      { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 46, y: 40 },
      { id: "our-10", team: "ours", number: 10, role: "Attacking midfielder", x: 22, y: 40 },
      { id: "our-2", team: "ours", number: 2, role: "Right wingback", x: 60, y: 24 },
      { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 34, y: 16 },
      { id: "our-3", team: "ours", number: 3, role: "Left wingback", x: 8, y: 24 }
    ];
    return players.map((p) => Object.assign({}, p, overrides[p.id] || {}));
  }

  function defend431(overrides = {}) {
    const players = [
      { id: "our-1", team: "ours", number: 1, role: "Goalkeeper", x: 34, y: 96 },
      { id: "our-2", team: "ours", number: 2, role: "Right wingback", x: 56, y: 68 },
      { id: "our-4", team: "ours", number: 4, role: "Right center back", x: 42, y: 74 },
      { id: "our-5", team: "ours", number: 5, role: "Left center back", x: 26, y: 74 },
      { id: "our-3", team: "ours", number: 3, role: "Left wingback", x: 12, y: 68 },
      { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 46, y: 48 },
      { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 34, y: 50 },
      { id: "our-10", team: "ours", number: 10, role: "Attacking midfielder", x: 22, y: 48 },
      { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 34, y: 28 }
    ];
    return players.map((p) => Object.assign({}, p, overrides[p.id] || {}));
  }

  const GLOSSARY = [
    {
      term: "4-1-2-1",
      definition:
        "Our base shape: back four (wingbacks + center backs), a 6 screening, an 8 and 10 ahead of him, and a 9. No wingers — width comes from the wingbacks."
    },
    {
      term: "Wingback",
      definition:
        "The 2 and 3. In possession they provide the wide channels. Out of possession they are the wide defenders in the back four."
    },
    {
      term: "Three attacking channels",
      definition:
        "When we attack in a 2-3-3 we occupy left wide, central, and right wide with the wingbacks and the 9. The 8 and 10 can step into half-spaces from the mid three."
    },
    {
      term: "Half-space",
      definition:
        "The channel between the wide lane and the center. Ideal for the 8 and 10 to receive between defenders after a wingback finds them."
    },
    {
      term: "Zone 14",
      definition:
        "The central pocket just outside the opponent penalty area. Our 6 often occupies this as the deepest central attacker."
    },
    {
      term: "Rest defense",
      definition:
        "The players positioned to protect against a turnover while we attack — usually the two center backs and the 6."
    },
    {
      term: "Plus-one",
      definition:
        "Keeping a spare defender behind the primary marker so one can pressure while another covers the next dangerous action."
    },
    {
      term: "Near-post run",
      definition:
        "A supporting run that attacks the near post when a cross is coming. One of three standard supporting runs with far post and cutback."
    },
    {
      term: "Far-post run",
      definition:
        "A supporting run that attacks the far post when a cross is coming — often arriving late across the face."
    },
    {
      term: "Cutback run",
      definition:
        "A supporting run toward the penalty spot when a wide player drives the goal line — ready for the ball pulled back."
    },
    {
      term: "Supporting runs (cross)",
      definition:
        "Anytime we are about to hit a cross — wide attack, set piece, or breakaway — attackers organize near post, far post, and cutback to the penalty spot."
    },
    {
      term: "Gap pass",
      definition:
        "A through ball that enters a different gap than the runner threatens, forcing defenders to solve two problems."
    },
    {
      term: "2-3-3 occupation",
      definition:
        "Not a separate formation — how we fill space high: two deepest (center backs), three central (6-8-10), three high (wingback–9–wingback). Width from wingbacks; half-spaces from 8/10 stepping up."
    },
    {
      term: "4-3-1 defensive shape",
      definition:
        "Not a second formation — how we organize out of possession: back four, midfield three (8-6-10), and the 9 higher. No wingers to drop — the mid three already covers the middle."
    },
    {
      term: "Go Short",
      definition:
        "Zero or one defender in the Golden Zone (near-post corner of the 18). If zero — or one who is high — go immediately: Stockton starts running the goal line and Malone feeds him on the move. If one is tight on the short, wait for Skittles, then Malone touches and bends while Stockton dribbles the cutback 2v1."
    },
    {
      term: "Go Long",
      definition:
        "Two defenders in the Golden Zone. After Skittles finishes his run, the taker delivers across the face — but the partner who isn’t striking curls early (before the ball is hit) for a rebound. Spot, Shield, and Screen move while the ball is in the air. No back-post targets — those jobs are absorbed by Spot / Screen / the non-striker curl."
    },
    {
      term: "Golden Zone",
      definition:
        "The area around the near-post corner of the 18 that we keep open. The read lives here: zero or one defender → Go Short; two → Go Long. Zero or one high → go immediately; one tight → deliberate short 2v1."
    },
    {
      term: "Malone",
      definition:
        "On immediate short: feeds Stockton as Stockton runs the goal line. On deliberate short: touches first to prep the ball, then bends to the Golden Zone. On long: if he isn’t striking, he curls before the ball is hit for a rebound."
    },
    {
      term: "Stockton",
      definition:
        "On immediate short: starts running the goal line and receives Malone’s feed on the move. On deliberate short: takes Malone’s touch and dribbles the goal line. On long: usually delivers across the face after Skittles arrives (partner curls early)."
    },
    {
      term: "Skittles",
      definition:
        "Visible, colorful distraction — we hope the defense fixates on him. Starts near the back post and runs first when we are waiting on the read (deliberate short or Go Long). Skip his wait on immediate short (zero or one high)."
    },
    {
      term: "Screen",
      definition: "Screens the keeper so he can’t see the ball, then cleans up rebounds."
    },
    {
      term: "Shield",
      definition:
        "Drops to shield a ball coming out of the box and stop a counterattack (holds the D / recovery space)."
    },
    {
      term: "Spot",
      definition: "To the penalty spot while the ball is in the air; clean rebounds, balanced to shoot."
    }
  ];

  const CORNER_ROLES = {
    malone:
      "Malone — on immediate short, feeds Stockton on the run; on deliberate short, touches then bends; on long, curls early if he isn’t striking",
    stockton:
      "Stockton — on short, runs/dribbles the goal line; on long, delivers across the face after Skittles (partner curls early)",
    skittles:
      "Skittles — colorful distraction; runs first when we wait (deliberate short or Go Long); skip him on immediate short",
    screen: "Screen — screens the keeper so he can’t see the ball; then cleans rebounds",
    spot: "Spot — to the penalty spot while the ball is in the air",
    shield: "Shield — drops to shield balls out of the box and stop counters",
    cornerDefense: "Corner Defense — delay counters, win long balls, +1 numbers in back"
  };

  const NAV_GROUPS = [
    {
      id: "cfc-attack-group",
      label: "Attack",
      modules: ["cfc-attack", "cfc-wide", "cfc-support"]
    },
    {
      id: "cfc-defense-group",
      label: "Defense",
      href: "#cfc-defense",
      modules: ["cfc-defense"]
    },
    {
      id: "cfc-set-pieces-group",
      label: "Set Pieces",
      modules: ["cfc-corner"]
    }
  ];

  const MODULES = [
    {
      id: "cfc-basics",
      title: "Basic 4-1-2-1",
      subtitle: "Numbers · codes · shape shifts",
      purpose:
        "Learn our shirt numbers and position codes, then how we shift into a 2-3-3 in attack and a 4-3-1 out of possession.",
      chapters: ["cfc-basics-numbers", "cfc-basics-shapes"],
      hash: "cfc-basics",
      overview: {
        headline: "Know your number → know your job → know the shifts",
        intro:
          "Before the game-model modules, lock in the basics: who wears which number, what the code letters mean, and how our base 4-1-2-1 becomes a 2-3-3 (attack) or a 4-3-1 (defense).",
        principles: [
          {
            title: "Numbers and codes",
            body:
              "Shirt numbers: " +
              SHIRT_MAP +
              ". No 7 or 11 — we do not play with wingers. The number is on the triangle; the code is the job."
          },
          {
            title: "2-3-3 is how we occupy when we attack",
            body:
              "Not a second formation. High up the field we fill two deepest (center backs), three central (6-8-10), and three high (wingback–9–wingback). Width comes from the wingbacks; the 8 and 10 can step into half-spaces."
          },
          {
            title: "4-3-1 is how we occupy when we defend",
            body:
              "Out of possession we fill a back four, a midfield three (8-6-10), and the 9 higher. The mid three already covers central space — there are no wingers to drop into a midfield four."
          }
        ],
        cues: [
          "Number = shirt. Code = job.",
          "Attack: occupy the 2-3-3.",
          "Defend: fill the 4-3-1.",
          "Width from wingbacks. Midfield is 6-8-10."
        ]
      }
    },
    {
      id: "cfc-attack",
      title: "Attacking Shape",
      subtitle: "Transition & 2-3-3",
      purpose:
        "Decide when to attack immediately and how to occupy the 2-3-3 once possession is established.",
      chapters: ["cfc-attack-the-moment", "cfc-create-2-3-3"],
      hash: "cfc-attack",
      group: "cfc-attack-group",
      overview: {
        headline: "Win it → look forward → occupy the 2-3-3",
        intro:
          "This module teaches our attacking game model in two connected parts: the first seconds after we win the ball, then how we occupy the field once possession is established.",
        principles: [
          {
            title: "Look to go long",
            body:
              "After a win, look to go long — a free drive, a runner with an advantage, or a disorganized back line. If it’s not on, build wide through the wingbacks to create scoring opportunities."
          },
          {
            title: "2-3-3 is an occupation map",
            body:
              "It is not a second formation. High up the field we fill two deepest, three central support/rest defense, and three high. Players rotate into useful spaces; they do not stand on fixed dots."
          },
          {
            title: "Wingbacks own the width",
            body:
              "There are no wingers. The 2 and 3 push to provide the wide channels. The 8 and 10 stay central or step into half-spaces — they do not become wide statues."
          },
          {
            title: "The 6 connects and protects",
            body:
              "In the attacking third the 6 is our deepest central attacker and first central defender — often around Zone 14 — recycling, facing forward, and stopping counters."
          }
        ],
        cues: [
          "Look to go long. If it’s not on — build wide.",
          "Wingbacks for width. 8 and 10 for half-spaces.",
          "2-3-3: two deep, three mid, three high.",
          "The 6 connects the attack and protects the turnover."
        ]
      }
    },
    {
      id: "cfc-wide",
      title: "Wide Attack Patterns",
      subtitle: "Triangle → gap pass → rotate or switch",
      purpose:
        "Find the wide triangle (wingback + half-space + deep), play the gap pass, rotate when tracked, switch when the chance is gone.",
      chapters: ["cfc-wide-attack"],
      hash: "cfc-wide",
      group: "cfc-attack-group",
      overview: {
        headline: "Triangle → gap pass → finish, rotate, or switch",
        intro:
          "Once we find the wide triangle (A wide, B half-space, C deep), this is the decision tree. A is usually the wingback. When the cross is on, Supporting Runs covers near post / far post / cutback.",
        principles: [
          {
            title: "1. Find the wide triangle",
            body:
              "A = wide (usually the wingback after a switch), B = half-space (usually 8 or 10), C = deep support (usually the 6 or the other midfielder). Letters are spaces — not fixed shirt numbers."
          },
          {
            title: "2. Gap pass to the half-space runner",
            body:
              "Look for B running in behind their wide defender. A’s pass travels in front of that defender — different gaps. Ideally B drives the goal line and shoots, crosses, or cuts back to a supporting runner."
          },
          {
            title: "3. As B runs — C follows, A underneath",
            body:
              "While B attacks the half-space, C follows and A rotates underneath. That keeps the triangle alive so if the first ball does not create a finish, B can become the next wide player."
          },
          {
            title: "4. Tracked? B back to the corner — try again",
            body:
              "If B is tracked and the gap pass is off, he rotates back toward the corner (wide). A’s and C’s rotation has already rebuilt the triangle — so we can create a new half-space run and another ball in behind."
          },
          {
            title: "5. Chance gone? Switch",
            body:
              "If the side is blocked off, the chance has died, or their defense has organized — do not force it. Switch to the other wingback and run the same idea from there."
          }
        ],
        cues: [
          "Find the triangle → look half-space.",
          "Run behind the defender. Pass in front of him.",
          "B runs → C follows, A underneath.",
          "Tracked? B to the corner — new gap pass.",
          "Blocked / organized? Switch sides."
        ]
      }
    },
    {
      id: "cfc-support",
      title: "Supporting Runs",
      subtitle: "Near · Far · Cutback",
      purpose:
        "Anytime a cross is coming — wide attack, set piece, or breakaway — attack near post, far post, and the cutback to the penalty spot.",
      chapters: ["cfc-supporting-runs"],
      hash: "cfc-support",
      group: "cfc-attack-group",
      overview: {
        headline: "Near post · Far post · Cutback to the spot",
        intro:
          "With only three high, every runner matters. When we are about to hit a cross, supporting runners do not ball-watch. The same three-run pattern holds from wide attack, set pieces, and breakaways.",
        principles: [
          {
            title: "Three runs, every time",
            body:
              "Near post. Far post. Cutback toward the penalty spot. Fill those jobs — often the 9, the far-side wingback or midfielder, and the late 8/10. Shirt numbers can change."
          },
          {
            title: "Near post",
            body:
              "Attack the front post with pace. Arrive as the ball arrives — force the first defender and the keeper to deal with a runner."
          },
          {
            title: "Far post",
            body:
              "Arrive across the face at the back post. Often the late runner if the near-post and cutback draws the first line."
          },
          {
            title: "Cutback to the penalty spot",
            body:
              "When the wingback (or half-space runner) drives the goal line, someone must be on or around the penalty spot for the ball pulled back — not everyone crashing the posts."
          },
          {
            title: "Same pattern, every context",
            body:
              "Wide-attack cross, corner serve, breakaway pull-back — the supporting-run jobs stay the same."
          }
        ],
        cues: [
          "Near. Far. Cutback.",
          "Don’t ball-watch — fill a post or the spot.",
          "Goal-line drive → someone on the penalty spot.",
          "Same three runs: open play, set piece, breakaway."
        ]
      }
    },
    {
      id: "cfc-defense",
      title: "Defensive Shape",
      subtitle: "Matchups & 4-3-1",
      purpose:
        "Know your matchup, then organize out of possession into a 4-3-1 — back four, midfield three, 9 higher.",
      chapters: ["cfc-defensive-responsibilities", "cfc-defend-4-3-1"],
      hash: "cfc-defense",
      group: "cfc-defense-group",
      overview: {
        headline: "Know your player — then fill the 4-3-1",
        intro:
          "This module has two connected parts: man-oriented matchups and cover, then how we occupy the field out of possession as a 4-3-1 — the defensive mirror of our attacking 2-3-3.",
        principles: [
          {
            title: "Base matchups (vs a typical 9v9)",
            body:
              "Wingbacks take opposing wide players. Both center backs account for the 9 (plus-one = pressure + cover). The 6 takes the highest central midfield threat. The 8 and 10 take the remaining midfielders. The 9 presses with a plan — often their deepest midfielder or the first pass out."
          },
          {
            title: "4-3-1 is a defensive occupation map",
            body:
              "It is not a second formation. Out of possession we fill space as a back four, a midfield three (8-6-10), and one higher. We do not invent a midfield four by dropping phantom wingers."
          },
          {
            title: "Stay compact — mid three connected",
            body:
              "The 8 and 10 recover into a line with the 6 so we are not outnumbered centrally. Wingbacks stay connected to the center backs — do not get stranded high when their wide player threatens behind."
          },
          {
            title: "Plus-one means pressure + cover",
            body:
              "One can engage while another protects the next dangerous action. It does not mean two players glued beside an attacker everywhere he goes."
          },
          {
            title: "Pass runners off",
            body:
              "Do not chase automatically. If a runner enters a teammate’s area and following opens central space, pass him off — communicate, and the receiving defender stays goal-side."
          },
          {
            title: "After we lose it",
            body:
              "Close numbers + cover behind → counterpress (squeeze). They escape or we are stretched → recover. The 9 presses with a plan, not alone."
          }
        ],
        cues: [
          "Know your player; protect the shape.",
          "Out of possession: 4-3-1.",
          "Mid three connected. Wingbacks connected to CBs.",
          "Pressure plus cover equals plus-one."
        ]
      }
    },
    {
      id: "cfc-corner",
      title: "Corners",
      subtitle: "Golden Zone · Go Short · Go Long",
      purpose:
        "Read the Golden Zone, then master short and long roles — same reads as the Blueprint, without back-post targets.",
      chapters: ["cfc-corner-lock", "cfc-short-corners", "cfc-long-corners"],
      hash: "cfc-corner",
      group: "cfc-set-pieces-group",
      overview: {
        headline: "Read the Golden Zone → Go Short or Go Long",
        intro:
          "Same Golden Zone language as the Blueprint. Defenders in the Golden Zone decide short vs long — and whether the short is immediate or deliberate. Malone and Stockton run the short; Skittles starts the wait sequence when we aren’t going now. With nine, we drop Front/Back Targets — Screen, Spot, Shield, and the early curl cover those jobs.",
        principles: [
          {
            title: "The Golden Zone read",
            body:
              "The Golden Zone is the near-post corner of the 18 — we keep it open. Zero or one defender there → Go Short. Two defenders there → Go Long. Extra short read: zero, or one who is high → go immediately. One tight on the short → deliberate 2v1 after Skittles."
          },
          {
            title: "Immediate short — go now",
            body:
              "Zero defenders in the corner, or one defender who is high: do not wait for Skittles. Stockton starts running along the goal line; Malone feeds him as he’s running. Quick attack before the defense can reset."
          },
          {
            title: "Deliberate short — wait, then 2v1",
            body:
              "One defender tight on the short: Malone raises his hand, everyone stares at Skittles, then after Skittles arrives we go short. Malone touches and bends to the Golden Zone; Stockton dribbles the goal line and looks for the cutback. Others start at the back post to keep the Golden Zone empty."
          },
          {
            title: "Go Long — curl early, then deliver",
            body:
              "After Skittles arrives: whoever isn’t striking the ball curls before it is hit — so he can arrive for a rebound off the long serve. Then Stockton delivers across the face. Screen blocks the keeper’s view. Spot hits the penalty spot. Shield drops to stop counters. Corner Defense keeps +1 behind. No separate Front/Back Targets."
          },
          {
            title: "Roles are jobs, not fixed numbers",
            body:
              "Stockton, Malone, Skittles, Screen, Spot, Shield, and Corner Defense can be filled by different players each week — know the job."
          }
        ],
        cues: [
          "Zero or one in the Golden Zone: Go Short. Two: Go Long.",
          "Zero or one high → go now. Stockton runs; Malone feeds.",
          "One tight → wait for Skittles, then 2v1.",
          "Go Long: non-striker curls before the ball is hit.",
          "Screen · Spot · Shield — no back-post targets."
        ]
      }
    },
    {
      id: "cfc-challenge",
      title: "Mixed Challenge",
      purpose: "Unlabeled scenarios from every module. Eight questions. Results by concept.",
      hash: "cfc-challenge",
      isChallenge: true
    }
  ];

  const SCENARIOS = [
    /* ---------- Basics ---------- */
    {
      id: "cfc-basics-01",
      module: "cfc-basics",
      chapter: "cfc-basics-numbers",
      title: "Base 4-1-2-1 — Numbers & Codes",
      phase: "learn",
      concept: "numbering",
      interactionType: "multiple-choice",
      prompt: "Look at our base 4-1-2-1. Which number is the defensive midfielder (DM)?",
      seeIt: "Blue triangles = us in a 4-1-2-1. Find the player who sits ahead of the center backs and screens the middle.",
      players: base4121(),
      options: [
        { id: "a", label: "6", correct: true },
        { id: "b", label: "8", correct: false },
        { id: "c", label: "10", correct: false },
        { id: "d", label: "4", correct: false }
      ],
      explanation:
        "The 6 is our defensive midfielder — the single pivot ahead of the back four. The 8 and 10 play ahead of him.",
      coachingCue: "Number = shirt. Code = job.",
      rationaleOptions: [
        { id: "r1", label: "He screens the center backs and connects to the 8 and 10.", correct: true },
        { id: "r2", label: "He is the highest player and scores most of the goals.", correct: false },
        { id: "r3", label: "He only plays on the right wing.", correct: false }
      ]
    },
    {
      id: "cfc-basics-02",
      module: "cfc-basics",
      chapter: "cfc-basics-numbers",
      title: "Match Numbers to Codes",
      phase: "learn",
      concept: "numbering",
      interactionType: "match-responsibilities",
      prompt: "Pair each shirt number with its position code. Tap one of our players, then the matching code on the right.",
      seeIt: "Blue triangles = shirt numbers (codes hidden). Red tokens on the right = job codes. Match every number to its code.",
      players: base4121({
        "our-1": { hideLabel: true },
        "our-2": { hideLabel: true },
        "our-3": { hideLabel: true },
        "our-4": { hideLabel: true },
        "our-5": { hideLabel: true },
        "our-6": { hideLabel: true },
        "our-8": { hideLabel: true },
        "our-10": { hideLabel: true },
        "our-9": { hideLabel: true }
      }),
      opponents: [
        { id: "code-gk", team: "opp", number: "GK", role: "Goalkeeper", x: 62, y: 98, hideLabel: true },
        { id: "code-rwb", team: "opp", number: "RWB", role: "Right wingback", x: 62, y: 78, hideLabel: true },
        { id: "code-rcb", team: "opp", number: "RCB", role: "Right center back", x: 62, y: 68, hideLabel: true },
        { id: "code-lcb", team: "opp", number: "LCB", role: "Left center back", x: 62, y: 58, hideLabel: true },
        { id: "code-lwb", team: "opp", number: "LWB", role: "Left wingback", x: 62, y: 48, hideLabel: true },
        { id: "code-dm", team: "opp", number: "DM", role: "Defensive midfielder", x: 62, y: 38, hideLabel: true },
        { id: "code-cm", team: "opp", number: "CM", role: "Central midfielder", x: 62, y: 28, hideLabel: true },
        { id: "code-am", team: "opp", number: "AM", role: "Attacking midfielder", x: 62, y: 18, hideLabel: true },
        { id: "code-cf", team: "opp", number: "CF", role: "Center forward", x: 62, y: 8, hideLabel: true }
      ],
      matchPairs: [
        { playerId: "our-1", codeId: "code-gk" },
        { playerId: "our-2", codeId: "code-rwb" },
        { playerId: "our-4", codeId: "code-rcb" },
        { playerId: "our-5", codeId: "code-lcb" },
        { playerId: "our-3", codeId: "code-lwb" },
        { playerId: "our-6", codeId: "code-dm" },
        { playerId: "our-8", codeId: "code-cm" },
        { playerId: "our-10", codeId: "code-am" },
        { playerId: "our-9", codeId: "code-cf" }
      ],
      explanation:
        "Every shirt maps to a job code. No RW/LW — width is RWB/LWB. Lock these in — every other module uses this language.",
      coachingCue: "Number = shirt. Code = job."
    },
    {
      id: "cfc-basics-03",
      module: "cfc-basics",
      chapter: "cfc-basics-shapes",
      title: "Into the 2-3-3 — Wingbacks High",
      phase: "learn",
      concept: "attacking-shape",
      interactionType: "multiple-choice",
      prompt:
        "From our base 4-1-2-1, how do we occupy a 2-3-3 in attack?",
      seeIt: "Blue triangles show an attacking 2-3-3: two CBs deep, 6-8-10 central, wingbacks high with the 9.",
      players: attack233(),
      options: [
        {
          id: "a",
          label: "CBs stay deepest; 6-8-10 form the mid three; wingbacks + 9 are the high three",
          correct: true
        },
        {
          id: "b",
          label: "Wingers push wide and fullbacks tuck next to the 6",
          correct: false
        },
        {
          id: "c",
          label: "Everyone drops into a flat back nine",
          correct: false
        },
        {
          id: "d",
          label: "The 9 and 6 swap so the 6 becomes the striker",
          correct: false
        }
      ],
      explanation:
        "2-3-3 is occupation, not a new formation. Two deepest (4 & 5), three central (6-8-10), three high (2-9-3). Width from wingbacks — we have no wingers.",
      coachingCue: "Attack: occupy the 2-3-3.",
      rationaleOptions: [
        {
          id: "r1",
          label: "Wingbacks provide width; midfield stays 6-8-10; CBs protect the rest defense.",
          correct: true
        },
        {
          id: "r2",
          label: "We add a 7 and 11 so we can play five attacking lanes.",
          correct: false
        },
        {
          id: "r3",
          label: "Both wingbacks must stay next to the center backs at all times.",
          correct: false
        }
      ]
    },
    {
      id: "cfc-basics-04",
      module: "cfc-basics",
      chapter: "cfc-basics-shapes",
      title: "Into the 4-3-1 — Out of Possession",
      phase: "learn",
      concept: "defending-shape",
      interactionType: "multiple-choice",
      prompt: "Out of possession, how do we fill the 4-3-1?",
      seeIt: "Blue triangles in a defensive 4-3-1: back four, midfield three, 9 higher.",
      players: defend431(),
      options: [
        {
          id: "a",
          label: "Back four, midfield three (8-6-10), and the 9 higher",
          correct: true
        },
        {
          id: "b",
          label: "Drop the 7 and 11 into a midfield four like an 11v11 4-4-2",
          correct: false
        },
        {
          id: "c",
          label: "Leave both wingbacks high and defend with three",
          correct: false
        },
        {
          id: "d",
          label: "Park everyone on the six-yard line",
          correct: false
        }
      ],
      explanation:
        "4-3-1 is the defensive occupation map: back four, connected mid three, 9 higher. No phantom wingers — we never had a 7 or 11.",
      coachingCue: "Defend: fill the 4-3-1.",
      rationaleOptions: [
        {
          id: "r1",
          label: "The mid three already covers central space; wingbacks defend wide in the back four.",
          correct: true
        },
        {
          id: "r2",
          label: "We need five midfielders because 9v9 is more open.",
          correct: false
        },
        {
          id: "r3",
          label: "The 9 must drop into the midfield line every time.",
          correct: false
        }
      ]
    },

    /* ---------- Attack ---------- */
    {
      id: "cfc-attack-01",
      module: "cfc-attack",
      chapter: "cfc-attack-the-moment",
      title: "First Look After the Win",
      phase: "decide",
      concept: "attacking-shape",
      interactionType: "multiple-choice",
      prompt:
        "We just won the ball in midfield. Their back line is disorganized and our 9 has a lane. What is the first look?",
      seeIt: "Ball at our 8’s feet. Their defense is broken. Our 9 is free in behind.",
      players: attack233({
        "our-8": { x: 40, y: 48 },
        "our-9": { x: 38, y: 20 }
      }),
      ball: { x: 40, y: 48 },
      opponents: [
        { id: "opp-1", team: "opp", number: 4, role: "CB", x: 30, y: 36 },
        { id: "opp-2", team: "opp", number: 5, role: "CB", x: 48, y: 40 },
        { id: "opp-3", team: "opp", number: 2, role: "WB", x: 58, y: 44 }
      ],
      options: [
        { id: "a", label: "Look to go long — play the 9 while they are disorganized", correct: true },
        { id: "b", label: "Always pass back to the goalkeeper first", correct: false },
        { id: "c", label: "Stop and wait for a coaching cue", correct: false },
        { id: "d", label: "Boot it out of bounds to reset", correct: false }
      ],
      explanation:
        "First look after a win: go long if a free drive or runner with advantage is on. If not — build wide through the wingbacks.",
      coachingCue: "Look to go long. If it’s not on — build wide."
    },
    {
      id: "cfc-attack-02",
      module: "cfc-attack",
      chapter: "cfc-create-2-3-3",
      title: "Who Provides the Width?",
      phase: "decide",
      concept: "attacking-shape",
      interactionType: "multiple-choice",
      prompt: "In our attacking 2-3-3, who primarily provides the wide channels?",
      seeIt: "Attacking occupation with wingbacks high left and right of the 9.",
      players: attack233(),
      options: [
        { id: "a", label: "The wingbacks (2 and 3)", correct: true },
        { id: "b", label: "The 7 and 11 wingers", correct: false },
        { id: "c", label: "Both center backs", correct: false },
        { id: "d", label: "Only the 9 drifting wide", correct: false }
      ],
      explanation:
        "We do not play with wingers. The 2 and 3 become the wide options. The 8 and 10 work half-spaces and central combinations.",
      coachingCue: "Wingbacks for width. 8 and 10 for half-spaces."
    },
    {
      id: "cfc-attack-03",
      module: "cfc-attack",
      chapter: "cfc-create-2-3-3",
      title: "Where Does the 6 Sit High?",
      phase: "decide",
      concept: "attacking-shape",
      interactionType: "pitch-hotspot",
      prompt: "When we are established high, tap the zone where the 6 usually connects and protects.",
      seeIt: "Attacking 2-3-3. Tap the central pocket just outside their box — Zone 14.",
      players: attack233(),
      zones: [
        { id: "zone-14", label: "Zone 14", x: 24, y: 28, w: 20, h: 14 },
        { id: "wide-right", label: "Wide right", x: 52, y: 18, w: 14, h: 16 },
        { id: "deep-cb", label: "Deep CB line", x: 20, y: 72, w: 28, h: 12 }
      ],
      correctAnswer: "zone-14",
      explanation:
        "The 6 is our deepest central attacker and first central defender — often around Zone 14 — recycling and stopping counters.",
      coachingCue: "The 6 connects the attack and protects the turnover."
    },

    /* ---------- Wide ---------- */
    {
      id: "cfc-wide-01",
      module: "cfc-wide",
      chapter: "cfc-wide-attack",
      title: "Build the Wide Triangle",
      phase: "decide",
      concept: "wide-attack",
      interactionType: "multiple-choice",
      prompt:
        "Ball with our right wingback after a switch. Who should occupy A (wide), B (half-space), and C (deep)?",
      seeIt: "Right side open. Letters are spaces — fill the triangle.",
      players: attack233({
        "our-2": { x: 60, y: 28, role: "A — wide" },
        "our-8": { x: 46, y: 32, role: "B — half-space" },
        "our-6": { x: 40, y: 48, role: "C — deep" }
      }),
      ball: { x: 60, y: 28 },
      options: [
        {
          id: "a",
          label: "A = wingback (wide), B = 8/10 (half-space), C = 6 or other mid (deep)",
          correct: true
        },
        {
          id: "b",
          label: "A = center back, B = goalkeeper, C = 9",
          correct: false
        },
        {
          id: "c",
          label: "All three must be wingbacks",
          correct: false
        },
        {
          id: "d",
          label: "A and B are fixed to shirts 7 and 11",
          correct: false
        }
      ],
      explanation:
        "Same A/B/C language as the Blueprint — but A is usually the wingback, not a winger. B is typically the 8 or 10 stepping into the half-space.",
      coachingCue: "Find the triangle → look half-space."
    },
    {
      id: "cfc-wide-02",
      module: "cfc-wide",
      chapter: "cfc-wide-attack",
      title: "Gap Pass Decision",
      phase: "decide",
      concept: "wide-attack",
      interactionType: "multiple-choice",
      prompt:
        "B (our 8) is running behind their wide defender. Where should the wingback’s pass travel?",
      seeIt: "B attacking the half-space. Their wide defender is between A and B.",
      players: attack233({
        "our-2": { x: 58, y: 30 },
        "our-8": { x: 48, y: 22 }
      }),
      ball: { x: 58, y: 30 },
      opponents: [
        { id: "opp-wb", team: "opp", number: 3, role: "WB", x: 52, y: 26 }
      ],
      options: [
        {
          id: "a",
          label: "In front of their defender — different gap than B’s run",
          correct: true
        },
        {
          id: "b",
          label: "Straight into the defender’s feet",
          correct: false
        },
        {
          id: "c",
          label: "Backwards to the goalkeeper only",
          correct: false
        },
        {
          id: "d",
          label: "Into touch to win a throw",
          correct: false
        }
      ],
      explanation:
        "Gap pass: runner behind the defender, ball in front of him — one defender cannot solve both problems.",
      coachingCue: "Run behind the defender. Pass in front of him."
    },
    {
      id: "cfc-wide-03",
      module: "cfc-wide",
      chapter: "cfc-wide-attack",
      title: "Tracked — What Next?",
      phase: "decide",
      concept: "wide-attack",
      interactionType: "ordered-decision",
      prompt: "B is tracked and the gap pass is off. Put the next actions in order.",
      seeIt: "Wide triangle on the right. B’s run is covered.",
      players: attack233({
        "our-2": { x: 58, y: 30 },
        "our-8": { x: 48, y: 24 },
        "our-6": { x: 40, y: 46 }
      }),
      ball: { x: 58, y: 30 },
      opponents: [
        { id: "opp-1", team: "opp", number: 3, role: "WB", x: 50, y: 22 }
      ],
      sequence: [
        { id: "s1", label: "B checks back toward the corner (wide)" },
        { id: "s2", label: "A and C’s rotation has rebuilt the triangle" },
        { id: "s3", label: "Create a new half-space run and gap pass — or switch if blocked" }
      ],
      explanation:
        "Tracked is not dead. Rebuild the triangle and try again — or switch to the other wingback if the side is gone.",
      coachingCue: "Tracked? B to the corner — new gap pass."
    },

    /* ---------- Support ---------- */
    {
      id: "cfc-support-01",
      module: "cfc-support",
      chapter: "cfc-supporting-runs",
      title: "Three Runs on the Cross",
      phase: "decide",
      concept: "supporting-runs",
      interactionType: "multiple-choice",
      prompt:
        "Our right wingback is about to cross. Which three jobs must be filled?",
      seeIt: "Wingback on the goal line. Attackers organizing in the box.",
      players: attack233({
        "our-2": { x: 62, y: 12 },
        "our-9": { x: 40, y: 10 },
        "our-10": { x: 28, y: 14 },
        "our-8": { x: 36, y: 22 }
      }),
      ball: { x: 62, y: 12 },
      options: [
        { id: "a", label: "Near post · Far post · Cutback to the penalty spot", correct: true },
        { id: "b", label: "Everyone stands on the six-yard line", correct: false },
        { id: "c", label: "Only the 9 attacks — everyone else watches", correct: false },
        { id: "d", label: "Both center backs join the front post", correct: false }
      ],
      explanation:
        "Same three-run pattern as the Blueprint. With fewer players ahead, every job still must be filled — often 9, far-side runner, and late 8/10 on the spot.",
      coachingCue: "Near. Far. Cutback."
    },
    {
      id: "cfc-support-02",
      module: "cfc-support",
      chapter: "cfc-supporting-runs",
      title: "Goal-Line Drive — Who Hits the Spot?",
      phase: "decide",
      concept: "supporting-runs",
      interactionType: "drag-player",
      prompt: "The wingback is driving the goal line. Drag a teammate onto the cutback spot.",
      seeIt: "Drag the late midfielder onto the penalty spot for the pull-back.",
      players: attack233({
        "our-2": { x: 60, y: 10 },
        "our-9": { x: 42, y: 8 },
        "our-3": { x: 18, y: 12 },
        "our-8": { x: 44, y: 36 }
      }),
      ball: { x: 60, y: 10 },
      dragPlayerId: "our-8",
      dragTarget: { x: 34, y: 18, r: 7 },
      explanation:
        "Goal-line drive → someone on the penalty spot. Do not let everyone crash the posts and leave the cutback empty.",
      coachingCue: "Goal-line drive → someone on the penalty spot."
    },

    /* ---------- Defense ---------- */
    {
      id: "cfc-defense-01",
      module: "cfc-defense",
      chapter: "cfc-defensive-responsibilities",
      title: "Wingback Matchup",
      phase: "decide",
      concept: "defending-shape",
      interactionType: "multiple-choice",
      prompt: "Their left wide player has the ball. Who is our primary matchup?",
      seeIt: "Opponent wide on our right. Our back four and mid three are set.",
      players: defend431(),
      opponents: [
        { id: "opp-wide", team: "opp", number: 11, role: "Wide", x: 58, y: 40 },
        { id: "opp-9", team: "opp", number: 9, role: "CF", x: 34, y: 52 }
      ],
      ball: { x: 58, y: 40 },
      options: [
        { id: "a", label: "Our right wingback (2)", correct: true },
        { id: "b", label: "Our left wingback (3)", correct: false },
        { id: "c", label: "Our 9", correct: false },
        { id: "d", label: "Our goalkeeper", correct: false }
      ],
      explanation:
        "Wingbacks take opposing wide players. Center backs stay plus-one on the 9; mid three stays connected.",
      coachingCue: "Know your player; protect the shape."
    },
    {
      id: "cfc-defense-02",
      module: "cfc-defense",
      chapter: "cfc-defend-4-3-1",
      title: "Fill the Midfield Three",
      phase: "decide",
      concept: "defending-shape",
      interactionType: "formation-diagnosis",
      prompt: "Which picture shows a correct 4-3-1 defensive occupation?",
      seeIt: "Compare the options. Look for back four + mid three + 9 higher.",
      players: defend431(),
      options: [
        {
          id: "a",
          label: "Back four, 8-6-10 in a mid line, 9 higher",
          correct: true
        },
        {
          id: "b",
          label: "Back four, midfield four with phantom 7 and 11, two high",
          correct: false
        },
        {
          id: "c",
          label: "Back three, five midfielders, no forward",
          correct: false
        },
        {
          id: "d",
          label: "Both wingbacks parked next to the opposing goalkeeper",
          correct: false
        }
      ],
      explanation:
        "Out of possession: 4-3-1. We do not copy the 11v11 4-4-2 by inventing wingers to drop.",
      coachingCue: "Out of possession: 4-3-1."
    },
    {
      id: "cfc-defense-03",
      module: "cfc-defense",
      chapter: "cfc-defend-4-3-1",
      title: "Plus-One on Their 9",
      phase: "decide",
      concept: "defending-shape",
      interactionType: "multiple-choice",
      prompt: "Their 9 is the danger. How do our center backs use plus-one?",
      seeIt: "Opponent 9 between our 4 and 5.",
      players: defend431(),
      opponents: [{ id: "opp-9", team: "opp", number: 9, role: "CF", x: 34, y: 58 }],
      options: [
        {
          id: "a",
          label: "One pressures; the other covers the next action — not two shadows glued to him",
          correct: true
        },
        {
          id: "b",
          label: "Both center backs leave him and mark the wingbacks",
          correct: false
        },
        {
          id: "c",
          label: "The 6 alone marks him from midfield forever",
          correct: false
        },
        {
          id: "d",
          label: "Ignore him until he scores",
          correct: false
        }
      ],
      explanation:
        "Plus-one = pressure + cover. One can engage; the other protects the next dangerous action.",
      coachingCue: "Pressure plus cover equals plus-one."
    },

    /* ---------- Corners ---------- */
    {
      id: "cfc-corner-01",
      module: "cfc-corner",
      chapter: "cfc-corner-lock",
      title: "Golden Zone Read — Zero",
      phase: "decide",
      concept: "corners-short",
      interactionType: "multiple-choice",
      prompt: "Zero defenders in the Golden Zone. What is the read?",
      seeIt: "Corner setup. Golden Zone (near-post corner of the 18) is empty.",
      pitchView: { x: 0, y: 0, w: 68, h: 55 },
      players: [
        { id: "malone", team: "ours", number: "M", role: "Malone", x: 4, y: 8 },
        { id: "stockton", team: "ours", number: "S", role: "Stockton", x: 12, y: 18 },
        { id: "skittles", team: "ours", number: "K", role: "Skittles", x: 40, y: 8 },
        { id: "screen", team: "ours", number: "Sc", role: "Screen", x: 30, y: 6 },
        { id: "spot", team: "ours", number: "Sp", role: "Spot", x: 34, y: 16 },
        { id: "shield", team: "ours", number: "Sh", role: "Shield", x: 34, y: 28 },
        { id: "cd", team: "ours", number: "CD", role: "Corner Defense", x: 34, y: 42 }
      ],
      zones: [
        { id: "golden", label: "Golden Zone", x: 8, y: 12, w: 14, h: 12 }
      ],
      ball: { x: 2, y: 2 },
      options: [
        { id: "a", label: "Go Short immediately — Stockton runs; Malone feeds", correct: true },
        { id: "b", label: "Go Long after Skittles", correct: false },
        { id: "c", label: "Wait forever for Skittles before any action", correct: false },
        { id: "d", label: "Call offside and walk away", correct: false }
      ],
      explanation:
        "Zero in the Golden Zone → Go Short now. Do not wait for Skittles. Same read as the Blueprint.",
      coachingCue: "Zero or one high → go now. Stockton runs; Malone feeds."
    },
    {
      id: "cfc-corner-02",
      module: "cfc-corner",
      chapter: "cfc-short-corners",
      title: "One Tight — Deliberate Short",
      phase: "decide",
      concept: "corners-short",
      interactionType: "ordered-decision",
      prompt: "One defender is tight on the short. Order the deliberate short sequence.",
      seeIt: "Defender tight on Malone/Stockton. Golden Zone still the read.",
      pitchView: { x: 0, y: 0, w: 68, h: 55 },
      players: [
        { id: "malone", team: "ours", number: "M", role: "Malone", x: 4, y: 8 },
        { id: "stockton", team: "ours", number: "S", role: "Stockton", x: 12, y: 18 },
        { id: "skittles", team: "ours", number: "K", role: "Skittles", x: 42, y: 8 },
        { id: "screen", team: "ours", number: "Sc", role: "Screen", x: 30, y: 6 },
        { id: "spot", team: "ours", number: "Sp", role: "Spot", x: 34, y: 16 },
        { id: "shield", team: "ours", number: "Sh", role: "Shield", x: 34, y: 28 },
        { id: "cd", team: "ours", number: "CD", role: "Corner Defense", x: 34, y: 42 }
      ],
      opponents: [
        { id: "opp-tight", team: "opp", number: 2, role: "Tight", x: 10, y: 14 }
      ],
      zones: [{ id: "golden", label: "Golden Zone", x: 8, y: 12, w: 14, h: 12 }],
      ball: { x: 2, y: 2 },
      sequence: [
        { id: "s1", label: "Malone hand up — everyone stares at Skittles" },
        { id: "s2", label: "Skittles runs (distraction)" },
        { id: "s3", label: "Malone touches & bends; Stockton dribbles the goal-line 2v1" }
      ],
      explanation:
        "One tight → deliberate short after Skittles. Same sequence as the Blueprint.",
      coachingCue: "One tight → wait for Skittles, then 2v1."
    },
    {
      id: "cfc-corner-03",
      module: "cfc-corner",
      chapter: "cfc-long-corners",
      title: "Two in the Golden Zone — Go Long",
      phase: "decide",
      concept: "corners-long",
      interactionType: "multiple-choice",
      prompt: "Two defenders are in the Golden Zone. What do we do?",
      seeIt: "Two opponents occupy the near-post corner of the 18.",
      pitchView: { x: 0, y: 0, w: 68, h: 55 },
      players: [
        { id: "malone", team: "ours", number: "M", role: "Malone", x: 4, y: 8 },
        { id: "stockton", team: "ours", number: "S", role: "Stockton", x: 6, y: 4 },
        { id: "skittles", team: "ours", number: "K", role: "Skittles", x: 42, y: 8 },
        { id: "screen", team: "ours", number: "Sc", role: "Screen", x: 30, y: 6 },
        { id: "spot", team: "ours", number: "Sp", role: "Spot", x: 34, y: 16 },
        { id: "shield", team: "ours", number: "Sh", role: "Shield", x: 34, y: 28 },
        { id: "cd", team: "ours", number: "CD", role: "Corner Defense", x: 34, y: 42 }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 4, role: "GZ", x: 12, y: 14 },
        { id: "opp-2", team: "opp", number: 5, role: "GZ", x: 16, y: 18 }
      ],
      zones: [{ id: "golden", label: "Golden Zone", x: 8, y: 12, w: 14, h: 12 }],
      ball: { x: 2, y: 2 },
      options: [
        {
          id: "a",
          label: "Go Long — after Skittles, non-striker curls early, then deliver",
          correct: true
        },
        { id: "b", label: "Force the immediate short into two defenders", correct: false },
        { id: "c", label: "Skip Skittles and hope", correct: false },
        { id: "d", label: "Send Front and Back Targets to hold the back post only", correct: false }
      ],
      explanation:
        "Two in the Golden Zone → Go Long. Same timing as the Blueprint. We do not use Front/Back Targets — Screen, Spot, Shield, and the early curl cover those jobs with nine.",
      coachingCue: "Go Long: non-striker curls before the ball is hit."
    },
    {
      id: "cfc-corner-04",
      module: "cfc-corner",
      chapter: "cfc-long-corners",
      title: "Long Roles — No Targets",
      phase: "learn",
      concept: "corners-long",
      interactionType: "match-responsibilities",
      prompt: "Match each corner job to its role token.",
      seeIt: "Tap a role on the pitch, then the matching job code.",
      pitchView: { x: 0, y: 0, w: 68, h: 55 },
      players: [
        { id: "our-screen", team: "ours", number: "Sc", role: "Screen", x: 30, y: 6, hideLabel: true },
        { id: "our-spot", team: "ours", number: "Sp", role: "Spot", x: 34, y: 16, hideLabel: true },
        { id: "our-shield", team: "ours", number: "Sh", role: "Shield", x: 34, y: 28, hideLabel: true },
        { id: "our-cd", team: "ours", number: "CD", role: "Corner Defense", x: 34, y: 42, hideLabel: true }
      ],
      opponents: [
        { id: "code-screen", team: "opp", number: "SCR", role: "Screen keeper", x: 60, y: 10, hideLabel: true },
        { id: "code-spot", team: "opp", number: "SPT", role: "Penalty spot", x: 60, y: 20, hideLabel: true },
        { id: "code-shield", team: "opp", number: "SHD", role: "Hold the D", x: 60, y: 30, hideLabel: true },
        { id: "code-cd", team: "opp", number: "+1", role: "Delay counters", x: 60, y: 40, hideLabel: true }
      ],
      matchPairs: [
        { playerId: "our-screen", codeId: "code-screen" },
        { playerId: "our-spot", codeId: "code-spot" },
        { playerId: "our-shield", codeId: "code-shield" },
        { playerId: "our-cd", codeId: "code-cd" }
      ],
      explanation:
        "Screen, Spot, Shield, Corner Defense stay. Front/Back Targets are dropped for 9v9 — fewer bodies, same jobs that matter.",
      coachingCue: "Screen · Spot · Shield — no back-post targets."
    }
  ];

  window.CfcRedIQ = {
    CONFIG,
    GLOSSARY,
    CORNER_ROLES,
    NAV_GROUPS,
    MODULES,
    SCENARIOS
  };
})();
