/**
 * The Blueprint — Brighton Fresh/Soph Blue Team — scenario data & config
 * Pitch: x 0–68 (width), y 0–105 (length). Attack toward TOP (y→0).
 * Edit wording and coordinates here; app.js renders from this data.
 */
(function () {
  "use strict";
  const CONFIG = {
    teamName: "Brighton Fresh/Soph Blue",
    appName: "The Blueprint",
    storageKey: "brighton-soccer-iq-progress",
    colors: {
      ours: "#1a4d7c",
      oursStroke: "#0b2a47",
      oursText: "#ffffff",
      opp: "#8b3a3a",
      oppStroke: "#4a1a1a",
      oppText: "#ffffff",
      ball: "#ffffff",
      highlight: "#f0c14b",
      correct: "#2d6a4f",
      incorrect: "#9b2226",
      zone: "rgba(126,182,217,0.28)"
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
    challengeCount: 10
  };

  const GLOSSARY = [
    {
      term: "Five attacking lanes",
      definition: "The five vertical channels we aim to occupy when established in possession: two wide channels, two half-spaces, and the central lane."
    },
    {
      term: "Wide channel",
      definition: "The lane nearest either touchline. Usually held by a winger or an overlapping/supporting fullback."
    },
    {
      term: "Half-space",
      definition: "The channel between the wide lane and the center. Ideal for the 8 and 10 to receive between defenders."
    },
    {
      term: "Central lane",
      definition: "The middle vertical lane through the pitch. Dangerous to leave empty in rest defense and valuable for recycling attacks."
    },
    {
      term: "Zone 14",
      definition: "The central pocket just outside the opponent penalty area. Our 6 often occupies this as the deepest central attacker."
    },
    {
      term: "Rest defense",
      definition: "The players positioned to protect against a turnover while we attack — usually including the 6 and at least one deeper defender."
    },
    {
      term: "Plus-one",
      definition: "Keeping a spare defender behind the primary marker so one can pressure while another covers the next dangerous action."
    },
    {
      term: "Near-post run",
      definition: "A supporting run that attacks the near post when a cross (or serve) is coming. One of three standard supporting runs with far post and cutback."
    },
    {
      term: "Far-post run",
      definition: "A supporting run that attacks the far post when a cross is coming — often arriving late across the face."
    },
    {
      term: "Cutback run",
      definition: "A supporting run toward the penalty spot (or the cutback zone) when a wide player drives the goal line — ready for the ball pulled back, not only balls whipped to the posts."
    },
    {
      term: "Supporting runs (cross)",
      definition: "Anytime we are about to hit a cross — wide attack, set piece, or breakaway — attackers organize near post, far post, and cutback to the penalty spot."
    },
    {
      term: "Man-oriented defending",
      definition: "Starting with clear individual matchups while staying connected to teammates and protecting central space."
    },
    {
      term: "Half-space run",
      definition: "A run in behind the opponent’s wide defender (between FB and CB toward the box), usually from the wide triangle after a switch. Best as a gap pass: ball in front of that defender, runner behind her — aiming for shot, cross, or cutback."
    },
    {
      term: "Wide rotation",
      definition: "When the half-space runner is tracked: she checks back to the corner (wide), while A rotates underneath and C follows — rebuilding the triangle so we can try another half-space run and gap pass. If the chance is gone and the defense is set, switch and try the other side."
    },
    {
      term: "Gap pass",
      definition: "A through ball that enters a different gap than the runner threatens, forcing defenders to solve two problems."
    },
    {
      term: "Third-player run",
      definition: "A runner who becomes available after a bounce or set so the ball skips the press onto a free attacker."
    },
    {
      term: "Overlap",
      definition: "A run around the outside of the ball carrier into the wide channel when the defender narrows."
    },
    {
      term: "Underlap",
      definition: "A run inside the wide player into the half-space or box when the defender is pinned wide."
    },
    {
      term: "Pin",
      definition: "Holding a defender wide or deep with your body shape so a teammate can attack the space she leaves."
    },
    {
      term: "Cover",
      definition: "Supporting a teammate who engages so the next pass or run into dangerous space is protected."
    },
    {
      term: "Counterpress",
      definition: "Immediate coordinated pressure after losing the ball to trap the opponent before they can play forward."
    },
    {
      term: "Defensive recovery",
      definition: "Sprinting back into shape when the opponent escapes pressure and our back line is exposed."
    },
    {
      term: "2-3-5 occupation",
      definition: "Not a separate formation — how we may fill space high: two deepest, three central support/rest defense, five attacking lanes."
    },
    {
      term: "4-4-2 defensive shape",
      definition: "Not a second formation — how we organize out of possession: back four, flat midfield four (7-8-6-11 or 7-6-8-11), and two higher (9 and 10). The 8 drops next to the 6; the 7 and 11 drop to cover deep wide attackers."
    },
    {
      term: "Short corner",
      definition: "Zero or one defender on the corner pair. Player 1 touches then bends to the near-post corner of the 18; Player 2 keeps the ball at the corner and dribbles parallel to the goal line — holding everyone onside for a cutback to 1 or others. Others start at the back post to clear space."
    },
    {
      term: "Direct delivery",
      definition: "Long corner serve used when two defenders are on the corner pair. Skittles clears the six first; Primary serves across the face for Front and Back Targets."
    },
    {
      term: "Skittles",
      definition: "Long-corner starter (formerly “The Run”): begins at the back post, curls across the middle of the box to drag a defender, then circles back to the D for a rebound. After the serve, Spot hits the penalty spot, Drop holds the D, and Targets come in from past the back post."
    },
    {
      term: "Corner Block",
      definition: "Stand in front of the keeper as a nuisance — screen her view — then clean up rebounds."
    },
  ];

  const CORNER_ROLES = {
    // Short-corner pair (any players can fill)
    player1: "Player 1 — touches, then bending run to near-post corner of the 18",
    player2: "Player 2 — keeps the ball at the corner and dribbles parallel to the goal line; cutback to 1 (or others) while holding them onside",
    // Long-corner roles (from team Long Corners sheet)
    primary: "Primary — serves across the face of goal after Skittles clears space",
    secondary: "Secondary — stays at the corner with Primary until the long serve; then drop for rebounds and counters",
    skittles: "Skittles — starts at the back post; curls across the middle of the box (drag a defender), then circles back to the D for a rebound",
    runner: "Skittles — starts at the back post; curls across the middle of the box (drag a defender), then circles back to the D for a rebound",
    frontTarget: "Front Target — starts further past the back post (nearer the goal line than Back), then comes into the back post on the serve",
    backTarget: "Back Target — starts further past the back post (deeper than Front), then comes into the back post on the serve",
    block: "The Block — nuisance in front of the keeper; screen, then clean rebounds",
    spot: "The Spot — to the penalty spot while the ball is in the air; clean rebounds, balanced to shoot",
    drop: "The Drop — to the D (not deep) while the ball is in the air; cut counters or shoot long rebounds",
    cornerDefense: "Corner Defense — delay counters, win long balls, +1 numbers in back"
  };

  const NAV_GROUPS = [
    {
      id: "attack-group",
      label: "Attack",
      modules: ["attack", "wide", "support"]
    },
    {
      id: "defense-group",
      label: "Defense",
      href: "#defense",
      modules: ["defense"]
    },
    {
      id: "set-pieces-group",
      label: "Set Pieces",
      modules: ["corner"]
    }
  ];

  const MODULES = [
    {
      id: "demo",
      title: "Demo",
      subtitle: "How The Blueprint works",
      purpose: "A quick walkthrough for the team — see the pitch, pick an answer, get the cue.",
      chapters: ["demo-walkthrough"],
      hash: "demo",
      overview: {
        headline: "See it → Choose it → Remember the cue",
        intro: "Use this module to learn how the site works before diving into real tactics. Two silly stages — same interactions you'll use everywhere else.",
        principles: [
          {
            title: "Open a module",
            body: "Each module starts with an overview of principles and coaching cues. Read it, then jump into scenarios — or skip and come back later."
          },
          {
            title: "Work a scenario",
            body: "Pitch on one side, question on the other. Look at the picture (numbers + role codes under each player), pick your decision, and sometimes explain why."
          },
          {
            title: "Get the cue",
            body: "Right answers unlock a short coaching cue and a replay animation. Miss once and you'll get a hint — miss twice and the answer is revealed."
          },
          {
            title: "Progress stays on this device",
            body: "Mastery is saved in the browser on this phone/laptop. Mixed Challenge pulls unlabeled questions from the real modules. Coach mode (?coach=1) shows targets when teaching from the front."
          }
        ],
        cues: [
          "See it → Choose it → Explain it → Cue.",
          "Numbers = shirts. Letters under triangles = job codes.",
          "Demo first — then Attack, Defense, Set Pieces."
        ]
      }
    },
    {
      id: "attack",
      title: "Attacking Shape",
      subtitle: "Transition & 2-3-5",
      purpose: "Decide when to attack immediately and how to occupy five lanes in possession.",
      chapters: ["attack-the-moment", "create-2-3-5"],
      hash: "attack",
      group: "attack-group",
      overview: {
        headline: "Win it → look forward → occupy five lanes",
        intro: "This module teaches our attacking game model in two connected parts: the first seconds after we win the ball, then how we occupy the field once possession is established.",
        principles: [
          {
            title: "Forward first, not forward forced",
            body: "After a win, scan for an immediate attack: a free drive, a runner with an advantage, or a disorganized back line. If none of those exist — ball winner isolated, first pass covered, opponent already compact — secure the ball, bring support, then expand."
          },
          {
            title: "2-3-5 is an occupation map",
            body: "It is not a second formation. High up the field we often fill space as two deepest, three central support/rest defense, and five attacking lanes. Players rotate into useful spaces; they do not stand on fixed dots."
          },
          {
            title: "Fullbacks read the winger",
            body: "Winger wide → fullback tucks or supports underneath. Winger inside → fullback becomes the wide option. Far-side fullback stays connected, not abandoned on the touchline."
          },
          {
            title: "The 6 connects and protects",
            body: "In the attacking third the 6 is our deepest central attacker and first central defender — often around Zone 14 — recycling, facing forward, and stopping counters."
          }
        ],
        cues: [
          "Forward first, not forward forced.",
          "Inside winger, outside fullback.",
          "Five lanes, not five statues.",
          "The 6 connects the attack and protects the turnover."
        ]
      }
    },
    {
      id: "wide",
      title: "Wide Attack Patterns",
      subtitle: "Triangle → gap pass → rotate or switch",
      purpose: "Find the wide triangle, play the half-space gap pass, rotate when tracked, switch when the chance is gone.",
      chapters: ["wide-attack"],
      hash: "wide",
      group: "attack-group",
      overview: {
        headline: "Triangle → gap pass → finish, rotate, or switch",
        intro: "Once we find the wide triangle (A wide, B half-space, C deep), this is the decision tree. When the cross is on, Supporting Runs covers near post / far post / cutback.",
        principles: [
          {
            title: "1. Find the wide triangle",
            body: "A = wide (usually the ball after a switch), B = half-space, C = deep support. Letters are spaces — not fixed shirt numbers. Any of our attackers can occupy A, B, or C."
          },
          {
            title: "2. Gap pass to the half-space runner",
            body: "Look for B running in behind their wide defender. A’s pass travels in front of that defender — different gaps. Ideally B drives the goal line and shoots, crosses, or cuts back to a supporting runner."
          },
          {
            title: "3. As B runs — C follows, A underneath",
            body: "While B attacks the half-space, C follows and A rotates underneath. That keeps the triangle alive so if the first ball does not create a finish, B can become the next wide player."
          },
          {
            title: "4. Tracked? B back to the corner — try again",
            body: "If B is tracked and the gap pass is off, she rotates back to the corner (wide). A’s and C’s rotation has already rebuilt the triangle — so we can create a new half-space run and another ball in behind."
          },
          {
            title: "5. Chance gone? Switch",
            body: "If the side is blocked off, the chance has died, or their defense has organized — do not force it. Switch to the other side and run the same idea from there."
          }
        ],
        cues: [
          "Find the triangle → look half-space.",
          "Run behind the 3. Pass in front of the 3.",
          "B runs → C follows, A underneath.",
          "Tracked? B to the corner — new gap pass.",
          "Blocked / organized? Switch sides."
        ]
      }
    },
    {
      id: "support",
      title: "Supporting Runs",
      subtitle: "Near · Far · Cutback",
      purpose: "Anytime a cross is coming — wide attack, set piece, or breakaway — attack near post, far post, and the cutback to the penalty spot.",
      chapters: ["supporting-runs"],
      hash: "support",
      group: "attack-group",
      overview: {
        headline: "Near post · Far post · Cutback to the spot",
        intro: "When we are about to hit a cross, supporting runners do not ball-watch. The same three-run pattern holds from wide attack, set pieces, and breakaways.",
        principles: [
          {
            title: "Three runs, every time",
            body: "Near post. Far post. Cutback toward the penalty spot. Fill those jobs — shirt numbers can change."
          },
          {
            title: "Near post",
            body: "Attack the front post with pace. Arrive as the ball arrives — force the first defender and the keeper to deal with a runner."
          },
          {
            title: "Far post",
            body: "Arrive across the face at the back post. Often the late runner if the near-post and cutback draws the first line."
          },
          {
            title: "Cutback to the penalty spot",
            body: "When the wide player drives the goal line, someone must be on or around the penalty spot for the ball pulled back — not everyone crashing the posts."
          },
          {
            title: "Same pattern, every context",
            body: "Wide-attack cross, corner serve, breakaway pull-back — the supporting-run jobs stay the same."
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
      id: "defense",
      title: "Defensive Shape",
      subtitle: "Matchups & 4-4-2",
      purpose: "Know your matchup, then organize out of possession into a 4-4-2 — 8 next to 6, 7 and 11 covering deep wide attackers.",
      chapters: ["defensive-responsibilities", "defend-4-4-2"],
      hash: "defense",
      group: "defense-group",
      overview: {
        headline: "Know your player — then fill the 4-4-2",
        intro: "This module has two connected parts: man-oriented matchups and cover, then how we occupy the field out of possession as a 4-4-2 — the defensive mirror of our attacking 2-3-5.",
        principles: [
          {
            title: "Base matchups (vs 4-3-3)",
            body: "Fullbacks take wingers. Center backs keep plus-one around the 9. The 6 takes the highest central midfield threat. The 8 takes the second advancing midfielder. The 10 accounts for their deepest midfielder (their 6). Wingers account for opposing fullbacks."
          },
          {
            title: "4-4-2 is a defensive occupation map",
            body: "It is not a second formation. Out of possession we fill space as a back four, a flat midfield four, and two higher. The midfield line reads 7-8-6-11 or 7-6-8-11 — the 8 sits next to the 6 on either side."
          },
          {
            title: "The 8 drops; the 7 and 11 drop",
            body: "The 8 recovers beside the 6 so we are not outnumbered centrally. The 7 and 11 drop into the midfield line to cover deep wide attackers (often their fullbacks or tucked wingers) — they do not stay glued high when those players threaten behind them."
          },
          {
            title: "Plus-one means pressure + cover",
            body: "One can engage while another protects the next dangerous action. It does not mean two players glued beside an attacker everywhere she goes. Shift that protection toward their best player when needed."
          },
          {
            title: "Pass runners off",
            body: "Do not chase automatically. If a runner enters a teammate’s area and following opens central space, pass her off — communicate, and the receiving defender stays goal-side."
          },
          {
            title: "After we lose it",
            body: "Close numbers + cover behind → counterpress (squeeze). They escape or we are stretched → recover. The 9 presses with a plan, not alone."
          }
        ],
        cues: [
          "Know your player; protect the shape.",
          "Out of possession: 4-4-2.",
          "8 next to 6. 7 and 11 cover deep wide.",
          "Pressure plus cover equals plus-one."
        ]
      }
    },
    {
      id: "corner",
      title: "Corners",
      subtitle: "Short play + long roles",
      purpose: "Decide short vs long, run our short-corner 1–2 play, then master long-corner roles.",
      chapters: ["short-corners", "long-corners"],
      hash: "corner",
      group: "set-pieces-group",
      overview: {
        headline: "Two corner tools: short play, then long serve",
        intro: "First read how many defenders are on our corner pair. Then either run the short 1–2 play (we almost always get a shot) or serve the long corner with clear roles. Supporting Runs still apply on the serve — near, far, and spot.",
        principles: [
          {
            title: "Part 1 — When to go short",
            body: "Zero or one defender near the corner pair → short. Two defenders → long serve. On short, everyone else starts at the back post to clear space for Player 1 and Player 2."
          },
          {
            title: "The short play (1 and 2)",
            body: "Player 1 touches the ball, then makes a high bending run toward the near-post corner of the 18. Player 2 must keep the ball at the corner and dribble next to — parallel to — the goal line. That run holds everyone onside so 2 can cut back to 1 or any other runner. If the defender overcommits to 2, cut back; if nobody is near (zero), 2 keeps driving the goal line until the defense overcommits, then finds 1."
          },
          {
            title: "Part 2 — Long corner sequence",
            body: "If two defenders are on Pri and Sec at the corner, do not play short. Skittles, Spot, and Drop start crowded at the back post. Skittles runs past the front post first (hoping to drag a defender). Then Primary serves. While the ball is in the air, Spot and Drop make their moves and Front/Back Targets attack the ball. Block screens the keeper. Corner Defense keeps +1 behind."
          },
          {
            title: "Roles are jobs, not fixed numbers",
            body: "Primary, Secondary, Skittles, Front/Back Target, Block, Spot, Drop, and Corner Defense can be filled by different players each week — know the job."
          }
        ],
        cues: [
          "Zero or one: short. Two: serve.",
          "1 touches and bends; 2 dribbles the goal line.",
          "Goal-line dribble = onside cutback.",
          "Back post clears space for the short.",
          "Skittles first — then Primary serves."
        ]
      }
    },
    {
      id: "challenge",
      title: "Mixed Challenge",
      purpose: "Unlabeled scenarios from every module. Ten questions. Results by concept.",
      hash: "challenge",
      isChallenge: true
    }
  ];

  const SCENARIOS = [
    {
      id: "demo-01",
      module: "demo",
      chapter: "demo-walkthrough",
      title: "A Lame Dad Joke",
      difficulty: 1,
      phase: "demo",
      concept: "demo",
      prompt: "Why was our base 4-3-3 bad at keeping secrets?",
      seeIt: "Base 4-3-3. Shirt number inside each triangle; role code underneath (GK, RB, DM, CF…). Attack toward the top.",
      interactionType: "multiple-choice",
      players: [
        { id: "our-1", team: "ours", number: 1, role: "Goalkeeper", x: 34, y: 96 },
        { id: "our-2", team: "ours", number: 2, role: "Right back", x: 58, y: 74 },
        { id: "our-4", team: "ours", number: 4, role: "Right center back", x: 42, y: 78 },
        { id: "our-5", team: "ours", number: 5, role: "Left center back", x: 26, y: 78 },
        { id: "our-3", team: "ours", number: 3, role: "Left back", x: 10, y: 74 },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 34, y: 56 },
        { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 48, y: 48 },
        { id: "our-10", team: "ours", number: 10, role: "Attacking midfielder", x: 20, y: 48 },
        { id: "our-7", team: "ours", number: 7, role: "Right winger", x: 58, y: 28 },
        { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 34, y: 20 },
        { id: "our-11", team: "ours", number: 11, role: "Left winger", x: 10, y: 28 }
      ],
      opponents: [],
      ball: { x: 34, y: 42 },
      options: [
        { id: "too-many", label: "Too many people standing around on the grass" },
        { id: "wings", label: "Because word travels fast down the wings" },
        { id: "six-spills", label: "The 6 always spills" },
        { id: "forwards", label: "Three forwards can't keep anything up front" }
      ],
      correctAnswer: "wings",
      hint: "Think about who plays wide… and how gossip spreads.",
      explanation: "Word travels fast down the wings. (Yes, that was the joke. Welcome to The Blueprint.)",
      coachingCue: "Numbers = shirts. Letters = jobs.",
      animationSteps: [
        { type: "highlight", playerIds: ["our-7", "our-11"] }
      ],
      challengeEligible: false
    },
    {
      id: "demo-02",
      module: "demo",
      chapter: "demo-walkthrough",
      title: "Coach Aaron's Grandure",
      difficulty: 1,
      phase: "demo",
      concept: "demo",
      prompt: "Why is Coach Johnson the best?",
      seeIt: "No tactics here — just tap an answer. More than one option can be right. Pick either correct one to see how feedback and cues work.",
      interactionType: "multiple-choice",
      players: [
        { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 34, y: 52 }
      ],
      opponents: [],
      ball: { x: 34, y: 48 },
      options: [
        { id: "not", label: "He's clearly not" },
        {
          id: "guitar",
          label: "His mastery of the rhythm guitar parts from Under the Table and Dreaming by Dave Matthews Band"
        },
        {
          id: "puns",
          label: "His disarming combination of terrible puns and large-group social interaction ineptitude"
        },
        {
          id: "snapchat",
          label: "He thinks Snapchat is where you talk with your friends while fight-dance snapping like in West Side Story"
        }
      ],
      correctAnswers: ["guitar", "puns"],
      correctAnswer: "guitar",
      hint: "Two answers work. Think music… or terrible puns.",
      explanation: "Correct — Dave Matthews mastery and/or the puns-plus-social-ineptitude combo. (Snapchat choreography is still wrong. So is \"he's clearly not.\" Probably.)",
      coachingCue: "More than one answer can be right — tap either and keep rolling.",
      animationSteps: [
        { type: "highlight", playerIds: ["our-9"] }
      ],
      challengeEligible: false
    },
    {
      id: "attack-01",
      module: "attack",
      chapter: "attack-the-moment",
      title: "Attack Now or Secure?",
      difficulty: 1,
      phase: "attacking-transition",
      concept: "transition",
      prompt: "We just won the ball at the 8. Their midfield is split and our 11 is free on the left. What should the 8 do first?",
      seeIt: "8 has the ball facing forward. Opp 6 and 8 are separated. Their 2 is tucked near midfield, so our 11 has a clear lane of green ahead. Their CBs are tight on our 9 — that is not the free player.",
      interactionType: "multiple-choice",
      players: [
        { id: "our-1", team: "ours", number: 1, role: "Goalkeeper", x: 34, y: 98 },
        { id: "our-4", team: "ours", number: 4, role: "Right center back", x: 28, y: 78 },
        { id: "our-5", team: "ours", number: 5, role: "Left center back", x: 40, y: 78 },
        { id: "our-2", team: "ours", number: 2, role: "Right back", x: 56, y: 70 },
        { id: "our-3", team: "ours", number: 3, role: "Left back", x: 12, y: 70 },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 36, y: 62 },
        { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 34, y: 52 },
        { id: "our-10", team: "ours", number: 10, role: "Attacking midfielder", x: 44, y: 42 },
        { id: "our-7", team: "ours", number: 7, role: "Right winger", x: 58, y: 36 },
        { id: "our-11", team: "ours", number: 11, role: "Left winger", x: 10, y: 38 },
        { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 36, y: 20 }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 4 },
        { id: "opp-4", team: "opp", number: 4, role: "Right center back", x: 30, y: 18 },
        { id: "opp-5", team: "opp", number: 5, role: "Left center back", x: 42, y: 18 },
        { id: "opp-6", team: "opp", number: 6, role: "Defensive midfielder", x: 48, y: 40 },
        { id: "opp-8", team: "opp", number: 8, role: "Central midfielder", x: 42, y: 50 },
        // Tucked near midfield so the gap behind our 11 is obvious
        { id: "opp-2", team: "opp", number: 2, role: "Right back", x: 18, y: 48 },
        { id: "opp-9", team: "opp", number: 9, role: "Center forward", x: 34, y: 68 }
      ],
      ball: { x: 34, y: 52 },
      options: [
        {
          id: "attack-now",
          label: "Play forward immediately into the open left channel (to/for the 11)"
        },
        {
          id: "force-9",
          label: "Force a long ball into the 9 between their two center backs"
        },
        {
          id: "secure",
          label: "Secure sideways to the 6 and rebuild slowly"
        },
        {
          id: "hold",
          label: "Hold the ball and wait for fullbacks to push up"
        }
      ],
      correctAnswer: "attack-now",
      hint: "Find the free forward option — not the hardest pass. Who is unmarked with space ahead?",
      explanation: "Their midfield is disconnected and the 11 is free. Attack that lane now. Do not force a needle-thread ball into the 9 in a 1v2 — that is forward forced, not forward first.",
      coachingCue: "Forward first, not forward forced.",
      rationalePrompt: "Why is the pass into the 11 stronger than forcing it to the 9?",
      rationaleOptions: [
        {
          id: "r1",
          label: "The 11 is free with space ahead; the 9 is doubled by two CBs — so forward means the open channel, not the lowest-percentage ball"
        },
        {
          id: "r2",
          label: "We always play the highest possible pass, even into a 1v2"
        },
        {
          id: "r3",
          label: "The 11 should never receive in transition"
        },
        {
          id: "r4",
          label: "The fullbacks are not high enough yet"
        }
      ],
      correctRationale: "r1",
      animationSteps: [
        { type: "highlight", playerIds: ["our-8", "our-11"] },
        { type: "move", playerId: "our-11", to: { x: 12, y: 22 }, duration: 500 },
        { type: "pass", from: { x: 34, y: 52 }, to: { x: 12, y: 28 }, duration: 550 },
        { type: "move", playerId: "our-11", to: { x: 14, y: 14 }, duration: 450 }
      ],
      challengeEligible: true
    },
    {
      id: "attack-02",
      module: "attack",
      chapter: "attack-the-moment",
      title: "Decision Order After the Win",
      difficulty: 2,
      phase: "attacking-transition",
      concept: "transition",
      prompt: "Put these transition actions in the correct order.",
      seeIt: "We have just won the ball. Before you choose a pass, order how we think.",
      interactionType: "ordered-decision",
      players: [
        {
          id: "our-1",
          team: "ours",
          number: 1,
          role: "Goalkeeper",
          x: 34,
          y: 98
        },
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 26,
          y: 80
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 80
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right back",
          x: 58,
          y: 78
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left back",
          x: 10,
          y: 78
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 58
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 48,
          y: 66
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 34,
          y: 42
        },
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 56,
          y: 40
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 12,
          y: 40
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 28
        }
      ],
      opponents: [
        {
          id: "opp-6",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 30,
          y: 50
        },
        {
          id: "opp-8",
          team: "opp",
          number: 8,
          role: "Central midfielder",
          x: 40,
          y: 52
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 24
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Left center back",
          x: 40,
          y: 24
        },
        {
          id: "opp-10",
          team: "opp",
          number: 10,
          role: "Attacking midfielder",
          x: 36,
          y: 46
        }
      ],
      ball: {
        x: 34,
        y: 58
      },
      options: [],
      correctAnswer: "look,advantage,secure,expand",
      hint: "Forward first means evaluate the forward option before you force it — then secure and expand if needed.",
      explanation: "Scan for the immediate attack, judge whether an advantage exists, secure if it does not, then expand the field.",
      coachingCue: "Forward first, not forward forced.",
      animationSteps: [
        {
          type: "pass",
          from: {
            x: 34,
            y: 58
          },
          to: {
            x: 42,
            y: 78
          },
          duration: 500
        },
        {
          type: "move",
          playerId: "our-2",
          to: {
            x: 58,
            y: 62
          },
          duration: 550
        },
        {
          type: "move",
          playerId: "our-3",
          to: {
            x: 10,
            y: 62
          },
          duration: 550
        }
      ],
      challengeEligible: true,
      sequence: [
        {
          id: "look",
          label: "Look for an immediate transition attack"
        },
        {
          id: "advantage",
          label: "Decide whether an advantage exists"
        },
        {
          id: "secure",
          label: "If not, secure possession"
        },
        {
          id: "expand",
          label: "Expand into wide attacking spaces"
        }
      ],
      correctOrder: ["look", "advantage", "secure", "expand"]
    },
    {
      id: "attack-03",
      module: "attack",
      chapter: "create-2-3-5",
      title: "Winger Wide — Fullback Choice",
      difficulty: 2,
      phase: "established-possession",
      concept: "attacking-shape",
      prompt: "Our 11 is already holding the left wide channel. Where should the left fullback (3) move?",
      seeIt: "11 is high and wide on the touchline. The left half-space and the space underneath 11 are open. Ball is with our 6.",
      interactionType: "drag-player",
      dragPlayerId: "our-3",
      dragTarget: {
        x: 18,
        y: 48,
        r: 9
      },
      players: [
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 72
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 72
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right back",
          x: 58,
          y: 58
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left back",
          x: 10,
          y: 68
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 55
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 44,
          y: 40
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 26,
          y: 36
        },
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 60,
          y: 28
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 6,
          y: 26
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 22
        }
      ],
      opponents: [
        {
          id: "opp-2",
          team: "opp",
          number: 2,
          role: "Right back",
          x: 12,
          y: 30
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Right center back",
          x: 30,
          y: 20
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 20
        }
      ],
      ball: {
        x: 34,
        y: 55
      },
      options: [
        {
          id: "tuck",
          label: "Tuck underneath / into the half-space to support"
        },
        {
          id: "stack",
          label: "Sprint into the same wide lane as the 11"
        },
        {
          id: "stay",
          label: "Stay as deep as a third center back"
        },
        {
          id: "box",
          label: "Abandon the left side and crash the box"
        }
      ],
      altOptions: [
        {
          id: "tuck",
          label: "Tuck underneath / half-space"
        },
        {
          id: "stack",
          label: "Stack the same wide lane"
        },
        {
          id: "stay",
          label: "Stay very deep"
        },
        {
          id: "box",
          label: "Crash the box"
        }
      ],
      zones: [
        {
          id: "tuck",
          label: "Support underneath",
          x: 12,
          y: 40,
          w: 14,
          h: 18
        },
        {
          id: "stack",
          label: "Same wide lane",
          x: 1,
          y: 18,
          w: 10,
          h: 16
        },
        {
          id: "stay",
          label: "Too deep",
          x: 6,
          y: 72,
          w: 12,
          h: 12
        }
      ],
      correctAnswer: "tuck",
      hint: "If the winger already owns the wide channel, stacking the same lane makes both players easier to mark.",
      explanation: "The 11 already provides width. The 3 should tuck or support underneath to give a different passing angle and keep rest-defense balance.",
      coachingCue: "Wide winger, connected fullback.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-3",
          to: {
            x: 18,
            y: 48
          },
          duration: 600
        }
      ],
      challengeEligible: true
    },
    {
      id: "attack-04",
      module: "attack",
      chapter: "create-2-3-5",
      title: "Winger Inside — Fullback Width",
      difficulty: 2,
      phase: "established-possession",
      concept: "attacking-shape",
      prompt: "Our 11 has moved into the left half-space. What should the left fullback (3) provide?",
      seeIt: "11 is inside between the opponent fullback and center back. The left touchline is empty. Ball is with our 8.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 70
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 70
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right back",
          x: 56,
          y: 56
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left back",
          x: 14,
          y: 58
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 52
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 40,
          y: 38
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 28,
          y: 34
        },
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 60,
          y: 26
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 22,
          y: 24
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 36,
          y: 18
        }
      ],
      opponents: [
        {
          id: "opp-2",
          team: "opp",
          number: 2,
          role: "Right back",
          x: 18,
          y: 28
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Right center back",
          x: 30,
          y: 18
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 18
        }
      ],
      ball: {
        x: 40,
        y: 38
      },
      options: [
        {
          id: "width",
          label: "Become the wide option (overlap or deeper wide support)"
        },
        {
          id: "inside",
          label: "Also tuck into the same half-space as the 11"
        },
        {
          id: "drop",
          label: "Drop next to the center backs and abandon the left side"
        },
        {
          id: "switch-side",
          label: "Sprint across to the right wing"
        }
      ],
      correctAnswer: "width",
      hint: "When the winger leaves the touchline, someone must replace that width — usually the fullback.",
      explanation: "Inside winger empties the wide channel. The fullback becomes the wide option so we still attack with five lanes.",
      coachingCue: "Inside winger, outside fullback.",
      rationalePrompt: "Why must the fullback supply width here?",
      rationaleOptions: [
        {
          id: "r1",
          label: "The winger moved inside and the defense narrowed, so width must come from the fullback"
        },
        {
          id: "r2",
          label: "Fullbacks should always overlap every attack"
        },
        {
          id: "r3",
          label: "The 6 cannot receive if fullbacks are wide"
        },
        {
          id: "r4",
          label: "The right side is overcrowded"
        }
      ],
      correctRationale: "r1",
      animationSteps: [
        {
          type: "move",
          playerId: "our-3",
          to: {
            x: 6,
            y: 32
          },
          duration: 650
        }
      ],
      challengeEligible: true
    },
    {
      id: "attack-05",
      module: "attack",
      chapter: "create-2-3-5",
      title: "Far-Side Fullback",
      difficulty: 2,
      phase: "established-possession",
      concept: "attacking-shape",
      prompt: "Ball is on the right with our 7. Our left fullback (3) is stuck on the far touchline. What should she do?",
      seeIt: "Play is overloaded on the right. Left back is hugging the far touchline with no nearby teammate. Central rest defense is thin.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 30,
          y: 68
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 44,
          y: 66
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right back",
          x: 58,
          y: 40
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left back",
          x: 4,
          y: 44
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 40,
          y: 48
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 50,
          y: 34
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 46,
          y: 28
        },
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 62,
          y: 24
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 18,
          y: 30
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 40,
          y: 18
        }
      ],
      opponents: [
        {
          id: "opp-11",
          team: "opp",
          number: 11,
          role: "Left winger",
          x: 56,
          y: 50
        },
        {
          id: "opp-9",
          team: "opp",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 58
        }
      ],
      ball: {
        x: 62,
        y: 24
      },
      options: [
        {
          id: "connect",
          label: "Become narrower and more connected, ready to switch or recover"
        },
        {
          id: "stay-wide",
          label: "Stay glued to the far touchline waiting for a hopeful switch"
        },
        {
          id: "join-box",
          label: "Sprint into the box from 40 yards out"
        },
        {
          id: "mark-alone",
          label: "Chase the opponent 9 by yourself into midfield"
        }
      ],
      correctAnswer: "connect",
      hint: "Far-side fullbacks who stay maximally wide leave the team disconnected on a turnover.",
      explanation: "On the weak side, the fullback tucks to stay connected for a switch and to help protect transition. Width is available if the ball travels; connection comes first.",
      coachingCue: "Far side: connected, not abandoned.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-3",
          to: {
            x: 18,
            y: 50
          },
          duration: 600
        }
      ],
      challengeEligible: true
    },
    {
      id: "attack-06",
      module: "attack",
      chapter: "create-2-3-5",
      title: "Place the 6",
      difficulty: 2,
      phase: "established-possession",
      concept: "attacking-shape",
      prompt: "We are established in the attacking third. Tap the best zone for our 6.",
      seeIt: "8, 10, and 9 are higher. Both half-spaces are occupied. The pocket outside the box (Zone 14) is empty.",
      interactionType: "pitch-hotspot",
      players: [
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 62
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 62
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right back",
          x: 58,
          y: 40
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left back",
          x: 10,
          y: 40
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 58
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 44,
          y: 28
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 24,
          y: 26
        },
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 60,
          y: 18
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 8,
          y: 18
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 14
        }
      ],
      opponents: [
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 16
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Left center back",
          x: 40,
          y: 16
        },
        {
          id: "opp-6",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 30
        }
      ],
      ball: {
        x: 44,
        y: 28
      },
      zones: [
        {
          id: "zone14",
          label: "Zone 14 support",
          x: 24,
          y: 32,
          w: 20,
          h: 14
        },
        {
          id: "highest",
          label: "Highest attacking line",
          x: 24,
          y: 8,
          w: 20,
          h: 10
        },
        {
          id: "deep",
          label: "Too deep with CBs",
          x: 24,
          y: 68,
          w: 20,
          h: 12
        },
        {
          id: "wide",
          label: "Right touchline",
          x: 56,
          y: 30,
          w: 10,
          h: 14
        }
      ],
      correctAnswer: "zone14",
      hint: "The 6 should stay underneath the higher attackers — often around Zone 14 — not join the highest line.",
      explanation: "In the attacking third the 6 is our deepest central attacker and first central defender: recycle, face forward, and protect the turnover from Zone 14.",
      coachingCue: "The 6 connects the attack and protects the turnover.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-6",
          to: {
            x: 34,
            y: 38
          },
          duration: 550
        }
      ],
      challengeEligible: true,
      options: []
    },
    {
      id: "attack-07",
      module: "attack",
      chapter: "create-2-3-5",
      title: "Overcrowded Lane",
      difficulty: 2,
      phase: "established-possession",
      concept: "attacking-shape",
      prompt: "What is wrong with this attacking shape?",
      seeIt: "Both the 11 and the 10 are stacked in the left half-space on the same horizontal line. The left wide channel is empty.",
      interactionType: "formation-diagnosis",
      players: [
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 68
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 68
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right back",
          x: 58,
          y: 48
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left back",
          x: 12,
          y: 50
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 50
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 46,
          y: 34
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 20,
          y: 28
        },
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 60,
          y: 22
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 18,
          y: 24
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 16
        }
      ],
      opponents: [
        {
          id: "opp-2",
          team: "opp",
          number: 2,
          role: "Right back",
          x: 14,
          y: 26
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Right center back",
          x: 30,
          y: 18
        }
      ],
      ball: {
        x: 46,
        y: 34
      },
      options: [
        {
          id: "same-lane",
          label: "Two players occupying the same lane / no width on the left"
        },
        {
          id: "no-plus",
          label: "No plus-one behind the ball"
        },
        {
          id: "both-fb",
          label: "Both fullbacks too high"
        },
        {
          id: "no-6",
          label: "No central support underneath"
        }
      ],
      correctAnswer: "same-lane",
      hint: "Look at the left half-space — who is sharing that vertical lane?",
      explanation: "10 and 11 are doubled in one half-space while the wide channel is empty. Occupy different lanes so one defender cannot mark two.",
      coachingCue: "Five lanes, not five statues.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-11",
          to: {
            x: 6,
            y: 22
          },
          duration: 550
        }
      ],
      challengeEligible: true
    },
    {
      id: "attack-08",
      module: "attack",
      chapter: "create-2-3-5",
      title: "Opposite Half-Spaces",
      difficulty: 2,
      phase: "established-possession",
      concept: "attacking-shape",
      prompt: "Where should the 8 and 10 occupy relative to each other in established attack?",
      seeIt: "Width is set by 7 and 11. The 9 is central. Both half-spaces are open. 8 and 10 are currently stacked on the right.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 48
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 48,
          y: 34
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 46,
          y: 28
        },
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 60,
          y: 20
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 8,
          y: 22
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 16
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right back",
          x: 56,
          y: 44
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left back",
          x: 12,
          y: 46
        },
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 66
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 66
        }
      ],
      opponents: [
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 18
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Left center back",
          x: 40,
          y: 18
        },
        {
          id: "opp-6",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 32
        }
      ],
      ball: {
        x: 34,
        y: 48
      },
      options: [
        {
          id: "opposite",
          label: "Occupy opposite half-spaces so we stretch the midfield"
        },
        {
          id: "stack-right",
          label: "Both stay on the ball-side half-space"
        },
        {
          id: "both-central",
          label: "Both stand on top of the 9 in the central lane"
        },
        {
          id: "drop-deep",
          label: "Both drop next to the 6"
        }
      ],
      correctAnswer: "opposite",
      hint: "If 8 and 10 share one half-space, the far half-space and central lane become easier to defend.",
      explanation: "8 and 10 generally attack higher spaces in opposite half-spaces. That stretches the opponent and keeps five lanes useful.",
      coachingCue: "Five lanes, not five statues.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-10",
          to: {
            x: 22,
            y: 28
          },
          duration: 550
        },
        {
          type: "move",
          playerId: "our-8",
          to: {
            x: 46,
            y: 30
          },
          duration: 550
        }
      ],
      challengeEligible: true
    },
    {
      id: "wide-01",
      module: "wide",
      chapter: "wide-attack",
      title: "#1 Half-Space Run After the Switch",
      difficulty: 1,
      phase: "wide-combination",
      concept: "half-space-run",
      prompt: "Ball is with Wide (A) after a switch. Who should make the half-space run?",
      seeIt: "We've switched and settled. Defense is flat and compressed to the ball. A is high and wide (onside). B occupies the half-space between their 5 and 3 — also onside. C is deep support. Their 3 shows to A and sits inside her.",
      interactionType: "multiple-choice",
      showTeachingZones: true,
      // Attacking-third crop (like the coaching-manual board)
      pitchView: { x: 0, y: 0, w: 68, h: 58 },
      players: [
        // Organized attacking shape after the switch — all onside (at/under the line)
        { id: "tri-a", team: "ours", number: "A", role: "Wide point", x: 64, y: 19, label: "Wide" },
        { id: "tri-b", team: "ours", number: "B", role: "Half-space point", x: 50, y: 20, label: "Half-space" },
        { id: "tri-c", team: "ours", number: "C", role: "Deep support", x: 50, y: 40, label: "Deep" },
        { id: "tri-d", team: "ours", number: "D", role: "Box threat", x: 36, y: 28, label: "Box" },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 32, y: 48 }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 },
        // Flat back line at the edge of the box, compressed to ball side
        { id: "opp-cb1", team: "opp", number: 4, role: "Right center back", x: 30, y: 17 },
        { id: "opp-cb2", team: "opp", number: 5, role: "Left center back", x: 46, y: 17 },
        { id: "opp-wb", team: "opp", number: 3, role: "Wide defender", x: 56, y: 17 },
        { id: "opp-dm", team: "opp", number: 6, role: "Defensive midfielder", x: 42, y: 32 }
      ],
      ball: { x: 65.5, y: 17.5 },
      zones: [
        // Half-space corridor between their 5 and 3, into the box (B's run)
        { id: "half-space", label: "Half-space", x: 48, y: 2, w: 10, h: 16 }
      ],
      options: [
        { id: "b-run", label: "B (half-space)" },
        { id: "c-run", label: "C (deep support)" },
        { id: "d-run", label: "D (box)" },
        { id: "a-dribble", label: "A (keep it and dribble alone)" }
      ],
      correctAnswer: "b-run",
      hint: "After the switch we are organized and onside. B is already in the half-space lane — she attacks behind their 3 while the pass stays in front.",
      explanation: "B runs the half-space behind their 3. A’s pass travels in front of that defender. Different gaps — and A/B/C can be filled by a 7, 10, 2, 8, or whoever occupies those spaces.",
      coachingCue: "Switch → settle onside. Run behind. Pass in front.",
      rationalePrompt: "Why B — and how should the pass relate to their wide defender?",
      rationaleOptions: [
        {
          id: "r1",
          label: "B runs in behind her while the pass goes in front — occupying that side and forcing two decisions (gap pass)"
        },
        {
          id: "r2",
          label: "B and the pass should use the exact same gap so one defender can clear both"
        },
        {
          id: "r3",
          label: "B should stay deep so A can cross to nobody"
        },
        {
          id: "r4",
          label: "B is marking their goalkeeper from midfield"
        }
      ],
      correctRationale: "r1",
      animationSteps: [
        { type: "highlight", playerIds: ["tri-a", "tri-b", "opp-wb", "opp-cb2"] },
        {
          type: "parallel",
          duration: 700,
          steps: [
            { type: "move", playerId: "tri-b", to: { x: 50, y: 8 }, duration: 700 },
            { type: "move", playerId: "opp-cb2", to: { x: 48, y: 10 }, duration: 700 }
          ]
        },
        { type: "pass", from: { x: 65.5, y: 17.5 }, to: { x: 52, y: 14 }, duration: 500 },
        { type: "move", playerId: "tri-b", to: { x: 51, y: 12 }, duration: 350 }
      ],
      challengeEligible: true
    },
    {
      id: "wide-02",
      module: "wide",
      chapter: "wide-attack",
      title: "Gap Pass: Behind vs In Front",
      difficulty: 2,
      phase: "wide-combination",
      concept: "half-space-run",
      prompt: "Build the gap pass: choose B’s run, then A’s pass.",
      seeIt: "Settled after the switch. Flat back line compressed to the ball. A wide (onside). B in the half-space between their 5 and 3 (onside). C deep. Their 3 shows to A — B threatens one side of her; the pass must use the other.",
      interactionType: "movement-and-pass",
      showTeachingZones: true,
      pitchView: { x: 0, y: 0, w: 68, h: 58 },
      players: [
        { id: "tri-a", team: "ours", number: "A", role: "Wide point", x: 64, y: 19, label: "Wide" },
        { id: "tri-b", team: "ours", number: "B", role: "Half-space point", x: 50, y: 20, label: "Half-space" },
        { id: "tri-c", team: "ours", number: "C", role: "Deep support", x: 50, y: 40, label: "Deep" },
        { id: "tri-d", team: "ours", number: "D", role: "Box threat", x: 36, y: 28, label: "Box" }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 },
        { id: "opp-cb1", team: "opp", number: 4, role: "Right center back", x: 30, y: 17 },
        { id: "opp-cb2", team: "opp", number: 5, role: "Left center back", x: 46, y: 17 },
        { id: "opp-wb", team: "opp", number: 3, role: "Wide defender", x: 56, y: 17 },
        { id: "opp-dm", team: "opp", number: 6, role: "Defensive midfielder", x: 42, y: 32 }
      ],
      ball: { x: 65.5, y: 17.5 },
      zones: [
        { id: "behind", label: "Behind wide defender", x: 48, y: 2, w: 10, h: 12 },
        { id: "front", label: "In front of wide defender", x: 50, y: 12, w: 10, h: 6 }
      ],
      runOptions: [
        { id: "run-behind", label: "B runs in behind their wide defender toward the box" },
        { id: "run-front", label: "B runs into the same lane in front of her as the pass" },
        { id: "run-short", label: "B checks short to A’s feet" }
      ],
      passOptions: [
        { id: "pass-front", label: "A passes in front of their wide defender into the half-space" },
        { id: "pass-behind", label: "A passes through the same behind gap as the run" },
        { id: "pass-float", label: "A floats a hopeful far-post cross" }
      ],
      correctRun: "run-behind",
      correctPass: "pass-front",
      correctAnswer: "run-behind|pass-front",
      hint: "Different gaps: runner goes behind the wide defender; ball travels in front of her.",
      explanation: "B behind. Pass from A in front. One defender cannot solve both — and those letters can be any of our attackers who occupy the triangle.",
      coachingCue: "Run behind. Pass in front.",
      animationSteps: [
        { type: "highlight", playerIds: ["tri-b", "opp-wb", "opp-cb2"] },
        {
          type: "parallel",
          duration: 700,
          steps: [
            { type: "move", playerId: "tri-b", to: { x: 50, y: 8 }, duration: 700 },
            { type: "move", playerId: "opp-cb2", to: { x: 48, y: 10 }, duration: 700 }
          ]
        },
        { type: "pass", from: { x: 65.5, y: 17.5 }, to: { x: 52, y: 14 }, duration: 500 },
        { type: "move", playerId: "tri-b", to: { x: 51, y: 12 }, duration: 350 }
      ],
      challengeEligible: true,
      options: []
    },
    {
      id: "wide-03",
      module: "wide",
      chapter: "wide-attack",
      title: "Give-and-Go Into the Half-Space",
      difficulty: 2,
      phase: "wide-combination",
      concept: "half-space-run",
      prompt: "B has the ball inside. What is the give-and-go into the half-space?",
      seeIt: "B starts with the ball. A is wide. C is deep support. We want the final pass to come from wide — after B sets A.",
      interactionType: "multiple-choice",
      showTeachingZones: true,
      players: [
        { id: "tri-b", team: "ours", number: "B", role: "Half-space point", x: 50, y: 34, label: "Half-space" },
        { id: "tri-a", team: "ours", number: "A", role: "Wide point", x: 62, y: 28, label: "Wide" },
        { id: "tri-c", team: "ours", number: "C", role: "Deep support", x: 54, y: 48, label: "Deep" },
        { id: "tri-d", team: "ours", number: "D", role: "Box threat", x: 36, y: 16, label: "Box" },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 34, y: 58 }
      ],
      opponents: [
        { id: "opp-wb", team: "opp", number: 3, role: "Wide defender", x: 56, y: 20 },
        { id: "opp-cb1", team: "opp", number: 4, role: "Right center back", x: 28, y: 16 },
        { id: "opp-cb2", team: "opp", number: 5, role: "Left center back", x: 48, y: 22 }
      ],
      ball: { x: 50, y: 34 },
      zones: [
        { id: "run-behind", label: "B runs behind wide defender", x: 44, y: 6, w: 12, h: 12 },
        { id: "pass-front", label: "Return pass in front", x: 50, y: 16, w: 10, h: 10 }
      ],
      options: [
        {
          id: "give-go",
          label: "B plays wide to A, then runs in behind their wide defender for the return gap pass from A"
        },
        {
          id: "stand",
          label: "B plays to A and stands still watching"
        },
        {
          id: "c-run",
          label: "Skip A — have C run the half-space while B keeps the ball"
        },
        {
          id: "cross",
          label: "B hits an early cross from where she is"
        }
      ],
      correctAnswer: "give-go",
      hint: "Give to the wide point first. Then B becomes the runner. The return ball starts from the touchline.",
      explanation: "Give-and-go: B → A, then B runs in behind. A returns from wide — in front of their wide defender. Same gap pass; letters remind us any player can fill A or B.",
      coachingCue: "Give wide, run behind — return in front.",
      rationalePrompt: "Why play it wide to A before the half-space run?",
      rationaleOptions: [
        {
          id: "r1",
          label: "So the final pass starts from wide — A can play in front of their wide defender while B runs behind her"
        },
        {
          id: "r2",
          label: "B is never allowed to run"
        },
        {
          id: "r3",
          label: "We only attack with crosses from the 6"
        },
        {
          id: "r4",
          label: "So A can dribble backward to midfield"
        }
      ],
      correctRationale: "r1",
      animationSteps: [
        { type: "highlight", playerIds: ["tri-b", "tri-a", "opp-wb"] },
        { type: "pass", from: { x: 50, y: 34 }, to: { x: 62, y: 28 }, duration: 450 },
        { type: "move", playerId: "tri-b", to: { x: 48, y: 8 }, duration: 650 },
        { type: "pass", from: { x: 62, y: 28 }, to: { x: 52, y: 16 }, duration: 500 },
        { type: "move", playerId: "tri-b", to: { x: 50, y: 12 }, duration: 400 }
      ],
      challengeEligible: true
    },
    {
      id: "wide-04",
      module: "wide",
      chapter: "wide-attack",
      title: "#2 When the Run Is Tracked",
      difficulty: 2,
      phase: "wide-combination",
      concept: "wide-rotation",
      prompt: "B made the half-space run, but a midfielder tracked her all the way. What should we do?",
      seeIt: "B is tracked in the half-space — the gap pass is closed. A has rotated underneath; C has followed. We still have a live triangle if we use it.",
      interactionType: "multiple-choice",
      showTeachingZones: true,
      pitchView: { x: 0, y: 0, w: 68, h: 58 },
      players: [
        { id: "tri-a", team: "ours", number: "A", role: "Wide point", x: 54, y: 34, label: "Underneath" },
        { id: "tri-b", team: "ours", number: "B", role: "Half-space point", x: 50, y: 10, label: "Half-space" },
        { id: "tri-c", team: "ours", number: "C", role: "Deep support", x: 52, y: 24, label: "Follow" },
        { id: "tri-d", team: "ours", number: "D", role: "Box threat", x: 34, y: 16, label: "Box" }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 },
        { id: "opp-cb1", team: "opp", number: 4, role: "Right center back", x: 30, y: 17 },
        { id: "opp-cb2", team: "opp", number: 5, role: "Left center back", x: 46, y: 14 },
        { id: "opp-wb", team: "opp", number: 3, role: "Wide defender", x: 56, y: 17 },
        { id: "opp-m", team: "opp", number: 8, role: "Central midfielder", x: 48, y: 12 }
      ],
      ball: { x: 54, y: 32 },
      zones: [
        { id: "corner", label: "Back to the corner", x: 58, y: 14, w: 8, h: 10 },
        { id: "half-space", label: "Next half-space", x: 48, y: 2, w: 10, h: 14 }
      ],
      options: [
        {
          id: "rotate",
          label: "B rotates back to the corner — A/C’s shape sets up a new half-space run and gap pass"
        },
        { id: "force", label: "Force the pass into the tracked runner anyway" },
        { id: "stop", label: "Everyone freezes and waits for a free kick" },
        { id: "both-crash", label: "Send A and C into the same tracked lane behind B" }
      ],
      correctAnswer: "rotate",
      hint: "Tracked = gap pass is off. B comes back to the corner (wide). The A/C rotation has already rebuilt the triangle for another try.",
      explanation: "When B is tracked, she rotates back to the corner. A underneath and C following have kept the triangle — so we can create a new half-space run and another ball in behind instead of forcing a covered pass.",
      coachingCue: "Tracked? B to the corner — new gap pass.",
      rationalePrompt: "Why send B back to the corner instead of forcing the ball into her?",
      rationaleOptions: [
        {
          id: "r1",
          label: "The lane is covered — B becomes wide at the corner so the rotated triangle can try another half-space run"
        },
        {
          id: "r2",
          label: "Rotations always mean crossing to the far post"
        },
        {
          id: "r3",
          label: "The deep player is never allowed in the box"
        },
        {
          id: "r4",
          label: "B made a mistake by running at all"
        }
      ],
      correctRationale: "r1",
      animationSteps: [
        { type: "highlight", playerIds: ["tri-b", "opp-m", "tri-a", "tri-c"] },
        // B back to the corner (wide)
        { type: "move", playerId: "tri-b", to: { x: 64, y: 18 }, duration: 600 },
        // New half-space runner from the rotated shape (C steps into B)
        { type: "move", playerId: "tri-c", to: { x: 50, y: 16 }, duration: 550 },
        { type: "pass", from: { x: 54, y: 32 }, to: { x: 64, y: 18 }, duration: 450 }
      ],
      challengeEligible: true
    },
    {
      id: "wide-05",
      module: "wide",
      chapter: "wide-attack",
      title: "Who Makes the Next Half-Space Run?",
      difficulty: 2,
      phase: "wide-combination",
      concept: "wide-rotation",
      prompt: "B has rotated back to the corner. A is underneath, C has followed. Who should attack the half-space next?",
      seeIt: "B is now wide at the corner. A sits underneath with the ball. C is the free player between them — ready to become the new half-space runner.",
      interactionType: "multiple-choice",
      showTeachingZones: true,
      pitchView: { x: 0, y: 0, w: 68, h: 58 },
      players: [
        { id: "tri-b", team: "ours", number: "B", role: "Wide point", x: 64, y: 18, label: "Corner" },
        { id: "tri-a", team: "ours", number: "A", role: "Deep support", x: 54, y: 34, label: "Underneath" },
        { id: "tri-c", team: "ours", number: "C", role: "Half-space point", x: 52, y: 26, label: "Ready" },
        { id: "tri-d", team: "ours", number: "D", role: "Box threat", x: 34, y: 16, label: "Box" }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 },
        { id: "opp-cb1", team: "opp", number: 4, role: "Right center back", x: 30, y: 17 },
        { id: "opp-cb2", team: "opp", number: 5, role: "Left center back", x: 46, y: 17 },
        { id: "opp-wb", team: "opp", number: 3, role: "Wide defender", x: 56, y: 17 },
        { id: "opp-m", team: "opp", number: 8, role: "Central midfielder", x: 44, y: 28 }
      ],
      ball: { x: 54, y: 32 },
      zones: [
        { id: "half-space", label: "Next half-space", x: 48, y: 2, w: 10, h: 16 }
      ],
      options: [
        { id: "c-fill", label: "C — she becomes the new half-space runner for the next gap pass" },
        { id: "a-leave", label: "A abandons underneath and stacks on top of B at the corner" },
        { id: "six-join", label: "The 6 abandons rest defense to crash the same lane" },
        { id: "empty", label: "Leave the half-space empty and hope" }
      ],
      correctAnswer: "c-fill",
      hint: "Letters move with the spaces. B is now wide; C is free to become the next B.",
      explanation: "B back to the corner = new A. A underneath = deep support. C steps into the half-space for the next gap pass. Same pattern, new bodies.",
      coachingCue: "B to the corner — new half-space runner.",
      animationSteps: [
        { type: "highlight", playerIds: ["tri-c", "tri-b", "tri-a"] },
        { type: "move", playerId: "tri-c", to: { x: 50, y: 10 }, duration: 600 },
        { type: "pass", from: { x: 54, y: 32 }, to: { x: 64, y: 18 }, duration: 400 },
        { type: "pass", from: { x: 64, y: 18 }, to: { x: 52, y: 14 }, duration: 500 }
      ],
      challengeEligible: true
    },
    {
      id: "wide-06",
      module: "wide",
      chapter: "wide-attack",
      title: "Broken Rotation",
      difficulty: 2,
      phase: "wide-combination",
      concept: "wide-rotation",
      prompt: "What is wrong with this attempted rotation?",
      seeIt: "B checked out of the half-space, but both A and C sprinted into the same half-space lane. The touchline is empty and there is no deep point.",
      interactionType: "formation-diagnosis",
      players: [
        { id: "tri-a", team: "ours", number: "A", role: "Wide point", x: 50, y: 16, label: "Wide" },
        { id: "tri-b", team: "ours", number: "B", role: "Half-space point", x: 54, y: 36, label: "Half-space" },
        { id: "tri-c", team: "ours", number: "C", role: "Deep support", x: 48, y: 18, label: "Deep" },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 40, y: 42 }
      ],
      opponents: [
        { id: "opp-wb", team: "opp", number: 3, role: "Wide defender", x: 56, y: 20 },
        { id: "opp-cb1", team: "opp", number: 4, role: "Right center back", x: 28, y: 14 },
        { id: "opp-m", team: "opp", number: 8, role: "Central midfielder", x: 46, y: 28 }
      ],
      ball: { x: 54, y: 36 },
      options: [
        { id: "stack", label: "Two players stacked the same half-space — no width, no deep point" },
        { id: "good", label: "Nothing — this is a perfect rotation" },
        { id: "no-9", label: "Missing a goalkeeper in the box" },
        { id: "too-deep", label: "Everyone is too deep in our own half" }
      ],
      correctAnswer: "stack",
      hint: "Rotation replaces one half-space occupant. It does not dump the whole triangle into one lane.",
      explanation: "A and C both filled the space B left. Keep one player in the half-space, keep width, keep a deep point — whoever is wearing A/B/C today.",
      coachingCue: "Fill the half-space; don’t stack it.",
      animationSteps: [
        { type: "move", playerId: "tri-a", to: { x: 62, y: 24 }, duration: 550 },
        { type: "move", playerId: "tri-c", to: { x: 48, y: 20 }, duration: 550 }
      ],
      challengeEligible: true
    },
    {
      id: "wide-07",
      module: "wide",
      chapter: "wide-attack",
      title: "Recognize the Trigger",
      difficulty: 1,
      phase: "wide-combination",
      concept: "half-space-run",
      prompt: "When do we most often look for the half-space run?",
      seeIt: "Ball was on the far side. It has just arrived with A on the near touchline. Their weak-side defenders are still shifting. B and C are ready to form the triangle.",
      interactionType: "multiple-choice",
      players: [
        { id: "tri-a", team: "ours", number: "A", role: "Wide point", x: 62, y: 32, label: "Wide" },
        { id: "tri-b", team: "ours", number: "B", role: "Half-space point", x: 46, y: 36, label: "Half-space" },
        { id: "tri-c", team: "ours", number: "C", role: "Deep support", x: 54, y: 50, label: "Deep" },
        { id: "far-wide", team: "ours", number: "·", role: "Far-side wide", x: 12, y: 40, label: "Far" },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 34, y: 48 }
      ],
      opponents: [
        { id: "opp-wb", team: "opp", number: 3, role: "Wide defender", x: 50, y: 28 },
        { id: "opp-cb1", team: "opp", number: 4, role: "Right center back", x: 28, y: 20 },
        { id: "opp-cb2", team: "opp", number: 5, role: "Left center back", x: 44, y: 24 },
        { id: "opp-fb", team: "opp", number: 2, role: "Far fullback", x: 14, y: 30 }
      ],
      ball: { x: 62, y: 32 },
      options: [
        { id: "after-switch", label: "After switching play to the wide point — while their back line is still shifting" },
        { id: "always-cross", label: "Only after we have already crossed three times" },
        { id: "gk-throw", label: "Only from a goal kick" },
        { id: "never", label: "Never — half-space runs are for the other team" }
      ],
      correctAnswer: "after-switch",
      hint: "A half-space run is often seen after a switching play.",
      explanation: "Switch → half-space run. Whoever becomes A on the ball side looks for B attacking behind their wide defender.",
      coachingCue: "Switch → look half-space.",
      animationSteps: [
        { type: "pass", from: { x: 20, y: 40 }, to: { x: 62, y: 32 }, duration: 700 },
        { type: "move", playerId: "tri-b", to: { x: 50, y: 14 }, duration: 600 }
      ],
      challengeEligible: true
    },
    {
      id: "wide-08",
      module: "wide",
      chapter: "wide-attack",
      title: "Rotate Under the Half-Space Run",
      difficulty: 2,
      phase: "wide-combination",
      concept: "wide-rotation",
      prompt: "As B runs the half-space, what should A and C do?",
      seeIt: "B is attacking the half-space. If A just holds the touchline and C stays glued deep, we cannot recirculate — B cannot become the next wide player if the cross is not on.",
      interactionType: "multiple-choice",
      showTeachingZones: true,
      pitchView: { x: 0, y: 0, w: 68, h: 58 },
      players: [
        { id: "tri-a", team: "ours", number: "A", role: "Wide point", x: 64, y: 19, label: "Wide" },
        { id: "tri-b", team: "ours", number: "B", role: "Half-space point", x: 50, y: 20, label: "Half-space" },
        { id: "tri-c", team: "ours", number: "C", role: "Deep support", x: 50, y: 40, label: "Deep" }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 },
        { id: "opp-cb1", team: "opp", number: 4, role: "Right center back", x: 30, y: 17 },
        { id: "opp-cb2", team: "opp", number: 5, role: "Left center back", x: 46, y: 17 },
        { id: "opp-wb", team: "opp", number: 3, role: "Wide defender", x: 56, y: 17 },
        { id: "opp-m", team: "opp", number: 8, role: "Central midfielder", x: 46, y: 28 }
      ],
      ball: { x: 65.5, y: 17.5 },
      zones: [
        { id: "half-space", label: "Half-space", x: 48, y: 2, w: 10, h: 16 }
      ],
      options: [
        {
          id: "rotate-under",
          label: "C follows B; A rotates underneath — so B can become wide next if the cross isn’t on"
        },
        {
          id: "width-depth",
          label: "A freezes on the touchline; C stays glued as a deep statue"
        },
        {
          id: "all-in",
          label: "A and C both sprint into the same half-space lane as B"
        },
        {
          id: "abandon",
          label: "Both drop to the halfway line immediately"
        }
      ],
      correctAnswer: "rotate-under",
      hint: "Think rotation: C steps up with the run; A comes underneath the triangle so the shape stays alive.",
      explanation: "As B runs the half-space, C follows and A rotates underneath. Ideally B finishes (shot / cross / cutback). If not, B can become wide next — and if she was tracked, she checks to the corner for another gap-pass try.",
      coachingCue: "B runs → C follows, A underneath.",
      animationSteps: [
        { type: "highlight", playerIds: ["tri-a", "tri-b", "tri-c"] },
        {
          type: "parallel",
          duration: 700,
          steps: [
            { type: "move", playerId: "tri-b", to: { x: 50, y: 8 }, duration: 700 },
            { type: "move", playerId: "opp-m", to: { x: 48, y: 12 }, duration: 700 },
            // C follows the half-space run
            { type: "move", playerId: "tri-c", to: { x: 52, y: 24 }, duration: 700 },
            // A rotates underneath
            { type: "move", playerId: "tri-a", to: { x: 54, y: 34 }, duration: 700 }
          ]
        }
      ],
      challengeEligible: true
    },

    {
      id: "wide-09",
      module: "wide",
      chapter: "wide-attack",
      title: "Chance Gone — Switch",
      difficulty: 2,
      phase: "wide-combination",
      concept: "wide-rotation",
      prompt: "The near side is blocked. Their back line is set. Another gap pass here looks forced. What next?",
      seeIt: "We've tried the triangle and the half-space. Numbers are around the ball. Their 3, 5, and midfield are compact. Far side has space and a free wide player.",
      interactionType: "multiple-choice",
      pitchView: { x: 0, y: 0, w: 68, h: 70 },
      players: [
        { id: "tri-a", team: "ours", number: "A", role: "Wide point", x: 62, y: 22, label: "Wide" },
        { id: "tri-b", team: "ours", number: "B", role: "Half-space point", x: 52, y: 28, label: "Half-space" },
        { id: "tri-c", team: "ours", number: "C", role: "Deep support", x: 48, y: 40, label: "Deep" },
        { id: "far-wide", team: "ours", number: 11, role: "Left winger", x: 10, y: 30, label: "Far" },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 34, y: 48 },
        { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 40, y: 42 }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 },
        { id: "opp-cb1", team: "opp", number: 4, role: "Right center back", x: 28, y: 18 },
        { id: "opp-cb2", team: "opp", number: 5, role: "Left center back", x: 44, y: 16 },
        { id: "opp-wb", team: "opp", number: 3, role: "Wide defender", x: 56, y: 18 },
        { id: "opp-m", team: "opp", number: 8, role: "Central midfielder", x: 48, y: 26 },
        { id: "opp-dm", team: "opp", number: 6, role: "Defensive midfielder", x: 40, y: 30 },
        { id: "opp-fb", team: "opp", number: 2, role: "Right back", x: 16, y: 28 }
      ],
      ball: { x: 54, y: 36 },
      options: [
        {
          id: "switch",
          label: "Switch to the far side and build a new wide triangle from there"
        },
        {
          id: "force",
          label: "Force another needle-thread gap pass into the traffic"
        },
        {
          id: "long",
          label: "Hit a hopeful long ball over the top with no runner"
        },
        {
          id: "dribble",
          label: "Have A dribble into three defenders alone"
        }
      ],
      correctAnswer: "switch",
      hint: "When the chance is gone and they are organized, don’t force the near-side pattern — switch and try the same idea elsewhere.",
      explanation: "Blocked off or organized defense = the near-side chance has died. Switch to the far side, find a new wide triangle, and look for the half-space gap pass again.",
      coachingCue: "Blocked / organized? Switch sides.",
      animationSteps: [
        { type: "highlight", playerIds: ["tri-a", "tri-c", "our-8", "far-wide"] },
        { type: "pass", from: { x: 54, y: 36 }, to: { x: 40, y: 42 }, duration: 450 },
        { type: "pass", from: { x: 40, y: 42 }, to: { x: 12, y: 32 }, duration: 650 },
        { type: "move", playerId: "far-wide", to: { x: 8, y: 22 }, duration: 400 }
      ],
      challengeEligible: true
    },

    /* ---------- Supporting Runs ---------- */
    {
      id: "support-01",
      module: "support",
      chapter: "supporting-runs",
      title: "The Three Supporting Runs",
      difficulty: 1,
      phase: "supporting-runs",
      concept: "supporting-runs",
      prompt: "A cross is coming from the wide channel. What three supporting runs do we fill?",
      seeIt: "Wide player is about to deliver. Three attackers need jobs in the box — not everyone ball-watching or stacking the same post.",
      interactionType: "multiple-choice",
      showTeachingZones: true,
      pitchView: { x: 0, y: 0, w: 68, h: 50 },
      players: [
        { id: "crosser", team: "ours", number: "X", role: "Wide delivery", x: 64, y: 12, label: "Cross" },
        { id: "near", team: "ours", number: "N", role: "Near-post run", x: 42, y: 22, label: "Near" },
        { id: "cut", team: "ours", number: "K", role: "Cutback run", x: 40, y: 28, label: "Cutback" },
        { id: "far", team: "ours", number: "F", role: "Far-post run", x: 28, y: 24, label: "Far" },
        { id: "trail", team: "ours", number: 8, role: "Central midfielder", x: 48, y: 36 }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 },
        { id: "opp-4", team: "opp", number: 4, role: "Right center back", x: 28, y: 12 },
        { id: "opp-5", team: "opp", number: 5, role: "Left center back", x: 42, y: 12 },
        { id: "opp-3", team: "opp", number: 3, role: "Left back", x: 54, y: 14 }
      ],
      ball: { x: 65, y: 10 },
      zones: [
        { id: "near-z", label: "Near post", x: 40, y: 2, w: 10, h: 8 },
        { id: "spot-z", label: "Penalty spot", x: 30, y: 9, w: 8, h: 6 },
        { id: "far-z", label: "Far post", x: 20, y: 2, w: 10, h: 8 }
      ],
      options: [
        { id: "three", label: "Near post, far post, and cutback toward the penalty spot" },
        { id: "posts-only", label: "Only near post and far post — nobody on the cutback" },
        { id: "stack-near", label: "Everyone crash the near post" },
        { id: "watch", label: "Stand and watch the cross from the D" }
      ],
      correctAnswer: "three",
      hint: "Three jobs: near, far, and the cutback to the spot.",
      explanation: "Anytime a cross is coming we fill near post, far post, and cutback to the penalty spot. Same pattern from wide attack, set pieces, or a breakaway.",
      coachingCue: "Near. Far. Cutback.",
      animationSteps: [
        { type: "highlight", playerIds: ["near", "far", "cut", "crosser"] },
        {
          type: "parallel",
          duration: 650,
          steps: [
            { type: "move", playerId: "near", to: { x: 44, y: 5 }, duration: 650 },
            { type: "move", playerId: "far", to: { x: 24, y: 5 }, duration: 650 },
            { type: "move", playerId: "cut", to: { x: 34, y: 12 }, duration: 650 },
            { type: "pass", from: { x: 65, y: 10 }, to: { x: 34, y: 8 }, duration: 650 }
          ]
        }
      ],
      challengeEligible: true
    },
    {
      id: "support-02",
      module: "support",
      chapter: "supporting-runs",
      title: "Near-Post Job",
      difficulty: 1,
      phase: "supporting-runs",
      concept: "supporting-runs",
      prompt: "The cross is whipped toward the six. Which runner’s job is the near post?",
      seeIt: "Delivery from the right. Three attackers are labeled by their supporting-run jobs.",
      interactionType: "multiple-choice",
      pitchView: { x: 0, y: 0, w: 68, h: 48 },
      players: [
        { id: "crosser", team: "ours", number: "X", role: "Wide delivery", x: 64, y: 10, label: "Cross" },
        { id: "near", team: "ours", number: "N", role: "Near-post run", x: 44, y: 18, label: "Near" },
        { id: "cut", team: "ours", number: "K", role: "Cutback run", x: 38, y: 26, label: "Cutback" },
        { id: "far", team: "ours", number: "F", role: "Far-post run", x: 26, y: 20, label: "Far" }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 },
        { id: "opp-5", team: "opp", number: 5, role: "Left center back", x: 42, y: 10 }
      ],
      ball: { x: 65, y: 8 },
      options: [
        { id: "near", label: "Near — attack the front post as the ball arrives" },
        { id: "far", label: "Far — only the back-post runner" },
        { id: "cut", label: "Cutback — only the penalty-spot runner" },
        { id: "crosser", label: "The crosser follows her own cross to the near post" }
      ],
      correctAnswer: "near",
      hint: "Near post = front post, ball-side.",
      explanation: "The near-post runner attacks the front post with timing — force the first defender and the keeper to deal with a body arriving with the ball.",
      coachingCue: "Near post — arrive with the ball.",
      animationSteps: [
        { type: "highlight", playerIds: ["near"] },
        { type: "move", playerId: "near", to: { x: 44, y: 5 }, duration: 550 },
        { type: "pass", from: { x: 65, y: 8 }, to: { x: 42, y: 5 }, duration: 500 }
      ],
      challengeEligible: true
    },
    {
      id: "support-03",
      module: "support",
      chapter: "supporting-runs",
      title: "Far-Post Job",
      difficulty: 1,
      phase: "supporting-runs",
      concept: "supporting-runs",
      prompt: "Near post and cutback are occupied. What is the far-post runner’s job?",
      seeIt: "Cross from the right. Near and cutback are filled. Someone must still arrive at the back post.",
      interactionType: "multiple-choice",
      pitchView: { x: 0, y: 0, w: 68, h: 48 },
      players: [
        { id: "crosser", team: "ours", number: "X", role: "Wide delivery", x: 64, y: 10, label: "Cross" },
        { id: "near", team: "ours", number: "N", role: "Near-post run", x: 44, y: 8, label: "Near" },
        { id: "cut", team: "ours", number: "K", role: "Cutback run", x: 34, y: 14, label: "Cutback" },
        { id: "far", team: "ours", number: "F", role: "Far-post run", x: 26, y: 22, label: "Far" }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 },
        { id: "opp-4", team: "opp", number: 4, role: "Right center back", x: 26, y: 10 }
      ],
      ball: { x: 65, y: 8 },
      options: [
        { id: "far", label: "Arrive across the face at the far post — often the late runner" },
        { id: "stop", label: "Stop at the top of the box and watch" },
        { id: "near-too", label: "Also crash the near post so we double it" },
        { id: "retreat", label: "Drop to midfield for the counter" }
      ],
      correctAnswer: "far",
      hint: "Far post is the back post — arrive across the face.",
      explanation: "The far-post runner arrives at the back post, often late across the face after near post and cutback have drawn the first line.",
      coachingCue: "Far post — arrive across the face.",
      animationSteps: [
        { type: "highlight", playerIds: ["far"] },
        { type: "move", playerId: "far", to: { x: 24, y: 5 }, duration: 650 },
        { type: "pass", from: { x: 65, y: 8 }, to: { x: 26, y: 6 }, duration: 600 }
      ],
      challengeEligible: true
    },
    {
      id: "support-04",
      module: "support",
      chapter: "supporting-runs",
      title: "Cutback to the Spot",
      difficulty: 2,
      phase: "supporting-runs",
      concept: "supporting-runs",
      prompt: "The wide player is driving the goal line. Posts are covered. Where must someone be for the cutback?",
      seeIt: "7 is on the goal line with the ball. Near and far runners are heading to the posts. The pull-back lane to the penalty spot is empty unless someone fills it.",
      interactionType: "multiple-choice",
      showTeachingZones: true,
      pitchView: { x: 0, y: 0, w: 68, h: 48 },
      players: [
        { id: "crosser", team: "ours", number: "X", role: "Wide delivery", x: 58, y: 4, label: "Goal line" },
        { id: "near", team: "ours", number: "N", role: "Near-post run", x: 44, y: 8, label: "Near" },
        { id: "far", team: "ours", number: "F", role: "Far-post run", x: 24, y: 8, label: "Far" },
        { id: "cut", team: "ours", number: "K", role: "Cutback run", x: 40, y: 26, label: "Cutback" }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 },
        { id: "opp-4", team: "opp", number: 4, role: "Right center back", x: 28, y: 10 },
        { id: "opp-5", team: "opp", number: 5, role: "Left center back", x: 42, y: 10 },
        { id: "opp-3", team: "opp", number: 3, role: "Left back", x: 54, y: 8 }
      ],
      ball: { x: 58, y: 3 },
      zones: [
        { id: "spot-z", label: "Penalty spot / cutback", x: 30, y: 9, w: 8, h: 6 }
      ],
      options: [
        { id: "spot", label: "On or around the penalty spot — ready for the ball pulled back" },
        { id: "corner", label: "Standing in the corner flag" },
        { id: "halfway", label: "On the halfway line" },
        { id: "both-posts", label: "A third body also on the near post" }
      ],
      correctAnswer: "spot",
      hint: "Goal-line drive → cutback runner on the penalty spot.",
      explanation: "When the wide player drives the goal line, someone must be on or around the penalty spot for the cutback — not everyone only crashing the posts.",
      coachingCue: "Goal-line drive → someone on the spot.",
      animationSteps: [
        { type: "highlight", playerIds: ["cut", "crosser"] },
        { type: "move", playerId: "cut", to: { x: 34, y: 12 }, duration: 550 },
        { type: "pass", from: { x: 58, y: 3 }, to: { x: 34, y: 12 }, duration: 500 }
      ],
      challengeEligible: true
    },
    {
      id: "support-05",
      module: "support",
      chapter: "supporting-runs",
      title: "Same Pattern, Every Context",
      difficulty: 1,
      phase: "supporting-runs",
      concept: "supporting-runs",
      prompt: "When do near / far / cutback supporting runs apply?",
      seeIt: "Three situations: a wide-attack cross, a corner serve, and a breakaway pull-back along the goal line.",
      interactionType: "multiple-choice",
      players: [
        { id: "a", team: "ours", number: "W", role: "Wide delivery", x: 60, y: 20, label: "Wide" },
        { id: "b", team: "ours", number: "P", role: "Primary", x: 64, y: 4, label: "Corner" },
        { id: "c", team: "ours", number: "B", role: "Breakaway", x: 8, y: 16, label: "Break" }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 4 }
      ],
      ball: { x: 60, y: 18 },
      pitchView: { x: 0, y: 0, w: 68, h: 55 },
      options: [
        {
          id: "all",
          label: "Wide-attack crosses, set pieces, and breakaways — same three runs"
        },
        { id: "corners-only", label: "Only on corners" },
        { id: "open-only", label: "Only in open play — never on set pieces" },
        { id: "never", label: "Only if the coach yells the runners’ names" }
      ],
      correctAnswer: "all",
      hint: "If a cross (or serve / pull-back) is coming, the three jobs are the same.",
      explanation: "Near post, far post, and cutback to the spot — whether the delivery is from wide attack, a set piece, or a breakaway. Build the habit so it is automatic.",
      coachingCue: "Same three runs — every cross.",
      animationSteps: [
        { type: "highlight", playerIds: ["a", "b", "c"] }
      ],
      challengeEligible: true
    },

    {
      id: "defense-01",
      module: "defense",
      chapter: "defensive-responsibilities",
      title: "Matchups vs 4-3-3",
      difficulty: 2,
      phase: "defending-established",
      concept: "defense",
      prompt: "Assign key responsibilities against a 4-3-3. Pair each of our players with the opponent she should primarily account for.",
      seeIt: "Full 11v11. Fullbacks→wingers, wingers→their fullbacks, 10→their 6, 6→their 10, 8→their 8. Either CB (4 or 5) can take their 9 — that is plus-one.",
      interactionType: "match-responsibilities",
      players: [
        { id: "our-1", team: "ours", number: 1, role: "Goalkeeper", x: 34, y: 96 },
        { id: "our-4", team: "ours", number: 4, role: "Right center back", x: 28, y: 74 },
        { id: "our-5", team: "ours", number: 5, role: "Left center back", x: 42, y: 74 },
        { id: "our-2", team: "ours", number: 2, role: "Right back", x: 56, y: 64 },
        { id: "our-3", team: "ours", number: 3, role: "Left back", x: 12, y: 64 },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 34, y: 56 },
        { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 44, y: 48 },
        { id: "our-10", team: "ours", number: 10, role: "Attacking midfielder", x: 34, y: 40 },
        { id: "our-7", team: "ours", number: 7, role: "Right winger", x: 58, y: 36 },
        { id: "our-11", team: "ours", number: 11, role: "Left winger", x: 10, y: 36 },
        { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 34, y: 24 }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 6 },
        { id: "opp-4", team: "opp", number: 4, role: "Right center back", x: 28, y: 16 },
        { id: "opp-5", team: "opp", number: 5, role: "Left center back", x: 40, y: 16 },
        { id: "opp-2", team: "opp", number: 2, role: "Right back", x: 56, y: 22 },
        { id: "opp-3", team: "opp", number: 3, role: "Left back", x: 12, y: 22 },
        { id: "opp-6", team: "opp", number: 6, role: "Defensive midfielder", x: 34, y: 30 },
        { id: "opp-8", team: "opp", number: 8, role: "Central midfielder", x: 44, y: 38 },
        { id: "opp-10", team: "opp", number: 10, role: "Attacking midfielder", x: 34, y: 44 },
        { id: "opp-7", team: "opp", number: 7, role: "Right winger", x: 14, y: 48 },
        { id: "opp-11", team: "opp", number: 11, role: "Left winger", x: 54, y: 48 },
        { id: "opp-9", team: "opp", number: 9, role: "Center forward", x: 34, y: 62 }
      ],
      ball: { x: 34, y: 30 },
      matchPairs: [
        { defenderId: "our-2", attackerId: "opp-11" },
        { defenderId: "our-3", attackerId: "opp-7" },
        { defenderId: "our-7", attackerId: "opp-3" },
        { defenderId: "our-11", attackerId: "opp-2" },
        { defenderId: "our-10", attackerId: "opp-6" },
        { defenderId: "our-6", attackerId: "opp-10" },
        { defenderId: "our-8", attackerId: "opp-8" },
        // Plus-one on the 9: either CB is correct
        { defenderIds: ["our-4", "our-5"], attackerId: "opp-9" }
      ],
      correctAnswer: "match-433",
      hint: "Fullbacks on wingers; wingers on their fullbacks; 10 on their 6; 6 on their 10; 8 on their 8. Either 4 or 5 can take their 9.",
      explanation: "Vs 4-3-3: fullbacks↔wingers, wingers↔fullbacks, 10 on their 6, 6 on their advanced midfielder, 8 on the second central midfielder, and CBs keep plus-one on the 9 (4 or 5).",
      coachingCue: "Know your player; protect the shape.",
      animationSteps: [
        {
          type: "highlight",
          playerIds: ["our-2", "our-3", "our-7", "our-11", "our-10", "our-6", "our-8", "our-4", "our-5", "opp-9"]
        }
      ],
      challengeEligible: true,
      options: []
    },
    {
      id: "defense-02",
      module: "defense",
      chapter: "defensive-responsibilities",
      title: "10 on Their 6",
      difficulty: 1,
      phase: "defending-established",
      concept: "defense",
      prompt: "Who is our 10 primarily responsible for when the opponent builds with a 4-3-3?",
      seeIt: "Opponent 6 is the deepest central outlet in buildup. Our 10 is the highest central defender of that outlet.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 34,
          y: 42
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 30
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 44,
          y: 50
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 58
        }
      ],
      opponents: [
        {
          id: "opp-6",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 36
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 22
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 22
        },
        {
          id: "opp-8",
          team: "opp",
          number: 8,
          role: "Central midfielder",
          x: 46,
          y: 40
        }
      ],
      ball: {
        x: 34,
        y: 22
      },
      options: [
        {
          id: "opp6",
          label: "The opponent's 6 — remove the easiest central outlet"
        },
        {
          id: "opp9",
          label: "The opponent's 9 — chase her everywhere"
        },
        {
          id: "opp2",
          label: "The opponent's right fullback"
        },
        {
          id: "nobody",
          label: "Nobody — the 10 floats freely"
        }
      ],
      correctAnswer: "opp6",
      hint: "The 10's defensive job starts with the opponent's deepest central midfielder.",
      explanation: "Our 10 accounts for their 6, removes the free central outlet, and stays connected enough to support the 9's press.",
      coachingCue: "Know your player; protect the shape.",
      animationSteps: [
        {
          type: "highlight",
          playerIds: ["our-10", "opp-6"]
        }
      ],
      challengeEligible: true
    },
    {
      id: "defense-03",
      module: "defense",
      chapter: "defensive-responsibilities",
      title: "8 When a Second AM Advances",
      difficulty: 2,
      phase: "defending-established",
      concept: "defense",
      prompt: "The opponent attacks with two central players ahead of the ball. What is the 8's primary job?",
      seeIt: "Opp 10 and opp 8 are both advanced. Our 6 is occupied with the highest threat. A second central runner is free if ignored.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 44,
          y: 50
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 30,
          y: 55
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 34,
          y: 38
        },
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 70
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 70
        }
      ],
      opponents: [
        {
          id: "opp-10",
          team: "opp",
          number: 10,
          role: "Attacking midfielder",
          x: 30,
          y: 48
        },
        {
          id: "opp-8",
          team: "opp",
          number: 8,
          role: "Central midfielder",
          x: 46,
          y: 46
        },
        {
          id: "opp-6",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 30
        }
      ],
      ball: {
        x: 34,
        y: 30
      },
      options: [
        {
          id: "second-am",
          label: "Take the second advancing central midfielder and recover ball-side"
        },
        {
          id: "stay-high",
          label: "Stay high with our 10 and ignore midfield recovery"
        },
        {
          id: "mark-fb",
          label: "Abandon midfield to mark their fullback"
        },
        {
          id: "gk",
          label: "Drop into goalkeeper position"
        }
      ],
      correctAnswer: "second-am",
      hint: "The main defensive distinction: the 8 recovers onto the second central threat; the 10 stays higher on their 6.",
      explanation: "When two central attackers advance, the 8 takes the second midfielder and supports the 6 on the ball side instead of remaining high with the 10.",
      coachingCue: "8 recovers; 10 occupies their 6.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-8",
          to: {
            x: 46,
            y: 48
          },
          duration: 500
        }
      ],
      challengeEligible: true
    },
    {
      id: "defense-04",
      module: "defense",
      chapter: "defensive-responsibilities",
      title: "Plus-One on the 9",
      difficulty: 2,
      phase: "defending-established",
      concept: "defense",
      prompt: "How should our center backs organize around the opponent's 9?",
      seeIt: "Opp 9 is central. Both of our CBs are stepping toward her at the same time with no cover behind.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 30,
          y: 68
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 38,
          y: 66
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 55
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right back",
          x: 56,
          y: 62
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left back",
          x: 12,
          y: 62
        }
      ],
      opponents: [
        {
          id: "opp-9",
          team: "opp",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 58
        },
        {
          id: "opp-10",
          team: "opp",
          number: 10,
          role: "Attacking midfielder",
          x: 40,
          y: 48
        }
      ],
      ball: {
        x: 40,
        y: 48
      },
      options: [
        {
          id: "plus-one",
          label: "One engages; the other provides cover — keep plus-one protection"
        },
        {
          id: "both-jump",
          label: "Both jump to the 9 together with no cover"
        },
        {
          id: "ignore",
          label: "Both ignore the 9 and mark wide players only"
        },
        {
          id: "six-alone",
          label: "Leave the 9 entirely to the 6"
        }
      ],
      correctAnswer: "plus-one",
      hint: "Plus-one means pressure plus cover — not two players glued to the same attacker with an empty space behind.",
      explanation: "Organize plus-one around the 9: one can engage while the other covers the next dangerous action. Do not both step without protection.",
      coachingCue: "Pressure plus cover equals plus-one.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-4",
          to: {
            x: 32,
            y: 60
          },
          duration: 450
        },
        {
          type: "move",
          playerId: "our-5",
          to: {
            x: 42,
            y: 68
          },
          duration: 450
        }
      ],
      challengeEligible: true
    },
    {
      id: "defense-05",
      module: "defense",
      chapter: "defensive-responsibilities",
      title: "Shift Plus-One to Best Attacker",
      difficulty: 3,
      phase: "defending-established",
      concept: "defense",
      prompt: "The opponent's left winger (11) is clearly their best attacker, drifting inside. How should plus-one protection shift?",
      seeIt: "Opp 11 is the identified danger, moving into the half-space. Opp 9 is quieter. Our CBs are still centered only on the 9.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 70
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 70
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right back",
          x: 54,
          y: 58
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 36,
          y: 56
        }
      ],
      opponents: [
        {
          id: "opp-11",
          team: "opp",
          number: 11,
          role: "Left winger",
          x: 48,
          y: 52
        },
        {
          id: "opp-9",
          team: "opp",
          number: 9,
          role: "Center forward",
          x: 30,
          y: 58
        },
        {
          id: "opp-10",
          team: "opp",
          number: 10,
          role: "Attacking midfielder",
          x: 36,
          y: 44
        }
      ],
      ball: {
        x: 48,
        y: 52
      },
      options: [
        {
          id: "shift",
          label: "Shift plus-one toward the best attacker — pressure plus cover on her next action"
        },
        {
          id: "double-glue",
          label: "Glue two players beside her everywhere she goes, abandoning central cover"
        },
        {
          id: "ignore-best",
          label: "Ignore the best attacker and only mark the 9"
        },
        {
          id: "fb-alone",
          label: "Leave her 1v1 to the fullback with no cover plan"
        }
      ],
      correctAnswer: "shift",
      hint: "Double does not mean two shadows everywhere. It means pressure plus protection on the dangerous next action.",
      explanation: "Shift plus-one toward the identified best attacker. One pressures; another protects the dangerous next ball or run — without abandoning all central structure.",
      coachingCue: "Pressure plus cover equals plus-one.",
      animationSteps: [
        {
          type: "highlight",
          playerIds: ["our-5", "our-2", "opp-11"]
        }
      ],
      challengeEligible: true
    },
    {
      id: "defense-06",
      module: "defense",
      chapter: "defensive-responsibilities",
      title: "Wingers vs Back Three",
      difficulty: 3,
      phase: "defending-established",
      concept: "defense",
      prompt: "Opponent plays a back three with wingbacks. Who should our 7 and 11 primarily account for?",
      seeIt: "Opponent in a back three (three CBs across). Wingbacks 2 and 3 are the widest players near the touchlines. Inside forwards are higher/narrower. Our fullbacks are already on those inside forwards.",
      interactionType: "multiple-choice",
      players: [
        { id: "our-7", team: "ours", number: 7, role: "Right winger", x: 62, y: 36, label: "RW" },
        { id: "our-11", team: "ours", number: 11, role: "Left winger", x: 6, y: 36, label: "LW" },
        { id: "our-2", team: "ours", number: 2, role: "Right back", x: 50, y: 56 },
        { id: "our-3", team: "ours", number: 3, role: "Left back", x: 18, y: 56 },
        { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 34, y: 26 },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 34, y: 48 }
      ],
      opponents: [
        { id: "opp-cb-l", team: "opp", number: 5, role: "Left center back", x: 22, y: 16, label: "CB" },
        { id: "opp-cb-c", team: "opp", number: 4, role: "Right center back", x: 34, y: 14, label: "CB" },
        { id: "opp-cb-r", team: "opp", number: 6, role: "Right center back", x: 46, y: 16, label: "CB" },
        { id: "opp-wb-r", team: "opp", number: 2, role: "Right wingback", x: 64, y: 30, label: "RWB" },
        { id: "opp-wb-l", team: "opp", number: 3, role: "Left wingback", x: 4, y: 30, label: "LWB" },
        { id: "opp-if-r", team: "opp", number: 7, role: "Right inside forward", x: 46, y: 50, label: "RIF" },
        { id: "opp-if-l", team: "opp", number: 11, role: "Left inside forward", x: 22, y: 50, label: "LIF" }
      ],
      ball: { x: 34, y: 14 },
      options: [
        {
          id: "wingbacks",
          label: "Track the opponent wingbacks (widest buildup options)"
        },
        {
          id: "cbs",
          label: "Both wingers mark the central center back"
        },
        {
          id: "ignore-wb",
          label: "Ignore wingbacks and only press the 9"
        },
        {
          id: "drop-cb",
          label: "Both drop into center-back roles"
        }
      ],
      correctAnswer: "wingbacks",
      hint: "Against a back three, the widest opponents are the wingbacks near the touchlines — that becomes a 7/11 job while fullbacks take the inside forwards.",
      explanation: "Vs back three/wingbacks: 7 and 11 track the wide wingbacks; fullbacks generally take advanced inside forwards; midfield keeps central matchups.",
      coachingCue: "Know your player; protect the shape.",
      animationSteps: [
        { type: "highlight", playerIds: ["our-7", "our-11", "opp-wb-r", "opp-wb-l"] }
      ],
      challengeEligible: true
    },
    {
      id: "defense-07",
      module: "defense",
      chapter: "defensive-responsibilities",
      title: "Far-Side Winger Tuck",
      difficulty: 2,
      phase: "defending-established",
      concept: "defense",
      prompt: "Ball is on the right. How far should our far-side winger (11) tuck?",
      seeIt: "Play is on the right. Our 11 is still hugging the far touchline, leaving a huge gap into midfield. Opp far wingback is still a latent threat.",
      interactionType: "drag-player",
      dragPlayerId: "our-11",
      dragTarget: {
        x: 22,
        y: 48,
        r: 10
      },
      players: [
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 58,
          y: 44
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 4,
          y: 46
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 40,
          y: 52
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 58
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left back",
          x: 14,
          y: 64
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 40,
          y: 34
        }
      ],
      opponents: [
        {
          id: "opp-2",
          team: "opp",
          number: 2,
          role: "Right back",
          x: 58,
          y: 36
        },
        {
          id: "opp-3",
          team: "opp",
          number: 3,
          role: "Left back",
          x: 10,
          y: 40
        },
        {
          id: "opp-8",
          team: "opp",
          number: 8,
          role: "Central midfielder",
          x: 46,
          y: 42
        }
      ],
      ball: {
        x: 58,
        y: 36
      },
      options: [
        {
          id: "tuck",
          label: "Tuck inside for compactness while retaining ability to recover wide"
        },
        {
          id: "stay",
          label: "Stay on the far touchline disconnected"
        },
        {
          id: "all-in",
          label: "Abandon the far player completely and stand on our 6"
        },
        {
          id: "press-alone",
          label: "Sprint alone to press their goalkeeper"
        }
      ],
      altOptions: [
        {
          id: "tuck",
          label: "Tuck compact, keep recovery awareness"
        },
        {
          id: "stay",
          label: "Stay maximally wide"
        },
        {
          id: "all-in",
          label: "Abandon far player entirely"
        },
        {
          id: "press-alone",
          label: "Press GK alone"
        }
      ],
      zones: [
        {
          id: "tuck",
          label: "Connected tuck",
          x: 16,
          y: 40,
          w: 16,
          h: 18
        },
        {
          id: "stay",
          label: "Too wide",
          x: 1,
          y: 40,
          w: 8,
          h: 16
        },
        {
          id: "all-in",
          label: "Too central",
          x: 30,
          y: 52,
          w: 10,
          h: 12
        }
      ],
      correctAnswer: "tuck",
      hint: "Far-side wingers tuck for compactness but must still be able to recover to the wide player.",
      explanation: "Tuck inside enough to close the midfield gap, without losing awareness of the far-side opponent you may need to recover to.",
      coachingCue: "Far side: compact, not blind.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-11",
          to: {
            x: 22,
            y: 48
          },
          duration: 550
        }
      ],
      challengeEligible: true
    },
    {
      id: "defense-08",
      module: "defense",
      chapter: "defensive-responsibilities",
      title: "Follow or Pass Off?",
      difficulty: 3,
      phase: "defending-established",
      concept: "defense",
      prompt: "An opponent midfielder runs from your zone into a teammate's natural area, opening central space if you chase. What should you do?",
      seeIt: "Opp 8 starts on our 6, then runs toward our right fullback's zone. Chasing her opens the central lane in front of our CBs. Our 2 is goal-side and ready.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 55
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right back",
          x: 52,
          y: 58
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 44,
          y: 50
        },
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 70
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 70
        }
      ],
      opponents: [
        {
          id: "opp-8",
          team: "opp",
          number: 8,
          role: "Central midfielder",
          x: 46,
          y: 54
        },
        {
          id: "opp-10",
          team: "opp",
          number: 10,
          role: "Attacking midfielder",
          x: 34,
          y: 46
        },
        {
          id: "opp-9",
          team: "opp",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 62
        }
      ],
      ball: {
        x: 34,
        y: 46
      },
      options: [
        {
          id: "pass-off",
          label: "Pass the runner to the teammate and protect the dangerous central space"
        },
        {
          id: "chase",
          label: "Follow her all the way to the touchline, abandoning the center"
        },
        {
          id: "ball-watch",
          label: "Stop marking and only watch the ball"
        },
        {
          id: "foul",
          label: "Foul her immediately regardless of location"
        }
      ],
      correctAnswer: "pass-off",
      hint: "The tempting answer is to stay attached everywhere. Preserving dangerous central space is more important.",
      explanation: "Pass the runner when she enters a teammate's area and chasing would open central space. Communicate; the receiving defender must be goal-side.",
      coachingCue: "Know your player; protect the shape.",
      rationalePrompt: "Why is passing her off stronger than chasing?",
      rationaleOptions: [
        {
          id: "r1",
          label: "Following would open a more dangerous central space while a teammate can take her"
        },
        {
          id: "r2",
          label: "We never mark midfield runners"
        },
        {
          id: "r3",
          label: "The fullback is always free"
        },
        {
          id: "r4",
          label: "Fouling is preferred"
        }
      ],
      correctRationale: "r1",
      animationSteps: [
        {
          type: "highlight",
          playerIds: ["our-6", "our-2", "opp-8"]
        }
      ],
      challengeEligible: true
    },
    {
      id: "defense-09",
      module: "defense",
      chapter: "defensive-responsibilities",
      title: "Counterpress or Recover?",
      difficulty: 2,
      phase: "defensive-transition",
      concept: "defense",
      prompt: "We just lost the ball. Several teammates are close and cover exists behind. What should we do?",
      seeIt: "Turnover in the opponent half. Three of our players within a few yards of the ball. Our 6 and a CB are still behind the press.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 36,
          y: 28
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 40,
          y: 34
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 32,
          y: 36
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 48
        },
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 60
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 60
        }
      ],
      opponents: [
        {
          id: "opp-6",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 36,
          y: 32
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Right center back",
          x: 30,
          y: 20
        }
      ],
      ball: {
        x: 36,
        y: 32
      },
      options: [
        {
          id: "counterpress",
          label: "Counterpress — trap it immediately while cover exists"
        },
        {
          id: "recover",
          label: "Everyone sprints back 40 yards without pressing"
        },
        {
          id: "watch",
          label: "Stand and watch if they escape"
        },
        {
          id: "foul",
          label: "Commit a tactical foul every time"
        }
      ],
      correctAnswer: "counterpress",
      hint: "If teammates are close and cover remains behind the pressure, squeeze. If they escape or we are stretched, recover.",
      explanation: "Close numbers + ability to prevent a forward pass + cover behind = counterpress. Trap the first touch before they play out.",
      coachingCue: "If we can trap it, squeeze. If they escape, recover.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-9",
          to: {
            x: 36,
            y: 30
          },
          duration: 350
        },
        {
          type: "move",
          playerId: "our-10",
          to: {
            x: 40,
            y: 32
          },
          duration: 350
        },
        {
          type: "move",
          playerId: "our-8",
          to: {
            x: 32,
            y: 34
          },
          duration: 350
        }
      ],
      challengeEligible: true
    },
    {
      id: "defense-10",
      module: "defense",
      chapter: "defensive-responsibilities",
      title: "Unsupported 9 Press",
      difficulty: 2,
      phase: "defending-press",
      concept: "defense",
      prompt: "Our 9 has sprinted to press a center back alone. Teammates are not connected. What is the problem?",
      seeIt: "9 is isolated pressing opp 5. Our 10 and wingers are still deep. Opp 6 and far CB are free outlets.",
      interactionType: "formation-diagnosis",
      players: [
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 42,
          y: 22
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 34,
          y: 48
        },
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 58,
          y: 50
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 10,
          y: 50
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 40,
          y: 56
        }
      ],
      opponents: [
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Left center back",
          x: 42,
          y: 18
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Right center back",
          x: 28,
          y: 20
        },
        {
          id: "opp-6",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 30
        }
      ],
      ball: {
        x: 42,
        y: 18
      },
      options: [
        {
          id: "solo-press",
          label: "The 9 pressed without teammate support — easy outlets remain"
        },
        {
          id: "too-compact",
          label: "We are too compact as a team"
        },
        {
          id: "no-gk",
          label: "We forgot to bring a goalkeeper"
        },
        {
          id: "plus-one",
          label: "We have perfect plus-one everywhere"
        }
      ],
      correctAnswer: "solo-press",
      hint: "Pressing starts with body shape and connected support. A lone 9 gives free central and far-side outlets.",
      explanation: "The 9 initiates pressure to dictate direction, but not alone. Without support, their 6 and far CB stay free.",
      coachingCue: "Press with a plan — not alone.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-10",
          to: {
            x: 34,
            y: 32
          },
          duration: 500
        },
        {
          type: "move",
          playerId: "our-7",
          to: {
            x: 52,
            y: 28
          },
          duration: 500
        }
      ],
      challengeEligible: true
    },

    {
      id: "defense-11",
      module: "defense",
      chapter: "defend-4-4-2",
      title: "Part 2: Name the Defensive Shape",
      difficulty: 1,
      phase: "defending-established",
      concept: "defending-shape",
      prompt: "Out of possession, what shape are we trying to fill — the defensive mirror of our attacking 2-3-5?",
      seeIt: "We are organized: back four, a flat midfield four across the pitch, and two higher (9 and 10). Midfield reads 7–8–6–11.",
      interactionType: "multiple-choice",
      players: [
        { id: "our-2", team: "ours", number: 2, role: "Right back", x: 56, y: 72 },
        { id: "our-4", team: "ours", number: 4, role: "Right center back", x: 28, y: 74 },
        { id: "our-5", team: "ours", number: 5, role: "Left center back", x: 42, y: 74 },
        { id: "our-3", team: "ours", number: 3, role: "Left back", x: 12, y: 72 },
        { id: "our-7", team: "ours", number: 7, role: "Right winger", x: 58, y: 52 },
        { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 42, y: 54 },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 28, y: 54 },
        { id: "our-11", team: "ours", number: 11, role: "Left winger", x: 10, y: 52 },
        { id: "our-10", team: "ours", number: 10, role: "Attacking midfielder", x: 40, y: 36 },
        { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 28, y: 34 }
      ],
      opponents: [
        { id: "opp-6", team: "opp", number: 6, role: "Defensive midfielder", x: 34, y: 28 },
        { id: "opp-8", team: "opp", number: 8, role: "Central midfielder", x: 44, y: 38 },
        { id: "opp-9", team: "opp", number: 9, role: "Center forward", x: 34, y: 58 }
      ],
      ball: { x: 34, y: 28 },
      options: [
        {
          id: "442",
          label: "4-4-2 — back four, midfield four (7-8-6-11 or 7-6-8-11), two higher"
        },
        {
          id: "stay-433",
          label: "Stay in a high 4-3-3 with the 8 and wingers advanced"
        },
        {
          id: "532",
          label: "Drop into a 5-3-2 with a third center back"
        },
        {
          id: "235",
          label: "Keep the attacking 2-3-5 occupation while defending"
        }
      ],
      correctAnswer: "442",
      hint: "Attacking occupation is 2-3-5. Defending occupation is the flip: a compact 4-4-2.",
      explanation: "Out of possession we fill a 4-4-2: back four, flat midfield four (7-8-6-11 or 7-6-8-11), and 9 + 10 higher. It is an occupation map — not a second formation we train separately.",
      coachingCue: "Out of possession: 4-4-2.",
      animationSteps: [
        { type: "highlight", playerIds: ["our-7", "our-8", "our-6", "our-11"] }
      ],
      challengeEligible: true
    },
    {
      id: "defense-12",
      module: "defense",
      chapter: "defend-4-4-2",
      title: "8 Drops Next to the 6",
      difficulty: 2,
      phase: "defending-established",
      concept: "defending-shape",
      prompt: "We are out of possession. Drag the 8 into the correct spot in our midfield four.",
      seeIt: "Our 6 is alone centrally. The 8 is still high next to the 10. Opp midfielders can play through the gap beside the 6.",
      interactionType: "drag-player",
      dragPlayerId: "our-8",
      dragTarget: { x: 44, y: 54, r: 9 },
      players: [
        { id: "our-2", team: "ours", number: 2, role: "Right back", x: 56, y: 72 },
        { id: "our-4", team: "ours", number: 4, role: "Right center back", x: 28, y: 74 },
        { id: "our-5", team: "ours", number: 5, role: "Left center back", x: 42, y: 74 },
        { id: "our-3", team: "ours", number: 3, role: "Left back", x: 12, y: 72 },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 30, y: 54 },
        { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 40, y: 36 },
        { id: "our-10", team: "ours", number: 10, role: "Attacking midfielder", x: 28, y: 34 },
        { id: "our-7", team: "ours", number: 7, role: "Right winger", x: 58, y: 50 },
        { id: "our-11", team: "ours", number: 11, role: "Left winger", x: 10, y: 50 },
        { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 34, y: 28 }
      ],
      opponents: [
        { id: "opp-8", team: "opp", number: 8, role: "Central midfielder", x: 46, y: 42 },
        { id: "opp-10", team: "opp", number: 10, role: "Attacking midfielder", x: 34, y: 40 },
        { id: "opp-6", team: "opp", number: 6, role: "Defensive midfielder", x: 34, y: 26 }
      ],
      ball: { x: 34, y: 26 },
      zones: [
        { id: "beside-6", label: "Beside the 6", x: 36, y: 48, w: 16, h: 14 },
        { id: "stay-high", label: "Stay high with 10", x: 28, y: 28, w: 18, h: 12 },
        { id: "back-line", label: "Into the back four", x: 36, y: 68, w: 14, h: 12 }
      ],
      correctAnswer: "beside-6",
      options: [
        { id: "beside-6", label: "Drop next to the 6 to complete the midfield four" },
        { id: "stay-high", label: "Stay high with the 10 and leave the 6 alone" },
        { id: "back-line", label: "Drop all the way into the back four" }
      ],
      hint: "The midfield four needs the 8 beside the 6 — left or right of her is fine (7-8-6-11 or 7-6-8-11).",
      explanation: "The 8 drops next to the 6 so we form a flat midfield four. She can sit either side (7-8-6-11 or 7-6-8-11). Staying high leaves a lane through midfield.",
      coachingCue: "8 next to 6.",
      animationSteps: [
        { type: "move", playerId: "our-8", to: { x: 44, y: 54 }, duration: 500 }
      ],
      challengeEligible: true
    },
    {
      id: "defense-13",
      module: "defense",
      chapter: "defend-4-4-2",
      title: "7 and 11 Cover Deep Wide",
      difficulty: 2,
      phase: "defending-established",
      concept: "defending-shape",
      prompt: "Their fullbacks are high and wide — deep wide attackers behind our midfield. What should our 7 and 11 do?",
      seeIt: "Opp 2 and 3 are pushed high on the touchlines. Our 7 and 11 are still stuck high with the 9/10. The midfield four has holes on both flanks.",
      interactionType: "multiple-choice",
      players: [
        { id: "our-2", team: "ours", number: 2, role: "Right back", x: 56, y: 74 },
        { id: "our-4", team: "ours", number: 4, role: "Right center back", x: 28, y: 76 },
        { id: "our-5", team: "ours", number: 5, role: "Left center back", x: 42, y: 76 },
        { id: "our-3", team: "ours", number: 3, role: "Left back", x: 12, y: 74 },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 30, y: 56 },
        { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 42, y: 56 },
        { id: "our-7", team: "ours", number: 7, role: "Right winger", x: 58, y: 28 },
        { id: "our-11", team: "ours", number: 11, role: "Left winger", x: 10, y: 28 },
        { id: "our-10", team: "ours", number: 10, role: "Attacking midfielder", x: 40, y: 32 },
        { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 28, y: 30 }
      ],
      opponents: [
        { id: "opp-2", team: "opp", number: 2, role: "Right back", x: 12, y: 48 },
        { id: "opp-3", team: "opp", number: 3, role: "Left back", x: 56, y: 48 },
        { id: "opp-6", team: "opp", number: 6, role: "Defensive midfielder", x: 34, y: 26 },
        { id: "opp-8", team: "opp", number: 8, role: "Central midfielder", x: 40, y: 40 }
      ],
      ball: { x: 34, y: 26 },
      options: [
        {
          id: "drop-cover",
          label: "Drop into the midfield line to cover those deep wide attackers"
        },
        {
          id: "stay-high",
          label: "Stay high and hope our fullbacks deal with everything"
        },
        {
          id: "both-central",
          label: "Both tuck next to the 6 and leave the flanks empty"
        },
        {
          id: "press-cb",
          label: "Sprint to press their center backs alone"
        }
      ],
      correctAnswer: "drop-cover",
      hint: "Deep wide attackers are often their fullbacks. Our 7 and 11 become the wide players in the midfield four.",
      explanation: "In the 4-4-2, the 7 and 11 drop onto deep wide attackers so the midfield line stays connected across the pitch. Leaving them high opens the flanks behind our 6 and 8.",
      coachingCue: "7 and 11 cover deep wide.",
      animationSteps: [
        { type: "move", playerId: "our-7", to: { x: 58, y: 52 }, duration: 500 },
        { type: "move", playerId: "our-11", to: { x: 10, y: 52 }, duration: 500 }
      ],
      challengeEligible: true
    },
    {
      id: "defense-14",
      module: "defense",
      chapter: "defend-4-4-2",
      title: "Broken Midfield Four",
      difficulty: 2,
      phase: "defending-established",
      concept: "defending-shape",
      prompt: "What is wrong with this out-of-possession shape?",
      seeIt: "The 6 is isolated. The 8 stayed high with the 10. The 7 dropped, but the 11 is still high — left flank open for their fullback.",
      interactionType: "formation-diagnosis",
      players: [
        { id: "our-2", team: "ours", number: 2, role: "Right back", x: 56, y: 74 },
        { id: "our-4", team: "ours", number: 4, role: "Right center back", x: 28, y: 76 },
        { id: "our-5", team: "ours", number: 5, role: "Left center back", x: 42, y: 76 },
        { id: "our-3", team: "ours", number: 3, role: "Left back", x: 12, y: 74 },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 34, y: 56 },
        { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 44, y: 34 },
        { id: "our-7", team: "ours", number: 7, role: "Right winger", x: 58, y: 52 },
        { id: "our-11", team: "ours", number: 11, role: "Left winger", x: 10, y: 30 },
        { id: "our-10", team: "ours", number: 10, role: "Attacking midfielder", x: 30, y: 32 },
        { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 36, y: 28 }
      ],
      opponents: [
        { id: "opp-2", team: "opp", number: 2, role: "Right back", x: 12, y: 46 },
        { id: "opp-8", team: "opp", number: 8, role: "Central midfielder", x: 46, y: 44 },
        { id: "opp-6", team: "opp", number: 6, role: "Defensive midfielder", x: 34, y: 24 }
      ],
      ball: { x: 34, y: 24 },
      options: [
        {
          id: "no-mid-four",
          label: "No midfield four — 8 stayed high and 11 did not drop to cover deep wide"
        },
        {
          id: "too-deep",
          label: "The back four is too deep"
        },
        {
          id: "perfect",
          label: "This is a perfect 4-4-2"
        },
        {
          id: "gk",
          label: "We need a fifth midfielder"
        }
      ],
      correctAnswer: "no-mid-four",
      hint: "Look at who is level with the 6. Both the 8 and both wide midfielders should be in that line.",
      explanation: "A real 4-4-2 midfield needs the 8 next to the 6 and both 7 and 11 dropped. Here the 8 stayed high and the 11 left the left flank open — easy central and wide progression.",
      coachingCue: "8 next to 6. 7 and 11 cover deep wide.",
      animationSteps: [
        { type: "move", playerId: "our-8", to: { x: 44, y: 56 }, duration: 450 },
        { type: "move", playerId: "our-11", to: { x: 10, y: 52 }, duration: 450 }
      ],
      challengeEligible: true
    },
    {
      id: "defense-15",
      module: "defense",
      chapter: "defend-4-4-2",
      title: "7-8-6-11 or 7-6-8-11?",
      difficulty: 1,
      phase: "defending-established",
      concept: "defending-shape",
      prompt: "Does the 8 have to sit on a fixed side of the 6 in our midfield four?",
      seeIt: "Ball is on our right. The 8 can tuck right of the 6 (7-8-6-11) or the shape can read 7-6-8-11 — both still a flat four.",
      interactionType: "multiple-choice",
      players: [
        { id: "our-7", team: "ours", number: 7, role: "Right winger", x: 58, y: 52 },
        { id: "our-8", team: "ours", number: 8, role: "Central midfielder", x: 42, y: 54 },
        { id: "our-6", team: "ours", number: 6, role: "Defensive midfielder", x: 28, y: 54 },
        { id: "our-11", team: "ours", number: 11, role: "Left winger", x: 10, y: 52 },
        { id: "our-4", team: "ours", number: 4, role: "Right center back", x: 28, y: 74 },
        { id: "our-5", team: "ours", number: 5, role: "Left center back", x: 42, y: 74 },
        { id: "our-10", team: "ours", number: 10, role: "Attacking midfielder", x: 40, y: 36 },
        { id: "our-9", team: "ours", number: 9, role: "Center forward", x: 28, y: 34 }
      ],
      opponents: [
        { id: "opp-8", team: "opp", number: 8, role: "Central midfielder", x: 48, y: 42 },
        { id: "opp-6", team: "opp", number: 6, role: "Defensive midfielder", x: 34, y: 26 }
      ],
      ball: { x: 48, y: 42 },
      options: [
        {
          id: "either-side",
          label: "Either side is fine — 7-8-6-11 or 7-6-8-11 — as long as she is next to the 6"
        },
        {
          id: "always-right",
          label: "The 8 must always be on the right of the 6"
        },
        {
          id: "always-left",
          label: "The 8 must always be on the left of the 6"
        },
        {
          id: "never-drop",
          label: "The 8 should never drop into the midfield four"
        }
      ],
      correctAnswer: "either-side",
      hint: "Read the numbers as a flat line, not as fixed dots. Ball side and second midfielder threat decide which side of the 6.",
      explanation: "7-8-6-11 and 7-6-8-11 are the same idea: a flat midfield four with the 8 beside the 6. Which side depends on ball side and the second central threat — not a permanent right/left assignment.",
      coachingCue: "8 next to 6 — either side.",
      animationSteps: [
        { type: "highlight", playerIds: ["our-7", "our-8", "our-6", "our-11"] }
      ],
      challengeEligible: true
    },

    {
      id: "corner-01",
      module: "corner",
      chapter: "short-corners",
      title: "Part 1: Zero Defenders — Go Short",
      difficulty: 1,
      phase: "corner-kick",
      concept: "corners-short",
      prompt: "Corner: zero defenders are near our corner pair. What is the first decision?",
      seeIt: "Player 1 and Player 2 are free at the flag. No opponent is close enough to stop the short. Our other attackers are stacked at the back post to clear space.",
      interactionType: "multiple-choice",
      players: [
        { id: "p1", team: "ours", number: "1", role: "Player 1", x: 66, y: 3.5, label: "P1" },
        { id: "p2", team: "ours", number: "2", role: "Player 2", x: 63, y: 1.3, label: "P2" },
        { id: "bp1", team: "ours", number: "·", role: "Back-post group", x: 24, y: 10, label: "BP" },
        { id: "bp2", team: "ours", number: "·", role: "Back-post group", x: 28, y: 12, label: "BP" },
        { id: "bp3", team: "ours", number: "·", role: "Back-post group", x: 22, y: 14, label: "BP" },
        { id: "bp4", team: "ours", number: "·", role: "Back-post group", x: 30, y: 8, label: "BP" },
        { id: "cd1", team: "ours", number: "·", role: "Corner defense", x: 30, y: 48, label: "CD" },
        { id: "cd2", team: "ours", number: "·", role: "Corner defense", x: 40, y: 50, label: "CD" }
      ],
      opponents: [
        { id: "opp-a", team: "opp", number: 4, role: "Right center back", x: 32, y: 12 },
        { id: "opp-b", team: "opp", number: 5, role: "Left center back", x: 26, y: 14 },
        { id: "opp-c", team: "opp", number: 6, role: "Midfielder", x: 36, y: 22 }
      ],
      ball: { x: 66, y: 1.3 },
      options: [
        { id: "short", label: "Play short — run the 1–2 play into free space" },
        { id: "serve", label: "Serve long into the crowded box anyway" },
        { id: "wait", label: "Wait for two defenders to come out, then decide" },
        { id: "gk", label: "Pass back to our goalkeeper" }
      ],
      correctAnswer: "short",
      hint: "Count defenders on the corner pair. Zero means the free space is at the flag — go short.",
      explanation: "Zero near the pair → short. Clear the box by keeping others at the back post so 1 and 2 can run the play. We almost always get a shot from this.",
      coachingCue: "Zero or one: short. Two: serve.",
      animationSteps: [
        { type: "pass", from: { x: 66, y: 1.3 }, to: { x: 63, y: 1.3 }, duration: 400 },
        { type: "highlight", playerIds: ["p1", "p2"] }
      ],
      challengeEligible: true
    },
    {
      id: "corner-02",
      module: "corner",
      chapter: "short-corners",
      title: "Part 1: One Defender — Short 2v1",
      difficulty: 1,
      phase: "corner-kick",
      concept: "corners-short",
      prompt: "One defender has stepped to our corner pair. What is the first decision?",
      seeIt: "One opponent is near Player 1 and Player 2 on the goal line. The rest of our attackers stay at the back post. We can create a 2v1 on the short.",
      interactionType: "multiple-choice",
      players: [
        { id: "p1", team: "ours", number: "1", role: "Player 1", x: 66, y: 3.5, label: "P1" },
        { id: "p2", team: "ours", number: "2", role: "Player 2", x: 63, y: 1.3, label: "P2" },
        { id: "bp1", team: "ours", number: "·", role: "Back-post group", x: 24, y: 10, label: "BP" },
        { id: "bp2", team: "ours", number: "·", role: "Back-post group", x: 28, y: 12, label: "BP" },
        { id: "bp3", team: "ours", number: "·", role: "Back-post group", x: 22, y: 14, label: "BP" },
        { id: "cd1", team: "ours", number: "·", role: "Corner defense", x: 32, y: 48, label: "CD" }
      ],
      opponents: [
        { id: "opp-short", team: "opp", number: 3, role: "Corner defender", x: 58, y: 3 },
        { id: "opp-a", team: "opp", number: 4, role: "Right center back", x: 30, y: 12 },
        { id: "opp-b", team: "opp", number: 5, role: "Left center back", x: 24, y: 14 }
      ],
      ball: { x: 66, y: 1.3 },
      options: [
        { id: "short", label: "Play short and attack the 2v1 with our 1–2 play" },
        { id: "serve", label: "Serve long because one defender ends the short" },
        { id: "chip", label: "Chip hopefully to the far post with no plan" },
        { id: "reset", label: "Cancel the corner and walk away" }
      ],
      correctAnswer: "short",
      hint: "One defender on the pair still means short — we want the 2v1.",
      explanation: "One near the pair → short. Run the 1–2 play and force that single defender to choose.",
      coachingCue: "Zero or one: short. Two: serve.",
      animationSteps: [
        { type: "pass", from: { x: 66, y: 1.3 }, to: { x: 63, y: 1.3 }, duration: 400 },
        { type: "move", playerId: "p1", to: { x: 52, y: 15 }, duration: 550 }
      ],
      challengeEligible: true
    },
    {
      id: "corner-03",
      module: "corner",
      chapter: "short-corners",
      title: "Short Play: 1 Touches, Then Bends",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners-short",
      prompt: "We have gone short. What does Player 1 do after the first touch?",
      seeIt: "Ball is live on the short — still with Player 2 on the goal line at the corner, ready to dribble parallel to that line. Player 1 has touched it. Back-post group stays put to keep the near space open.",
      interactionType: "multiple-choice",
      showTeachingZones: true,
      players: [
        { id: "p1", team: "ours", number: "1", role: "Player 1", x: 64.5, y: 4, label: "P1" },
        { id: "p2", team: "ours", number: "2", role: "Player 2", x: 64, y: 1.3, label: "P2" },
        { id: "bp1", team: "ours", number: "·", role: "Back-post group", x: 24, y: 10, label: "BP" },
        { id: "bp2", team: "ours", number: "·", role: "Back-post group", x: 28, y: 12, label: "BP" },
        { id: "bp3", team: "ours", number: "·", role: "Back-post group", x: 22, y: 14, label: "BP" }
      ],
      opponents: [
        { id: "opp-short", team: "opp", number: 3, role: "Corner defender", x: 56, y: 3 }
      ],
      ball: { x: 64, y: 1.3 },
      zones: [
        { id: "near18", label: "Near-post corner of the 18", x: 46, y: 12, w: 12, h: 8 }
      ],
      options: [
        { id: "bend", label: "Make a high bending run toward the near-post corner of the 18" },
        { id: "stand", label: "Stand on the corner arc and watch" },
        { id: "box-crash", label: "Sprint straight into the six-yard box with the crowd" },
        { id: "retreat", label: "Drop all the way to midfield" }
      ],
      correctAnswer: "bend",
      hint: "After the touch, Player 1’s job is the bending run into the near-post corner of the 18 — not a crash into traffic.",
      explanation: "1 touches, then bends high toward the near-post corner of the 18. 2 keeps the ball on the goal line — that run is the cutback target once 2 draws the defender.",
      coachingCue: "1 touches and bends; 2 dribbles the goal line.",
      animationSteps: [
        { type: "highlight", playerIds: ["p1"] },
        { type: "move", playerId: "p1", to: { x: 52, y: 15 }, duration: 700 }
      ],
      challengeEligible: true
    },
    {
      id: "corner-04",
      module: "corner",
      chapter: "short-corners",
      title: "Short Play: Goal-Line Drive — Cutback?",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners-short",
      prompt: "Player 2 still has the ball and is dribbling parallel to the goal line. The defender steps hard toward 2. What should 2 do?",
      seeIt: "2 is on the goal line with the ball — between the corner and the near post — holding everyone onside. 1 is bending toward the near-post corner of the 18. The red defender has stepped onto the goal line toward 2.",
      interactionType: "multiple-choice",
      showTeachingZones: true,
      players: [
        { id: "p1", team: "ours", number: "1", role: "Player 1", x: 50, y: 15, label: "P1" },
        { id: "p2", team: "ours", number: "2", role: "Player 2", x: 56, y: 1.3, label: "P2" },
        { id: "bp1", team: "ours", number: "·", role: "Back-post group", x: 24, y: 10, label: "BP" },
        { id: "bp2", team: "ours", number: "·", role: "Back-post group", x: 28, y: 12, label: "BP" }
      ],
      opponents: [
        { id: "opp-short", team: "opp", number: 3, role: "Corner defender", x: 52, y: 2.5 }
      ],
      ball: { x: 56, y: 1.3 },
      zones: [
        { id: "ahead1", label: "Cutback to/ahead of 1", x: 46, y: 11, w: 12, h: 8 }
      ],
      options: [
        { id: "pass-1", label: "Cut back to or just ahead of Player 1’s bending run" },
        { id: "force-end", label: "Ignore the open 1 and shoot from the corner flag" },
        { id: "turn-back", label: "Turn back and cancel the corner" },
        { id: "chip-crowd", label: "Chip into the back-post crowd immediately" }
      ],
      correctAnswer: "pass-1",
      hint: "When the defender commits to 2 on the goal line, the cutback is on — and everyone is onside because 2 holds the line.",
      explanation: "Defender overcommits to the goal-line dribble → 2 cutbacks to/ahead of 1. Staying on the goal line keeps receivers onside. If the defender stays, 2 can keep driving the goal line.",
      coachingCue: "Goal-line dribble = onside cutback.",
      rationalePrompt: "Why does the cutback work from the goal line?",
      rationaleOptions: [
        { id: "r1", label: "2 is on the goal line with the ball, so teammates receiving the cutback stay onside — and the defender stepped, freeing 1" },
        { id: "r2", label: "We never pass on short corners" },
        { id: "r3", label: "Because the back-post group called for it" },
        { id: "r4", label: "Because Player 1 is automatically offside from any short corner" }
      ],
      correctRationale: "r1",
      animationSteps: [
        { type: "move", playerId: "opp-short", to: { x: 54, y: 1.8 }, duration: 350 },
        { type: "pass", from: { x: 56, y: 1.3 }, to: { x: 50, y: 14 }, duration: 450 },
        { type: "move", playerId: "p1", to: { x: 48, y: 13 }, duration: 400 }
      ],
      challengeEligible: true
    },
    {
      id: "corner-05",
      module: "corner",
      chapter: "short-corners",
      title: "Zero Defenders: Drive the Goal Line",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners-short",
      prompt: "Zero defenders near the pair. Player 2 has the ball at the corner. What is 2’s first job?",
      seeIt: "Nobody is close. 2 has the ball on the goal line at the corner. 1 is starting the bend. Empty grass along the goal line toward the near post. Back-post group still clearing the near space.",
      interactionType: "multiple-choice",
      players: [
        { id: "p1", team: "ours", number: "1", role: "Player 1", x: 58, y: 12, label: "P1" },
        { id: "p2", team: "ours", number: "2", role: "Player 2", x: 65, y: 1.3, label: "P2" },
        { id: "bp1", team: "ours", number: "·", role: "Back-post group", x: 24, y: 10, label: "BP" },
        { id: "bp2", team: "ours", number: "·", role: "Back-post group", x: 28, y: 12, label: "BP" }
      ],
      opponents: [
        { id: "opp-a", team: "opp", number: 4, role: "Right center back", x: 30, y: 16 },
        { id: "opp-b", team: "opp", number: 5, role: "Left center back", x: 36, y: 18 }
      ],
      ball: { x: 65, y: 1.3 },
      options: [
        { id: "drive", label: "Dribble parallel to the goal line until a defender overcommits, then cut back to/ahead of 1" },
        { id: "early-cross", label: "Immediately float a cross from 25 yards out" },
        { id: "stop", label: "Stop and wait for instructions from the bench" },
        { id: "up-touch", label: "Dribble up the touchline away from goal, abandoning the goal-line run" }
      ],
      correctAnswer: "drive",
      hint: "With zero pressure, 2 keeps the ball at the corner and drives the goal line — not up the touchline — until someone has to step.",
      explanation: "Zero nearby → 2 dribbles parallel to the goal line. That holds everyone onside. Force an overcommit, then cut back to/ahead of 1. That is why we almost always get a shot.",
      coachingCue: "2 dribbles the goal line — force the step.",
      animationSteps: [
        { type: "move", playerId: "p2", to: { x: 52, y: 1.3 }, duration: 700 },
        { type: "move", playerId: "opp-a", to: { x: 50, y: 3 }, duration: 500 },
        { type: "pass", from: { x: 52, y: 1.3 }, to: { x: 52, y: 14 }, duration: 400 }
      ],
      challengeEligible: true
    },
    {
      id: "corner-06",
      module: "corner",
      chapter: "short-corners",
      title: "Short Setup: Clear the Near Space",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners-short",
      prompt: "What is wrong with this short-corner picture?",
      seeIt: "We are trying to play short, but three attackers are standing in the near half-space right where 1 needs to bend and 2 needs to cut back from the goal line.",
      interactionType: "formation-diagnosis",
      players: [
        { id: "p1", team: "ours", number: "1", role: "Player 1", x: 66, y: 3.5, label: "P1" },
        { id: "p2", team: "ours", number: "2", role: "Player 2", x: 64, y: 1.3, label: "P2" },
        { id: "crowd1", team: "ours", number: "·", role: "Crowding near space", x: 52, y: 12 },
        { id: "crowd2", team: "ours", number: "·", role: "Crowding near space", x: 48, y: 14 },
        { id: "crowd3", team: "ours", number: "·", role: "Crowding near space", x: 54, y: 16 }
      ],
      opponents: [
        { id: "opp-short", team: "opp", number: 3, role: "Corner defender", x: 58, y: 3 }
      ],
      ball: { x: 64, y: 1.3 },
      options: [
        { id: "crowd", label: "Teammates are crowding the near space — they should be at the back post clearing room" },
        { id: "fine", label: "Nothing — pack the short corner with everyone" },
        { id: "no-gk", label: "We forgot a goalkeeper" },
        { id: "too-deep", label: "Everyone is too deep in our own half" }
      ],
      correctAnswer: "crowd",
      hint: "Short corners need empty grass for 1’s bend and 2’s goal-line cutback. That means the rest start at the back post.",
      explanation: "Back post clears space. If teammates stand in the near channel, the cutback from the goal line has nowhere to go.",
      coachingCue: "Back post clears space for the short.",
      animationSteps: [
        { type: "move", playerId: "crowd1", to: { x: 24, y: 10 }, duration: 500 },
        { type: "move", playerId: "crowd2", to: { x: 28, y: 12 }, duration: 500 },
        { type: "move", playerId: "crowd3", to: { x: 22, y: 14 }, duration: 500 }
      ],
      challengeEligible: true
    },
    {
      id: "corner-07",
      module: "corner",
      chapter: "long-corners",
      title: "Part 2: Two Defenders — Serve Long",
      difficulty: 1,
      phase: "corner-kick",
      concept: "corners-long",
      prompt: "Two defenders are tight on our corner pair. What is the first decision?",
      seeIt: "Pri and Sec both still at the flag. Skittles/Spot/Drop crowded near the back post. Front and Back Targets start further past the back post (Front nearer the goal line), ready to come into the back post on the serve.",
      interactionType: "multiple-choice",
      players: [
        { id: "primary", team: "ours", number: "P", role: "Primary", x: 66, y: 1.5, label: "Pri" },
        { id: "secondary", team: "ours", number: "S", role: "Secondary", x: 64.5, y: 3.2, label: "Sec" },
        { id: "skittles", team: "ours", number: "Sk", role: "Skittles", x: 24, y: 10, label: "Skit" },
        { id: "spot", team: "ours", number: "O", role: "Spot", x: 26, y: 11.5, label: "Spt" },
        { id: "drop", team: "ours", number: "D", role: "Drop", x: 22.5, y: 12.5, label: "Drp" },
        // Targets start further past the back post; Front closer to goal line than Back
        { id: "front", team: "ours", number: "F", role: "Front Target", x: 14, y: 5.5, label: "FT" },
        { id: "back", team: "ours", number: "B", role: "Back Target", x: 13, y: 12, label: "BT" },
        { id: "block", team: "ours", number: "K", role: "Block", x: 34, y: 5.5, label: "Blk" },
        { id: "cd1", team: "ours", number: "·", role: "Corner defense", x: 30, y: 50, label: "CD" },
        { id: "cd2", team: "ours", number: "·", role: "Corner defense", x: 40, y: 52, label: "CD" }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 2, role: "Corner defender", x: 62, y: 3 },
        { id: "opp-2", team: "opp", number: 3, role: "Corner defender", x: 61, y: 5.5 },
        { id: "opp-a", team: "opp", number: 4, role: "Right center back", x: 36, y: 12 },
        { id: "opp-b", team: "opp", number: 5, role: "Left center back", x: 28, y: 11 }
      ],
      ball: { x: 66, y: 1.5 },
      options: [
        { id: "serve", label: "Serve long — two defenders pulled from the box" },
        { id: "short", label: "Still force the short into a 2v2" },
        { id: "wait", label: "Wait for a third defender to join them" },
        { id: "cancel", label: "Cancel and restart from midfield" }
      ],
      correctAnswer: "serve",
      hint: "Two out at the pair → long. Skittles curls across the middle first; then serve while Spot (penalty spot), Drop (the D), and Targets attack.",
      explanation: "Long serve. Skittles curls across the middle of the box, then to the D for a rebound. Primary serves. While the ball is in the air: Spot → penalty spot, Drop → the D, Targets come in from past the back post.",
      coachingCue: "Zero or one: short. Two: serve.",
      animationSteps: [
        { type: "highlight", playerIds: ["skittles"] },
        // Skittles: across the middle → out right → curl back to the D
        {
          type: "parallel",
          duration: 550,
          steps: [
            { type: "move", playerId: "skittles", to: { x: 36, y: 9 }, duration: 550 },
            { type: "move", playerId: "opp-b", to: { x: 34, y: 9 }, duration: 550 }
          ]
        },
        { type: "move", playerId: "skittles", to: { x: 50, y: 13 }, duration: 420 },
        { type: "move", playerId: "skittles", to: { x: 34, y: 20 }, duration: 480 },
        // Ball in air: Spot → penalty spot, Drop → D, Targets → into back post
        {
          type: "parallel",
          duration: 750,
          steps: [
            { type: "pass", from: { x: 66, y: 1.5 }, to: { x: 28, y: 7 }, duration: 750 },
            { type: "move", playerId: "spot", to: { x: 34, y: 12 }, duration: 700 },
            { type: "move", playerId: "drop", to: { x: 34, y: 20.5 }, duration: 700 },
            { type: "move", playerId: "front", to: { x: 28, y: 5.5 }, duration: 700 },
            { type: "move", playerId: "back", to: { x: 26, y: 9 }, duration: 700 }
          ]
        },
        { type: "highlight", playerIds: ["front", "back", "spot", "drop", "skittles"] }
      ],
      challengeEligible: true
    },
    {
      id: "corner-08",
      module: "corner",
      chapter: "long-corners",
      title: "Long: Skittles Starts It",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners-long",
      prompt: "On a long corner, what is Skittles’ first job?",
      seeIt: "Pri and Sec at the flag. Skittles starts with Spot and Drop near the back post — ready to curl across the middle of the box, then circle back to the D for a rebound.",
      interactionType: "multiple-choice",
      players: [
        { id: "primary", team: "ours", number: "P", role: "Primary", x: 66, y: 1.5, label: "Pri" },
        { id: "secondary", team: "ours", number: "S", role: "Secondary", x: 64.5, y: 3.2, label: "Sec" },
        { id: "skittles", team: "ours", number: "Sk", role: "Skittles", x: 24, y: 10, label: "Skit" },
        { id: "spot", team: "ours", number: "O", role: "Spot", x: 26, y: 11.5, label: "Spt" },
        { id: "drop", team: "ours", number: "D", role: "Drop", x: 22.5, y: 12.5, label: "Drp" },
        { id: "front", team: "ours", number: "F", role: "Front Target", x: 14, y: 5.5, label: "FT" },
        { id: "back", team: "ours", number: "B", role: "Back Target", x: 13, y: 12, label: "BT" },
        { id: "block", team: "ours", number: "K", role: "Block", x: 34, y: 5.5, label: "Blk" }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 2, role: "Corner defender", x: 62, y: 3 },
        { id: "opp-2", team: "opp", number: 3, role: "Corner defender", x: 61, y: 5.5 },
        { id: "opp-mark", team: "opp", number: 5, role: "Marker on Skittles", x: 26, y: 11 },
        { id: "gk", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 }
      ],
      ball: { x: 66, y: 1.5 },
      options: [
        { id: "start", label: "Curl across the middle of the box (drag a defender), then circle back to the D for a rebound" },
        { id: "stand-six", label: "Stand still on the six-yard line blocking our own targets" },
        { id: "take-corner", label: "Take the corner instead of the Primary" },
        { id: "leave", label: "Jog to midfield before the ball is struck" }
      ],
      correctAnswer: "start",
      hint: "The rebound circle crosses the middle — out toward the right, then back into the D — not a tiny triangle by the post.",
      explanation: "Skittles leaves the back-post crowd, curls across the middle of the box (hoping to drag a marker), then circles back to the D for a rebound.",
      coachingCue: "Across the middle — then circle to the D.",
      animationSteps: [
        { type: "highlight", playerIds: ["skittles"] },
        {
          type: "parallel",
          duration: 550,
          steps: [
            { type: "move", playerId: "skittles", to: { x: 36, y: 9 }, duration: 550 },
            { type: "move", playerId: "opp-mark", to: { x: 34, y: 9 }, duration: 550 }
          ]
        },
        { type: "move", playerId: "skittles", to: { x: 50, y: 13 }, duration: 420 },
        { type: "move", playerId: "skittles", to: { x: 34, y: 20 }, duration: 480 }
      ],
      challengeEligible: true
    },
    {
      id: "corner-09",
      module: "corner",
      chapter: "long-corners",
      title: "Long: Primary’s Serve",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners-long",
      prompt: "Skittles has curled across the middle and circled to the D. What should the Primary do — and when do Spot, Drop, and the Targets move?",
      seeIt: "Skittles has finished at the D. Spot and Drop are still near the back-post start. Front and Back Targets are still further past the back post (Front nearer the goal line) — they come into the back post with the ball in the air.",
      interactionType: "multiple-choice",
      players: [
        { id: "primary", team: "ours", number: "P", role: "Primary", x: 66, y: 1.5, label: "Pri" },
        { id: "secondary", team: "ours", number: "S", role: "Secondary", x: 64.5, y: 3.2, label: "Sec" },
        { id: "skittles", team: "ours", number: "Sk", role: "Skittles", x: 34, y: 20, label: "Skit" },
        { id: "front", team: "ours", number: "F", role: "Front Target", x: 14, y: 5.5, label: "FT" },
        { id: "back", team: "ours", number: "B", role: "Back Target", x: 13, y: 12, label: "BT" },
        { id: "block", team: "ours", number: "K", role: "Block", x: 34, y: 5.5, label: "Blk" },
        { id: "spot", team: "ours", number: "O", role: "Spot", x: 26, y: 11.5, label: "Spt" },
        { id: "drop", team: "ours", number: "D", role: "Drop", x: 22.5, y: 12.5, label: "Drp" }
      ],
      opponents: [
        { id: "opp-1", team: "opp", number: 2, role: "Corner defender", x: 62, y: 3 },
        { id: "opp-2", team: "opp", number: 3, role: "Corner defender", x: 61, y: 5.5 },
        { id: "gk", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 }
      ],
      ball: { x: 66, y: 1.5 },
      options: [
        { id: "face", label: "Serve across the face — while the ball is in the air, Spot→penalty spot, Drop→the D, Targets come into the back post" },
        { id: "soft", label: "Roll a soft ball that dies at the near cone" },
        { id: "short-now", label: "Ignore Skittles and play short into the two defenders" },
        { id: "midfield", label: "Pass backward to Corner Defense on purpose" }
      ],
      correctAnswer: "face",
      hint: "With the ball in the air: Spot to the penalty spot, Drop to the D (not deep), Targets crash in from past the back post.",
      explanation: "Primary serves. While the ball flies: Spot hits the penalty spot, Drop holds the D, and Front/Back Targets come in from beyond the back post (Front nearer the goal line).",
      coachingCue: "Serve — Spot to the spot, Drop to the D, Targets in.",
      animationSteps: [
        {
          type: "parallel",
          duration: 750,
          steps: [
            { type: "pass", from: { x: 66, y: 1.5 }, to: { x: 28, y: 7 }, duration: 750 },
            { type: "move", playerId: "spot", to: { x: 34, y: 12 }, duration: 700 },
            { type: "move", playerId: "drop", to: { x: 34, y: 20.5 }, duration: 700 },
            { type: "move", playerId: "front", to: { x: 28, y: 5.5 }, duration: 700 },
            { type: "move", playerId: "back", to: { x: 26, y: 9 }, duration: 700 }
          ]
        }
      ],
      challengeEligible: true
    },
    {
      id: "corner-10",
      module: "corner",
      chapter: "long-corners",
      title: "Long Roles: Block, Spot, Drop, Defense",
      difficulty: 3,
      phase: "corner-kick",
      concept: "corners-long",
      prompt: "Match the long-corner job to the correct role.",
      seeIt: "Pri/Sec at the corner. Skittles/Spot/Drop start near the back post. Targets start further past the back post (Front nearer the goal line). On the serve: Spot → penalty spot, Drop → the D, Targets come into the back post.",
      interactionType: "multiple-choice",
      players: [
        { id: "primary", team: "ours", number: "P", role: "Primary", x: 66, y: 1.5, label: "Pri" },
        { id: "secondary", team: "ours", number: "S", role: "Secondary", x: 64.5, y: 3.2, label: "Sec" },
        { id: "skittles", team: "ours", number: "Sk", role: "Skittles", x: 24, y: 10, label: "Skit" },
        { id: "spot", team: "ours", number: "O", role: "Spot", x: 26, y: 11.5, label: "Spt" },
        { id: "drop", team: "ours", number: "D", role: "Drop", x: 22.5, y: 12.5, label: "Drp" },
        { id: "block", team: "ours", number: "K", role: "Block", x: 34, y: 5.5, label: "Blk" },
        { id: "cd1", team: "ours", number: "·", role: "Corner defense", x: 30, y: 52, label: "CD" },
        { id: "cd2", team: "ours", number: "·", role: "Corner defense", x: 42, y: 52, label: "CD" },
        { id: "front", team: "ours", number: "F", role: "Front Target", x: 14, y: 5.5, label: "FT" },
        { id: "back", team: "ours", number: "B", role: "Back Target", x: 13, y: 12, label: "BT" }
      ],
      opponents: [
        { id: "gk", team: "opp", number: 1, role: "Goalkeeper", x: 34, y: 3 },
        { id: "opp-1", team: "opp", number: 2, role: "Corner defender", x: 62, y: 3 },
        { id: "opp-2", team: "opp", number: 3, role: "Corner defender", x: 61, y: 5.5 }
      ],
      ball: { x: 66, y: 1.5 },
      options: [
        { id: "correct-set", label: "Block screens the keeper; Spot cleans the penalty spot; Drop holds the D; Corner Defense keeps +1 behind" },
        { id: "all-crash", label: "Everyone including Corner Defense crashes the six-yard box" },
        { id: "no-block", label: "Nobody screens the keeper — leave her free to claim everything" },
        { id: "drop-posts", label: "The Drop and Spot both stand on the goal line" }
      ],
      correctAnswer: "correct-set",
      hint: "Spot = the penalty spot (not deep). Drop = the D (not halfway to midfield). Targets start past the back post and come in.",
      explanation: "Block screens the keeper. Spot hits the penalty spot. Drop holds the D. Corner Defense keeps +1. Targets start further past the back post and crash in on the serve.",
      coachingCue: "Know the job — not just a shirt number.",
      animationSteps: [
        { type: "highlight", playerIds: ["skittles", "block", "spot", "drop", "front", "back", "cd1", "cd2"] },
        { type: "move", playerId: "skittles", to: { x: 36, y: 9 }, duration: 500 },
        { type: "move", playerId: "skittles", to: { x: 50, y: 13 }, duration: 400 },
        { type: "move", playerId: "skittles", to: { x: 34, y: 20 }, duration: 450 },
        {
          type: "parallel",
          duration: 700,
          steps: [
            { type: "pass", from: { x: 66, y: 1.5 }, to: { x: 28, y: 7 }, duration: 700 },
            { type: "move", playerId: "spot", to: { x: 34, y: 12 }, duration: 650 },
            { type: "move", playerId: "drop", to: { x: 34, y: 20.5 }, duration: 650 },
            { type: "move", playerId: "front", to: { x: 28, y: 5.5 }, duration: 650 },
            { type: "move", playerId: "back", to: { x: 26, y: 9 }, duration: 650 }
          ]
        }
      ],
      challengeEligible: true
    },


  ];

  window.SoccerIQ = Object.assign(window.SoccerIQ || {}, {
    CONFIG,
    GLOSSARY,
    CORNER_ROLES,
    NAV_GROUPS,
    MODULES,
    SCENARIOS
  });
})();
