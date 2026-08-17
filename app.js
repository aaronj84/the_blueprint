/* The Blueprint — Brighton Fresh/Soph Blue Team — application engine */
(function () {
  "use strict";

  const IQ = window.SoccerIQ;
  if (!IQ || !IQ.SCENARIOS) {
    document.getElementById("app-root").innerHTML =
      '<p class="empty-state">Failed to load scenario data. Check scenarios.js.</p>';
    return;
  }

  const CONFIG = IQ.CONFIG;
  const MODULES = IQ.MODULES;
  const SCENARIOS = IQ.SCENARIOS;
  const GLOSSARY = IQ.GLOSSARY;
  const NAV_GROUPS = IQ.NAV_GROUPS || [];
  const VARSITY_ROSTER = IQ.VARSITY_ROSTER || [];
  const PW = CONFIG.pitch.width;
  const PL = CONFIG.pitch.length;
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Progress ---------- */
  function defaultProgress() {
    return {
      scenarios: {},
      challengeAttempts: [],
      lastModule: null,
      overviewDismissed: {},
    };
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return defaultProgress();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultProgress(), parsed, {
        scenarios: parsed.scenarios || {},
        overviewDismissed: parsed.overviewDismissed || {},
      });
    } catch {
      return defaultProgress();
    }
  }

  function saveProgress() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.progress));
  }

  function getScenarioProgress(id) {
    return state.progress.scenarios[id] || {
      completed: false,
      decisionCorrect: false,
      rationaleCorrect: false,
      firstAttemptCorrect: null,
      attempts: 0,
      needsReview: false,
    };
  }

  function moduleScenarios(moduleId) {
    return SCENARIOS.filter((s) => s.module === moduleId);
  }

  function moduleStats(moduleId) {
    const list = moduleScenarios(moduleId).filter((s) => s.persistProgress !== false);
    const total = list.length;
    let completed = 0;
    let decisionHits = 0;
    let rationaleHits = 0;
    let rationaleTotal = 0;
    let firstHits = 0;
    let firstTotal = 0;

    list.forEach((s) => {
      const p = getScenarioProgress(s.id);
      if (p.completed) completed += 1;
      if (p.decisionCorrect) decisionHits += 1;
      if (s.rationaleOptions && s.rationaleOptions.length) {
        rationaleTotal += 1;
        if (p.rationaleCorrect) rationaleHits += 1;
      }
      if (p.firstAttemptCorrect !== null) {
        firstTotal += 1;
        if (p.firstAttemptCorrect) firstHits += 1;
      }
    });

    const masteryPct =
      total === 0 ? 0 : Math.round((decisionHits / total) * 100);
    return {
      total,
      completed,
      decisionHits,
      rationaleHits,
      rationaleTotal,
      firstHits,
      firstTotal,
      masteryPct,
      masteryLabel: masteryLabel(masteryPct),
    };
  }

  function masteryLabel(pct) {
    const m = CONFIG.mastery;
    if (pct >= m.ready) return "mastered";
    if (pct >= m.developing) return "ready";
    if (pct >= m.learning) return "developing";
    return "learning";
  }

  /* ---------- State ---------- */
  const state = {
    progress: loadProgress(),
    coach: new URLSearchParams(location.search).get("coach") === "1",
    view: "home",
    moduleId: null,
    scenarioId: null,
    session: null,
    challenge: null,
    drawerOpen: false,
    tracker: {
      mode: "idle",
      pending: null,
      showGrid: true,
      period: 1,
      team: "us",
      lineupEdit: "us",
      opponent: "",
      lineup: { set: false, us: {}, opp: {} },
    },
  };

  if (state.coach) document.body.classList.add("coach-mode");

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function findScenario(id) {
    return SCENARIOS.find((s) => s.id === id);
  }

  function findModule(id) {
    return MODULES.find((m) => m.id === id);
  }

  function showToast(text) {
    const el = $("#role-toast");
    el.textContent = text;
    el.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove("is-visible"), 1800);
  }

  /* ---------- Routing ---------- */
  function parseHash() {
    const raw = (location.hash || "#home").replace(/^#/, "");
    if (!raw || raw === "home") return { view: "home" };
    if (raw === "glossary") return { view: "glossary" };
    if (raw === "challenge") return { view: "challenge" };
    if (raw === "shots") return { view: "shots" };
    if (raw === "shots-map") return { view: "shots-map" };

    const mod = MODULES.find((m) => m.hash === raw || m.id === raw);
    if (mod) {
      if (mod.isChallenge) return { view: "challenge" };
      return { view: "module", moduleId: mod.id };
    }

    const scenario = findScenario(raw);
    if (scenario) {
      return { view: "scenario", moduleId: scenario.module, scenarioId: scenario.id };
    }

    // chapter hashes like attack-the-moment
    const byChapter = SCENARIOS.find((s) => s.chapter === raw);
    if (byChapter) return { view: "module", moduleId: byChapter.module };

    return { view: "home" };
  }

  function navigate(hash) {
    if (hash.startsWith("#")) location.hash = hash;
    else location.hash = "#" + hash;
  }

  function setNavCurrent(view, moduleId) {
    const mod = moduleId ? findModule(moduleId) : null;
    const groupId = mod?.group || null;

    $$("[data-nav]").forEach((el) => {
      const key = el.getAttribute("data-nav");
      const current =
        (view === "home" && key === "home") ||
        (view === "glossary" && key === "glossary") ||
        (view === "challenge" && key === "challenge") ||
        (view === "module" && key === moduleId) ||
        (view === "scenario" && key === moduleId);
      if (current) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });

    $$("[data-nav-group]").forEach((el) => {
      const key = el.getAttribute("data-nav-group");
      if (groupId && key === groupId) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
  }

  /* ---------- Pitch SVG ---------- */
  function pitchMarkup(scenario, opts = {}) {
    const hideLabels = opts.hideLabels || false;
    const showCoachTargets = state.coach;
    const view = scenario.pitchView || { x: 0, y: 0, w: PW, h: PL };
    const stripes = [];
    for (let i = 0; i < 6; i += 1) {
      stripes.push(
        `<rect class="grass-stripe" x="0" y="${i * (PL / 6)}" width="${PW}" height="${PL / 12}" />`
      );
    }

    const zones = (scenario.zones || [])
      .map((z) => {
        const interactive = scenario.interactionType === "pitch-hotspot";
        const cls = interactive ? "hotspot-zone" : "teaching-zone";
        const attrs = interactive
          ? `tabindex="0" role="button" aria-label="${escapeHtml(z.label || z.id)}"`
          : `pointer-events="none" aria-hidden="true"`;
        return `<rect class="${cls}" data-zone-id="${escapeHtml(z.id)}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="1.2" ${attrs} />`;
      })
      .join("");

    let coachTargets = "";
    if (showCoachTargets) {
      if (scenario.dragTarget) {
        const t = scenario.dragTarget;
        coachTargets += `<circle class="coach-target coach-only" cx="${t.x}" cy="${t.y}" r="${t.r || 6}" />`;
      }
      (scenario.zones || []).forEach((z) => {
        if (z.id === scenario.correctAnswer) {
          coachTargets += `<rect class="coach-target coach-only" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="1.2" />`;
        }
      });
    }

    const tokens = []
      .concat(scenario.opponents || [], scenario.players || [])
      .map((p) => tokenMarkup(p, hideLabels))
      .join("");

    const ball = scenario.ball ? ballMarkup(scenario.ball.x, scenario.ball.y) : "";

    const line = "var(--pitch-line)";
    const goalW = 7.32;
    const goalX = (PW - goalW) / 2;

    return `
      <svg class="pitch-svg" viewBox="${view.x} ${view.y} ${view.w} ${view.h}" role="img" aria-label="Tactical pitch diagram">
        <defs>
          <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
            <path d="M0,0 L4,2 L0,4 Z" fill="var(--brand)" />
          </marker>
        </defs>
        ${stripes.join("")}
        <rect x="1" y="1" width="${PW - 2}" height="${PL - 2}" fill="none" stroke="${line}" stroke-width="0.45" />
        <line x1="1" y1="${PL / 2}" x2="${PW - 1}" y2="${PL / 2}" stroke="${line}" stroke-width="0.35" />
        <circle cx="${PW / 2}" cy="${PL / 2}" r="9.15" fill="none" stroke="${line}" stroke-width="0.35" />
        <circle cx="${PW / 2}" cy="${PL / 2}" r="0.5" fill="${line}" />
        <!-- goals -->
        <rect x="${goalX}" y="0.15" width="${goalW}" height="0.85" fill="none" stroke="${line}" stroke-width="0.4" />
        <rect x="${goalX}" y="${PL - 1}" width="${goalW}" height="0.85" fill="none" stroke="${line}" stroke-width="0.4" />
        <!-- penalty areas -->
        <rect x="${(PW - 40.32) / 2}" y="1" width="40.32" height="16.5" fill="none" stroke="${line}" stroke-width="0.35" />
        <rect x="${(PW - 18.32) / 2}" y="1" width="18.32" height="5.5" fill="none" stroke="${line}" stroke-width="0.35" />
        <rect x="${(PW - 40.32) / 2}" y="${PL - 17.5}" width="40.32" height="16.5" fill="none" stroke="${line}" stroke-width="0.35" />
        <rect x="${(PW - 18.32) / 2}" y="${PL - 6.5}" width="18.32" height="5.5" fill="none" stroke="${line}" stroke-width="0.35" />
        <g id="pitch-zones">${zones}</g>
        <g id="pitch-coach">${coachTargets}</g>
        <g id="pitch-anim"></g>
        <g id="pitch-players">${tokens}</g>
        ${ball}
      </svg>
    `;
  }

  function ballMarkup(x, y) {
    return `
      <g class="ball" id="pitch-ball" data-x="${x}" data-y="${y}" transform="translate(${x},${y})">
        <text class="ball-emoji" text-anchor="middle" dominant-baseline="central">⚽</text>
      </g>
    `;
  }

  function setBallPos(el, x, y) {
    if (!el) return;
    el.setAttribute("transform", `translate(${x},${y})`);
    el.dataset.x = x;
    el.dataset.y = y;
  }

  function getBallPos(el) {
    return {
      x: parseFloat(el?.dataset.x || 0),
      y: parseFloat(el?.dataset.y || 0),
    };
  }

  /** US Soccer–style triangles: attack ▲, defense ▼ — drawn in local coords, moved via transform */
  function tokenMarkup(p, hideLabels) {
    const isOpp = p.team === "opp";
    const cls = isOpp ? "player-token opp" : "player-token";
    const role = hideLabels || p.hideLabel ? "" : tokenAbbrev(p);
    const roleText = role
      ? `<text class="token-role" x="0" y="3.15">${escapeHtml(role)}</text>`
      : "";
    // Smaller triangles so pitch scale reads clearly
    const shape = isOpp
      ? `<polygon class="token-disk" points="0,1.55 -1.45,-1.15 1.45,-1.15" />` // ▼
      : `<polygon class="token-disk" points="0,-1.55 -1.45,1.15 1.45,1.15" />`; // ▲
    const numY = isOpp ? "-0.15" : "0.45";
    const fullRole = roleFullName(p);
    const numStr = String(p.number);
    const numClass = numStr.length > 2 ? "token-num token-num-sm" : "token-num";
    return `
      <g class="${cls}" data-player-id="${escapeHtml(p.id)}" data-role="${escapeHtml(fullRole)}" data-number="${escapeHtml(numStr)}" data-x="${p.x}" data-y="${p.y}" transform="translate(${p.x},${p.y})">
        ${shape}
        <text class="${numClass}" x="0" y="${numY}">${escapeHtml(numStr)}</text>
        ${roleText}
      </g>
    `;
  }

  function setTokenPos(g, x, y) {
    g.setAttribute("transform", `translate(${x},${y})`);
    g.dataset.x = x;
    g.dataset.y = y;
  }

  function getTokenPos(g) {
    return {
      x: parseFloat(g.dataset.x || 0),
      y: parseFloat(g.dataset.y || 0),
    };
  }

  /** Standard shirt symbology — number inside triangle, abbrev below */
  const SHIRT_ABBREV = {
    1: "GK",
    2: "RB",
    3: "LB",
    4: "RCB",
    5: "LCB",
    6: "DM",
    7: "RW",
    8: "CM",
    9: "CF",
    10: "AM",
    11: "LW",
  };

  const SHIRT_FULL = {
    1: "Goalkeeper",
    2: "Right back",
    3: "Left back",
    4: "Right center back",
    5: "Left center back",
    6: "Defensive midfielder",
    7: "Right winger",
    8: "Central midfielder",
    9: "Center forward",
    10: "Attacking midfielder",
    11: "Left winger",
  };

  function tokenAbbrev(p) {
    const n = Number(p.number);
    if (Number.isInteger(n) && SHIRT_ABBREV[n]) return SHIRT_ABBREV[n];
    if (p.label) return p.label;
    return shortRole(p.role);
  }

  function roleFullName(p) {
    const n = Number(p.number);
    if (Number.isInteger(n) && SHIRT_FULL[n]) return SHIRT_FULL[n];
    return p.role || "";
  }

  function shortRole(role) {
    if (!role) return "";
    const map = {
      Goalkeeper: "GK",
      "Right back": "RB",
      "Left back": "LB",
      "Right fullback": "RB",
      "Left fullback": "LB",
      "Right center back": "RCB",
      "Left center back": "LCB",
      "Center back": "CB",
      "Defensive midfielder": "DM",
      "Central midfielder": "CM",
      "Attacking midfielder": "AM",
      "Right winger": "RW",
      "Left winger": "LW",
      "Center forward": "CF",
      "Wide point": "Wide",
      "Half-space point": "½-sp",
      "Deep support": "Deep",
      "Box threat": "Box",
      "Wide defender": "WD",
      "Far-side wide": "Far",
      Skittles: "Skit",
      Stockton: "Stk",
      Malone: "Mal",
      Spot: "Spt",
      Shield: "Shld",
      Screen: "Scr",
      Primary: "Stk",
      Secondary: "Mal",
      Drop: "Shld",
      Block: "Scr",
      "Near-post run": "Near",
      "Far-post run": "Far",
      "Cutback run": "Cut",
      "Front Target": "FT",
      "Back Target": "BT",
      "Corner defense": "CD",
      "Corner defender": "Def",
      "Back-post group": "BP",
    };
    return map[role] || role.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  }

  /* ---------- Session ---------- */
  function createSession(scenario, challengeMode) {
    const options = scenario.options ? shuffle(scenario.options) : [];
    const rationaleOptions = scenario.rationaleOptions
      ? shuffle(scenario.rationaleOptions)
      : [];
    return {
      scenario,
      challengeMode: !!challengeMode,
      stage: "decision",
      attempts: 0,
      decisionCorrect: false,
      rationaleCorrect: null,
      selected: null,
      selectedRationale: null,
      revealUnlocked: false,
      options,
      rationaleOptions,
      matchSelections: [],
      orderItems: scenario.sequence ? shuffle(scenario.sequence.map((s) => ({ ...s }))) : [],
      runChoice: null,
      passChoice: null,
      locked: false,
      animating: false,
    };
  }

  /* ---------- Rendering views ---------- */
  const root = $("#app-root");

  function render() {
    const route = parseHash();
    state.view = route.view;
    state.moduleId = route.moduleId || null;
    state.scenarioId = route.scenarioId || null;
    setNavCurrent(state.view, state.moduleId);
    document.body.classList.toggle("tracker-view", state.view === "shots" || state.view === "shots-map");
    document.body.classList.toggle("shot-map-view", state.view === "shots-map");

    if (state.view === "home") renderHome();
    else if (state.view === "glossary") renderGlossary();
    else if (state.view === "challenge") renderChallenge();
    else if (state.view === "shots") renderShotTracker();
    else if (state.view === "shots-map") renderShotMap();
    else if (state.view === "module") renderModule(state.moduleId);
    else if (state.view === "scenario") renderScenario(state.scenarioId);
    else renderHome();

    window.scrollTo(0, 0);
  }

  function renderHome() {
    const cards = MODULES.map((m) => {
      if (m.isChallenge) {
        return `
          <article class="module-card challenge-card">
            <div class="module-card-top">
              <div>
                <h2>${escapeHtml(m.title)}</h2>
                <p class="purpose">${escapeHtml(m.purpose)}</p>
              </div>
              <span class="mastery-badge">10 Qs</span>
            </div>
            <div class="module-card-actions">
              <a class="btn btn-primary" href="#challenge">Start challenge</a>
            </div>
          </article>
        `;
      }
      const stats = moduleStats(m.id);
      const started = stats.completed > 0;
      return `
        <article class="module-card">
          <div class="module-card-top">
            <div>
              <h2>${escapeHtml(m.title)}</h2>
              ${m.subtitle ? `<p class="purpose" style="margin:0.15rem 0 0;color:var(--accent);font-size:0.82rem;font-weight:700">${escapeHtml(m.subtitle)}</p>` : ""}
              <p class="purpose">${escapeHtml(m.purpose)}</p>
            </div>
            <span class="mastery-badge ${stats.masteryLabel}">${stats.masteryLabel}</span>
          </div>
          <div class="progress-row">
            <div class="progress-meta">
              <span>${stats.completed}/${stats.total} scenarios</span>
              <span>${stats.masteryPct}% mastery</span>
            </div>
            <div class="progress-bar" aria-hidden="true"><div class="progress-fill" style="width:${stats.masteryPct}%"></div></div>
          </div>
          <div class="module-card-actions">
            <a class="btn btn-primary" href="#${escapeHtml(m.hash)}">${started ? "Continue" : "Start"}</a>
            ${(() => {
              const missed = moduleScenarios(m.id).find((s) => {
                const p = getScenarioProgress(s.id);
                return p.needsReview || (p.attempts > 0 && !p.decisionCorrect);
              });
              return missed
                ? `<a class="btn btn-ghost" href="#${escapeHtml(missed.id)}">Review missed</a>`
                : "";
            })()}
          </div>
        </article>
      `;
    }).join("");

    const overall = MODULES.filter((m) => !m.isChallenge).reduce(
      (acc, m) => {
        const s = moduleStats(m.id);
        acc.done += s.completed;
        acc.total += s.total;
        return acc;
      },
      { done: 0, total: 0 }
    );

    root.innerHTML = `
      <section class="hero">
        <h1>The Blueprint</h1>
        <p>Brighton Fresh/Soph Blue Team — see it, choose it, explain it. Train attacking shape, wide patterns, supporting runs, defensive shape, and set pieces.</p>
        <div class="hero-meta">
          <span class="pill">Progress <strong>${overall.done}/${overall.total}</strong></span>
          <span class="pill">Saved on this device</span>
        </div>
      </section>
      <section class="module-grid" aria-label="Modules">${cards}</section>
    `;
  }

  function renderGlossary() {
    const items = GLOSSARY.map(
      (g) => `
      <div class="glossary-item">
        <dl>
          <dt>${escapeHtml(g.term)}</dt>
          <dd>${escapeHtml(g.definition)}</dd>
        </dl>
      </div>`
    ).join("");
    root.innerHTML = `
      <div class="section-header">
        <div>
          <h1>Glossary</h1>
          <p>Shared language for Brighton’s model. Short definitions — not essays.</p>
        </div>
        <a class="btn btn-secondary" href="#home">Back</a>
      </div>
      <div class="glossary-grid">${items}</div>
    `;
  }

  function renderModule(moduleId) {
    const mod = findModule(moduleId);
    if (!mod || mod.isChallenge) {
      navigate("home");
      return;
    }
    const stats = moduleStats(moduleId);
    const list = moduleScenarios(moduleId);
    const overviewOpen = !(state.progress.overviewDismissed || {})[moduleId];
    const ov = mod.overview;

    const rows = list
      .map((s, i) => {
        const p = getScenarioProgress(s.id);
        let status = "Not started";
        let cls = "";
        if (s.persistProgress === false) {
          status = "Unlock each visit";
        } else if (p.completed && p.decisionCorrect) {
          status = "Complete";
          cls = "is-complete";
        } else if (p.needsReview || (p.attempts > 0 && !p.decisionCorrect)) {
          status = "Review";
          cls = "is-missed";
        } else if (p.attempts > 0) {
          status = "In progress";
        }
        const chapterLabel = ({
          "basics-numbers": "Numbers & codes",
          "basics-shapes": "Shape shifts",
          "attack-the-moment": "Attack the moment",
          "create-2-3-5": "Create the 2-3-5",
          "wide-attack": "Wide attack patterns",
          "supporting-runs": "Supporting runs",
          "defensive-responsibilities": "Part 1 · Matchups",
          "defend-4-4-2": "Part 2 · 4-4-2",
          "corner-lock": "Locked play",
          "short-corners": "Part 1 · Go Short",
          "long-corners": "Part 2 · Go Long",
        })[s.chapter] || s.chapter || "";
        return `
          <a class="scenario-row ${cls}" href="#${escapeHtml(s.id)}">
            <span class="scenario-index">${i + 1}</span>
            <span class="scenario-info">
              <strong>${escapeHtml(s.title)}</strong>
              <span>${escapeHtml(chapterLabel)} · ${escapeHtml(s.interactionType)}</span>
            </span>
            <span class="scenario-status">${status}</span>
          </a>
        `;
      })
      .join("");

    const overviewHtml = ov
      ? `
      <section class="module-overview ${overviewOpen ? "is-open" : "is-collapsed"}" id="module-overview">
        <div class="module-overview-header">
          <div>
            <p class="overview-kicker">Before you start</p>
            <h2>${escapeHtml(ov.headline)}</h2>
          </div>
          <button type="button" class="btn btn-ghost" id="toggle-overview">
            ${overviewOpen ? "Hide overview" : "Show overview"}
          </button>
        </div>
        <div class="module-overview-body" ${overviewOpen ? "" : "hidden"}>
          <p class="overview-intro">${escapeHtml(ov.intro)}</p>
          <div class="principle-grid">
            ${(ov.principles || [])
              .map(
                (pr) => `
              <article class="principle-card">
                <h3>${escapeHtml(pr.title)}</h3>
                <p>${escapeHtml(pr.body)}</p>
              </article>`
              )
              .join("")}
          </div>
          ${
            ov.cues && ov.cues.length
              ? `<div class="cue-strip">
                  <span class="label">Cues you will see</span>
                  <ul>${ov.cues.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>
                </div>`
              : ""
          }
          <div class="module-card-actions" style="margin-top:1rem">
            <a class="btn btn-primary" href="#${escapeHtml(list[0] ? list[0].id : "home")}" id="begin-scenarios">Begin scenarios</a>
            <button type="button" class="btn btn-secondary" id="skip-to-list">Skip to scenario list</button>
          </div>
        </div>
      </section>`
      : "";

    root.innerHTML = `
      <div class="section-header">
        <div>
          <h1>${escapeHtml(mod.title)}</h1>
          <p>${escapeHtml(mod.purpose)}</p>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <a class="btn btn-ghost" href="#home">Home</a>
          ${
            ov
              ? `<button type="button" class="btn btn-secondary" id="header-show-overview">${overviewOpen ? "Overview" : "Read overview"}</button>`
              : ""
          }
          <a class="btn btn-primary" href="#${escapeHtml(list[0] ? list[0].id : "home")}">Start scenarios</a>
        </div>
      </div>
      ${overviewHtml}
      <div class="progress-row" style="margin-bottom:1rem" id="scenario-list-anchor">
        <div class="progress-meta">
          <span>${stats.completed}/${stats.total} complete · ${stats.masteryLabel}</span>
          <span>${stats.masteryPct}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${stats.masteryPct}%"></div></div>
      </div>
      <div class="scenario-list">${rows}</div>
    `;

    const persistOverview = (dismissed) => {
      if (!state.progress.overviewDismissed) state.progress.overviewDismissed = {};
      state.progress.overviewDismissed[moduleId] = dismissed;
      saveProgress();
    };

    const setOverviewOpen = (open) => {
      const section = $("#module-overview");
      const body = $(".module-overview-body", section);
      const toggle = $("#toggle-overview");
      if (!section) return;
      section.classList.toggle("is-open", open);
      section.classList.toggle("is-collapsed", !open);
      if (body) body.hidden = !open;
      if (toggle) toggle.textContent = open ? "Hide overview" : "Show overview";
      persistOverview(!open);
    };

    $("#toggle-overview")?.addEventListener("click", () => {
      const open = !$("#module-overview")?.classList.contains("is-open");
      setOverviewOpen(open);
    });
    $("#header-show-overview")?.addEventListener("click", () => {
      setOverviewOpen(true);
      $("#module-overview")?.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth", block: "start" });
    });
    $("#skip-to-list")?.addEventListener("click", () => {
      setOverviewOpen(false);
      $("#scenario-list-anchor")?.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth", block: "start" });
    });
    $("#begin-scenarios")?.addEventListener("click", () => {
      persistOverview(true);
    });
  }

  function renderScenario(id) {
    const scenario = findScenario(id);
    if (!scenario) {
      navigate("home");
      return;
    }
    const challengeMode = !!(state.challenge && state.challenge.active);
    if (!state.session || state.session.scenario.id !== id || challengeMode !== state.session.challengeMode) {
      state.session = createSession(scenario, challengeMode);
    }
    paintScenario();
  }

  function paintScenario() {
    const session = state.session;
    const s = session.scenario;
    const mod = findModule(s.module);
    const hideLabels = session.challengeMode;
    const showZones =
      s.interactionType === "pitch-hotspot" ||
      s.interactionType === "drag-player" ||
      s.showTeachingZones ||
      (state.coach && s.zones);

    const scenarioForPitch = {
      ...s,
      zones: showZones || s.interactionType === "pitch-hotspot" ? s.zones : [],
    };
    // In challenge, hide teaching zone shading until answered? Brief says remove highlighted teaching zones
    if (session.challengeMode && session.stage === "decision" && s.interactionType !== "pitch-hotspot") {
      scenarioForPitch.zones = [];
    }

    const challengeHeader = session.challengeMode
      ? `<span class="step-indicator">Question ${state.challenge.index + 1} / ${state.challenge.queue.length}</span>`
      : "";

    root.innerHTML = `
      <div class="scenario-shell">
        <div class="scenario-toolbar">
          <div class="breadcrumb">
            <a href="#home">Home</a><span>/</span>
            <a href="#${escapeHtml(mod.hash)}">${escapeHtml(mod.title)}</a><span>/</span>
            <span>${escapeHtml(s.title)}</span>
          </div>
          ${challengeHeader}
        </div>
        <div class="coach-banner">Coach mode — answers and targets visible. Scenario ID: <code>${escapeHtml(s.id)}</code></div>
        <div class="coach-controls">
          <div class="coach-meta">correct: ${escapeHtml(String(s.correctAnswer))} | cue: ${escapeHtml(s.coachingCue || "")}</div>
          <label class="muted">Module filter
            <select id="coach-module-filter">
              <option value="">All</option>
              ${MODULES.filter((m) => !m.isChallenge).map((m) => `<option value="${m.id}" ${m.id === s.module ? "selected" : ""}>${escapeHtml(m.title)}</option>`).join("")}
            </select>
          </label>
          <button type="button" class="btn btn-secondary" id="coach-prev">Previous</button>
          <button type="button" class="btn btn-secondary" id="coach-next">Next</button>
          <button type="button" class="btn btn-ghost" id="coach-replay">Replay animation</button>
        </div>

        <div class="pitch-column">
          ${s.seeIt && !session.challengeMode ? `<div class="see-it"><span class="label">See it</span><p>${escapeHtml(s.seeIt)}</p></div>` : ""}
          <p class="anim-caption" id="anim-caption" hidden></p>
          <div class="pitch-wrap" id="pitch-wrap">${pitchMarkup(scenarioForPitch, { hideLabels })}</div>
        </div>

        <div class="panel-column">
          <div class="prompt-block">
            <p class="phase">${escapeHtml(s.phase || "")}</p>
            <h2>${escapeHtml(
              session.stage === "rationale"
                ? s.rationalePrompt || "Why?"
                : session.stage === "text-gate"
                  ? s.textPrompt || "Enter the code"
                  : s.prompt
            )}</h2>
          </div>
          <div class="interaction-panel" id="interaction-panel"></div>
          <div id="feedback-slot"></div>
          <div class="scenario-actions" id="scenario-actions"></div>
        </div>
      </div>
    `;

    bindPitch(s);
    renderInteraction();
    renderFeedback();
    renderScenarioActions();
    bindCoachControls();
  }

  function bindPitch(scenario) {
    const wrap = $("#pitch-wrap");
    if (!wrap) return;

    $$(".player-token", wrap).forEach((g) => {
      g.addEventListener("click", (e) => {
        e.stopPropagation();
        const role = g.getAttribute("data-role");
        const num = g.getAttribute("data-number");
        if (role) showToast(`#${num} — ${role}`);
        if (state.session.scenario.interactionType === "match-responsibilities") {
          handleMatchSelect(g.getAttribute("data-player-id"));
        }
      });
    });

    if (scenario.interactionType === "pitch-hotspot") {
      $$(".hotspot-zone", wrap).forEach((zone) => {
        const choose = () => {
          if (state.session.locked || state.session.stage !== "decision") return;
          selectDecision(zone.getAttribute("data-zone-id"));
        };
        zone.addEventListener("click", choose);
        zone.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            choose();
          }
        });
      });
    }

    if (scenario.interactionType === "drag-player") {
      setupDrag(scenario);
    }
  }

  function setupDrag(scenario) {
    const wrap = $("#pitch-wrap");
    const svg = $(".pitch-svg", wrap);
    const playerId = scenario.dragPlayerId;
    const g = $(`[data-player-id="${playerId}"]`, wrap);
    if (!g || !svg) return;

    g.classList.add("is-draggable");
    let dragging = false;

    const getPoint = (evt) => {
      const pt = svg.createSVGPoint();
      const e = evt.touches ? evt.touches[0] : evt;
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM().inverse();
      return pt.matrixTransform(ctm);
    };

    const moveToken = (x, y) => setTokenPos(g, x, y);

    const onDown = (evt) => {
      if (state.session.locked || state.session.stage !== "decision") return;
      dragging = true;
      wrap.classList.add("is-dragging");
      g.classList.add("is-dragging");
      evt.preventDefault();
    };
    const onMove = (evt) => {
      if (!dragging) return;
      evt.preventDefault();
      const p = getPoint(evt);
      const x = Math.max(2, Math.min(PW - 2, p.x));
      const y = Math.max(2, Math.min(PL - 2, p.y));
      moveToken(x, y);
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      wrap.classList.remove("is-dragging");
      g.classList.remove("is-dragging");
      const x = parseFloat(g.dataset.x || scenario.players.find((p) => p.id === playerId).x);
      const y = parseFloat(g.dataset.y || scenario.players.find((p) => p.id === playerId).y);
      evaluateDrag(x, y);
    };

    g.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function evaluateDrag(x, y) {
    const s = state.session.scenario;
    const t = s.dragTarget;
    if (!t) return;
    const dist = Math.hypot(x - t.x, y - t.y);
    const ok = dist <= (t.r || 8);
    // Also accept correct zone id if zones provided
    if (s.zones && s.correctAnswer) {
      const zone = s.zones.find((z) => z.id === s.correctAnswer);
      if (zone) {
        const inZone =
          x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h;
        commitDecision(inZone || ok ? s.correctAnswer : "miss", inZone || ok);
        return;
      }
    }
    commitDecision(ok ? s.correctAnswer : "miss", ok);
  }

  /* ---------- Interactions ---------- */
  function syncPromptHeader() {
    const session = state.session;
    if (!session) return;
    const s = session.scenario;
    const promptEl = $(".prompt-block h2");
    const phaseEl = $(".prompt-block .phase");
    if (!promptEl) return;

    if (session.stage === "rationale") {
      promptEl.textContent = s.rationalePrompt || "Why does that decision work?";
      if (phaseEl) phaseEl.textContent = "Explain it";
    } else if (session.stage === "complete") {
      promptEl.textContent = s.prompt;
      if (phaseEl) phaseEl.textContent = s.phase || "";
    } else {
      promptEl.textContent = s.prompt;
      if (phaseEl) phaseEl.textContent = s.phase || "";
    }
  }

  function renderInteraction() {
    const panel = $("#interaction-panel");
    if (!panel) return;
    const session = state.session;
    const s = session.scenario;
    syncPromptHeader();

    if (session.stage === "rationale") {
      const whyQ = s.rationalePrompt || "Why does that decision work?";
      panel.innerHTML = `
        <p class="step-label"><strong>Step 2 — Explain it</strong></p>
        <p class="rationale-question">${escapeHtml(whyQ)}</p>
        <div class="options-grid">
          ${session.rationaleOptions
            .map(
              (o) => `
            <button type="button" class="option-btn ${session.selectedRationale === o.id ? "is-selected" : ""}" data-rationale="${escapeHtml(o.id)}" ${session.locked && session.stage === "complete" ? "disabled" : ""}>
              ${escapeHtml(o.label)}
            </button>`
            )
            .join("")}
        </div>
      `;
      $$("[data-rationale]", panel).forEach((btn) => {
        btn.addEventListener("click", () => selectRationale(btn.getAttribute("data-rationale")));
      });
      return;
    }

    if (session.stage === "text-gate") {
      panel.innerHTML = `
        <p class="step-label"><strong>Step 2 — Pillar lock</strong></p>
        <p class="muted">${escapeHtml(s.textHint || "Type the answer, then submit.")}</p>
        <div class="text-gate">
          <input type="text" id="text-gate-input" class="text-gate-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type here" />
          <button type="button" class="btn btn-primary" id="text-gate-submit">Unlock</button>
        </div>
      `;
      const input = $("#text-gate-input");
      input?.focus();
      $("#text-gate-submit")?.addEventListener("click", submitTextGate);
      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submitTextGate();
        }
      });
      return;
    }

    if (session.stage === "complete") {
      panel.innerHTML = "";
      return;
    }

    const step1 =
      s.rationaleOptions && s.rationaleOptions.length
        ? `<p class="step-label"><strong>Step 1 — Choose it</strong></p>`
        : "";

    switch (s.interactionType) {
      case "multiple-choice":
      case "formation-diagnosis":
        panel.innerHTML = `
          ${step1}
          <div class="options-grid">
            ${session.options
              .map(
                (o) => `
              <button type="button" class="option-btn ${session.selected === o.id ? "is-selected" : ""}" data-option="${escapeHtml(o.id)}">
                ${escapeHtml(o.label)}
              </button>`
              )
              .join("")}
          </div>`;
        $$("[data-option]", panel).forEach((btn) => {
          btn.addEventListener("click", () => selectDecision(btn.getAttribute("data-option")));
        });
        break;

      case "pitch-hotspot":
        panel.innerHTML = `${step1}<p class="muted">Tap the best zone on the pitch.${state.coach ? " (Coach: correct zone outlined.)" : ""}</p>`;
        break;

      case "drag-player":
        panel.innerHTML = `
          ${step1}
          <p class="muted">Drag #${escapeHtml(String((s.players.find((p) => p.id === s.dragPlayerId) || {}).number || ""))} to the best area — or use the buttons.</p>
          <div class="alt-actions">
            ${(s.altOptions || s.options || [])
              .map(
                (o) =>
                  `<button type="button" class="btn btn-secondary" data-option="${escapeHtml(o.id)}">${escapeHtml(o.label)}</button>`
              )
              .join("")}
          </div>`;
        $$("[data-option]", panel).forEach((btn) => {
          btn.addEventListener("click", () => selectDecision(btn.getAttribute("data-option")));
        });
        break;

      case "match-responsibilities":
        panel.innerHTML = `
          <div class="match-status" id="match-status">Select one of our players, then the opponent she should mark. Correct pairs gray out.</div>
          <div class="alt-actions" style="margin-top:0.5rem">
            <button type="button" class="btn btn-ghost" id="match-undo">Undo last pair</button>
            <button type="button" class="btn btn-primary" id="match-submit">Check matchups</button>
          </div>
          <ul id="match-pairs-list" class="muted" style="margin:0.5rem 0 0;padding-left:1.1rem"></ul>
        `;
        $("#match-undo")?.addEventListener("click", () => {
          const last = session.matchSelections.pop();
          if (last) {
            $(`[data-player-id="${last.defenderId}"]`)?.classList.remove("is-matched");
            $(`[data-player-id="${last.attackerId}"]`)?.classList.remove("is-matched");
          }
          session._matchPick = null;
          $$(".player-token").forEach((g) => g.classList.remove("is-selected"));
          updateMatchList();
          paintMatchTokens();
          $("#match-status").textContent = "Pair removed. Select one of our players, then an opponent.";
        });
        $("#match-submit")?.addEventListener("click", () => submitMatch());
        updateMatchList();
        paintMatchTokens();
        break;

      case "movement-and-pass":
        renderMovementPass(panel);
        break;

      case "ordered-decision":
        panel.innerHTML = `
          <p class="muted">Put these in the correct order.</p>
          <div class="order-list" id="order-list"></div>
          <button type="button" class="btn btn-primary" id="order-submit" style="margin-top:0.5rem">Check order</button>
        `;
        paintOrderList();
        $("#order-submit").addEventListener("click", submitOrder);
        break;

      default:
        panel.innerHTML = `<div class="options-grid">${session.options
          .map(
            (o) =>
              `<button type="button" class="option-btn" data-option="${escapeHtml(o.id)}">${escapeHtml(o.label)}</button>`
          )
          .join("")}</div>`;
        $$("[data-option]", panel).forEach((btn) => {
          btn.addEventListener("click", () => selectDecision(btn.getAttribute("data-option")));
        });
    }
  }

  function renderMovementPass(panel) {
    const session = state.session;
    const s = session.scenario;
    const runOptions = s.runOptions || (s.options || []).filter((o) => o.stage === "run");
    const passOptions = s.passOptions || (s.options || []).filter((o) => o.stage === "pass");

    if (!session.runChoice) {
      panel.innerHTML = `
        <p class="muted"><strong>Step 1 — Choose the run</strong></p>
        <div class="options-grid">
          ${shuffle(runOptions)
            .map(
              (o) =>
                `<button type="button" class="option-btn" data-run="${escapeHtml(o.id)}">${escapeHtml(o.label)}</button>`
            )
            .join("")}
        </div>`;
      $$("[data-run]", panel).forEach((btn) => {
        btn.addEventListener("click", () => {
          session.runChoice = btn.getAttribute("data-run");
          renderInteraction();
        });
      });
    } else {
      panel.innerHTML = `
        <p class="muted"><strong>Step 2 — Choose the pass</strong> (run locked: ${escapeHtml(
          (runOptions.find((o) => o.id === session.runChoice) || {}).label || session.runChoice
        )})</p>
        <div class="options-grid">
          ${shuffle(passOptions)
            .map(
              (o) =>
                `<button type="button" class="option-btn" data-pass="${escapeHtml(o.id)}">${escapeHtml(o.label)}</button>`
            )
            .join("")}
        </div>`;
      $$("[data-pass]", panel).forEach((btn) => {
        btn.addEventListener("click", () => {
          session.passChoice = btn.getAttribute("data-pass");
          const combo = `${session.runChoice}|${session.passChoice}`;
          const ok =
            session.runChoice === s.correctRun &&
            session.passChoice === s.correctPass;
          commitDecision(combo, ok);
        });
      });
    }
  }

  function paintOrderList() {
    const list = $("#order-list");
    const items = state.session.orderItems;
    list.innerHTML = items
      .map(
        (item, idx) => `
      <div class="order-item" data-idx="${idx}">
        <span class="order-rank">${idx + 1}</span>
        <div class="order-controls">
          <button type="button" aria-label="Move up" data-dir="up" ${idx === 0 ? "disabled" : ""}>▲</button>
          <button type="button" aria-label="Move down" data-dir="down" ${idx === items.length - 1 ? "disabled" : ""}>▼</button>
        </div>
        <span>${escapeHtml(item.label)}</span>
      </div>`
      )
      .join("");
    $$("[data-dir]", list).forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = btn.closest(".order-item");
        const idx = parseInt(row.getAttribute("data-idx"), 10);
        const dir = btn.getAttribute("data-dir");
        const swap = dir === "up" ? idx - 1 : idx + 1;
        if (swap < 0 || swap >= items.length) return;
        [items[idx], items[swap]] = [items[swap], items[idx]];
        paintOrderList();
      });
    });
  }

  function submitOrder() {
    const s = state.session.scenario;
    const ids = state.session.orderItems.map((i) => i.id);
    const ok = ids.join(",") === (s.correctOrder || []).join(",");
    commitDecision(ids.join(","), ok);
  }

  function matchDefenderIds(pair) {
    if (pair.defenderIds && pair.defenderIds.length) return pair.defenderIds;
    if (pair.defenderId) return [pair.defenderId];
    return [];
  }

  function isCorrectMatchPair(defenderId, attackerId) {
    const needed = state.session.scenario.matchPairs || [];
    return needed.some(
      (n) => n.attackerId === attackerId && matchDefenderIds(n).includes(defenderId)
    );
  }

  function isPlayerMatched(playerId) {
    const selections = state.session.matchSelections;
    if (selections.some((m) => m.defenderId === playerId)) return true;
    const neededSlots = (state.session.scenario.matchPairs || []).filter(
      (n) => n.attackerId === playerId
    ).length;
    if (neededSlots > 0) {
      const filled = selections.filter((m) => m.attackerId === playerId).length;
      return filled >= neededSlots;
    }
    return false;
  }

  function paintMatchTokens() {
    $$(".player-token").forEach((g) => {
      const id = g.getAttribute("data-player-id");
      g.classList.toggle("is-matched", isPlayerMatched(id));
    });
  }

  function shakeToken(g) {
    if (!g) return;
    const { x, y } = getTokenPos(g);
    const offsets = [0, -1.4, 1.4, -1, 1, -0.5, 0];
    let i = 0;
    const tick = () => {
      if (i >= offsets.length) {
        setTokenPos(g, x, y);
        g.classList.remove("is-wrong");
        return;
      }
      setTokenPos(g, x + offsets[i], y);
      i += 1;
      setTimeout(tick, 35);
    };
    g.classList.add("is-wrong");
    tick();
  }

  function handleMatchSelect(playerId) {
    const session = state.session;
    if (session.locked || session.stage !== "decision") return;
    const all = [].concat(session.scenario.players || [], session.scenario.opponents || []);
    const player = all.find((p) => p.id === playerId);
    if (!player) return;

    if (isPlayerMatched(playerId)) {
      showToast("That player is already matched");
      return;
    }

    $$(".player-token").forEach((g) => g.classList.remove("is-selected"));
    const el = $(`[data-player-id="${playerId}"]`);
    if (!session._matchPick) {
      if (player.team !== "ours") {
        showToast("Select one of our players first");
        return;
      }
      const assignable = (session.scenario.matchPairs || []).some((n) =>
        matchDefenderIds(n).includes(playerId)
      );
      if (!assignable) {
        showToast("That player isn’t in the key matchups for this exercise");
        return;
      }
      session._matchPick = playerId;
      el?.classList.add("is-selected");
      $("#match-status").textContent = `Selected #${player.number}. Now tap the opponent she marks.`;
    } else {
      if (player.team !== "opp") {
        showToast("Select an opponent to pair");
        return;
      }
      const defenderId = session._matchPick;
      const attackerId = playerId;
      const defEl = $(`[data-player-id="${defenderId}"]`);
      const attEl = el;

      if (!isCorrectMatchPair(defenderId, attackerId)) {
        shakeToken(defEl);
        shakeToken(attEl);
        session._matchPick = null;
        $$(".player-token").forEach((g) => g.classList.remove("is-selected"));
        $("#match-status").textContent = "Not that matchup — try again. Select one of our players first.";
        showToast("Wrong matchup");
        return;
      }

      // Correct: gray out defender; attacker grays when all her slots are filled
      session.matchSelections = session.matchSelections.filter(
        (m) => m.defenderId !== defenderId
      );
      session.matchSelections.push({ defenderId, attackerId });
      session._matchPick = null;
      $$(".player-token").forEach((g) => g.classList.remove("is-selected"));
      paintMatchTokens();
      updateMatchList();

      const needed = session.scenario.matchPairs || [];
      const done = needed.every((n) =>
        session.matchSelections.some(
          (g) => g.attackerId === n.attackerId && matchDefenderIds(n).includes(g.defenderId)
        )
      );
      if (done) {
        $("#match-status").textContent = "All key matchups set — check matchups to finish.";
      } else {
        $("#match-status").textContent = "Correct — grayed out. Select another of our players.";
      }
    }
  }

  function updateMatchList() {
    const ul = $("#match-pairs-list");
    if (!ul) return;
    const all = [].concat(
      state.session.scenario.players || [],
      state.session.scenario.opponents || []
    );
    const needed = state.session.scenario.matchPairs || [];
    ul.innerHTML = state.session.matchSelections
      .map((m) => {
        const d = all.find((p) => p.id === m.defenderId);
        const a = all.find((p) => p.id === m.attackerId);
        return `<li>Our #${d?.number} → Opp #${a?.number}</li>`;
      })
      .join("");
    const remaining = needed.length - state.session.matchSelections.length;
    if (remaining > 0) {
      ul.innerHTML += `<li class="muted">${remaining} matchup${remaining === 1 ? "" : "s"} left</li>`;
    }
  }

  function submitMatch() {
    const s = state.session.scenario;
    const needed = s.matchPairs || [];
    const got = state.session.matchSelections;
    const ok =
      needed.length > 0 &&
      needed.every((n) =>
        got.some(
          (g) => g.attackerId === n.attackerId && matchDefenderIds(n).includes(g.defenderId)
        )
      ) &&
      got.length === needed.length;
    commitDecision(JSON.stringify(got), ok);
  }

  function selectDecision(answerId) {
    if (state.session.locked || state.session.stage !== "decision") return;
    const s = state.session.scenario;
    const ok = answerId === s.correctAnswer;
    commitDecision(answerId, ok);
  }

  function commitDecision(answerId, ok) {
    const session = state.session;
    const s = session.scenario;
    session.selected = answerId;
    session.attempts += 1;
    session.decisionCorrect = ok;

    const allowHint = !session.challengeMode;
    const gateLock = !!s.textPrompt && s.persistProgress === false;
    const reveal = ok || (!gateLock && (session.attempts >= 2 || session.challengeMode));

    if (!ok && allowHint && (session.attempts === 1 || gateLock)) {
      session.locked = false;
      paintOptionStates();
      showFeedback("hint", s.hint || "Look again at the picture — who occupies which space?");
      renderScenarioActions();
      return;
    }

    session.locked = true;
    paintOptionStates();

    if (ok && s.textPrompt) {
      session.stage = "text-gate";
      session.locked = false;
      showFeedback("correct", "Promise locked. One more lock before the play is revealed.");
      const h2 = $(".prompt-block h2");
      if (h2) h2.textContent = s.textPrompt;
      renderInteraction();
      renderScenarioActions();
      return;
    }

    if (ok && s.rationaleOptions && s.rationaleOptions.length) {
      session.stage = "rationale";
      session.locked = false;
      // Clear decision selection styling; show only the why step now
      showFeedback(
        "correct",
        "Decision locked. Now explain why that choice works."
      );
      renderInteraction();
      renderScenarioActions();
      return;
    }

    finishScenario(ok, reveal);
  }

  function submitTextGate() {
    const session = state.session;
    if (!session || session.stage !== "text-gate") return;
    const s = session.scenario;
    const input = $("#text-gate-input");
    const raw = (input?.value || "").trim();
    const expected = String(s.correctText || "").trim().toLowerCase();
    const ok = raw.toLowerCase() === expected;
    if (!ok) {
      showFeedback("hint", s.textFail || s.textHint || "Try again.");
      input?.focus();
      return;
    }
    session.revealUnlocked = true;
    finishScenario(true, true, true);
  }

  function selectRationale(id) {
    const session = state.session;
    if (session.stage !== "rationale") return;
    const s = session.scenario;
    session.selectedRationale = id;
    const ok = id === s.correctRationale;
    session.rationaleCorrect = ok;
    session.locked = true;
    finishScenario(session.decisionCorrect, true, ok);
  }

  function finishScenario(decisionOk, reveal, rationaleOk) {
    const session = state.session;
    const s = session.scenario;
    session.stage = "complete";
    session.locked = true;

    // Progress (skip ephemeral / session-only scenarios like the corner lock)
    if (!session.challengeMode && s.persistProgress !== false) {
      const prev = getScenarioProgress(s.id);
      const first =
        prev.firstAttemptCorrect === null
          ? session.attempts === 1 && decisionOk
          : prev.firstAttemptCorrect;
      state.progress.scenarios[s.id] = {
        completed: decisionOk,
        decisionCorrect: decisionOk,
        rationaleCorrect:
          rationaleOk == null
            ? prev.rationaleCorrect || !s.rationaleOptions
            : rationaleOk,
        firstAttemptCorrect: first,
        attempts: (prev.attempts || 0) + session.attempts,
        needsReview: !decisionOk,
      };
      state.progress.lastModule = s.module;
      saveProgress();
    } else if (state.challenge) {
      state.challenge.results.push({
        id: s.id,
        concept: s.concept || s.module,
        decisionCorrect: decisionOk,
        rationaleCorrect: rationaleOk == null ? true : rationaleOk,
      });
    }

    paintOptionStates();
    const msg = decisionOk
      ? s.explanation
      : reveal
        ? s.explanation
        : s.hint;
    showFeedback(decisionOk ? "correct" : "incorrect", msg, s.coachingCue);
    renderInteraction();
    renderScenarioActions();

    if (decisionOk || reveal) {
      playAnimation(s.animationSteps || []);
    }

    // Highlight correct option
    if (reveal) {
      $$(".option-btn").forEach((btn) => {
        const id = btn.getAttribute("data-option") || btn.getAttribute("data-rationale");
        if (!id) return;
        if (id === s.correctAnswer || id === s.correctRationale) btn.classList.add("is-correct");
        if (
          (btn.getAttribute("data-option") === session.selected && !decisionOk) ||
          (btn.getAttribute("data-rationale") === session.selectedRationale && rationaleOk === false)
        ) {
          btn.classList.add("is-incorrect");
        }
      });
      $$(".hotspot-zone").forEach((z) => {
        if (z.getAttribute("data-zone-id") === s.correctAnswer) z.classList.add("is-correct");
      });
    }
  }

  function paintOptionStates() {
    const session = state.session;
    $$(".option-btn").forEach((btn) => {
      const id = btn.getAttribute("data-option");
      if (id && id === session.selected) btn.classList.add("is-selected");
    });
    $$(".hotspot-zone").forEach((z) => {
      if (z.getAttribute("data-zone-id") === session.selected) z.classList.add("is-selected");
    });
  }

  function showFeedback(kind, text, cue) {
    const slot = $("#feedback-slot");
    if (!slot) return;
    const title =
      kind === "correct" ? "Strong read" : kind === "hint" ? "Hint" : "Not this picture";
    slot.innerHTML = `
      <div class="feedback is-${kind}">
        <h3>${title}</h3>
        <p>${escapeHtml(text || "")}</p>
        ${
          cue && kind !== "hint"
            ? `<div class="coaching-cue"><span class="label">Remember it</span><strong>${escapeHtml(cue)}</strong></div>`
            : ""
        }
      </div>
    `;
  }

  function renderFeedback() {
    // no-op placeholder; feedback set by showFeedback
  }

  function renderScenarioActions() {
    const el = $("#scenario-actions");
    if (!el) return;
    const session = state.session;
    const s = session.scenario;
    const list = moduleScenarios(s.module);
    const idx = list.findIndex((x) => x.id === s.id);
    const next = list[idx + 1];

    if (session.challengeMode && session.stage === "complete") {
      el.innerHTML = `<button type="button" class="btn btn-primary" id="challenge-next-btn">Next</button>`;
      $("#challenge-next-btn").addEventListener("click", advanceChallenge);
      return;
    }

    const bits = [];
    if (session.stage === "complete") {
      const hasAlt = !!(s.animationStepsAlt && s.animationStepsAlt.length);
      if (hasAlt) {
        bits.push(
          `<p class="anim-next-prompt"><strong>Watch both plays:</strong> you just saw Go Long — tap <em>Watch Go Short</em> next.</p>`
        );
        bits.push(
          `<button type="button" class="btn btn-secondary" id="replay-anim">Watch Go Long again</button>`
        );
        bits.push(
          `<button type="button" class="btn btn-primary" id="replay-anim-alt">Watch Go Short →</button>`
        );
        if (next) bits.push(`<a class="btn btn-secondary" href="#${escapeHtml(next.id)}">Next scenario</a>`);
        else bits.push(`<a class="btn btn-secondary" href="#${escapeHtml(findModule(s.module).hash)}">Module complete</a>`);
      } else {
        bits.push(
          `<button type="button" class="btn btn-ghost" id="replay-anim">Replay animation</button>`
        );
        if (next) bits.push(`<a class="btn btn-primary" href="#${escapeHtml(next.id)}">Next scenario</a>`);
        else bits.push(`<a class="btn btn-primary" href="#${escapeHtml(findModule(s.module).hash)}">Module complete</a>`);
      }
      bits.push(`<a class="btn btn-secondary" href="#${escapeHtml(findModule(s.module).hash)}">Back to module</a>`);
    } else if (session.stage === "decision" && session.attempts > 0 && !session.decisionCorrect) {
      bits.push(`<p class="muted">Try another answer.</p>`);
    }
    el.innerHTML = bits.join("");
    $("#replay-anim")?.addEventListener("click", () => playAnimation(s.animationSteps || []));
    $("#replay-anim-alt")?.addEventListener("click", () => playAnimation(s.animationStepsAlt || []));
  }

  function resetPitchToScenario(scenario) {
    const all = [].concat(scenario.players || [], scenario.opponents || []);
    all.forEach((p) => {
      const g = $(`[data-player-id="${p.id}"]`);
      if (g) {
        setTokenPos(g, p.x, p.y);
        g.classList.remove("is-highlight", "is-matched", "is-selected", "is-wrong");
      }
    });
    const ball = $("#pitch-ball");
    if (ball && scenario.ball) setBallPos(ball, scenario.ball.x, scenario.ball.y);
    const animLayer = $("#pitch-anim");
    if (animLayer) animLayer.innerHTML = "";
  }

  /* ---------- Animation ---------- */
  function playAnimation(steps) {
    if (!steps.length) return;
    const scenario = state.session?.scenario;
    if (scenario) resetPitchToScenario(scenario);
    const animLayer = $("#pitch-anim");
    if (!animLayer) return;
    animLayer.innerHTML = "";
    $$(".player-token").forEach((g) => g.classList.remove("is-highlight"));
    const captionEl = $("#anim-caption");
    if (captionEl) {
      captionEl.hidden = false;
      captionEl.textContent = "";
    }

    const setCaption = (step) => {
      if (!captionEl || !step.caption) return;
      captionEl.textContent = step.caption;
    };

    const flatten = (list) => {
      list.forEach((step) => {
        setCaption(step);
        if (step.type === "parallel") (step.steps || []).forEach((s) => applyAnimStep(s, true));
        else applyAnimStep(step, true);
      });
    };

    if (REDUCED_MOTION) {
      flatten(steps);
      return;
    }

    let i = 0;
    const run = () => {
      if (i >= steps.length) return;
      const step = steps[i];
      setCaption(step);
      if (step.type === "parallel") {
        (step.steps || []).forEach((s) => applyAnimStep(s, false));
        i += 1;
        setTimeout(run, step.duration || 500);
        return;
      }
      applyAnimStep(step, false);
      const dur = step.duration || 500;
      i += 1;
      setTimeout(run, dur);
    };
    run();
  }

  function applyAnimStep(step, instant) {
    const animLayer = $("#pitch-anim");
    if (step.type === "parallel") {
      (step.steps || []).forEach((s) => applyAnimStep(s, instant));
      return;
    }
    if (step.type === "move") {
      const g = $(`[data-player-id="${step.playerId}"]`);
      if (!g) return;
      const from = getTokenPos(g);
      const toX = step.to.x;
      const toY = step.to.y;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "line");
      path.setAttribute("class", "anim-path");
      path.setAttribute("x1", from.x);
      path.setAttribute("y1", from.y);
      path.setAttribute("x2", toX);
      path.setAttribute("y2", toY);
      animLayer.appendChild(path);

      if (instant || REDUCED_MOTION) {
        setTokenPos(g, toX, toY);
        return;
      }
      const start = performance.now();
      const dur = step.duration || 500;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        setTokenPos(g, from.x + (toX - from.x) * t, from.y + (toY - from.y) * t);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } else if (step.type === "pass" || step.type === "ball") {
      const ball = $("#pitch-ball");
      const from = step.from || getBallPos(ball);
      const to = step.to;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("class", "anim-pass");
      line.setAttribute("x1", from.x);
      line.setAttribute("y1", from.y);
      line.setAttribute("x2", to.x);
      line.setAttribute("y2", to.y);
      animLayer.appendChild(line);
      if (ball) {
        if (instant || REDUCED_MOTION) {
          setBallPos(ball, to.x, to.y);
        } else {
          const start = performance.now();
          const dur = step.duration || 450;
          const x0 = from.x;
          const y0 = from.y;
          const tick = (now) => {
            const t = Math.min(1, (now - start) / dur);
            setBallPos(ball, x0 + (to.x - x0) * t, y0 + (to.y - y0) * t);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }
    } else if (step.type === "highlight") {
      (step.playerIds || []).forEach((id) => {
        $(`[data-player-id="${id}"]`)?.classList.add("is-highlight");
      });
    }
  }

  function bindCoachControls() {
    if (!state.coach) return;
    $("#coach-prev")?.addEventListener("click", () => coachNav(-1));
    $("#coach-next")?.addEventListener("click", () => coachNav(1));
    $("#coach-replay")?.addEventListener("click", () => {
      playAnimation(state.session.scenario.animationSteps || []);
    });
    $("#coach-module-filter")?.addEventListener("change", (e) => {
      const mid = e.target.value;
      const list = mid ? moduleScenarios(mid) : SCENARIOS;
      if (list[0]) navigate(list[0].id);
    });
  }

  function coachNav(dir) {
    const filter = $("#coach-module-filter")?.value || "";
    const list = filter ? moduleScenarios(filter) : SCENARIOS;
    const idx = list.findIndex((s) => s.id === state.session.scenario.id);
    const next = list[idx + dir];
    if (next) {
      state.session = null;
      navigate(next.id);
    }
  }

  /* ---------- Challenge ---------- */
  function renderChallenge() {
    if (state.challenge && state.challenge.active) {
      const id = state.challenge.queue[state.challenge.index];
      state.scenarioId = id;
      state.session = createSession(findScenario(id), true);
      paintScenario();
      return;
    }

    if (state.challenge && state.challenge.finished) {
      renderChallengeResults();
      return;
    }

    root.innerHTML = `
      <div class="section-header">
        <div>
          <h1>Mixed Challenge</h1>
          <p>Ten unlabeled scenarios from every module. No first-hint. Decision and rationale both count. Results by concept.</p>
        </div>
        <a class="btn btn-ghost" href="#home">Home</a>
      </div>
      <div class="results-card">
        <p class="muted">Role labels and teaching highlights are removed. Commit before you see the answer.</p>
        <div class="module-card-actions" style="margin-top:1rem">
          <button type="button" class="btn btn-primary" id="start-challenge">Start 10-question challenge</button>
        </div>
      </div>
    `;
    $("#start-challenge").addEventListener("click", startChallenge);
  }

  function startChallenge() {
    const pool = SCENARIOS.filter((s) => s.challengeEligible !== false);
    const queue = shuffle(pool)
      .slice(0, CONFIG.challengeCount || 10)
      .map((s) => s.id);
    state.challenge = {
      active: true,
      finished: false,
      queue,
      index: 0,
      results: [],
    };
    state.session = null;
    navigate(queue[0]);
  }

  function advanceChallenge() {
    const ch = state.challenge;
    if (!ch) return;
    ch.index += 1;
    if (ch.index >= ch.queue.length) {
      ch.active = false;
      ch.finished = true;
      state.session = null;
      navigate("challenge");
      return;
    }
    state.session = null;
    navigate(ch.queue[ch.index]);
  }

  function renderChallengeResults() {
    const results = state.challenge.results;
    const byConcept = {};
    results.forEach((r) => {
      const key = r.concept || "general";
      if (!byConcept[key]) byConcept[key] = { hit: 0, total: 0 };
      byConcept[key].total += 1;
      if (r.decisionCorrect && r.rationaleCorrect) byConcept[key].hit += 1;
    });

    const conceptLabels = {
      transition: "Transition decisions",
      "attacking-shape": "Attacking shape",
      "wide-combinations": "Wide combinations",
      "gap-pass": "Gap passes",
      "half-space-run": "Half-space runs",
      "wide-rotation": "Wide rotations",
      "supporting-runs": "Supporting runs",
      defense: "Defensive shape",
      "defending-shape": "4-4-2 defensive shape",
      corners: "Corners",
      "corners-short": "Short corners",
      "corners-long": "Long corners",
      attack: "Attacking shape",
      wide: "Wide attack patterns",
      support: "Supporting runs",
      corner: "Corners",
    };

    const rows = Object.keys(byConcept)
      .map((k) => {
        const c = byConcept[k];
        return `<div class="concept-row"><span>${escapeHtml(conceptLabels[k] || k)}</span><strong>${c.hit}/${c.total}</strong></div>`;
      })
      .join("");

    // Recommend weakest module
    let weakest = null;
    let worst = 2;
    Object.keys(byConcept).forEach((k) => {
      const ratio = byConcept[k].hit / byConcept[k].total;
      if (ratio < worst) {
        worst = ratio;
        weakest = k;
      }
    });
    const modMap = {
      transition: "attack",
      "attacking-shape": "attack",
      attack: "attack",
      "wide-combinations": "wide",
      "gap-pass": "wide",
      "half-space-run": "wide",
      "wide-rotation": "wide",
      wide: "wide",
      defense: "defense",
      "defending-shape": "defense",
      corners: "corner",
      "corners-short": "corner",
      "corners-long": "corner",
      corner: "corner",
    };
    const reviewId = modMap[weakest] || "attack";
    const reviewMod = findModule(reviewId);

    const totalHit = results.filter((r) => r.decisionCorrect && r.rationaleCorrect).length;

    root.innerHTML = `
      <div class="section-header">
        <div>
          <h1>Challenge results</h1>
          <p>${totalHit}/${results.length} fully correct (decision + rationale).</p>
        </div>
      </div>
      <div class="results-card">
        <div class="concept-scores">${rows}</div>
        <div class="recommend">Review next: <strong>${escapeHtml(reviewMod.title)}</strong> — strengthen the concepts that slipped.</div>
        <div class="module-card-actions" style="margin-top:1rem">
          <a class="btn btn-primary" href="#${escapeHtml(reviewMod.hash)}">Open ${escapeHtml(reviewMod.title)}</a>
          <button type="button" class="btn btn-secondary" id="retry-challenge">Try again</button>
          <a class="btn btn-ghost" href="#home">Home</a>
        </div>
      </div>
    `;
    state.progress.challengeAttempts.push({
      at: Date.now(),
      score: totalHit,
      total: results.length,
    });
    saveProgress();
    $("#retry-challenge").addEventListener("click", () => {
      state.challenge = null;
      startChallenge();
    });
  }

  /* ---------- Secret varsity shot tracker ---------- */
  const HALF_L = PL / 2;
  const DEF_SLIVER = 8;
  const FIELD_Y_MAX = HALF_L + DEF_SLIVER;
  const PEN_W = 40.32;
  const SIX_W = 18.32;
  const PEN_SIDE = (PW - PEN_W) / 2;
  const WIDE_END = PEN_SIDE + 1.2;
  const CENTER_W = 17;
  const CENTER_X0 = (PW - CENTER_W) / 2;
  const CENTER_X1 = CENTER_X0 + CENTER_W;
  const TRACKER_CHANNELS = [
    { id: "LW", label: "Left wide", x0: 0, x1: WIDE_END },
    { id: "LHS", label: "Left half-space", x0: WIDE_END, x1: CENTER_X0 },
    { id: "C", label: "Center", x0: CENTER_X0, x1: CENTER_X1 },
    { id: "RHS", label: "Right half-space", x0: CENTER_X1, x1: PW - WIDE_END },
    { id: "RW", label: "Right wide", x0: PW - WIDE_END, x1: PW },
  ];
  const TRACKER_DEPTHS = [
    { id: "6Y", label: "Six-yard", y0: 0, y1: 5.5 },
    { id: "PS", label: "Penalty-spot line", y0: 5.5, y1: 11 },
    { id: "BOX", label: "Penalty area", y0: 11, y1: 16.5 },
    { id: "D", label: "Top of the box", y0: 16.5, y1: 25 },
    { id: "AT", label: "Attacking third", y0: 25, y1: 35 },
    { id: "HALF", label: "Toward halfway", y0: 35, y1: HALF_L },
  ];
  const SHOT_RESULT_LABELS = {
    goal: "Goal",
    "on-target": "Shot on Goal",
    blocked: "Shot Blocked",
    missed: "Missed Shot",
  };
  const ASSIST_TYPE_LABELS = {
    pass: "Pass",
    gap: "Gap",
    cross: "Cross",
  };
  const TRACKER_FIRST_ACTIONS = [
    { id: "assist-pass", label: "Assist — Pass", kind: "assist", type: "pass" },
    { id: "assist-gap", label: "Assist — Gap", kind: "assist", type: "gap" },
    { id: "assist-cross", label: "Assist — Cross", kind: "assist", type: "cross" },
    { id: "goal", label: "Goal", kind: "shot", result: "goal" },
    { id: "on-target", label: "Shot on Goal", kind: "shot", result: "on-target" },
    { id: "blocked", label: "Shot Blocked", kind: "shot", result: "blocked" },
    { id: "missed", label: "Missed Shot", kind: "shot", result: "missed" },
  ];
  const TRACKER_SHOT_ACTIONS = TRACKER_FIRST_ACTIONS.filter((a) => a.kind === "shot");

  function loadShots() {
    try {
      const raw = localStorage.getItem(CONFIG.shotsStorageKey || "brighton-varsity-shot-tracker");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveShots(events) {
    localStorage.setItem(
      CONFIG.shotsStorageKey || "brighton-varsity-shot-tracker",
      JSON.stringify(events)
    );
  }

  const TRACKER_UI_KEY = "brighton-varsity-shot-tracker-ui";

  function loadTrackerUi() {
    try {
      const raw = localStorage.getItem(TRACKER_UI_KEY);
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch {
      return {};
    }
  }

  function saveTrackerUi() {
    localStorage.setItem(
      TRACKER_UI_KEY,
      JSON.stringify({
        period: state.tracker.period,
        opponent: state.tracker.opponent || "",
        team: state.tracker.team || "us",
        lineupEdit: state.tracker.lineupEdit || "us",
        lineup: state.tracker.lineup,
      })
    );
  }

  function eventPeriod(ev) {
    return normalizePeriod(ev && ev.period);
  }

  function normalizePeriod(p) {
    const n = Number(p);
    if (n === 2 || n === 3 || n === 4) return n;
    return 1;
  }

  function periodLabel(period) {
    if (period === 2) return "2nd Half";
    if (period === 3) return "ET 1";
    if (period === 4) return "ET 2";
    return "1st Half";
  }

  function periodCsv(period) {
    if (period === 3) return "ET1";
    if (period === 4) return "ET2";
    return String(period === 2 ? 2 : 1);
  }

  let trackerEvents = loadShots();
  const savedUi = loadTrackerUi();
  state.tracker.period = normalizePeriod(savedUi.period);
  state.tracker.opponent = savedUi.opponent || "";
  state.tracker.team = savedUi.team === "opp" ? "opp" : "us";
  state.tracker.lineupEdit = savedUi.lineupEdit === "opp" ? "opp" : "us";
  state.tracker.lineup = savedUi.lineup && typeof savedUi.lineup === "object"
    ? Object.assign({ set: false, us: {}, opp: {} }, savedUi.lineup, {
        us: savedUi.lineup.us || {},
        opp: savedUi.lineup.opp || {},
      })
    : { set: false, us: {}, opp: {} };

  const POSITION_SLOTS = [
    { id: 1, code: "GK" },
    { id: 2, code: "RB" },
    { id: 3, code: "LB" },
    { id: 4, code: "RCB" },
    { id: 5, code: "LCB" },
    { id: 6, code: "DM" },
    { id: 7, code: "RW" },
    { id: 8, code: "CM" },
    { id: 9, code: "CF" },
    { id: 10, code: "AM" },
    { id: 11, code: "LW" },
  ];

  function jerseyChoices() {
    return ["00", "0"].concat(Array.from({ length: 99 }, (_, i) => String(i + 1)));
  }

  function lineupIsSet() {
    return !!state.tracker.lineup?.set;
  }

  function slotPlayer(team, slotId) {
    const bag = team === "opp" ? state.tracker.lineup.opp : state.tracker.lineup.us;
    return (bag && bag[String(slotId)]) || null;
  }

  function onFieldPlayers(team) {
    return POSITION_SLOTS.map((slot) => {
      const p = slotPlayer(team, slot.id);
      if (!p) return null;
      return Object.assign({ slot: slot.id, slotCode: slot.code, team }, p);
    }).filter(Boolean);
  }

  function usedUsNumbers(exceptSlot) {
    const used = new Set();
    POSITION_SLOTS.forEach((slot) => {
      if (exceptSlot && slot.id === exceptSlot) return;
      const p = slotPlayer("us", slot.id);
      if (p) used.add(String(p.number));
    });
    return used;
  }

  function usedOppNumbers(exceptSlot) {
    const used = new Set();
    POSITION_SLOTS.forEach((slot) => {
      if (exceptSlot && slot.id === exceptSlot) return;
      const p = slotPlayer("opp", slot.id);
      if (p) used.add(String(p.number));
    });
    return used;
  }

  function assignSlot(team, slotId, player) {
    const key = team === "opp" ? "opp" : "us";
    if (!state.tracker.lineup[key] || typeof state.tracker.lineup[key] !== "object") {
      state.tracker.lineup[key] = {};
    }
    if (!player) delete state.tracker.lineup[key][String(slotId)];
    else state.tracker.lineup[key][String(slotId)] = player;
    saveTrackerUi();
  }

  function usPlayerFromValue(value) {
    if (!value) return null;
    if (value.startsWith("n-")) {
      const num = value.slice(2);
      return { number: num, name: `JV #${num}`, short: "JV", adhoc: true };
    }
    const roster = VARSITY_ROSTER.find((p) => String(p.number) === value);
    if (!roster) return null;
    return {
      number: roster.number,
      name: roster.name,
      short: roster.short || firstName(roster.name),
      adhoc: false,
    };
  }

  function findOnFieldPlayer(team, number) {
    return onFieldPlayers(team).find((p) => String(p.number) === String(number)) || null;
  }

  function recordingTeam() {
    return state.tracker.team === "opp" ? "opp" : "us";
  }

  function eventTeam(ev) {
    return ev && ev.team === "opp" ? "opp" : "us";
  }

  function shouldAskPlayer() {
    return lineupIsSet() && onFieldPlayers(recordingTeam()).length > 0;
  }

  function usSelectOptions(slotId) {
    const current = slotPlayer("us", slotId);
    const used = usedUsNumbers(slotId);
    const opts = [`<option value="">—</option>`];
    rosterForPicker().forEach((p) => {
      const taken = used.has(String(p.number));
      const selected = current && !current.adhoc && String(current.number) === String(p.number);
      opts.push(
        `<option value="${p.number}" ${taken ? "disabled" : ""} ${selected ? "selected" : ""}>${escapeHtml(playerDisplayName(p))}</option>`
      );
    });
    if (current?.adhoc) {
      opts.push(
        `<option value="n-${escapeHtml(String(current.number))}" selected>#${escapeHtml(String(current.number))} (added)</option>`
      );
    }
    opts.push(`<option value="__add__">Add number…</option>`);
    return opts.join("");
  }

  function oppSelectOptions(slotId) {
    const current = slotPlayer("opp", slotId);
    const used = usedOppNumbers(slotId);
    const opts = [`<option value="">—</option>`];
    jerseyChoices().forEach((num) => {
      const taken = used.has(num);
      const selected = current && String(current.number) === num;
      opts.push(
        `<option value="${num}" ${taken ? "disabled" : ""} ${selected ? "selected" : ""}>${num}</option>`
      );
    });
    return opts.join("");
  }

  function lineupEditorMarkup() {
    const team = state.tracker.lineupEdit === "opp" ? "opp" : "us";
    const count = onFieldPlayers(team).length;
    const rows = POSITION_SLOTS.map((slot) => {
      const filled = slotPlayer(team, slot.id);
      const select =
        team === "opp"
          ? `<select class="lineup-select" data-lineup-team="opp" data-lineup-slot="${slot.id}">${oppSelectOptions(slot.id)}</select>`
          : `<select class="lineup-select" data-lineup-team="us" data-lineup-slot="${slot.id}">${usSelectOptions(slot.id)}</select>`;
      return `
        <div class="lineup-row">
          <span class="lineup-pos"><strong>${slot.id}</strong> ${slot.code}</span>
          ${select}
          <button type="button" class="btn btn-ghost lineup-sub" data-sub-slot="${slot.id}" ${filled ? "" : "disabled"}>Sub</button>
        </div>`;
    }).join("");
    return `
      <section class="lineup-section" id="lineup-section">
        <div class="lineup-header">
          <h2>Positions</h2>
          <button type="button" class="btn ${lineupIsSet() ? "btn-secondary" : "btn-primary"}" id="set-positions-btn">${lineupIsSet() ? "Positions set" : "Set Positions"}</button>
        </div>
        <p class="muted lineup-help">${lineupIsSet() ? "Only these 11 appear when you add a play. Sub to swap." : "Assign the 11, then tap Set Positions. Until then, plays save without a player."}</p>
        <div class="half-toggle lineup-team-toggle" role="tablist" aria-label="Lineup team">
          <button type="button" class="half-toggle-btn ${team === "us" ? "is-on" : ""}" data-lineup-edit="us">Us</button>
          <button type="button" class="half-toggle-btn ${team === "opp" ? "is-on" : ""}" data-lineup-edit="opp">Them</button>
        </div>
        <p class="lineup-count">${count}/11 on the field</p>
        <div class="lineup-list">${rows}</div>
      </section>`;
  }

  function openNumberPicker(usedSet, onPick) {
    const modal = $("#number-pick-modal");
    const select = $("#number-pick-select");
    if (!modal || !select) return;
    select.innerHTML = jerseyChoices()
      .map((num) => `<option value="${num}" ${usedSet.has(num) ? "disabled" : ""}>${num}</option>`)
      .join("");
    const first = jerseyChoices().find((n) => !usedSet.has(n));
    if (first) select.value = first;
    modal.hidden = false;
    const confirmBtn = $("#number-pick-confirm");
    const cancelBtns = $$("[data-close-number-pick]");
    const finish = (picked) => {
      modal.hidden = true;
      confirmBtn.onclick = null;
      cancelBtns.forEach((el) => {
        el.onclick = null;
      });
      if (picked) onPick(picked);
    };
    confirmBtn.onclick = () => {
      const opt = select.selectedOptions[0];
      if (!select.value || opt?.disabled) return;
      finish(select.value);
    };
    cancelBtns.forEach((el) => {
      el.onclick = () => finish(null);
    });
  }

  function openSubPicker(team, slotId) {
    const current = slotPlayer(team, slotId);
    if (!current) return;
    if (team === "opp") {
      openNumberPicker(usedOppNumbers(slotId), (num) => {
        assignSlot("opp", slotId, { number: num });
        renderShotTracker({ keepScroll: true });
      });
      return;
    }
    const modal = $("#lineup-sub-modal");
    const list = $("#lineup-sub-list");
    if (!modal || !list) return;
    const used = usedUsNumbers(slotId);
    const available = rosterForPicker().filter(
      (p) => String(p.number) !== String(current.number) && !used.has(String(p.number))
    );
    list.innerHTML = available
      .map(
        (p) =>
          `<button type="button" class="shot-player-btn" data-sub-us="${p.number}">
            <span class="name">${escapeHtml(playerDisplayName(p))}</span>
            <span class="num">${p.number}</span>
          </button>`
      )
      .join("") +
      `<button type="button" class="shot-player-btn" data-sub-add="1"><span class="name">Add number</span></button>`;
    modal.hidden = false;
    const onClick = (e) => {
      const add = e.target.closest("[data-sub-add]");
      const usBtn = e.target.closest("[data-sub-us]");
      if (add) {
        modal.hidden = true;
        list.removeEventListener("click", onClick);
        openNumberPicker(usedUsNumbers(slotId), (num) => {
          assignSlot("us", slotId, usPlayerFromValue(`n-${num}`));
          renderShotTracker({ keepScroll: true });
        });
        return;
      }
      if (usBtn) {
        assignSlot("us", slotId, usPlayerFromValue(usBtn.getAttribute("data-sub-us")));
        modal.hidden = true;
        list.removeEventListener("click", onClick);
        renderShotTracker({ keepScroll: true });
      }
    };
    list.addEventListener("click", onClick);
    $$("[data-close-lineup-sub]").forEach((el) => {
      el.onclick = () => {
        modal.hidden = true;
        list.removeEventListener("click", onClick);
      };
    });
  }

  function bindLineupEditor() {
    $$("[data-lineup-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tracker.lineupEdit = btn.getAttribute("data-lineup-edit") === "opp" ? "opp" : "us";
        saveTrackerUi();
        renderShotTracker({ keepScroll: true });
      });
    });
    $("#set-positions-btn")?.addEventListener("click", () => {
      state.tracker.lineup.set = true;
      saveTrackerUi();
      renderShotTracker({ keepScroll: true });
      showToast("Positions set — Add Play will use this 11");
    });
    $$(".lineup-select").forEach((sel) => {
      sel.addEventListener("change", () => {
        const team = sel.getAttribute("data-lineup-team");
        const slotId = Number(sel.getAttribute("data-lineup-slot"));
        const value = sel.value;
        if (team === "opp") {
          assignSlot("opp", slotId, value ? { number: value } : null);
          renderShotTracker({ keepScroll: true });
          return;
        }
        if (value === "__add__") {
          sel.value = slotPlayer("us", slotId)
            ? slotPlayer("us", slotId).adhoc
              ? `n-${slotPlayer("us", slotId).number}`
              : String(slotPlayer("us", slotId).number)
            : "";
          openNumberPicker(usedUsNumbers(slotId), (num) => {
            assignSlot("us", slotId, usPlayerFromValue(`n-${num}`));
            renderShotTracker({ keepScroll: true });
          });
          return;
        }
        assignSlot("us", slotId, usPlayerFromValue(value));
        renderShotTracker({ keepScroll: true });
      });
    });
    $$("[data-sub-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slotId = Number(btn.getAttribute("data-sub-slot"));
        openSubPicker(state.tracker.lineupEdit === "opp" ? "opp" : "us", slotId);
      });
    });
  }

  const shotModal = $("#shot-event-modal");
  const shotModalDraft = {
    step: "first",
    phase: "action",
    location: null,
    player: null,
    action: null,
  };

  function locatePitchPoint(rawX, rawY) {
    const x = Math.max(0, Math.min(PW, rawX));
    const y = Math.max(0, Math.min(FIELD_Y_MAX, rawY));
    if (y >= HALF_L) {
      return {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        zoneId: "DEF",
        zoneLabel: "Defensive half",
      };
    }
    const col = TRACKER_CHANNELS.findIndex((c, i) =>
      i === TRACKER_CHANNELS.length - 1 ? x >= c.x0 && x <= c.x1 : x >= c.x0 && x < c.x1
    );
    const row = TRACKER_DEPTHS.findIndex((d, i) =>
      i === TRACKER_DEPTHS.length - 1 ? y >= d.y0 && y <= d.y1 : y >= d.y0 && y < d.y1
    );
    const channel = TRACKER_CHANNELS[Math.max(0, col)];
    const depth = TRACKER_DEPTHS[Math.max(0, row)];
    const sixX0 = (PW - SIX_W) / 2;
    const penX0 = (PW - PEN_W) / 2;
    const inSix = x >= sixX0 && x <= sixX0 + SIX_W && y <= 5.5;
    const inBox = x >= penX0 && x <= penX0 + PEN_W && y <= 16.5;
    const nearSpot = Math.hypot(x - PW / 2, y - 11) <= 2.2;
    let zoneLabel;
    if (channel.id === "C" && depth.id === "D") zoneLabel = "Zone 14";
    else if (nearSpot) zoneLabel = "Penalty spot";
    else if (inSix) zoneLabel = `Six-yard box · ${channel.label}`;
    else if (inBox) zoneLabel = `Box · ${channel.label}`;
    else zoneLabel = `${channel.label} · ${depth.label}`;
    return {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      zoneId: `${channel.id}-${depth.id}`,
      zoneLabel,
    };
  }

  function formatLoc(loc) {
    if (!loc) return "—";
    return loc.zoneLabel || "—";
  }

  function formatXY(loc) {
    if (!loc) return "—";
    return `${Number(loc.x).toFixed(1)}, ${Number(loc.y).toFixed(1)}`;
  }

  function formatShotTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function playerLabel(p) {
    if (!p) return "untagged";
    if (p.team === "opp") return `Opp #${p.number}`;
    return playerDisplayName(p);
  }

  function playerDisplayName(p) {
    if (!p) return "";
    if (p.team === "opp" || (p.number != null && !p.name && !p.short)) return `#${p.number}`;
    if (p.short) return p.short;
    return firstName(p.name || p);
  }

  function firstName(full) {
    const raw = String(full || "").trim().split(/\s+/)[0] || full;
    const nick = {
      Madeline: "Maddie",
      Abigail: "Abby",
      Jaqueline: "Jackie",
      Ariana: "Ari",
    };
    const fromRoster = VARSITY_ROSTER.find((p) => p.name === full);
    if (fromRoster?.short) return fromRoster.short;
    return nick[raw] || raw;
  }

  function rosterForPicker() {
    return VARSITY_ROSTER.slice().sort((a, b) =>
      playerDisplayName(a).localeCompare(playerDisplayName(b), undefined, { sensitivity: "base" })
    );
  }

  function csvEscape(value) {
    const s = String(value ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function exportShotsCsv() {
    if (!trackerEvents.length) {
      showToast("No shots to export");
      return;
    }
    const headers = [
      "half",
      "team",
      "time",
      "player_number",
      "player_name",
      "result",
      "shot_zone_id",
      "shot_zone",
      "shot_x",
      "shot_y",
      "assisted_by_number",
      "assisted_by_name",
      "assist_type",
      "assist_zone_id",
      "assist_zone",
      "assist_x",
      "assist_y",
    ];
    const lines = [headers.join(",")];
    trackerEvents.forEach((ev) => {
      lines.push(
        [
          periodCsv(eventPeriod(ev)),
          eventTeam(ev) === "opp" ? "opponent" : "us",
          ev.createdAt,
          ev.shooterNumber ?? "",
          csvEscape(ev.shooterName || ""),
          csvEscape(SHOT_RESULT_LABELS[ev.result] || ev.result),
          ev.shot?.zoneId ?? "",
          csvEscape(ev.shot?.zoneLabel || ""),
          ev.shot?.x ?? "",
          ev.shot?.y ?? "",
          ev.assist?.number ?? "",
          csvEscape(ev.assist?.name || ""),
          ev.assist ? ASSIST_TYPE_LABELS[ev.assist.type] || ev.assist.type : "",
          ev.assist?.zoneId ?? "",
          csvEscape(ev.assist?.zoneLabel || ""),
          ev.assist?.x ?? "",
          ev.assist?.y ?? "",
        ].join(",")
      );
    });
    const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bengals-shots-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast("CSV exported");
  }

  function pitchFromSvgPoint(sx, sy) {
    return { x: sy, y: HALF_L - sx };
  }

  function svgEventPoint(svg, evt) {
    const pt = svg.createSVGPoint();
    const e = evt.changedTouches?.[0] || evt.touches?.[0] || evt;
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    return pt.matrixTransform(ctm.inverse());
  }

  function halfPitchMarkup(events, opts = {}) {
    const line = "var(--pitch-line)";
    const goalW = 7.32;
    const goalX = (PW - goalW) / 2;
    const penW = 40.32;
    const penH = 16.5;
    const sixW = 18.32;
    const sixH = 5.5;
    const penX = (PW - penW) / 2;
    const sixX = (PW - sixW) / 2;
    const spotX = PW / 2;
    const spotY = 11;
    const arcR = 9.15;
    const dx = Math.sqrt(arcR * arcR - (penH - spotY) * (penH - spotY));

    const stripes = [];
    for (let i = 0; i < 5; i += 1) {
      stripes.push(
        `<rect class="grass-stripe" x="0" y="${i * (FIELD_Y_MAX / 5)}" width="${PW}" height="${FIELD_Y_MAX / 10}" />`
      );
    }

    let grid = "";
    if (opts.showGrid) {
      TRACKER_CHANNELS.forEach((ch, i) => {
        TRACKER_DEPTHS.forEach((d, j) => {
          if ((i + j) % 2 === 1) {
            grid += `<rect class="tracker-cell" x="${ch.x0}" y="${d.y0}" width="${ch.x1 - ch.x0}" height="${d.y1 - d.y0}" />`;
          }
        });
      });
      grid += `<rect class="tracker-cell tracker-cell-deep" x="0" y="${HALF_L}" width="${PW}" height="${DEF_SLIVER}" />`;
      TRACKER_CHANNELS.slice(1).forEach((ch) => {
        grid += `<line class="tracker-grid-line" x1="${ch.x0}" y1="0" x2="${ch.x0}" y2="${HALF_L}" />`;
      });
      TRACKER_DEPTHS.slice(1).forEach((d) => {
        grid += `<line class="tracker-grid-line" x1="0" y1="${d.y0}" x2="${PW}" y2="${d.y0}" />`;
      });
    }

    const pendingDots = [];
    const pending = state.tracker.pending;
    if (pending?.assist?.location) {
      const a = pending.assist.location;
      pendingDots.push(
        `<circle class="tracker-pending assist" cx="${a.x}" cy="${a.y}" r="1.15" />`
      );
    }
    if (shotModalDraft.location && !shotModal.hidden) {
      const loc = shotModalDraft.location;
      pendingDots.push(
        `<circle class="tracker-pending" cx="${loc.x}" cy="${loc.y}" r="1.25" />`
      );
    }

    const markers = events
      .filter((ev) => eventPeriod(ev) === (opts.period || state.tracker.period || 1))
      .map((ev) => {
        let html = "";
        if (ev.assist) {
          html += `<line class="tracker-assist-line" x1="${ev.assist.x}" y1="${ev.assist.y}" x2="${ev.shot.x}" y2="${ev.shot.y}" />`;
          html += `<circle class="tracker-assist-dot" cx="${ev.assist.x}" cy="${ev.assist.y}" r="0.9" />`;
        }
        html += `<circle class="tracker-shot-dot ${escapeHtml(ev.result)}" cx="${ev.shot.x}" cy="${ev.shot.y}" r="1.7" />`;
        if (ev.shooterNumber !== undefined && ev.shooterNumber !== null && ev.shooterNumber !== "") {
          html += `<text class="tracker-shot-num" x="${ev.shot.x}" y="${ev.shot.y}" transform="rotate(-90 ${ev.shot.x} ${ev.shot.y})">${escapeHtml(String(ev.shooterNumber))}</text>`;
        }
        return `<g class="tracker-event ${eventTeam(ev) === "opp" ? "is-opp" : ""}" data-event-id="${escapeHtml(ev.id)}">${html}</g>`;
      })
      .join("");

    return `
      <svg class="pitch-svg tracker-pitch-svg" viewBox="-9.4 -1 64.8 70" role="application" aria-label="Attacking half with a sliver of the defensive half. Goal on the right.">
        <g transform="translate(${HALF_L},0) rotate(90)">
          ${stripes.join("")}
          <g class="tracker-grid">${grid}</g>
          <rect x="0" y="0" width="${PW}" height="${FIELD_Y_MAX}" fill="none" stroke="${line}" stroke-width="0.45" />
          <line x1="0" y1="${HALF_L}" x2="${PW}" y2="${HALF_L}" stroke="${line}" stroke-width="0.4" />
          <circle cx="${PW / 2}" cy="${HALF_L}" r="9.15" fill="none" stroke="${line}" stroke-width="0.35" />
          <circle cx="${PW / 2}" cy="${HALF_L}" r="0.45" fill="${line}" />
          <rect x="${goalX}" y="-1.35" width="${goalW}" height="1.35" fill="none" stroke="${line}" stroke-width="0.45" />
          <rect x="${penX}" y="0" width="${penW}" height="${penH}" fill="none" stroke="${line}" stroke-width="0.35" />
          <rect x="${sixX}" y="0" width="${sixW}" height="${sixH}" fill="none" stroke="${line}" stroke-width="0.35" />
          <circle cx="${spotX}" cy="${spotY}" r="0.45" fill="${line}" />
          <path d="M ${spotX - dx} ${penH} A ${arcR} ${arcR} 0 0 0 ${spotX + dx} ${penH}" fill="none" stroke="${line}" stroke-width="0.35" />
          <path d="M 0 1 A 1 1 0 0 0 1 0" fill="none" stroke="${line}" stroke-width="0.3" />
          <path d="M ${PW} 1 A 1 1 0 0 1 ${PW - 1} 0" fill="none" stroke="${line}" stroke-width="0.3" />
          <text class="tracker-goal-label" x="${PW / 2}" y="-1.85" transform="rotate(-90 ${PW / 2} -1.85)">GOAL</text>
          <g class="tracker-markers">${markers}${pendingDots.join("")}</g>
        </g>
      </svg>
    `;
  }

  function resetTrackerDraft() {
    state.tracker.mode = "idle";
    state.tracker.pending = null;
    shotModalDraft.step = "first";
    shotModalDraft.phase = "action";
    shotModalDraft.location = null;
    shotModalDraft.player = null;
    shotModalDraft.action = null;
  }

  function closeShotModal() {
    if (shotModal) shotModal.hidden = true;
    shotModalDraft.player = null;
    shotModalDraft.action = null;
    shotModalDraft.phase = "action";
    shotModalDraft.location = null;
  }

  function dismissShotModal() {
    closeShotModal();
    if (state.view === "shots") renderShotTracker();
  }

  function fillShotModal(step, location) {
    shotModalDraft.step = step;
    shotModalDraft.phase = "action";
    shotModalDraft.location = location;
    shotModalDraft.player = null;
    shotModalDraft.action = null;
    renderShotModal();
    shotModal.dataset.openedAt = String(Date.now());
    shotModal.hidden = false;
  }

  function actionShortLabel(action) {
    if (!action) return "";
    if (action.kind === "assist") return ASSIST_TYPE_LABELS[action.type] || action.type;
    if (action.result === "on-target") return "On Goal";
    if (action.result === "blocked") return "Blocked";
    if (action.result === "missed") return "Missed";
    if (action.result === "goal") return "Goal";
    return action.label || "";
  }

  function renderShotModal() {
    const title = $("#shot-modal-title");
    const locEl = $("#shot-modal-location");
    const actionLabel = $("#shot-action-label");
    const playerHeading = $(".shot-modal-heading");
    const playerGrid = $("#shot-player-grid");
    const actionGrid = $("#shot-action-grid");
    const backBtn = $("#shot-modal-back");
    const panel = $(".shot-modal-panel", shotModal);
    const nudge = $("#shot-lineup-nudge");
    const nudgeText = $("#shot-lineup-nudge-text");
    if (!shotModal || !playerGrid || !actionGrid) return;

    const step = shotModalDraft.step;
    const phase = shotModalDraft.phase;
    const loc = shotModalDraft.location;
    const locText = loc ? `${formatLoc(loc)}  ·  (${formatXY(loc)})` : "";
    if (actionLabel) actionLabel.hidden = true;
    if (nudge) {
      const ask = shouldAskPlayer();
      nudge.hidden = ask || phase === "player";
      if (!ask && nudgeText) {
        nudgeText.textContent = lineupIsSet()
          ? `No ${recordingTeam() === "opp" ? "opponent numbers" : "players"} in the 11. This play will save without a player.`
          : "Positions aren’t set. This play will save without a player.";
      }
      const btn = $("#shot-goto-lineup");
      if (btn) btn.textContent = lineupIsSet() ? "Add players" : "Set positions";
    }

    if (panel) panel.classList.toggle("is-player-phase", phase === "player");
    if (backBtn) backBtn.hidden = phase !== "player";

    if (phase === "action") {
      title.textContent = step === "shot" ? "Shot result?" : "What happened?";
      locEl.textContent = locText;
      if (playerHeading) playerHeading.hidden = true;
      playerGrid.hidden = true;
      actionGrid.hidden = false;

      const shotBtns = TRACKER_SHOT_ACTIONS.map(
        (a) =>
          `<button type="button" class="shot-action-btn is-${a.result}" data-action-id="${escapeHtml(a.id)}">${escapeHtml(actionShortLabel(a))}</button>`
      ).join("");
      if (step === "shot") {
        actionGrid.innerHTML = `<div class="shot-action-row shot-action-row-fill">${shotBtns}</div>`;
      } else {
        const assistBtns = TRACKER_FIRST_ACTIONS.filter((a) => a.kind === "assist")
          .map(
            (a) =>
              `<button type="button" class="shot-action-btn is-assist" data-action-id="${escapeHtml(a.id)}">${escapeHtml(ASSIST_TYPE_LABELS[a.type])}</button>`
          )
          .join("");
        actionGrid.innerHTML = `
          <p class="shot-action-heading">Assist</p>
          <div class="shot-action-row shot-action-row-3">${assistBtns}</div>
          <p class="shot-action-heading">Shot</p>
          <div class="shot-action-row shot-action-row-fill">${shotBtns}</div>`;
      }
      return;
    }

    const chosen = shotModalDraft.action;
    const team = recordingTeam();
    const whoTitle = chosen?.kind === "assist" ? "Who assisted?" : "Who shot?";
    title.textContent = whoTitle;
    locEl.textContent = chosen
      ? `${actionShortLabel(chosen)}${chosen.kind === "assist" ? " assist" : ""}  ·  ${locText}`
      : locText;
    if (playerHeading) playerHeading.hidden = true;
    playerGrid.hidden = false;
    actionGrid.hidden = true;
    playerGrid.innerHTML = onFieldPlayers(team)
      .map((p) => {
        const label = team === "opp" ? `#${p.number}` : escapeHtml(playerDisplayName(p));
        const num = team === "opp" ? p.slotCode : p.number;
        return `
        <button type="button" class="shot-player-btn" data-player-number="${escapeHtml(String(p.number))}" data-player-team="${team}">
          <span class="name">${label}</span>
          <span class="num">${escapeHtml(String(num))}</span>
        </button>`;
      })
      .join("");
  }

  function completeShotModal() {
    const action = shotModalDraft.action;
    if (!action) return;
    const player = shotModalDraft.player || null;
    if (shouldAskPlayer() && !player) return;
    if (shotModalDraft.step === "first" && action.kind === "assist") {
      state.tracker.pending = {
        assist: {
          player,
          type: action.type,
          location: shotModalDraft.location,
        },
      };
      state.tracker.mode = "awaiting-shot-location";
      closeShotModal();
      shotModalDraft.location = null;
      renderShotTracker();
      showToast("Tap where the shot was taken");
      return;
    }
    if (action.kind === "shot") {
      const assist = shotModalDraft.step === "shot" ? state.tracker.pending?.assist : null;
      commitShotEvent(action.result, player, assist || null);
    }
  }

  function commitShotEvent(result, shooter, assist) {
    const loc = shotModalDraft.location;
    if (!loc) return;
    const team = recordingTeam();
    const event = {
      id: `shot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      period: normalizePeriod(state.tracker.period),
      team,
      shooterNumber: shooter ? String(shooter.number) : "",
      shooterName: shooter ? shooter.name || "" : "",
      shooterShort: shooter ? shooter.short || "" : "",
      result,
      shot: loc,
      assist: assist
        ? {
            number: assist.player ? String(assist.player.number) : "",
            name: assist.player ? assist.player.name || "" : "",
            short: assist.player ? assist.player.short || "" : "",
            type: assist.type,
            x: assist.location.x,
            y: assist.location.y,
            zoneId: assist.location.zoneId,
            zoneLabel: assist.location.zoneLabel,
          }
        : null,
    };
    trackerEvents = [event, ...trackerEvents];
    saveShots(trackerEvents);
    closeShotModal();
    resetTrackerDraft();
    renderShotTracker();
    const extra = event.assist
      ? ` (assist: ${event.assist.number ? (team === "opp" ? `Opp #${event.assist.number}` : firstName(event.assist.name) || `#${event.assist.number}`) : "untagged"})`
      : "";
    showToast(`${SHOT_RESULT_LABELS[result]} — ${playerLabel(shooter ? Object.assign({ team }, shooter) : null)}${extra}`);
  }

  function bindShotModal() {
    if (!shotModal || shotModal.dataset.bound === "1") return;
    shotModal.dataset.bound = "1";
    shotModal.addEventListener("click", (e) => {
      const playerBtn = e.target.closest("[data-player-number]");
      if (playerBtn) {
        const team = playerBtn.getAttribute("data-player-team") || recordingTeam();
        const number = playerBtn.getAttribute("data-player-number");
        shotModalDraft.player = findOnFieldPlayer(team, number);
        completeShotModal();
        return;
      }
      const actionBtn = e.target.closest("[data-action-id]");
      if (actionBtn) {
        const action = TRACKER_FIRST_ACTIONS.find(
          (a) => a.id === actionBtn.getAttribute("data-action-id")
        );
        if (!action) return;
        shotModalDraft.action = action;
        if (shouldAskPlayer()) {
          shotModalDraft.phase = "player";
          renderShotModal();
        } else {
          completeShotModal();
        }
      }
    });
    $("#shot-modal-back")?.addEventListener("click", () => {
      shotModalDraft.phase = "action";
      shotModalDraft.player = null;
      shotModalDraft.action = null;
      renderShotModal();
    });
    $("#shot-goto-lineup")?.addEventListener("click", () => {
      dismissShotModal();
      resetTrackerDraft();
      renderShotTracker();
      requestAnimationFrame(() => {
        $("#lineup-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    $$("[data-close-shot-modal]").forEach((el) =>
      el.addEventListener("click", () => {
        const openedAt = Number(shotModal.dataset.openedAt || 0);
        if (Date.now() - openedAt < 450) return;
        dismissShotModal();
      })
    );
  }

  function bindTrackerPitch() {
    const wrap = $("#tracker-pitch-wrap");
    const svg = $(".tracker-pitch-svg", wrap);
    if (!wrap || !svg) return;
    const recording =
      state.tracker.mode === "awaiting-location" ||
      state.tracker.mode === "awaiting-shot-location";
    wrap.classList.toggle("is-recording", recording);
    if (!recording) return;

    let lastTap = 0;
    const onTap = (evt) => {
      if (!shotModal.hidden) return;
      const now = Date.now();
      if (now - lastTap < 350) return;
      lastTap = now;
      evt.preventDefault();
      evt.stopPropagation();
      const p = svgEventPoint(svg, evt);
      const pitch = pitchFromSvgPoint(p.x, p.y);
      const loc = locatePitchPoint(pitch.x, pitch.y);
      if (state.tracker.mode === "awaiting-location") {
        fillShotModal("first", loc);
        renderShotTracker({ keepScroll: true });
      } else if (state.tracker.mode === "awaiting-shot-location") {
        fillShotModal("shot", loc);
        renderShotTracker({ keepScroll: true });
      }
    };
    svg.addEventListener("pointerup", onTap);
  }

  function trackerSummary(events) {
    const n = (result) => events.filter((e) => e.result === result).length;
    const assists = events.filter((e) => e.assist).length;
    return { goals: n("goal"), onTarget: n("on-target"), blocked: n("blocked"), missed: n("missed"), assists, total: events.length };
  }

  function eventPersonLabel(team, number, name, short) {
    if (number === undefined || number === null || String(number) === "") return "—";
    if (team === "opp") return `Opp #${number}`;
    if (short) return `#${number} ${short}`;
    const nick = firstName(name);
    return nick ? `#${number} ${nick}` : `#${number}`;
  }

  function shotTableRows(events) {
    if (!events.length) {
      return `<tr><td colspan="9" class="empty-state" style="padding:1.25rem">No plays yet.</td></tr>`;
    }
    return events
      .map((ev) => {
        const team = eventTeam(ev);
        const player = eventPersonLabel(team, ev.shooterNumber, ev.shooterName, ev.shooterShort);
        const assistBy = ev.assist
          ? eventPersonLabel(team, ev.assist.number, ev.assist.name, ev.assist.short)
          : "—";
        const assistType = ev.assist ? ASSIST_TYPE_LABELS[ev.assist.type] || ev.assist.type : "—";
        const assistCell = ev.assist
          ? `${escapeHtml(formatLoc(ev.assist))}<br /><span class="muted">${escapeHtml(formatXY(ev.assist))}</span>`
          : "—";
        return `
          <tr>
            <td>${escapeHtml(formatShotTime(ev.createdAt))}</td>
            <td><span class="team-chip ${team === "opp" ? "is-opp" : "is-us"}">${team === "opp" ? "Them" : "Us"}</span></td>
            <td>${escapeHtml(player)}</td>
            <td><span class="shot-result-pill ${escapeHtml(ev.result)}">${escapeHtml(SHOT_RESULT_LABELS[ev.result] || ev.result)}</span></td>
            <td>${escapeHtml(assistBy)}</td>
            <td>${escapeHtml(assistType)}</td>
            <td class="tracker-coord-cell">${escapeHtml(formatLoc(ev.shot))}<br /><span class="muted">${escapeHtml(formatXY(ev.shot))}</span></td>
            <td class="tracker-coord-cell">${assistCell}</td>
            <td><button type="button" class="icon-btn tracker-delete" data-delete-shot="${escapeHtml(ev.id)}" aria-label="Delete shot">×</button></td>
          </tr>`;
      })
      .join("");
  }

  function shotTableMarkup(title, events) {
    return `
      <h3 class="tracker-half-heading">${escapeHtml(title)}</h3>
      <div class="tracker-summary">
        ${summaryPills(trackerSummary(events))}
      </div>
      <div class="tracker-table-wrap">
        <table class="tracker-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Team</th>
              <th>Player</th>
              <th>Result</th>
              <th>Assisted by</th>
              <th>Assist type</th>
              <th>Shot location</th>
              <th>Assist location</th>
              <th><span class="sr-only">Delete</span></th>
            </tr>
          </thead>
          <tbody>${shotTableRows(events)}</tbody>
        </table>
      </div>`;
  }

  function summaryPills(sum) {
    return `
      <span class="pill">Plays <strong>${sum.total}</strong></span>
      <span class="pill">Goals <strong>${sum.goals}</strong></span>
      <span class="pill">On target <strong>${sum.onTarget}</strong></span>
      <span class="pill">Blocked <strong>${sum.blocked}</strong></span>
      <span class="pill">Missed <strong>${sum.missed}</strong></span>
      <span class="pill">Assists <strong>${sum.assists}</strong></span>`;
  }

  function toFullFieldPoint(loc, period, team) {
    const x = Number(loc.x);
    const y = Number(loc.y);
    const usAttacksRight = period !== 2 && period !== 4;
    const attacksRight = team === "opp" ? !usAttacksRight : usAttacksRight;
    if (!attacksRight) return { fx: y, fy: PW - x };
    return { fx: PL - y, fy: x };
  }

  function resultFill(result) {
    if (result === "goal") return "#f0c14b";
    if (result === "on-target") return "#ffffff";
    if (result === "blocked") return "#e07a3d";
    return "rgba(11,31,51,0.45)";
  }

  function fullFieldMarkup(events) {
    const line = "#f2f6f3";
    const goalW = 7.32;
    const goalY = (PW - goalW) / 2;
    const penW = 40.32;
    const penH = 16.5;
    const sixW = 18.32;
    const sixH = 5.5;
    const penY = (PW - penW) / 2;
    const sixY = (PW - sixW) / 2;
    const arcR = 9.15;
    const spotInset = 11;
    const dx = Math.sqrt(arcR * arcR - (penH - spotInset) * (penH - spotInset));
    const stripes = [];
    for (let i = 0; i < 6; i += 1) {
      stripes.push(
        `<rect fill="${i % 2 ? "#277047" : "#2d7a4a"}" x="${i * (PL / 6)}" y="0" width="${PL / 6}" height="${PW}" />`
      );
    }

    const markers = events
      .map((ev) => {
        const period = eventPeriod(ev);
        const team = eventTeam(ev);
        const shot = toFullFieldPoint(ev.shot, period, team);
        const stroke = team === "opp" ? "#c0392b" : ev.result === "missed" ? "#ffffff" : "#0b1f33";
        const numFill = team === "opp" || ev.result === "missed" ? "#ffffff" : "#0b1f33";
        let html = "";
        if (ev.assist) {
          const a = toFullFieldPoint(ev.assist, period, team);
          html += `<line x1="${a.fx}" y1="${a.fy}" x2="${shot.fx}" y2="${shot.fy}" stroke="rgba(255,255,255,0.85)" stroke-width="0.28" stroke-dasharray="1.1 0.7" fill="none" />`;
          html += `<circle cx="${a.fx}" cy="${a.fy}" r="0.85" fill="#7ec8e3" stroke="${team === "opp" ? "#c0392b" : "#0b1f33"}" stroke-width="0.2" />`;
        }
        html += `<circle cx="${shot.fx}" cy="${shot.fy}" r="1.65" fill="${resultFill(ev.result)}" stroke="${stroke}" stroke-width="${team === "opp" ? "0.42" : "0.28"}" />`;
        if (ev.shooterNumber !== undefined && ev.shooterNumber !== null && String(ev.shooterNumber) !== "") {
          html += `<text x="${shot.fx}" y="${shot.fy}" fill="${numFill}" font-size="1.25" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeHtml(String(ev.shooterNumber))}</text>`;
        }
        return html;
      })
      .join("");

    return `
      <svg id="shot-map-svg" class="shot-map-svg" viewBox="-3.2 -3.2 111.4 74.4" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Full-field shot map. 1st half attacks right, 2nd half attacks left.">
        ${stripes.join("")}
        <rect x="0" y="0" width="${PL}" height="${PW}" fill="none" stroke="${line}" stroke-width="0.45" />
        <line x1="${HALF_L}" y1="0" x2="${HALF_L}" y2="${PW}" stroke="${line}" stroke-width="0.4" />
        <circle cx="${HALF_L}" cy="${PW / 2}" r="9.15" fill="none" stroke="${line}" stroke-width="0.35" />
        <circle cx="${HALF_L}" cy="${PW / 2}" r="0.45" fill="${line}" />
        <rect x="-1.4" y="${goalY}" width="1.4" height="${goalW}" fill="none" stroke="${line}" stroke-width="0.45" />
        <rect x="${PL}" y="${goalY}" width="1.4" height="${goalW}" fill="none" stroke="${line}" stroke-width="0.45" />
        <rect x="0" y="${penY}" width="${penH}" height="${penW}" fill="none" stroke="${line}" stroke-width="0.35" />
        <rect x="${PL - penH}" y="${penY}" width="${penH}" height="${penW}" fill="none" stroke="${line}" stroke-width="0.35" />
        <rect x="0" y="${sixY}" width="${sixH}" height="${sixW}" fill="none" stroke="${line}" stroke-width="0.35" />
        <rect x="${PL - sixH}" y="${sixY}" width="${sixH}" height="${sixW}" fill="none" stroke="${line}" stroke-width="0.35" />
        <circle cx="${spotInset}" cy="${PW / 2}" r="0.45" fill="${line}" />
        <circle cx="${PL - spotInset}" cy="${PW / 2}" r="0.45" fill="${line}" />
        <path d="M ${penH} ${PW / 2 - dx} A ${arcR} ${arcR} 0 0 1 ${penH} ${PW / 2 + dx}" fill="none" stroke="${line}" stroke-width="0.35" />
        <path d="M ${PL - penH} ${PW / 2 - dx} A ${arcR} ${arcR} 0 0 0 ${PL - penH} ${PW / 2 + dx}" fill="none" stroke="${line}" stroke-width="0.35" />
        <text x="12" y="-1.15" fill="${line}" font-size="2.3" font-weight="750" text-anchor="middle">2nd HALF</text>
        <text x="${PL - 12}" y="-1.15" fill="${line}" font-size="2.3" font-weight="750" text-anchor="middle">1st HALF</text>
        ${markers}
      </svg>`;
  }

  function downloadSummaryImage() {
    const svg = $("#shot-map-svg");
    if (!svg) return;
    const clone = svg.cloneNode(true);
    clone.setAttribute("width", "1600");
    clone.setAttribute("height", String(Math.round(1600 * (74.4 / 111.4))));
    const xml = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = Math.round(1600 * (74.4 / 111.4));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#2d7a4a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((png) => {
        if (!png) {
          showToast("Could not save image");
          return;
        }
        const pngUrl = URL.createObjectURL(png);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `bengals-shot-map-${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(pngUrl), 1500);
        showToast("Shot map saved");
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast("Could not save image");
    };
    img.src = url;
  }

  function renderShotTracker(opts = {}) {
    bindShotModal();
    const scrollY = window.scrollY;
    const events = trackerEvents;
    const period = normalizePeriod(state.tracker.period);
    const etMode = period >= 3;
    const firstHalf = events.filter((e) => eventPeriod(e) === 1);
    const secondHalf = events.filter((e) => eventPeriod(e) === 2);
    const etOne = events.filter((e) => eventPeriod(e) === 3);
    const etTwo = events.filter((e) => eventPeriod(e) === 4);
    const showEtLog = etMode || etOne.length > 0 || etTwo.length > 0;
    const recording =
      state.tracker.mode === "awaiting-location" ||
      state.tracker.mode === "awaiting-shot-location";
    let status = `Add Play, then tap. ${periodLabel(period)} · ${recordingTeam() === "opp" ? "Them" : "Us"} · goal on the right.`;
    if (state.tracker.mode === "awaiting-location") {
      status = `Tap the pass or shot location · ${periodLabel(period)} · ${recordingTeam() === "opp" ? "Them" : "Us"}.`;
    } else if (state.tracker.mode === "awaiting-shot-location") {
      const a = state.tracker.pending?.assist;
      status = a
        ? `Assist: ${playerLabel(a.player ? Object.assign({ team: recordingTeam() }, a.player) : null)} (${ASSIST_TYPE_LABELS[a.type]}). Tap the shot.`
        : "Tap where the shot was taken.";
    }

    root.innerHTML = `
      <div class="tracker-page">
        <section class="tracker-stage">
          <div class="half-toggle" role="tablist" aria-label="Match period">
            ${
              etMode
                ? `<button type="button" class="half-toggle-btn ${period === 3 ? "is-on" : ""}" data-set-period="3">ET 1</button>
            <button type="button" class="half-toggle-btn ${period === 4 ? "is-on" : ""}" data-set-period="4">ET 2</button>
            <button type="button" class="half-toggle-btn is-et" data-et-toggle aria-label="Back to regular time">90</button>`
                : `<button type="button" class="half-toggle-btn ${period === 1 ? "is-on" : ""}" data-set-period="1">1st Half</button>
            <button type="button" class="half-toggle-btn ${period === 2 ? "is-on" : ""}" data-set-period="2">2nd Half</button>
            <button type="button" class="half-toggle-btn is-et" data-et-toggle aria-label="Extra time">ET</button>`
            }
          </div>
          <div class="half-toggle tracker-side-toggle" role="tablist" aria-label="Recording team">
            <button type="button" class="half-toggle-btn ${recordingTeam() === "us" ? "is-on" : ""}" data-set-team="us">Us</button>
            <button type="button" class="half-toggle-btn ${recordingTeam() === "opp" ? "is-on" : ""}" data-set-team="opp">Them</button>
          </div>
          <div class="tracker-toolbar">
            ${
              recording
                ? `<button type="button" class="btn btn-secondary" id="tracker-cancel-record">Cancel</button>`
                : `<button type="button" class="btn btn-primary" id="tracker-record">Add Play</button>`
            }
            <button type="button" class="btn btn-ghost" id="tracker-export" ${events.length ? "" : "disabled"}>CSV</button>
            <a class="btn btn-ghost" href="#shots-map">Game map</a>
            <button type="button" class="btn btn-ghost" id="tracker-toggle-grid">${state.tracker.showGrid ? "Hide zones" : "Zones"}</button>
          </div>
          <p class="tracker-status ${recording ? "is-live" : ""}" id="tracker-status">${escapeHtml(status)}</p>
          <div class="pitch-wrap tracker-pitch-wrap" id="tracker-pitch-wrap">${halfPitchMarkup(events, { showGrid: state.tracker.showGrid, period })}</div>
        </section>

        <section class="tracker-log" id="tracker-log">
          <h2>Recorded plays</h2>
          ${shotTableMarkup("1st Half", firstHalf)}
          ${shotTableMarkup("2nd Half", secondHalf)}
          ${showEtLog ? shotTableMarkup("ET 1", etOne) + shotTableMarkup("ET 2", etTwo) : ""}
          ${
            events.length
              ? `<button type="button" class="btn btn-ghost" id="tracker-clear">Clear results</button>`
              : ""
          }
        </section>

        ${lineupEditorMarkup()}
      </div>
    `;

    $("#tracker-record")?.addEventListener("click", () => {
      state.tracker.mode = "awaiting-location";
      state.tracker.pending = null;
      renderShotTracker();
    });
    $("#tracker-cancel-record")?.addEventListener("click", () => {
      closeShotModal();
      resetTrackerDraft();
      renderShotTracker();
    });
    $$("[data-set-team]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.getAttribute("data-set-team") === "opp" ? "opp" : "us";
        if (next === state.tracker.team) return;
        state.tracker.team = next;
        saveTrackerUi();
        resetTrackerDraft();
        closeShotModal();
        renderShotTracker({ keepScroll: true });
      });
    });
    $$("[data-set-period]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = normalizePeriod(btn.getAttribute("data-set-period"));
        if (next === state.tracker.period) return;
        state.tracker.period = next;
        saveTrackerUi();
        resetTrackerDraft();
        closeShotModal();
        renderShotTracker({ keepScroll: true });
      });
    });
    $("[data-et-toggle]")?.addEventListener("click", () => {
      state.tracker.period = period >= 3 ? 2 : 3;
      saveTrackerUi();
      resetTrackerDraft();
      closeShotModal();
      renderShotTracker({ keepScroll: true });
    });
    $("#tracker-toggle-grid")?.addEventListener("click", () => {
      state.tracker.showGrid = !state.tracker.showGrid;
      renderShotTracker({ keepScroll: true });
    });
    $("#tracker-export")?.addEventListener("click", () => exportShotsCsv());
    $("#tracker-clear")?.addEventListener("click", () => {
      if (!confirm("Clear all recorded shots on this device? This cannot be undone.")) return;
      trackerEvents = [];
      saveShots(trackerEvents);
      renderShotTracker({ keepScroll: true });
      showToast("Shots cleared");
    });
    $$("[data-delete-shot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-delete-shot");
        const ev = trackerEvents.find((e) => e.id === id);
        const label = ev
          ? `${SHOT_RESULT_LABELS[ev.result] || ev.result} by ${eventPersonLabel(eventTeam(ev), ev.shooterNumber, ev.shooterName, ev.shooterShort)}`
          : "this recording";
        if (!confirm(`Delete ${label}?`)) return;
        trackerEvents = trackerEvents.filter((e) => e.id !== id);
        saveShots(trackerEvents);
        renderShotTracker({ keepScroll: true });
      });
    });
    bindTrackerPitch();
    bindLineupEditor();
    if (opts.keepScroll) window.scrollTo(0, scrollY);
  }

  function renderShotMap() {
    const events = trackerEvents;
    const firstHalf = events.filter((e) => eventPeriod(e) === 1);
    const secondHalf = events.filter((e) => eventPeriod(e) === 2);
    const etOne = events.filter((e) => eventPeriod(e) === 3);
    const etTwo = events.filter((e) => eventPeriod(e) === 4);
    const hasEt = etOne.length > 0 || etTwo.length > 0;
    const vs = state.tracker.opponent || "";
    const dateLabel = new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    root.innerHTML = `
      <div class="shot-map-page">
        <div class="shot-map-actions no-print">
          <a class="btn btn-ghost" href="#shots">Back</a>
          <button type="button" class="btn btn-primary" id="shot-map-print">Print / PDF</button>
          <button type="button" class="btn btn-ghost" id="shot-map-save" ${events.length ? "" : "disabled"}>Save image</button>
        </div>
        <div class="shot-map-print" id="shot-map-print-root">
          <header class="shot-map-header">
            <h1>Brighton Bengals</h1>
            <p>
              <label class="no-print">vs
                <input type="text" id="shot-map-opponent" value="${escapeHtml(vs)}" placeholder="Opponent" />
              </label>
              <span class="shot-map-vs-print">${vs ? `vs ${escapeHtml(vs)}` : ""}</span>
              <span class="muted"> · ${escapeHtml(dateLabel)}</span>
            </p>
          </header>
          <div class="shot-map-pitch">${fullFieldMarkup(events)}</div>
          <p class="shot-map-caption">1st half and ET 1: we attack the right goal, they attack the left. 2nd half and ET 2 reverse. Gold = goal · White = on target · Orange = blocked · Hollow = missed · Blue dot = assist · Red ring = opponent.</p>
          <div class="shot-map-stats">
            <div>
              <h2>1st Half</h2>
              <div class="tracker-summary">${summaryPills(trackerSummary(firstHalf))}</div>
            </div>
            <div>
              <h2>2nd Half</h2>
              <div class="tracker-summary">${summaryPills(trackerSummary(secondHalf))}</div>
            </div>
            ${
              hasEt
                ? `<div>
              <h2>ET 1</h2>
              <div class="tracker-summary">${summaryPills(trackerSummary(etOne))}</div>
            </div>
            <div>
              <h2>ET 2</h2>
              <div class="tracker-summary">${summaryPills(trackerSummary(etTwo))}</div>
            </div>`
                : ""
            }
          </div>
        </div>
      </div>
    `;
    $("#shot-map-print")?.addEventListener("click", () => window.print());
    $("#shot-map-save")?.addEventListener("click", () => downloadSummaryImage());
    $("#shot-map-opponent")?.addEventListener("change", (e) => {
      state.tracker.opponent = e.target.value.trim();
      saveTrackerUi();
      const printVs = $(".shot-map-vs-print");
      if (printVs) printVs.textContent = state.tracker.opponent ? `vs ${state.tracker.opponent}` : "";
    });
  }

  /* ---------- Chrome: drawer, settings ---------- */
  function openDrawer(open) {
    const drawer = $("#nav-drawer");
    const btn = $("#menu-btn");
    state.drawerOpen = open;
    if (open) {
      drawer.hidden = false;
      requestAnimationFrame(() => drawer.classList.add("is-open"));
      btn.setAttribute("aria-expanded", "true");
    } else {
      drawer.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      setTimeout(() => {
        if (!state.drawerOpen) drawer.hidden = true;
      }, 220);
    }
  }

  $("#menu-btn")?.addEventListener("click", () => openDrawer(!state.drawerOpen));
  $$("[data-close-drawer]").forEach((el) =>
    el.addEventListener("click", () => openDrawer(false))
  );

  // Desktop flyouts: click toggle for touch; hover/focus-within via CSS
  $$("[data-flyout]").forEach((fly) => {
    const trigger = $(".nav-flyout-trigger", fly);
    if (!trigger || trigger.tagName === "A") return;
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const open = !fly.classList.contains("is-open");
      $$("[data-flyout]").forEach((f) => f.classList.remove("is-open"));
      $$(".nav-flyout-trigger[aria-expanded]").forEach((t) => t.setAttribute("aria-expanded", "false"));
      if (open) {
        fly.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-flyout]")) {
      $$("[data-flyout]").forEach((f) => f.classList.remove("is-open"));
      $$(".nav-flyout-trigger[aria-expanded]").forEach((t) => t.setAttribute("aria-expanded", "false"));
    }
  });

  const settingsModal = $("#settings-modal");
  $("#settings-btn")?.addEventListener("click", () => {
    settingsModal.hidden = false;
  });
  $$("[data-close-settings]").forEach((el) =>
    el.addEventListener("click", () => {
      settingsModal.hidden = true;
    })
  );
  $("#reset-progress-btn")?.addEventListener("click", () => {
    if (confirm("Reset all saved progress on this device?")) {
      state.progress = defaultProgress();
      saveProgress();
      settingsModal.hidden = true;
      render();
      showToast("Progress reset");
    }
  });
  $("#open-shot-tracker")?.addEventListener("click", () => {
    settingsModal.hidden = true;
    navigate("shots");
  });

  window.addEventListener("hashchange", () => {
    // Reset session when leaving a scenario unless challenge advancing
    const route = parseHash();
    if (route.view !== "shots") {
      closeShotModal();
      resetTrackerDraft();
    }
    if (route.view !== "scenario") {
      if (!(state.challenge && state.challenge.active && route.view === "challenge")) {
        // keep challenge state
      }
      if (route.view !== "scenario") state.session = null;
    } else if (state.session && state.session.scenario.id !== route.scenarioId) {
      state.session = null;
    }
    render();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (shotModal && !shotModal.hidden) {
      dismissShotModal();
    }
  });

  // Boot
  render();
})();
