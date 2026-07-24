/**
 * Brighton Soccer IQ Lab — scenario data & config
 * Pitch: x 0–68 (width), y 0–105 (length). Attack toward TOP (y→0).
 * Edit wording and coordinates here; app.js renders from this data.
 */
(function () {
  "use strict";
  const CONFIG = {
    teamName: "Brighton",
    appName: "Soccer IQ Lab",
    storageKey: "brighton-soccer-iq-progress",
    colors: {
      ours: "#1a4d7c",
      oursStroke: "#0b2a47",
      oursText: "#ffffff",
      opp: "#8b3a3a",
      oppStroke: "#4a1a1a",
      oppText: "#ffffff",
      ball: "#f5f0e6",
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
      term: "Man-oriented defending",
      definition: "Starting with clear individual matchups while staying connected to teammates and protecting central space."
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
      term: "Short corner",
      definition: "Playing to the near partner instead of serving the box when zero or one defender is near the corner pair."
    },
    {
      term: "Direct delivery",
      definition: "Serving into the box when two defenders are pulled to the corner pair, creating space for separated runs."
    }
  ];

  const CORNER_ROLES = {
    cornerTaker: "Corner taker",
    shortPartner: "Short partner",
    nearRunner: "Near runner",
    centralRunner: "Central runner",
    backRunner: "Back runner",
    recycler: "Recycler",
    restDefense: "6 / rest defense"
  };

  const MODULES = [
    {
      id: "attack",
      title: "Attack the Moment",
      subtitle: "Transition & 2-3-5",
      purpose: "Decide when to attack immediately and how to occupy five lanes in possession.",
      chapters: ["attack-the-moment", "create-2-3-5"],
      hash: "attack"
    },
    {
      id: "wide",
      title: "Wide Attack & Gap Passes",
      purpose: "Build wide triangles and split defenses with different run and pass gaps.",
      chapters: ["wide-attack"],
      hash: "wide"
    },
    {
      id: "defense",
      title: "Defensive Responsibilities",
      purpose: "Know your matchup without losing shape, plus-one cover, and what to do after a loss.",
      chapters: ["defensive-responsibilities"],
      hash: "defense"
    },
    {
      id: "corner",
      title: "Corner Decision Lab",
      purpose: "Read 0/1/2 defenders at the corner, then finish with triangles or separated box runs.",
      chapters: ["corners"],
      hash: "corner"
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
      id: "attack-01",
      module: "attack",
      chapter: "attack-the-moment",
      title: "Attack Now or Secure?",
      difficulty: 1,
      phase: "attacking-transition",
      concept: "transition",
      prompt: "We just won the ball at the 8. The opponent midfield is open and our 9 has a step on their back line. What should the 8 do first?",
      seeIt: "Our 8 has the ball facing forward. Opponent 6 and 8 are separated. Our 9 is beyond their right center back.",
      interactionType: "multiple-choice",
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
          role: "Center back",
          x: 28,
          y: 78
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
          x: 40,
          y: 78
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 56,
          y: 70
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
          x: 12,
          y: 70
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 62
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 30,
          y: 52
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 42,
          y: 40
        },
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 58,
          y: 34
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 10,
          y: 36
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 36,
          y: 22
        }
      ],
      opponents: [
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 30,
          y: 18
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Center back",
          x: 44,
          y: 20
        },
        {
          id: "opp-6",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 48,
          y: 44
        },
        {
          id: "opp-8",
          team: "opp",
          number: 8,
          role: "Central midfielder",
          x: 22,
          y: 48
        },
        {
          id: "opp-9",
          team: "opp",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 68
        }
      ],
      ball: {
        x: 30,
        y: 52
      },
      options: [
        {
          id: "attack-now",
          label: "Drive or play forward immediately into the open lane"
        },
        {
          id: "secure",
          label: "Secure sideways to the 6 and rebuild slowly"
        },
        {
          id: "switch",
          label: "Turn and switch all the way to the weak-side fullback first"
        },
        {
          id: "hold",
          label: "Hold the ball and wait for fullbacks to push up"
        }
      ],
      correctAnswer: "attack-now",
      hint: "Check the opponent midfield gap and whether our 9 already has a step. If both are true, the first option is forward.",
      explanation: "Their midfield is disconnected and our 9 already has an advantage on the back line. Playing forward now uses the disorder before they recover.",
      coachingCue: "Forward first, not forward forced.",
      rationalePrompt: "Why is attacking now the stronger first action?",
      rationaleOptions: [
        {
          id: "r1",
          label: "Because we always play the highest pass available"
        },
        {
          id: "r2",
          label: "The opponent is disorganized and we have a runner with an advantage"
        },
        {
          id: "r3",
          label: "Because the fullbacks are not high enough yet"
        },
        {
          id: "r4",
          label: "Because the 6 should never receive in transition"
        }
      ],
      correctRationale: "r2",
      animationSteps: [
        {
          type: "highlight",
          playerIds: ["our-8", "our-9"]
        },
        {
          type: "pass",
          from: {
            x: 30,
            y: 52
          },
          to: {
            x: 36,
            y: 24
          },
          duration: 550
        },
        {
          type: "move",
          playerId: "our-9",
          to: {
            x: 36,
            y: 14
          },
          duration: 500
        }
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
          role: "Center back",
          x: 26,
          y: 80
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
          x: 42,
          y: 80
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 58,
          y: 78
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
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
          role: "Center back",
          x: 28,
          y: 24
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Center back",
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
          role: "Center back",
          x: 28,
          y: 72
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
          x: 42,
          y: 72
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 58,
          y: 58
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
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
          role: "Right fullback",
          x: 12,
          y: 30
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 30,
          y: 20
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Center back",
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
          role: "Center back",
          x: 28,
          y: 70
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
          x: 42,
          y: 70
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 56,
          y: 56
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
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
          role: "Right fullback",
          x: 18,
          y: 28
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 30,
          y: 18
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Center back",
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
          label: "Because the right side is overcrowded"
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
      seeIt: "Play is overloaded on the right. Left fullback is hugging the far touchline with no nearby teammate. Central rest defense is thin.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Center back",
          x: 30,
          y: 68
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
          x: 44,
          y: 66
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 58,
          y: 40
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
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
          role: "Center back",
          x: 28,
          y: 62
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
          x: 42,
          y: 62
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 58,
          y: 40
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
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
          role: "Center back",
          x: 28,
          y: 16
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Center back",
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
          role: "Center back",
          x: 28,
          y: 68
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
          x: 42,
          y: 68
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 58,
          y: 48
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
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
          role: "Right fullback",
          x: 14,
          y: 26
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
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
          role: "Right fullback",
          x: 56,
          y: 44
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
          x: 12,
          y: 46
        },
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Center back",
          x: 28,
          y: 66
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
          x: 42,
          y: 66
        }
      ],
      opponents: [
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 28,
          y: 18
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Center back",
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
      title: "Gap Pass: Outside Run, Inside Pass",
      difficulty: 3,
      phase: "wide-combination",
      concept: "gap-pass",
      prompt: "Build a gap pass: choose the runner's gap, then the pass gap.",
      seeIt: "Ball with our 7 on the right. Opponent back line is connected. Our 9 can run the outside shoulder; an inside passing lane exists between CB and FB.",
      interactionType: "movement-and-pass",
      players: [
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 58,
          y: 30
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 40,
          y: 22
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 46,
          y: 36
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 38,
          y: 42
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 60,
          y: 44
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 50
        }
      ],
      opponents: [
        {
          id: "opp-3",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 54,
          y: 24
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 42,
          y: 18
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Center back",
          x: 30,
          y: 18
        },
        {
          id: "opp-6",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 36,
          y: 32
        }
      ],
      ball: {
        x: 58,
        y: 30
      },
      runOptions: [
        {
          id: "run-out",
          label: "9 runs the outside gap (beyond the fullback)"
        },
        {
          id: "run-in",
          label: "9 runs the same inside gap the pass will use"
        },
        {
          id: "run-near",
          label: "9 checks short to the ball"
        }
      ],
      passOptions: [
        {
          id: "pass-in",
          label: "Slip the pass through the inside gap"
        },
        {
          id: "pass-out",
          label: "Play the pass into the same outside gap as the run"
        },
        {
          id: "pass-cross",
          label: "Float an early cross away from the runner"
        }
      ],
      correctRun: "run-out",
      correctPass: "pass-in",
      correctAnswer: "run-out|pass-in",
      hint: "The runner and the pass should threaten different gaps so one defender cannot solve both.",
      explanation: "Outside run pulls the fullback; the pass enters through a different inside gap. That forces two separate defensive decisions.",
      coachingCue: "Different run, different gap.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-9",
          to: {
            x: 52,
            y: 12
          },
          duration: 600
        },
        {
          type: "pass",
          from: {
            x: 58,
            y: 30
          },
          to: {
            x: 44,
            y: 16
          },
          duration: 500
        }
      ],
      challengeEligible: true,
      options: []
    },
    {
      id: "wide-02",
      module: "wide",
      chapter: "wide-attack",
      title: "Gap Pass: Inside Run, Outside Pass",
      difficulty: 3,
      phase: "wide-combination",
      concept: "gap-pass",
      prompt: "Reverse the gaps: choose the run, then the pass.",
      seeIt: "Ball with our 11 on the left. Inside channel between CB and FB is the runner threat; outside channel can take the pass.",
      interactionType: "movement-and-pass",
      players: [
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 10,
          y: 30
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 28,
          y: 22
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 22,
          y: 36
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
          x: 8,
          y: 44
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 50
        }
      ],
      opponents: [
        {
          id: "opp-2",
          team: "opp",
          number: 2,
          role: "Right fullback",
          x: 14,
          y: 24
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Center back",
          x: 26,
          y: 18
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 38,
          y: 18
        }
      ],
      ball: {
        x: 10,
        y: 30
      },
      runOptions: [
        {
          id: "run-in",
          label: "9 runs the inside gap between FB and CB"
        },
        {
          id: "run-out",
          label: "9 runs the outside gap beyond the fullback"
        },
        {
          id: "run-flat",
          label: "9 stays flat and calls for a cross"
        }
      ],
      passOptions: [
        {
          id: "pass-out",
          label: "Play around/outside into a different gap"
        },
        {
          id: "pass-in",
          label: "Play the pass into the same inside gap as the run"
        },
        {
          id: "pass-back",
          label: "Bounce straight back to the 6 under no pressure"
        }
      ],
      correctRun: "run-in",
      correctPass: "pass-out",
      correctAnswer: "run-in|pass-out",
      hint: "If the runner occupies the inside gap, look for the pass to arrive through a different lane.",
      explanation: "Inside run occupies one gap; the pass travels through another. Defenders must choose between tracking the runner and closing the lane.",
      coachingCue: "Different run, different gap.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-9",
          to: {
            x: 22,
            y: 12
          },
          duration: 600
        },
        {
          type: "pass",
          from: {
            x: 10,
            y: 30
          },
          to: {
            x: 8,
            y: 14
          },
          duration: 500
        }
      ],
      challengeEligible: true,
      options: []
    },
    {
      id: "wide-03",
      module: "wide",
      chapter: "wide-attack",
      title: "Overlap After Defender Narrows",
      difficulty: 2,
      phase: "wide-combination",
      concept: "wide-combinations",
      prompt: "Our 10 has the ball inside. The opponent fullback has narrowed toward the ball. What run should the 2 make?",
      seeIt: "10 on the ball in the right half-space. Opp left fullback stepped inside. The outside lane is open.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 46,
          y: 32
        },
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 54,
          y: 24
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 58,
          y: 42
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 18
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 36,
          y: 40
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 52
        }
      ],
      opponents: [
        {
          id: "opp-3",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 48,
          y: 28
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 36,
          y: 18
        }
      ],
      ball: {
        x: 46,
        y: 32
      },
      options: [
        {
          id: "overlap",
          label: "Overlap into the vacated outside lane"
        },
        {
          id: "underlap",
          label: "Underlap into the already crowded inside channel"
        },
        {
          id: "drop",
          label: "Drop 20 yards and ask for a backwards pass"
        },
        {
          id: "switch",
          label: "Ignore the 2v1 and switch immediately"
        }
      ],
      correctAnswer: "overlap",
      hint: "When the defender narrows toward an inside ball carrier, the outside lane usually opens for the fullback.",
      explanation: "Inside ball + narrowed defender = outside lane free. The fullback overlaps to attack that width.",
      coachingCue: "Defender narrows — overlap the outside.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-2",
          to: {
            x: 62,
            y: 22
          },
          duration: 600
        },
        {
          type: "pass",
          from: {
            x: 46,
            y: 32
          },
          to: {
            x: 62,
            y: 24
          },
          duration: 450
        }
      ],
      challengeEligible: true
    },
    {
      id: "wide-04",
      module: "wide",
      chapter: "wide-attack",
      title: "Underlap While Winger Pins",
      difficulty: 2,
      phase: "wide-combination",
      concept: "wide-combinations",
      prompt: "Our 7 is pinning the opponent fullback wide. Where should the 8 / runner attack?",
      seeIt: "7 holds the touchline and pins opp 3. The inside channel toward the box is open. Ball with our 2.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 62,
          y: 24
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 48,
          y: 36
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 56,
          y: 40
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 18
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 40,
          y: 30
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 50
        }
      ],
      opponents: [
        {
          id: "opp-3",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 58,
          y: 26
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 40,
          y: 18
        }
      ],
      ball: {
        x: 56,
        y: 40
      },
      options: [
        {
          id: "underlap",
          label: "Underlap inside the pinned winger toward the box / end line"
        },
        {
          id: "overlap",
          label: "Overlap outside into the same lane the 7 already occupies"
        },
        {
          id: "stand",
          label: "Stand still and wait for a cross"
        },
        {
          id: "retreat",
          label: "Retreat to the halfway line"
        }
      ],
      correctAnswer: "underlap",
      hint: "If the winger pins the defender wide, the free lane is usually inside — not another player in the same wide channel.",
      explanation: "Pin wide, attack inside. The underlap uses the half-space/box channel the pinned defender cannot cover.",
      coachingCue: "Winger pins — underlap the inside.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-8",
          to: {
            x: 52,
            y: 16
          },
          duration: 600
        },
        {
          type: "pass",
          from: {
            x: 56,
            y: 40
          },
          to: {
            x: 52,
            y: 18
          },
          duration: 450
        }
      ],
      challengeEligible: true
    },
    {
      id: "wide-05",
      module: "wide",
      chapter: "wide-attack",
      title: "Bounce to the Deep Point",
      difficulty: 2,
      phase: "wide-combination",
      concept: "wide-combinations",
      prompt: "The two highest players in the right triangle are tightly pressured. What is the best next action?",
      seeIt: "7 and 9 are flat near the offside line with defenders tight. Our 10 is the deeper triangle point, facing forward with space.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 58,
          y: 18
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 44,
          y: 16
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 48,
          y: 36
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 60,
          y: 34
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 48
        }
      ],
      opponents: [
        {
          id: "opp-3",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 56,
          y: 20
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 44,
          y: 18
        },
        {
          id: "opp-8",
          team: "opp",
          number: 8,
          role: "Central midfielder",
          x: 50,
          y: 28
        }
      ],
      ball: {
        x: 58,
        y: 18
      },
      options: [
        {
          id: "bounce",
          label: "Bounce to the deep point (10) who can face forward and split or switch"
        },
        {
          id: "force-shot",
          label: "Force a low-percentage shot through two defenders"
        },
        {
          id: "hope-cross",
          label: "Float a hopeful cross into traffic"
        },
        {
          id: "dribble-end",
          label: "Try to beat both defenders on the end line alone"
        }
      ],
      correctAnswer: "bounce",
      hint: "When the two high points are locked, the deeper triangle point should receive facing forward.",
      explanation: "Bounce to the deep player resets the picture: she can split the next line or switch while the advanced players stretch the defense.",
      coachingCue: "Two locked — find the deep point.",
      animationSteps: [
        {
          type: "pass",
          from: {
            x: 58,
            y: 18
          },
          to: {
            x: 48,
            y: 36
          },
          duration: 450
        },
        {
          type: "pass",
          from: {
            x: 48,
            y: 36
          },
          to: {
            x: 28,
            y: 20
          },
          duration: 550
        }
      ],
      challengeEligible: true
    },
    {
      id: "wide-06",
      module: "wide",
      chapter: "wide-attack",
      title: "Cutback, Not Cross",
      difficulty: 2,
      phase: "wide-combination",
      concept: "wide-combinations",
      prompt: "Our 7 has reached the end line. The defense is recovering toward its goal. What finish should she look for?",
      seeIt: "Ball on the right end line. Defenders sprinting toward goal. Our 10 and 9 are arriving at the penalty spot / cutback zone, not at the back post yet.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 64,
          y: 8
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 40,
          y: 14
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 36,
          y: 20
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 30,
          y: 24
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 40
        }
      ],
      opponents: [
        {
          id: "opp-3",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 58,
          y: 10
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 44,
          y: 10
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Center back",
          x: 32,
          y: 10
        },
        {
          id: "opp-1",
          team: "opp",
          number: 1,
          role: "Goalkeeper",
          x: 34,
          y: 4
        }
      ],
      ball: {
        x: 64,
        y: 8
      },
      options: [
        {
          id: "cutback",
          label: "Cut the ball back to the arriving teammate behind the first defensive line"
        },
        {
          id: "shot",
          label: "Force a near-impossible shot from the end line"
        },
        {
          id: "float",
          label: "Float a high cross to the far post with no runner there yet"
        },
        {
          id: "stop",
          label: "Stop and dribble backwards without a pass"
        }
      ],
      correctAnswer: "cutback",
      hint: "When defenders are recovering toward the goal, the dangerous space is often behind them — the cutback zone.",
      explanation: "End-line ball + recovering defense = cutback to the teammate arriving behind the first line, not a hopeful float or forced shot.",
      coachingCue: "End line: cut back behind the recovery.",
      animationSteps: [
        {
          type: "pass",
          from: {
            x: 64,
            y: 8
          },
          to: {
            x: 36,
            y: 18
          },
          duration: 450
        }
      ],
      challengeEligible: true
    },
    {
      id: "wide-07",
      module: "wide",
      chapter: "wide-attack",
      title: "Switch the Overload",
      difficulty: 2,
      phase: "wide-combination",
      concept: "wide-combinations",
      prompt: "The ball-side triangle has attracted three defenders. What is the best next action?",
      seeIt: "Right side congested with our 2, 7, and 10 plus three opponents. Far-side 11 has width and time. Central 6 can reverse the ball safely.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 60,
          y: 24
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 58,
          y: 36
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 50,
          y: 30
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 36,
          y: 44
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 8,
          y: 28
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 18
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
          x: 12,
          y: 46
        }
      ],
      opponents: [
        {
          id: "opp-3",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 56,
          y: 26
        },
        {
          id: "opp-8",
          team: "opp",
          number: 8,
          role: "Central midfielder",
          x: 52,
          y: 34
        },
        {
          id: "opp-11",
          team: "opp",
          number: 11,
          role: "Left winger",
          x: 48,
          y: 40
        },
        {
          id: "opp-2",
          team: "opp",
          number: 2,
          role: "Right fullback",
          x: 16,
          y: 30
        }
      ],
      ball: {
        x: 58,
        y: 36
      },
      options: [
        {
          id: "switch",
          label: "Attract, then switch/recycle through central support to the free far side"
        },
        {
          id: "force",
          label: "Force another combination into the three-defender trap"
        },
        {
          id: "long",
          label: "Boot a hopeful long cross with no near target"
        },
        {
          id: "solo",
          label: "Have the 2 take on all three alone"
        }
      ],
      correctAnswer: "switch",
      hint: "Count defenders on the ball side. If the triangle has pulled enough pressure and the far side is free, reverse the ball.",
      explanation: "Ball-side overload means the far side is underloaded. Central support safely switches to the free wide player.",
      coachingCue: "Overload attracts — switch the free side.",
      animationSteps: [
        {
          type: "pass",
          from: {
            x: 58,
            y: 36
          },
          to: {
            x: 36,
            y: 44
          },
          duration: 400
        },
        {
          type: "pass",
          from: {
            x: 36,
            y: 44
          },
          to: {
            x: 8,
            y: 28
          },
          duration: 550
        }
      ],
      challengeEligible: true
    },
    {
      id: "wide-08",
      module: "wide",
      chapter: "wide-attack",
      title: "Broken Triangle",
      difficulty: 2,
      phase: "wide-combination",
      concept: "wide-combinations",
      prompt: "What is wrong with this wide attacking shape?",
      seeIt: "On the right, 7 and 2 are level on the same horizontal line in the wide channel. There is no deeper supporting point.",
      interactionType: "formation-diagnosis",
      players: [
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 60,
          y: 28
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 58,
          y: 30
        },
        {
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 34,
          y: 40
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 18
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 52
        }
      ],
      opponents: [
        {
          id: "opp-3",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 54,
          y: 26
        }
      ],
      ball: {
        x: 60,
        y: 28
      },
      options: [
        {
          id: "no-depth",
          label: "No depth — two players in the same lane with no deep triangle point"
        },
        {
          id: "no-width",
          label: "No width anywhere on the field"
        },
        {
          id: "no-9",
          label: "Missing a center forward"
        },
        {
          id: "too-deep",
          label: "Everyone is too deep in our own half"
        }
      ],
      correctAnswer: "no-depth",
      hint: "A useful triangle needs two higher points and one deeper point who can see the field — not two flat players in one lane.",
      explanation: "Two players stacked flat in one lane create no third angle. Separate lanes and keep one deeper supporting point.",
      coachingCue: "Triangle needs depth, not a flat pair.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-2",
          to: {
            x: 52,
            y: 42
          },
          duration: 550
        }
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
      seeIt: "Opponent in a 4-3-3. Pair: our 2→opp 11, our 3→opp 7, our 10→opp 6, our 6→opp 10.",
      interactionType: "match-responsibilities",
      players: [
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 56,
          y: 60
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
          x: 12,
          y: 60
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
          id: "our-10",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 34,
          y: 40
        },
        {
          id: "our-4",
          team: "ours",
          number: 4,
          role: "Center back",
          x: 28,
          y: 72
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
          x: 42,
          y: 72
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 44,
          y: 48
        },
        {
          id: "our-7",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 58,
          y: 42
        },
        {
          id: "our-11",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 10,
          y: 42
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
          id: "opp-11",
          team: "opp",
          number: 11,
          role: "Left winger",
          x: 54,
          y: 48
        },
        {
          id: "opp-7",
          team: "opp",
          number: 7,
          role: "Right winger",
          x: 14,
          y: 48
        },
        {
          id: "opp-6",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 32
        },
        {
          id: "opp-10",
          team: "opp",
          number: 10,
          role: "Attacking midfielder",
          x: 34,
          y: 44
        },
        {
          id: "opp-9",
          team: "opp",
          number: 9,
          role: "Center forward",
          x: 34,
          y: 62
        },
        {
          id: "opp-8",
          team: "opp",
          number: 8,
          role: "Central midfielder",
          x: 44,
          y: 38
        }
      ],
      ball: {
        x: 34,
        y: 32
      },
      matchPairs: [
        {
          defenderId: "our-2",
          attackerId: "opp-11"
        },
        {
          defenderId: "our-3",
          attackerId: "opp-7"
        },
        {
          defenderId: "our-10",
          attackerId: "opp-6"
        },
        {
          defenderId: "our-6",
          attackerId: "opp-10"
        }
      ],
      correctAnswer: "match-433",
      hint: "Fullbacks take wingers. The 10 accounts for their deepest midfielder. The 6 takes the highest central midfield threat.",
      explanation: "Vs 4-3-3: fullbacks on wingers, 10 on their 6, 6 on their advanced midfielder, CBs plus-one on the 9.",
      coachingCue: "Know your player; protect the shape.",
      animationSteps: [
        {
          type: "highlight",
          playerIds: ["our-2", "our-3", "our-10", "our-6"]
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
          role: "Center back",
          x: 28,
          y: 22
        },
        {
          id: "opp-5",
          team: "opp",
          number: 5,
          role: "Center back",
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
          role: "Center back",
          x: 28,
          y: 70
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
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
          role: "Center back",
          x: 30,
          y: 68
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
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
          role: "Right fullback",
          x: 56,
          y: 62
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
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
          role: "Center back",
          x: 28,
          y: 70
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
          x: 42,
          y: 70
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
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
      seeIt: "Opp wingbacks are the widest buildup options. Opp inside forwards are higher. Our fullbacks are already oriented to those inside forwards.",
      interactionType: "multiple-choice",
      players: [
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
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 52,
          y: 58
        },
        {
          id: "our-3",
          team: "ours",
          number: 3,
          role: "Left fullback",
          x: 16,
          y: 58
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
          id: "opp-wb-r",
          team: "opp",
          number: 2,
          role: "Right wingback",
          x: 58,
          y: 32
        },
        {
          id: "opp-wb-l",
          team: "opp",
          number: 3,
          role: "Left wingback",
          x: 10,
          y: 32
        },
        {
          id: "opp-if-r",
          team: "opp",
          number: 7,
          role: "Right inside forward",
          x: 48,
          y: 48
        },
        {
          id: "opp-if-l",
          team: "opp",
          number: 11,
          role: "Left inside forward",
          x: 20,
          y: 48
        },
        {
          id: "opp-cb",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 34,
          y: 18
        }
      ],
      ball: {
        x: 34,
        y: 18
      },
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
      hint: "Against a back three, the widest opponents are often wingbacks — that becomes a 7/11 job while fullbacks take advanced inside forwards.",
      explanation: "Vs back three/wingbacks: 7 and 11 track wingbacks; fullbacks generally take advanced wingers/inside forwards; midfield keeps central matchups.",
      coachingCue: "Know your player; protect the shape.",
      animationSteps: [
        {
          type: "highlight",
          playerIds: ["our-7", "our-11", "opp-wb-r", "opp-wb-l"]
        }
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
          role: "Left fullback",
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
          role: "Right fullback",
          x: 58,
          y: 36
        },
        {
          id: "opp-3",
          team: "opp",
          number: 3,
          role: "Left fullback",
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
          role: "Right fullback",
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
          role: "Center back",
          x: 28,
          y: 70
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
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
          label: "Because the fullback is always free"
        },
        {
          id: "r4",
          label: "Because fouling is preferred"
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
          role: "Center back",
          x: 28,
          y: 60
        },
        {
          id: "our-5",
          team: "ours",
          number: 5,
          role: "Center back",
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
          role: "Center back",
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
          role: "Center back",
          x: 42,
          y: 18
        },
        {
          id: "opp-4",
          team: "opp",
          number: 4,
          role: "Center back",
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
      id: "corner-01",
      module: "corner",
      chapter: "corners",
      title: "Zero Defenders: Play Short",
      difficulty: 1,
      phase: "corner-kick",
      concept: "corners",
      prompt: "Corner: zero defenders are near our corner pair. What is the first decision?",
      seeIt: "Corner taker and short partner are free. No opponent within pressing distance of the pair. The box is crowded.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-ct",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 66,
          y: 6,
          label: "Taker"
        },
        {
          id: "our-sp",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 60,
          y: 10,
          label: "Short"
        },
        {
          id: "our-nr",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 40,
          y: 12,
          label: "Near"
        },
        {
          id: "our-cr",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 34,
          y: 14,
          label: "Central"
        },
        {
          id: "our-br",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 24,
          y: 12,
          label: "Back"
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 32,
          label: "6"
        },
        {
          id: "our-rec",
          team: "ours",
          number: 4,
          role: "Center back",
          x: 42,
          y: 22,
          label: "Recycle"
        }
      ],
      opponents: [
        {
          id: "opp-a",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 36,
          y: 10
        },
        {
          id: "opp-b",
          team: "opp",
          number: 5,
          role: "Center back",
          x: 30,
          y: 12
        },
        {
          id: "opp-c",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 18
        }
      ],
      ball: {
        x: 66,
        y: 6
      },
      options: [
        {
          id: "short",
          label: "Play short — use the free space immediately"
        },
        {
          id: "serve",
          label: "Serve directly into the crowded box"
        },
        {
          id: "delay",
          label: "Wait 10 seconds for defenders to arrive"
        },
        {
          id: "gk",
          label: "Pass back to our goalkeeper"
        }
      ],
      correctAnswer: "short",
      hint: "Count defenders near the corner pair. Zero means the free space is at the corner — play short.",
      explanation: "Zero defenders near the pair: play short and use the free space instead of serving into a crowded box.",
      coachingCue: "Zero or one: short. Two: serve.",
      animationSteps: [
        {
          type: "pass",
          from: {
            x: 66,
            y: 6
          },
          to: {
            x: 60,
            y: 10
          },
          duration: 400
        }
      ],
      challengeEligible: true
    },
    {
      id: "corner-02",
      module: "corner",
      chapter: "corners",
      title: "One Defender: Short 2v1",
      difficulty: 1,
      phase: "corner-kick",
      concept: "corners",
      prompt: "One defender is near our corner pair. What is the first decision?",
      seeIt: "One opponent has stepped out to the corner pair. The box has lost that defender. We can create a 2v1.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-ct",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 66,
          y: 6,
          label: "Taker"
        },
        {
          id: "our-sp",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 60,
          y: 10,
          label: "Short"
        },
        {
          id: "our-nr",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 40,
          y: 12,
          label: "Near"
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 32,
          label: "6"
        },
        {
          id: "our-br",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 22,
          y: 12,
          label: "Back"
        }
      ],
      opponents: [
        {
          id: "opp-corner",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 58,
          y: 12
        },
        {
          id: "opp-a",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 36,
          y: 10
        },
        {
          id: "opp-b",
          team: "opp",
          number: 5,
          role: "Center back",
          x: 28,
          y: 12
        }
      ],
      ball: {
        x: 66,
        y: 6
      },
      options: [
        {
          id: "short-2v1",
          label: "Play short and create a 2v1"
        },
        {
          id: "serve",
          label: "Serve directly because one defender is enough to stop short"
        },
        {
          id: "chip",
          label: "Chip over everyone to the far post with no plan"
        },
        {
          id: "leave",
          label: "Walk away from the ball"
        }
      ],
      correctAnswer: "short-2v1",
      hint: "One defender on the pair = we still play short and attack the 2v1.",
      explanation: "One defender near the pair: play short, create the 2v1, then overlap, underlap, drive, or bounce from there.",
      coachingCue: "Zero or one: short. Two: serve.",
      animationSteps: [
        {
          type: "pass",
          from: {
            x: 66,
            y: 6
          },
          to: {
            x: 60,
            y: 10
          },
          duration: 400
        },
        {
          type: "move",
          playerId: "our-ct",
          to: {
            x: 62,
            y: 14
          },
          duration: 500
        }
      ],
      challengeEligible: true
    },
    {
      id: "corner-03",
      module: "corner",
      chapter: "corners",
      title: "Two Defenders: Serve",
      difficulty: 1,
      phase: "corner-kick",
      concept: "corners",
      prompt: "Two defenders have stepped out to our corner pair. What is the first decision?",
      seeIt: "Two opponents are tight to the corner pair. Their box is missing those two. Our runners are ready from a higher back-post start.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-ct",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 66,
          y: 6,
          label: "Taker"
        },
        {
          id: "our-sp",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 60,
          y: 10,
          label: "Short"
        },
        {
          id: "our-nr",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 28,
          y: 16,
          label: "Near"
        },
        {
          id: "our-cr",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 32,
          y: 14,
          label: "Central"
        },
        {
          id: "our-br",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 22,
          y: 12,
          label: "Back"
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 30,
          label: "6"
        },
        {
          id: "our-rec",
          team: "ours",
          number: 4,
          role: "Center back",
          x: 40,
          y: 22,
          label: "Recycle"
        }
      ],
      opponents: [
        {
          id: "opp-1",
          team: "opp",
          number: 2,
          role: "Right fullback",
          x: 62,
          y: 8
        },
        {
          id: "opp-2",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 58,
          y: 12
        },
        {
          id: "opp-a",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 36,
          y: 14
        },
        {
          id: "opp-b",
          team: "opp",
          number: 5,
          role: "Center back",
          x: 28,
          y: 14
        }
      ],
      ball: {
        x: 66,
        y: 6
      },
      options: [
        {
          id: "serve",
          label: "Serve directly — two defenders pulled from the box"
        },
        {
          id: "short",
          label: "Still play short into a 2v2"
        },
        {
          id: "wait",
          label: "Wait for a third defender to join them"
        },
        {
          id: "back-pass",
          label: "Pass back to midfield and cancel the corner"
        }
      ],
      correctAnswer: "serve",
      hint: "Two defenders on the pair means space appears in the box — serve with separated runs.",
      explanation: "Two defenders pulled to the corner pair: serve directly and attack with intentional, separated runs.",
      coachingCue: "Zero or one: short. Two: serve.",
      animationSteps: [
        {
          type: "pass",
          from: {
            x: 66,
            y: 6
          },
          to: {
            x: 28,
            y: 10
          },
          duration: 600
        },
        {
          type: "move",
          playerId: "our-br",
          to: {
            x: 22,
            y: 8
          },
          duration: 500
        },
        {
          type: "move",
          playerId: "our-nr",
          to: {
            x: 40,
            y: 10
          },
          duration: 500
        }
      ],
      challengeEligible: true
    },
    {
      id: "corner-04",
      module: "corner",
      chapter: "corners",
      title: "After Short: Overlap",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners",
      prompt: "We played short. The defender narrowed toward the short partner. What should the corner taker do?",
      seeIt: "Short pass completed. Opp defender stepped toward the receiver. Outside lane around her is open.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-ct",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 64,
          y: 10,
          label: "Taker"
        },
        {
          id: "our-sp",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 58,
          y: 12,
          label: "Short"
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 40,
          y: 14
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 30
        }
      ],
      opponents: [
        {
          id: "opp-d",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 56,
          y: 14
        }
      ],
      ball: {
        x: 58,
        y: 12
      },
      options: [
        {
          id: "overlap",
          label: "Overlap around the outside of the defender"
        },
        {
          id: "stand",
          label: "Stand still on the corner arc"
        },
        {
          id: "box",
          label: "Sprint into the six-yard box with no ball"
        },
        {
          id: "retreat",
          label: "Drop to the halfway line"
        }
      ],
      correctAnswer: "overlap",
      hint: "After the short, if the defender narrows to the ball, the taker's outside overlap is often on.",
      explanation: "Short + defender narrowing = outside lane free. The original taker overlaps to attack that space.",
      coachingCue: "Short, then attack the free lane.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-ct",
          to: {
            x: 64,
            y: 16
          },
          duration: 500
        },
        {
          type: "pass",
          from: {
            x: 58,
            y: 12
          },
          to: {
            x: 64,
            y: 16
          },
          duration: 400
        }
      ],
      challengeEligible: true
    },
    {
      id: "corner-05",
      module: "corner",
      chapter: "corners",
      title: "Overlap Blocked",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners",
      prompt: "The defender blocked the outside overlap. What is the next option?",
      seeIt: "Taker's outside run is closed. Inside half-space and a deeper supporting player are available.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-ct",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 62,
          y: 12,
          label: "Taker"
        },
        {
          id: "our-sp",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 56,
          y: 14,
          label: "Short"
        },
        {
          id: "our-deep",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 48,
          y: 24,
          label: "Deep"
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 32
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 36,
          y: 14
        }
      ],
      opponents: [
        {
          id: "opp-d",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 60,
          y: 14
        },
        {
          id: "opp-e",
          team: "opp",
          number: 8,
          role: "Central midfielder",
          x: 50,
          y: 18
        }
      ],
      ball: {
        x: 56,
        y: 14
      },
      options: [
        {
          id: "inside-deep",
          label: "Play inside or bounce to the deep supporting option"
        },
        {
          id: "force-out",
          label: "Force the blocked overlap anyway"
        },
        {
          id: "shot",
          label: "Shoot from the corner flag"
        },
        {
          id: "reset-gk",
          label: "Reset all the way to our goalkeeper"
        }
      ],
      correctAnswer: "inside-deep",
      hint: "When the outside is taken away, use the inside channel or the deep triangle point.",
      explanation: "Overlap closed → attack the inside half-space or bounce to the deep player who can split or recycle.",
      coachingCue: "Blocked outside — find inside or deep.",
      animationSteps: [
        {
          type: "pass",
          from: {
            x: 56,
            y: 14
          },
          to: {
            x: 48,
            y: 24
          },
          duration: 450
        }
      ],
      challengeEligible: true
    },
    {
      id: "corner-06",
      module: "corner",
      chapter: "corners",
      title: "Build the Wide Triangle",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners",
      prompt: "After the short corner begins, what shape should we build?",
      seeIt: "Short corner is live on the right. Players are clustered on the end line with no deeper point.",
      interactionType: "formation-diagnosis",
      players: [
        {
          id: "our-ct",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 64,
          y: 10
        },
        {
          id: "our-sp",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 58,
          y: 12
        },
        {
          id: "our-2",
          team: "ours",
          number: 2,
          role: "Right fullback",
          x: 60,
          y: 14
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 44,
          y: 12
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 34
        }
      ],
      opponents: [
        {
          id: "opp-d",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 54,
          y: 14
        }
      ],
      ball: {
        x: 58,
        y: 12
      },
      options: [
        {
          id: "triangle",
          label: "Two higher points near the offside line + one deeper supporting point (+ box threat)"
        },
        {
          id: "flat-line",
          label: "All four players flat on the end line"
        },
        {
          id: "retreat",
          label: "Everyone retreats to the center circle"
        },
        {
          id: "only-6",
          label: "Only the 6 attacks the six-yard box"
        }
      ],
      correctAnswer: "triangle",
      hint: "Same wide-attack rule: two advanced points, one deep point who can see the field, plus a box threat.",
      explanation: "Short-corner attack uses the same triangle: two higher points, one deeper support, box threat, and a central recycle option.",
      coachingCue: "Short corner still needs a triangle.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-2",
          to: {
            x: 52,
            y: 26
          },
          duration: 500
        },
        {
          type: "move",
          playerId: "our-9",
          to: {
            x: 40,
            y: 12
          },
          duration: 500
        }
      ],
      challengeEligible: true
    },
    {
      id: "corner-07",
      module: "corner",
      chapter: "corners",
      title: "Separated Direct Runs",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners",
      prompt: "We are serving directly. How should the box runners attack?",
      seeIt: "Two defenders are at the corner pair. Our runners are currently starting together toward the same near-post spot.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-ct",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 66,
          y: 6,
          label: "Taker"
        },
        {
          id: "our-nr",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 30,
          y: 14,
          label: "Near"
        },
        {
          id: "our-cr",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 28,
          y: 14,
          label: "Central"
        },
        {
          id: "our-br",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 26,
          y: 14,
          label: "Back"
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 30
        },
        {
          id: "our-rec",
          team: "ours",
          number: 4,
          role: "Center back",
          x: 42,
          y: 22,
          label: "Recycle"
        }
      ],
      opponents: [
        {
          id: "opp-1",
          team: "opp",
          number: 2,
          role: "Right fullback",
          x: 62,
          y: 8
        },
        {
          id: "opp-2",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 58,
          y: 12
        },
        {
          id: "opp-a",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 34,
          y: 12
        }
      ],
      ball: {
        x: 66,
        y: 6
      },
      options: [
        {
          id: "separated",
          label: "Separated runs: near-post, penalty-spot/central, and back-post destinations"
        },
        {
          id: "same-spot",
          label: "All three sprint to the exact same near-post spot"
        },
        {
          id: "stand",
          label: "Stand still in front of the keeper"
        },
        {
          id: "leave-box",
          label: "All leave the box before the serve"
        }
      ],
      correctAnswer: "separated",
      hint: "Do not animate every runner to the same point. Attack different destinations.",
      explanation: "From a higher back-post start, runners separate into near, central/spot, and back-post spaces so one defender cannot clear all three.",
      coachingCue: "Separated runs, separated spaces.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-nr",
          to: {
            x: 42,
            y: 8
          },
          duration: 500
        },
        {
          type: "move",
          playerId: "our-cr",
          to: {
            x: 34,
            y: 12
          },
          duration: 500
        },
        {
          type: "move",
          playerId: "our-br",
          to: {
            x: 22,
            y: 8
          },
          duration: 500
        },
        {
          type: "pass",
          from: {
            x: 66,
            y: 6
          },
          to: {
            x: 24,
            y: 8
          },
          duration: 600
        }
      ],
      challengeEligible: true
    },
    {
      id: "corner-08",
      module: "corner",
      chapter: "corners",
      title: "Place the 6 on the Corner",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners",
      prompt: "On a direct delivery, tap the best zone for our 6.",
      seeIt: "Runners attack the box. The edge of the area / higher central zone for rest defense and second balls is empty.",
      interactionType: "pitch-hotspot",
      players: [
        {
          id: "our-ct",
          team: "ours",
          number: 7,
          role: "Right winger",
          x: 66,
          y: 6
        },
        {
          id: "our-nr",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 40,
          y: 10
        },
        {
          id: "our-cr",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 34,
          y: 12
        },
        {
          id: "our-br",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 24,
          y: 10
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
          id: "our-rec",
          team: "ours",
          number: 4,
          role: "Center back",
          x: 44,
          y: 20
        }
      ],
      opponents: [
        {
          id: "opp-1",
          team: "opp",
          number: 2,
          role: "Right fullback",
          x: 62,
          y: 8
        },
        {
          id: "opp-2",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 58,
          y: 12
        }
      ],
      ball: {
        x: 66,
        y: 6
      },
      zones: [
        {
          id: "rest6",
          label: "Higher central rest defense",
          x: 26,
          y: 26,
          w: 16,
          h: 12
        },
        {
          id: "sixyard",
          label: "Stand on the goal line",
          x: 30,
          y: 2,
          w: 10,
          h: 6
        },
        {
          id: "halfway",
          label: "Halfway line",
          x: 26,
          y: 50,
          w: 16,
          h: 10
        },
        {
          id: "corner",
          label: "Join the corner pair",
          x: 56,
          y: 6,
          w: 10,
          h: 8
        }
      ],
      correctAnswer: "rest6",
      hint: "The 6 stays higher and central as primary rest defense and recycling option — not on the goal line.",
      explanation: "On direct corners the 6 remains higher and central: rest defense first, recycle second balls, protect the turnover.",
      coachingCue: "The 6 connects the attack and protects the turnover.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-6",
          to: {
            x: 34,
            y: 30
          },
          duration: 500
        }
      ],
      challengeEligible: true,
      options: []
    },
    {
      id: "corner-09",
      module: "corner",
      chapter: "corners",
      title: "Recycler After Clearance",
      difficulty: 2,
      phase: "corner-kick",
      concept: "corners",
      prompt: "A partial clearance drops in front of the box. What should the front/recycler player do?",
      seeIt: "Ball is cleared weakly to the edge of the area. Our recycler is nearest. Opponents are scrambling out.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-rec",
          team: "ours",
          number: 4,
          role: "Center back",
          x: 42,
          y: 22,
          label: "Recycle"
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 30
        },
        {
          id: "our-9",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 36,
          y: 12
        },
        {
          id: "our-8",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 30,
          y: 14
        }
      ],
      opponents: [
        {
          id: "opp-a",
          team: "opp",
          number: 5,
          role: "Center back",
          x: 38,
          y: 14
        },
        {
          id: "opp-b",
          team: "opp",
          number: 6,
          role: "Defensive midfielder",
          x: 40,
          y: 20
        }
      ],
      ball: {
        x: 42,
        y: 20
      },
      options: [
        {
          id: "recycle",
          label: "Win/secure the second ball and recycle into another attack or shot"
        },
        {
          id: "watch",
          label: "Watch it bounce and hope a teammate arrives"
        },
        {
          id: "retreat",
          label: "Sprint away from the ball toward midfield"
        },
        {
          id: "foul",
          label: "Foul the nearest opponent immediately"
        }
      ],
      correctAnswer: "recycle",
      hint: "Front-area players exist for underhit balls and clearances — that is their job on the serve.",
      explanation: "The recycler attacks the partial clearance, secures the second ball, and turns it into a shot or continued attack.",
      coachingCue: "Second ball is still our chance.",
      animationSteps: [
        {
          type: "highlight",
          playerIds: ["our-rec"]
        },
        {
          type: "ball",
          to: {
            x: 42,
            y: 18
          },
          duration: 300
        }
      ],
      challengeEligible: true
    },
    {
      id: "corner-10",
      module: "corner",
      chapter: "corners",
      title: "Back-Post Curl",
      difficulty: 3,
      phase: "corner-kick",
      concept: "corners",
      prompt: "Two defenders are out at the pair. Our back-post runner has space and a left-footed delivery is available. What is on?",
      seeIt: "Right-sided corner, left-footed taker angle available. Back-post runner is free beyond the far defender. Near and central runners are separating.",
      interactionType: "multiple-choice",
      players: [
        {
          id: "our-ct",
          team: "ours",
          number: 11,
          role: "Left winger",
          x: 66,
          y: 6,
          label: "Taker"
        },
        {
          id: "our-br",
          team: "ours",
          number: 9,
          role: "Center forward",
          x: 22,
          y: 10,
          label: "Back"
        },
        {
          id: "our-nr",
          team: "ours",
          number: 8,
          role: "Central midfielder",
          x: 40,
          y: 12,
          label: "Near"
        },
        {
          id: "our-cr",
          team: "ours",
          number: 10,
          role: "Attacking midfielder",
          x: 34,
          y: 14,
          label: "Central"
        },
        {
          id: "our-6",
          team: "ours",
          number: 6,
          role: "Defensive midfielder",
          x: 34,
          y: 30
        }
      ],
      opponents: [
        {
          id: "opp-1",
          team: "opp",
          number: 2,
          role: "Right fullback",
          x: 62,
          y: 8
        },
        {
          id: "opp-2",
          team: "opp",
          number: 3,
          role: "Left fullback",
          x: 58,
          y: 12
        },
        {
          id: "opp-a",
          team: "opp",
          number: 4,
          role: "Center back",
          x: 36,
          y: 12
        },
        {
          id: "opp-b",
          team: "opp",
          number: 5,
          role: "Center back",
          x: 30,
          y: 12
        }
      ],
      ball: {
        x: 66,
        y: 6
      },
      options: [
        {
          id: "curl",
          label: "Deliver the left-footed ball curling toward the free back-post runner"
        },
        {
          id: "short",
          label: "Play short even though two defenders are on the pair"
        },
        {
          id: "near-only",
          label: "Only aim at the near post with no back-post threat"
        },
        {
          id: "clear",
          label: "Kick it out for a throw-in"
        }
      ],
      correctAnswer: "curl",
      hint: "When two are pulled out and the back-post runner is free, the curling back-post delivery is the preferred finish.",
      explanation: "Two out at the pair + separated back-post runner + left-footed curl = attack the far post away from the recovering crowd.",
      coachingCue: "Two out — curl the back post.",
      animationSteps: [
        {
          type: "move",
          playerId: "our-br",
          to: {
            x: 20,
            y: 6
          },
          duration: 500
        },
        {
          type: "pass",
          from: {
            x: 66,
            y: 6
          },
          to: {
            x: 20,
            y: 8
          },
          duration: 650
        }
      ],
      challengeEligible: true
    }
  ];

  window.SoccerIQ = Object.assign(window.SoccerIQ || {}, {
    CONFIG,
    GLOSSARY,
    CORNER_ROLES,
    MODULES,
    SCENARIOS
  });
})();
