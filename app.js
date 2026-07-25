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
    const list = moduleScenarios(moduleId);
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
  }

  /* ---------- Pitch SVG ---------- */
  function pitchMarkup(scenario, opts = {}) {
    const hideLabels = opts.hideLabels || false;
    const showCoachTargets = state.coach;
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
      <svg class="pitch-svg" viewBox="0 0 ${PW} ${PL}" role="img" aria-label="Tactical pitch diagram">
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
    // Classic small soccer ball (not a plain dot)
    return `
      <g class="ball" id="pitch-ball" data-x="${x}" data-y="${y}" transform="translate(${x},${y})">
        <circle class="ball-body" r="0.95" />
        <circle class="ball-pent" r="0.28" />
        <path class="ball-seam" d="M0,-0.95 Q0.55,-0.35 0.82,0.45 M0,-0.95 Q-0.55,-0.35 -0.82,0.45 M0.82,0.45 Q0,0.75 -0.82,0.45" />
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
    const role = hideLabels ? "" : (p.label || shortRole(p.role) || "");
    const roleText = role
      ? `<text class="token-role" x="0" y="3.1">${escapeHtml(role)}</text>`
      : "";
    // Smaller triangles so pitch scale reads clearly
    const shape = isOpp
      ? `<polygon class="token-disk" points="0,1.55 -1.45,-1.15 1.45,-1.15" />` // ▼
      : `<polygon class="token-disk" points="0,-1.55 -1.45,1.15 1.45,1.15" />`; // ▲
    const numY = isOpp ? "-0.15" : "0.45";
    return `
      <g class="${cls}" data-player-id="${escapeHtml(p.id)}" data-role="${escapeHtml(p.role || "")}" data-number="${escapeHtml(String(p.number))}" data-x="${p.x}" data-y="${p.y}" transform="translate(${p.x},${p.y})">
        ${shape}
        <text class="token-num" x="0" y="${numY}">${escapeHtml(String(p.number))}</text>
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

  function shortRole(role) {
    if (!role) return "";
    const map = {
      Goalkeeper: "GK",
      "Right fullback": "RFB",
      "Left fullback": "LFB",
      "Center back": "CB",
      "Defensive midfielder": "6",
      "Central midfielder": "8",
      "Attacking midfielder": "10",
      "Right winger": "RW",
      "Left winger": "LW",
      "Center forward": "9",
      "Wide point": "Wide",
      "Half-space point": "½-sp",
      "Deep support": "Deep",
      "Box threat": "Box",
      "Wide defender": "WD",
      "Far-side wide": "Far",
      Skittles: "Skit",
      Primary: "Pri",
      Secondary: "Sec",
      Spot: "Spt",
      Drop: "Drp",
      Block: "Blk",
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

    if (state.view === "home") renderHome();
    else if (state.view === "glossary") renderGlossary();
    else if (state.view === "challenge") renderChallenge();
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
        <p>Brighton Fresh/Soph Blue Team — see it, choose it, explain it. Train the 4-3-3 game model: transitions, five-lane occupation, wide combinations, man-oriented defending, and corner decisions.</p>
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
        if (p.completed && p.decisionCorrect) {
          status = "Complete";
          cls = "is-complete";
        } else if (p.needsReview || (p.attempts > 0 && !p.decisionCorrect)) {
          status = "Review";
          cls = "is-missed";
        } else if (p.attempts > 0) {
          status = "In progress";
        }
        const chapterLabel = ({
          "attack-the-moment": "Attack the moment",
          "create-2-3-5": "Create the 2-3-5",
          "wide-attack": "Wide attack",
          "defensive-responsibilities": "Part 1 · Matchups",
          "defend-4-4-2": "Part 2 · 4-4-2",
          "short-corners": "Part 1 · Short",
          "long-corners": "Part 2 · Long",
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
          <div class="pitch-wrap" id="pitch-wrap">${pitchMarkup(scenarioForPitch, { hideLabels })}</div>
        </div>

        <div class="panel-column">
          <div class="prompt-block">
            <p class="phase">${escapeHtml(s.phase || "")}</p>
            <h2>${escapeHtml(session.stage === "rationale" ? s.rationalePrompt || "Why?" : s.prompt)}</h2>
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
          <div class="match-status" id="match-status">Select one of our players, then the opponent she should mark.</div>
          <div class="alt-actions" style="margin-top:0.5rem">
            <button type="button" class="btn btn-ghost" id="match-undo">Undo last pair</button>
            <button type="button" class="btn btn-primary" id="match-submit">Check matchups</button>
          </div>
          <ul id="match-pairs-list" class="muted" style="margin:0.5rem 0 0;padding-left:1.1rem"></ul>
        `;
        $("#match-undo")?.addEventListener("click", () => {
          session.matchSelections.pop();
          updateMatchList();
        });
        $("#match-submit")?.addEventListener("click", () => submitMatch());
        updateMatchList();
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

  function handleMatchSelect(playerId) {
    const session = state.session;
    if (session.locked || session.stage !== "decision") return;
    const all = [].concat(session.scenario.players || [], session.scenario.opponents || []);
    const player = all.find((p) => p.id === playerId);
    if (!player) return;

    $$(".player-token").forEach((g) => g.classList.remove("is-selected"));
    const el = $(`[data-player-id="${playerId}"]`);
    if (!session._matchPick) {
      if (player.team !== "ours") {
        showToast("Select one of our players first");
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
      session.matchSelections = session.matchSelections.filter(
        (m) => m.defenderId !== session._matchPick && m.attackerId !== playerId
      );
      session.matchSelections.push({
        defenderId: session._matchPick,
        attackerId: playerId,
      });
      session._matchPick = null;
      $$(".player-token").forEach((g) => g.classList.remove("is-selected"));
      updateMatchList();
      $("#match-status").textContent = "Pair saved. Add another or check matchups.";
    }
  }

  function updateMatchList() {
    const ul = $("#match-pairs-list");
    if (!ul) return;
    const all = [].concat(
      state.session.scenario.players || [],
      state.session.scenario.opponents || []
    );
    ul.innerHTML = state.session.matchSelections
      .map((m) => {
        const d = all.find((p) => p.id === m.defenderId);
        const a = all.find((p) => p.id === m.attackerId);
        return `<li>Our #${d?.number} → Opp #${a?.number}</li>`;
      })
      .join("");
  }

  function submitMatch() {
    const s = state.session.scenario;
    const needed = s.matchPairs || [];
    const got = state.session.matchSelections;
    const ok =
      needed.length > 0 &&
      needed.every((n) =>
        got.some((g) => g.defenderId === n.defenderId && g.attackerId === n.attackerId)
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
    const reveal = ok || session.attempts >= 2 || session.challengeMode;

    if (!ok && session.attempts === 1 && allowHint) {
      session.locked = false;
      paintOptionStates();
      showFeedback("hint", s.hint || "Look again at the picture — who occupies which space?");
      renderScenarioActions();
      return;
    }

    session.locked = true;
    paintOptionStates();

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

    // Progress
    if (!session.challengeMode) {
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
      bits.push(
        `<button type="button" class="btn btn-ghost" id="replay-anim">Replay animation</button>`
      );
      if (next) bits.push(`<a class="btn btn-primary" href="#${escapeHtml(next.id)}">Next scenario</a>`);
      else bits.push(`<a class="btn btn-primary" href="#${escapeHtml(findModule(s.module).hash)}">Module complete</a>`);
      bits.push(`<a class="btn btn-secondary" href="#${escapeHtml(findModule(s.module).hash)}">Back to module</a>`);
    } else if (session.stage === "decision" && session.attempts > 0 && !session.decisionCorrect) {
      bits.push(`<p class="muted">Try another answer.</p>`);
    }
    el.innerHTML = bits.join("");
    $("#replay-anim")?.addEventListener("click", () => playAnimation(s.animationSteps || []));
  }

  /* ---------- Animation ---------- */
  function playAnimation(steps) {
    if (!steps.length) return;
    const animLayer = $("#pitch-anim");
    if (!animLayer) return;
    animLayer.innerHTML = "";

    const flatten = (list) => {
      list.forEach((step) => {
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
      defense: "Defensive responsibilities",
      "defending-shape": "4-4-2 defensive shape",
      corners: "Corners",
      "corners-short": "Short corners",
      "corners-long": "Long corners",
      attack: "Attacking shape",
      wide: "Wide attack",
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

  window.addEventListener("hashchange", () => {
    // Reset session when leaving a scenario unless challenge advancing
    const route = parseHash();
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

  // Boot
  render();
})();
