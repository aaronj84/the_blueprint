/**
 * Brighton Shot Tracker — Phase 2 UI (vanilla JS).
 *
 * Sideline recording is still tap-fast. Backend is additive.
 *
 * Out of scope (do not add here):
 *   - Per-coach accounts / attribution (PIN is shared access-gating only)
 *   - Audit trail / edit history on shots (silent overwrite is fine)
 *   - Offline-first sync / conflict resolution for spotty connectivity
 *   - Real-time multi-device live updates
 *   - xG, video integration, formation drawing
 *
 * Known gap: if a write fails, the play stays marked "not saved — check
 * connection" with a retry. Writes are not queued for later.
 */
(function (global) {
  "use strict";

  const IQ = global.SoccerIQ || {};
  const CONFIG = IQ.CONFIG || { pitch: { width: 68, length: 105 } };
  const API = global.ShotAPI;
  const PW = CONFIG.pitch.width;
  const PL = CONFIG.pitch.length;
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
  const OUTSIDE_BOX_DEPTHS = ["D", "AT", "HALF", "DEF"];
  const POSITION_CODES = ["GK", "LB", "LCB", "RCB", "RB", "DM", "LM", "RM", "LW", "CF", "RW"];
  const POSITION_SLOTS = [
    { id: 1, code: "GK", group: "GK" },
    { id: 2, code: "LB", group: "OB" },
    { id: 3, code: "LCB", group: "CB" },
    { id: 4, code: "RCB", group: "CB" },
    { id: 5, code: "RB", group: "OB" },
    { id: 6, code: "DM", group: "MID" },
    { id: 7, code: "LM", group: "MID" },
    { id: 8, code: "RM", group: "MID" },
    { id: 9, code: "LW", group: "FWD" },
    { id: 10, code: "CF", group: "FWD" },
    { id: 11, code: "RW", group: "FWD" },
  ];
  /** 4-3-3 pin map: attacking goal at top, % of pitch (card centers). */
  const FORMATION_LAYOUT = [
    { id: 9, code: "LW", x: 18, y: 11 },
    { id: 10, code: "CF", x: 50, y: 7 },
    { id: 11, code: "RW", x: 82, y: 11 },
    { id: 7, code: "LM", x: 28, y: 31 },
    { id: 8, code: "RM", x: 72, y: 31 },
    { id: 6, code: "DM", x: 50, y: 43 },
    { id: 2, code: "LB", x: 12, y: 61 },
    { id: 3, code: "LCB", x: 36, y: 57 },
    { id: 4, code: "RCB", x: 64, y: 57 },
    { id: 5, code: "RB", x: 88, y: 61 },
    { id: 1, code: "GK", x: 50, y: 87 },
  ];
  const POSITION_GROUPS = [
    { id: "GK", label: "GK" },
    { id: "OB", label: "Outside backs" },
    { id: "CB", label: "Center backs" },
    { id: "MID", label: "Mids" },
    { id: "FWD", label: "Forwards" },
  ];
  const GROUP_FOR_CODE = Object.fromEntries(POSITION_SLOTS.map((s) => [s.code, s.group]));
  /** Jersey → position groups (for Sub / lineup dropdown ordering) */
  const DEFAULT_POSITION_GROUPS = {
    "1": ["GK"], // Lilah
    "19": ["CB"], // Jane
    "20": ["CB"], // Shai
    "11": ["CB"], // Tae
    "33": ["CB", "OB"], // Finley
    "15": ["OB", "MID"], // Saige
    "2": ["OB", "MID"], // Maddie
    "8": ["OB", "FWD"], // Addison
    "9": ["OB", "FWD"], // Georgia
    "24": ["MID", "FWD"], // Savvy
    "17": ["MID"], // Jackie
    "26": ["MID"], // Sharky
    "18": ["MID"], // Stella
    "25": ["MID"], // Grace
    "32": ["FWD"], // Ari
    "13": ["FWD"], // Kailee
    "29": ["FWD"], // Abby
    "5": ["FWD"], // Kate
    "27": ["FWD"], // Natalia
  };
  /** Default 4-3-3 XI: back→front, left→right */
  const DEFAULT_XI_JERSEYS = [
    { slot: 1, code: "GK", number: "1" }, // Lilah
    { slot: 2, code: "LB", number: "15" }, // Saige
    { slot: 3, code: "LCB", number: "20" }, // Shai
    { slot: 4, code: "RCB", number: "19" }, // Jane
    { slot: 5, code: "RB", number: "2" }, // Maddie
    { slot: 6, code: "DM", number: "24" }, // Savvy
    { slot: 7, code: "LM", number: "17" }, // Jackie
    { slot: 8, code: "RM", number: "26" }, // Sharky
    { slot: 9, code: "LW", number: "9" }, // Georgia
    { slot: 10, code: "CF", number: "13" }, // Kailee
    { slot: 11, code: "RW", number: "32" }, // Ari
  ];
  const GAME_TYPES = ["preseason", "region", "playoffs", "friendly", "other"];
  const SHOT_RESULT_LABELS = {
    goal: "Goal",
    "on-target": "Shot on Goal",
    blocked: "Shot Blocked",
    missed: "Missed Shot",
    foul: "Foul",
    corner: "Corner",
    "pk-goal": "PK Goal",
    "pk-missed": "PK Missed",
  };
  const MISS_DIRECTION_LABELS = {
    over: "Over",
    short: "Short",
    "wide-left": "Wide left",
    "wide-right": "Wide right",
  };
  const MISS_DIRECTIONS = ["over", "short", "wide-left", "wide-right"];
  const ASSIST_TYPE_LABELS = { pass: "Pass", gap: "Gap", cross: "Cross" };
  const TRACKER_ASSIST_ACTIONS = [
    { id: "assist-pass", label: "Assist — Pass", kind: "assist", type: "pass" },
    { id: "assist-gap", label: "Assist — Gap", kind: "assist", type: "gap" },
    { id: "assist-cross", label: "Assist — Cross", kind: "assist", type: "cross" },
  ];
  const TRACKER_SHOT_ACTIONS = [
    { id: "goal", label: "Goal", kind: "shot", result: "goal" },
    { id: "on-target", label: "Shot on Goal", kind: "shot", result: "on-target" },
    { id: "blocked", label: "Shot Blocked", kind: "shot", result: "blocked" },
    { id: "missed", label: "Missed Shot", kind: "shot", result: "missed" },
  ];
  const TRACKER_OTHER_ACTIONS = [
    { id: "foul", label: "Foul", kind: "shot", result: "foul" },
    { id: "corner", label: "Corner", kind: "shot", result: "corner" },
    { id: "pk-goal", label: "PK Goal", kind: "shot", result: "pk-goal" },
    { id: "pk-missed", label: "PK Missed", kind: "shot", result: "pk-missed" },
  ];
  const TRACKER_FIRST_ACTIONS = [...TRACKER_ASSIST_ACTIONS, ...TRACKER_SHOT_ACTIONS, ...TRACKER_OTHER_ACTIONS];
  const RESULTS_NEEDING_MISS_DIR = new Set(["missed", "pk-missed"]);
  const LS_EVENTS = CONFIG.shotsStorageKey || "brighton-varsity-shot-tracker";
  const LS_UI_V1 = "brighton-varsity-shot-tracker-ui";
  const LS_UI_V2 = "brighton-varsity-shot-tracker-ui-v2";
  const LS_LINEUP = "brighton-varsity-shot-tracker-lineup";
  const LS_DEFAULT_LINEUP = "brighton-varsity-shot-tracker-default-lineup";
  const NICK = { Madeline: "Maddie", Abigail: "Abby", Jaqueline: "Jackie", Ariana: "Ari", Charlotte: "Sharky" };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const root = () => $("#app-root");
  const shotModal = $("#shot-event-modal");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(text) {
    const el = $("#role-toast");
    if (!el) return;
    el.textContent = text;
    el.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove("is-visible"), 2200);
  }

  function loadUi() {
    try {
      return JSON.parse(localStorage.getItem(LS_UI_V2) || "{}") || {};
    } catch {
      return {};
    }
  }

  function saveUi() {
    localStorage.setItem(
      LS_UI_V2,
      JSON.stringify({
        period: st.period,
        team: st.team,
        showGrid: st.showGrid,
        swapSides: st.swapSides,
        seasonId: st.seasonId,
        gameId: st.gameId,
      })
    );
    if (st.seasonId) sessionStorage.setItem("shots-season-id", st.seasonId);
    if (st.gameId) sessionStorage.setItem("shots-game-id", st.gameId);
  }

  function loadLineupBag() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LS_LINEUP) || "{}") || {};
      return {
        set: !!parsed.set,
        edit: parsed.edit === "opp" ? "opp" : "us",
        us: parsed.us && typeof parsed.us === "object" ? parsed.us : {},
        opp: parsed.opp && typeof parsed.opp === "object" ? parsed.opp : {},
      };
    } catch {
      return { set: false, edit: "us", us: {}, opp: {} };
    }
  }

  function saveLineupBag() {
    localStorage.setItem(
      LS_LINEUP,
      JSON.stringify({
        set: st.lineup.set,
        edit: st.lineup.edit,
        us: st.lineup.us,
        opp: st.lineup.opp,
      })
    );
  }

  function loadDefaultLineup() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LS_DEFAULT_LINEUP) || "{}") || {};
      return parsed.us && typeof parsed.us === "object" ? { us: parsed.us } : { us: {} };
    } catch {
      return { us: {} };
    }
  }

  function saveDefaultLineupBag(bag) {
    localStorage.setItem(LS_DEFAULT_LINEUP, JSON.stringify({ us: bag || {} }));
  }

  const savedUi = loadUi();
  const savedLineup = loadLineupBag();
  const st = {
    view: "shots",
    booted: false,
    booting: false,
    session: null,
    pinError: "",
    loading: false,
    error: "",
    teams: [],
    seasons: [],
    games: [],
    game: null,
    seasonId: savedUi.seasonId || sessionStorage.getItem("shots-season-id") || "",
    gameId: savedUi.gameId || sessionStorage.getItem("shots-game-id") || "",
    ourRoster: [],
    oppRoster: [],
    shots: [],
    namedPlayers: [],
    mode: "idle",
    pending: null,
    showGrid: savedUi.showGrid !== false,
    period: normalizePeriod(savedUi.period || "1"),
    team: savedUi.team === "opp" ? "opp" : "us",
    swapSides: !!savedUi.swapSides,
    lineup: savedLineup,
    defaultLineup: loadDefaultLineup(),
    csvPending: null,
    importOpen: false,
    history: { seasonId: "", playerId: "", opponentId: "", depth: "", rows: null, loading: false },
  };

  const shotModalDraft = {
    step: "first",
    phase: "action",
    location: null,
    player: null,
    action: null,
    position: "",
    missDirection: "",
    subSlotId: null,
    justAddedNumber: "",
  };

  function normalizePeriod(p) {
    if (p === 3 || p === "3" || p === "ET1") return "ET1";
    if (p === 4 || p === "4" || p === "ET2") return "ET2";
    if (p === 2 || p === "2") return "2";
    return "1";
  }

  function periodLabel(period) {
    const p = normalizePeriod(period);
    if (p === "2") return "2nd Half";
    if (p === "ET1") return "ET 1";
    if (p === "ET2") return "ET 2";
    return "1st Half";
  }

  function periodCsv(period) {
    return normalizePeriod(period);
  }

  function eventPeriod(ev) {
    return normalizePeriod(ev && ev.period);
  }

  function brighton() {
    return st.teams.find((t) => t.is_brighton) || null;
  }

  function teamById(id) {
    return st.teams.find((t) => t.id === id) || null;
  }

  function opponentOf(game) {
    if (!game) return null;
    const b = brighton();
    if (!b) return game.away_team || teamById(game.away_team_id);
    if (game.home_team_id === b.id) return game.away_team || teamById(game.away_team_id);
    return game.home_team || teamById(game.home_team_id);
  }

  function recordingTeam() {
    return st.team === "opp" ? "opp" : "us";
  }

  function recordingTeamId() {
    const b = brighton();
    if (recordingTeam() === "us") return b ? b.id : st.game?.our_team_id;
    const opp = opponentOf(st.game);
    return opp ? opp.id : null;
  }

  function teamLabel(team, ev) {
    if (team === "opp") {
      if (ev?.opponentName) return ev.opponentName;
      const opp = opponentOf(st.game);
      return opp ? opp.name : "Opponent";
    }
    return "Brighton";
  }

  function eventTeam(ev) {
    return ev && ev.team === "opp" ? "opp" : "us";
  }

  function lineupIsSet() {
    return !!st.lineup?.set;
  }

  function slotPlayer(team, slotId) {
    const bag = team === "opp" ? st.lineup.opp : st.lineup.us;
    return (bag && bag[String(slotId)]) || null;
  }

  function onFieldPlayers(team) {
    return POSITION_SLOTS.map((slot) => {
      const p = slotPlayer(team, slot.id);
      if (!p) return null;
      return Object.assign({ slot: slot.id, slotCode: slot.code, team }, p);
    }).filter(Boolean);
  }

  function formationPitchShell(cardsHtml, extrasHtml = "") {
    return `
      <div class="formation-pitch" role="group" aria-label="4-3-3 formation">
        <div class="formation-pitch-lines" aria-hidden="true">
          <span class="fp-outline"></span>
          <span class="fp-halfway"></span>
          <span class="fp-circle"></span>
          <span class="fp-box fp-box-att"></span>
          <span class="fp-six fp-six-att"></span>
          <span class="fp-box fp-box-def"></span>
          <span class="fp-six fp-six-def"></span>
        </div>
        ${cardsHtml}
      </div>
      ${extrasHtml || ""}`;
  }

  function formationCardStyle(layout) {
    return `left:${layout.x}%;top:${layout.y}%`;
  }

  function formationMeta(slotCode, player) {
    if (player && player.number != null && player.number !== "") {
      return `${escapeHtml(String(player.number))} · ${escapeHtml(slotCode)}`;
    }
    return escapeHtml(slotCode);
  }

  function usedLineupNumbers(team, exceptSlot) {
    const used = new Set();
    POSITION_SLOTS.forEach((slot) => {
      if (exceptSlot && slot.id === exceptSlot) return;
      const p = slotPlayer(team, slot.id);
      if (p) used.add(String(p.number));
    });
    return used;
  }

  function assignSlot(team, slotId, player) {
    const key = team === "opp" ? "opp" : "us";
    if (!st.lineup[key] || typeof st.lineup[key] !== "object") st.lineup[key] = {};
    if (!player) delete st.lineup[key][String(slotId)];
    else st.lineup[key][String(slotId)] = player;
    saveLineupBag();
  }

  function defaultLineupCount() {
    return Object.keys(st.defaultLineup.us || {}).length;
  }

  function saveCurrentAsDefault() {
    const copy = {};
    Object.keys(st.lineup.us || {}).forEach((k) => {
      copy[k] = Object.assign({}, st.lineup.us[k]);
    });
    st.defaultLineup = { us: copy };
    saveDefaultLineupBag(copy);
    showToast("Default starting lineup saved");
  }

  function restoreDefaultLineup() {
    let bag = st.defaultLineup.us || {};
    if (!Object.keys(bag).length) {
      bag = buildDefaultXiFromRoster();
      if (Object.keys(bag).length < 11) {
        showToast("No default lineup saved yet");
        return;
      }
      st.defaultLineup = { us: Object.assign({}, bag) };
      saveDefaultLineupBag(bag);
    }
    st.lineup.us = {};
    Object.keys(bag).forEach((k) => {
      st.lineup.us[k] = Object.assign({}, bag[k]);
    });
    st.lineup.set = true;
    saveLineupBag();
    showToast("Restored default starting lineup");
    draw({ keepScroll: true });
  }

  function playerWhoLabel(action) {
    if (!action) return "Who?";
    if (action.result === "foul") return "Who fouled?";
    if (action.result === "corner") return "Who took the corner?";
    if (action.result === "pk-goal" || action.result === "pk-missed") return "Who took the PK?";
    if (action.kind === "assist") return "Who assisted?";
    return "Who shot?";
  }

  function needsMissDirection(action) {
    return !!(action && RESULTS_NEEDING_MISS_DIR.has(action.result));
  }

  function firstName(full) {
    const raw = String(full || "").trim().split(/\s+/)[0] || "";
    return NICK[raw] || raw;
  }

  function playerDisplayName(p) {
    if (!p) return "";
    if (p.short || p.short_name) return p.short || p.short_name;
    if (p.name) return firstName(p.name);
    const num = p.jersey_number || p.number;
    return num != null && String(num) !== "" ? `#${num}` : "Unknown";
  }

  function playerLabel(p) {
    if (!p) return "untagged";
    if (p.team === "opp" && !p.name && !p.short && !p.short_name) return `Opp #${p.number || p.jersey_number}`;
    return playerDisplayName(p);
  }

  function rosterPlayers(team) {
    const rows = team === "opp" ? st.oppRoster : st.ourRoster;
    return rows.map((r) => {
      const number = String(r.jersey_number || "");
      const fromDb = Array.isArray(r.player?.position_groups) ? r.player.position_groups.filter(Boolean) : [];
      const fromDefaults = DEFAULT_POSITION_GROUPS[number] || [];
      return {
        id: r.player_id || r.player?.id,
        rosterId: r.id,
        number: r.jersey_number,
        jersey_number: r.jersey_number,
        name: r.player?.name || null,
        short: r.player?.short_name || null,
        short_name: r.player?.short_name || null,
        squad: r.squad === "jv" ? "jv" : "varsity",
        positionGroups: fromDb.length ? fromDb.slice() : fromDefaults.slice(),
        team,
      };
    });
  }

  function sortPlayers(list) {
    return list.slice().sort((a, b) => {
      const aJv = a.squad === "jv" ? 1 : 0;
      const bJv = b.squad === "jv" ? 1 : 0;
      if (aJv !== bJv) return aJv - bJv;
      const aNamed = !!(a.name || a.short || a.short_name);
      const bNamed = !!(b.name || b.short || b.short_name);
      if (aNamed !== bNamed) return aNamed ? -1 : 1;
      const byName = playerDisplayName(a).localeCompare(playerDisplayName(b), undefined, { sensitivity: "base" });
      if (byName) return byName;
      return String(a.number || "").localeCompare(String(b.number || ""), undefined, { numeric: true });
    });
  }

  function normalizePositionCode(code) {
    if (code === "CM") return "RM";
    if (code === "AM") return "LM";
    return code || "";
  }

  function playerInGroup(p, groupId) {
    if (!groupId || !p) return false;
    return (p.positionGroups || []).includes(groupId);
  }

  function groupForSlot(slotId) {
    const slot = POSITION_SLOTS.find((s) => s.id === Number(slotId));
    return slot?.group || GROUP_FOR_CODE[slot?.code] || "";
  }

  function buildDefaultXiFromRoster() {
    const bag = {};
    DEFAULT_XI_JERSEYS.forEach((row) => {
      const p = rosterPlayers("us").find((x) => String(x.number) === String(row.number));
      if (!p) return;
      bag[String(row.slot)] = {
        id: p.id || "",
        number: String(p.number),
        name: p.name || "",
        short: p.short || p.short_name || "",
      };
    });
    return bag;
  }

  function seedDefaultLineupIfEmpty() {
    if (Object.keys(st.defaultLineup.us || {}).length) return;
    if (!st.ourRoster.length) return;
    const bag = buildDefaultXiFromRoster();
    if (Object.keys(bag).length < 11) return;
    st.defaultLineup = { us: bag };
    saveDefaultLineupBag(bag);
    if (!Object.keys(st.lineup.us || {}).length) {
      st.lineup.us = Object.assign({}, bag);
      st.lineup.set = true;
      saveLineupBag();
    }
  }

  function jerseyChoices() {
    return ["00", "0"].concat(Array.from({ length: 99 }, (_, i) => String(i + 1)));
  }

  function localEvents() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LS_EVENTS) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function localUiV1() {
    try {
      return JSON.parse(localStorage.getItem(LS_UI_V1) || "{}") || {};
    } catch {
      return {};
    }
  }

  function mapShot(row) {
    if (row._view) return row;
    const b = brighton();
    const team = b && row.team_id === b.id ? "us" : "opp";
    const roster = team === "us" ? st.ourRoster : st.oppRoster;
    const assistJersey = row.assist_player_id
      ? roster.find((r) => r.player_id === row.assist_player_id)?.jersey_number || ""
      : "";
    return {
      id: row.id,
      createdAt: row.created_at,
      period: normalizePeriod(row.period),
      team,
      team_id: row.team_id,
      player_id: row.player_id || null,
      shooterNumber: row.jersey_number_at_time || "",
      shooterName: row.player?.name || "",
      shooterShort: row.player?.short_name || "",
      position: normalizePositionCode(row.position || ""),
      result: row.result,
      missDirection: row.miss_direction || "",
      saveFailed: !!row.saveFailed,
      pendingPayload: row.pendingPayload || null,
      shot: {
        x: Number(row.x),
        y: Number(row.y),
        zoneId: row.zone_id,
        zoneLabel: row.zone_label,
      },
      assist: row.assist_type
        ? {
            player_id: row.assist_player_id || null,
            number: assistJersey,
            name: row.assist_player?.name || "",
            short: row.assist_player?.short_name || "",
            type: row.assist_type,
            position: normalizePositionCode(row.assist_position || ""),
            x: Number(row.assist_x),
            y: Number(row.assist_y),
            zoneId: row.assist_zone_id,
            zoneLabel: row.assist_zone_label,
          }
        : null,
    };
  }

  async function refreshMeta() {
    st.teams = await API.teams();
    st.seasons = await API.seasons();
    if (!st.seasonId && st.seasons[0]) st.seasonId = st.seasons[0].id;
    st.games = st.seasonId ? await API.games(st.seasonId) : await API.games();
    try {
      st.namedPlayers = await API.namedPlayers();
    } catch {
      st.namedPlayers = [];
    }
  }

  async function loadGameContext() {
    if (!st.gameId) {
      st.game = null;
      st.ourRoster = [];
      st.oppRoster = [];
      st.shots = [];
      return;
    }
    st.game = await API.game(st.gameId);
    st.seasonId = st.game.season_id;
    const b = brighton();
    const opp = opponentOf(st.game);
    st.ourRoster = b ? await API.roster(b.id, st.game.season_id) : [];
    st.oppRoster = opp ? await API.roster(opp.id, st.game.season_id) : [];
    seedDefaultLineupIfEmpty();
    const rows = await API.shotsForGame(st.gameId);
    st.shots = rows.map(mapShot);
    saveUi();
  }

  async function boot() {
    if (st.booting) return;
    st.booting = true;
    try {
      if (!API || !API.isConfigured()) {
        st.booted = true;
        draw();
        return;
      }
      st.session = await API.getSession();
      if (st.session) {
        st.loading = true;
        draw();
        try {
          await refreshMeta();
          if (st.gameId) await loadGameContext();
        } catch (err) {
          st.error = err.message || "Could not load data";
        }
        st.loading = false;
      }
      st.booted = true;
      draw();
    } finally {
      st.booting = false;
    }
  }

  function trackerNav() {
    return "";
  }

  function gameTitle(game) {
    if (!game) return "No game selected";
    const home = game.home_team?.name || "Home";
    const away = game.away_team?.name || "Away";
    const d = game.date ? String(game.date).slice(0, 10) : "";
    return `${d} · ${home} vs ${away}`;
  }

  function renderSetup() {
    root().innerHTML = `
      <div class="shots-gate">
        <h1>Shot tracker setup</h1>
        <p>Create a Supabase project, run <code>supabase/schema.sql</code>, enable Anonymous auth, then put the project URL and anon key in <code>shots-config.js</code>.</p>
        <p class="muted">PIN is the shared staff gate (default KEPPA). It is not per-coach security.</p>
        <a class="btn btn-secondary" href="#home">Back</a>
      </div>`;
  }

  function renderPin() {
    root().innerHTML = `
      <div class="shots-gate">
        <h1>Shot tracker</h1>
        <p>Enter the staff PIN to continue.</p>
        <form id="shots-pin-form" class="shots-pin-form">
          <label class="sr-only" for="shots-pin">PIN</label>
          <input id="shots-pin" class="text-gate-input" type="password" inputmode="text" autocomplete="off" maxlength="16" />
          <button type="submit" class="btn btn-primary">Open tracker</button>
        </form>
        ${st.pinError ? `<p class="shots-error">${escapeHtml(st.pinError)}</p>` : ""}
      </div>`;
    $("#shots-pin-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const value = $("#shots-pin").value;
      st.pinError = "";
      const result = await API.signInWithPin(value);
      if (!result.ok) {
        st.pinError = result.error;
        renderPin();
        return;
      }
      st.session = result.session;
      st.loading = true;
      draw();
      try {
        await refreshMeta();
        if (st.gameId) await loadGameContext();
      } catch (err) {
        st.error = err.message || "Could not load data";
      }
      st.loading = false;
      draw();
    });
    requestAnimationFrame(() => $("#shots-pin")?.focus());
  }

  function renderLoading(msg) {
    root().innerHTML = `<div class="shots-gate"><p>${escapeHtml(msg || "Loading…")}</p></div>`;
  }

  async function selectSeason(id) {
    st.seasonId = id;
    st.games = id ? await API.games(id) : await API.games();
    saveUi();
    draw();
  }

  async function selectGame(id) {
    st.gameId = id;
    st.loading = true;
    draw();
    try {
      await loadGameContext();
      st.error = "";
    } catch (err) {
      st.error = err.message || "Could not open game";
    }
    st.loading = false;
    if (location.hash.replace(/^#/, "") !== "shots") location.hash = "shots";
    else draw();
  }

  function parseCsvLine(line) {
    const out = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else if (ch === '"') inQ = false;
        else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  }

  function parseCsvDate(value) {
    const t = String(value || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
    return t;
  }

  function parseScheduleCsv(text) {
    const raw = String(text || "").replace(/^\uFEFF/, "");
    const lines = raw.split(/\r\n|\n|\r/).filter((l) => l.trim());
    if (!lines.length) throw new Error("CSV is empty");
    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
    const expected = ["date", "home_team", "away_team", "season_label", "game_type"];
    const hasHeader = expected.every((k, i) => header[i] === k);
    const start = hasHeader ? 1 : 0;
    const rows = [];
    for (let i = start; i < lines.length; i += 1) {
      const cols = parseCsvLine(lines[i]);
      if (cols.every((c) => !c)) continue;
      const [date, home_team, away_team, season_label, game_type] = cols;
      const gt = String(game_type || "other").trim().toLowerCase();
      if (!GAME_TYPES.includes(gt)) {
        throw new Error(`Row ${i + 1}: game_type must be ${GAME_TYPES.join(" / ")}`);
      }
      rows.push({
        date: parseCsvDate(String(date || "").trim()),
        home_team: String(home_team || "").trim(),
        away_team: String(away_team || "").trim(),
        season_label: String(season_label || "").trim(),
        game_type: gt,
      });
    }
    if (!rows.length) throw new Error("No game rows found");
    return rows;
  }

  function newTeamNames(rows) {
    const known = new Set(st.teams.map((t) => t.name.toLowerCase()));
    const names = [];
    rows.forEach((r) => {
      [r.home_team, r.away_team].forEach((n) => {
        if (n && !known.has(n.toLowerCase()) && !names.some((x) => x.toLowerCase() === n.toLowerCase())) {
          names.push(n);
        }
      });
    });
    return names;
  }

  async function importScheduleRows(rows, createNames) {
    for (const name of createNames) {
      await API.createTeam(name);
    }
    await refreshMeta();
    const b = brighton();
    if (!b) throw new Error("Brighton team is missing. Re-run schema.sql.");
    const byName = (n) => st.teams.find((t) => t.name.toLowerCase() === n.toLowerCase());
    const bySeason = (label) => st.seasons.find((s) => s.label.toLowerCase() === label.toLowerCase());
    let created = 0;
    for (const row of rows) {
      let season = bySeason(row.season_label);
      if (!season) {
        const year = Number(String(row.season_label).slice(0, 4)) || new Date().getFullYear();
        season = await API.createSeason(year, row.season_label);
        st.seasons.push(season);
      }
      const home = byName(row.home_team);
      const away = byName(row.away_team);
      if (!home || !away) throw new Error(`Unknown team in ${row.date} ${row.home_team} vs ${row.away_team}`);
      if (home.id !== b.id && away.id !== b.id) {
        throw new Error(`${row.home_team} vs ${row.away_team} does not include Brighton`);
      }
      await API.createGame({
        season_id: season.id,
        date: row.date,
        game_type: row.game_type,
        home_team_id: home.id,
        away_team_id: away.id,
        our_team_id: b.id,
      });
      created += 1;
    }
    st.seasonId = st.seasonId || st.seasons[0]?.id || "";
    st.games = await API.games(st.seasonId);
    st.csvPending = null;
    showToast(`Imported ${created} game${created === 1 ? "" : "s"}`);
    draw();
  }

  async function createGameFromForm() {
    const date = $("#new-game-date").value;
    const type = $("#new-game-type").value;
    let seasonId = $("#new-game-season").value;
    const newSeasonLabel = $("#new-season-label")?.value.trim();
    if (seasonId === "__new__") {
      if (!newSeasonLabel) throw new Error("Enter a season label");
      const year = Number($("#new-season-year")?.value) || new Date().getFullYear();
      const season = await API.createSeason(year, newSeasonLabel);
      seasonId = season.id;
      st.seasons.unshift(season);
    }
    const pickTeam = async (selId, newId) => {
      const v = $(selId).value;
      if (v === "__new__") {
        const name = $(newId).value.trim();
        if (!name) throw new Error("Enter a team name");
        const team = await API.createTeam(name);
        st.teams.push(team);
        return team.id;
      }
      return v;
    };
    const homeId = await pickTeam("#new-game-home", "#new-home-name");
    const awayId = await pickTeam("#new-game-away", "#new-away-name");
    const b = brighton();
    if (!date || !seasonId || !homeId || !awayId) throw new Error("Date, season, and both teams are required");
    if (homeId === awayId) throw new Error("Home and away must be different");
    if (!b || (homeId !== b.id && awayId !== b.id)) throw new Error("Brighton must be home or away");
    const game = await API.createGame({
      season_id: seasonId,
      date,
      game_type: type,
      home_team_id: homeId,
      away_team_id: awayId,
      our_team_id: b.id,
    });
    st.seasonId = seasonId;
    await selectGame(game.id);
  }

  async function importLocalStorageGame() {
    const events = localEvents();
    if (!events.length) throw new Error("No saved game on this device");
    const date = $("#import-date").value;
    const seasonId = $("#import-season").value;
    const oppName = $("#import-opponent").value.trim() || localUiV1().opponent || "Imported opponent";
    const type = $("#import-type").value;
    if (!date || !seasonId) throw new Error("Pick a date and season");
    const b = brighton();
    let opp = st.teams.find((t) => t.name.toLowerCase() === oppName.toLowerCase());
    if (!opp) opp = await API.createTeam(oppName);
    await refreshMeta();
    opp = st.teams.find((t) => t.name.toLowerCase() === oppName.toLowerCase());
    const game = await API.createGame({
      season_id: seasonId,
      date,
      game_type: type,
      home_team_id: b.id,
      away_team_id: opp.id,
      our_team_id: b.id,
    });
    st.gameId = game.id;
    await loadGameContext();
    for (const ev of events) {
      if (ev.shot == null || ev.shot.x == null || ev.shot.y == null) continue;
      const team = ev.team === "opp" ? "opp" : "us";
      const teamId = team === "us" ? b.id : opp.id;
      let playerId = null;
      let jersey = ev.shooterNumber ? String(ev.shooterNumber) : null;
      if (jersey) {
        const name = team === "us" ? ev.shooterName || null : null;
        const roster = await API.ensureRosterPlayer(teamId, seasonId, jersey, name);
        playerId = roster.player_id;
        if (team === "us") st.ourRoster = await API.roster(b.id, seasonId);
        else st.oppRoster = await API.roster(opp.id, seasonId);
      }
      let assistPlayerId = null;
      if (ev.assist?.number) {
        const aName = team === "us" ? ev.assist.name || null : null;
        const aRoster = await API.ensureRosterPlayer(teamId, seasonId, String(ev.assist.number), aName);
        assistPlayerId = aRoster.player_id;
      }
      const row = {
        game_id: game.id,
        period: normalizePeriod(ev.period),
        team_id: teamId,
        player_id: playerId,
        jersey_number_at_time: jersey,
        position: null,
        x: ev.shot?.x,
        y: ev.shot?.y,
        zone_id: ev.shot?.zoneId || null,
        zone_label: ev.shot?.zoneLabel || null,
        result: ev.result,
        assist_player_id: assistPlayerId,
        assist_type: ev.assist?.type || null,
        assist_x: ev.assist ? ev.assist.x : null,
        assist_y: ev.assist ? ev.assist.y : null,
        assist_zone_id: ev.assist ? ev.assist.zoneId : null,
        assist_zone_label: ev.assist ? ev.assist.zoneLabel : null,
        created_at: ev.createdAt || new Date().toISOString(),
      };
      const saved = await API.insertShot(row);
      if (!saved.ok) throw new Error(saved.error);
    }
    await loadGameContext();
    showToast("Imported this device's saved game. localStorage was left in place.");
    location.hash = "shots";
  }

  function teamOptions(selectedId, includeNew) {
    const opts = st.teams
      .map((t) => `<option value="${t.id}" ${t.id === selectedId ? "selected" : ""}>${escapeHtml(t.name)}</option>`)
      .join("");
    return `<option value="">Select…</option>${opts}${includeNew ? `<option value="__new__">New team…</option>` : ""}`;
  }

  function seasonOptions(selectedId, includeNew) {
    const opts = st.seasons
      .map((s) => `<option value="${s.id}" ${s.id === selectedId ? "selected" : ""}>${escapeHtml(s.label)}</option>`)
      .join("");
    return `${opts}${includeNew ? `<option value="__new__">New season…</option>` : ""}`;
  }

  function renderGames() {
    const localCount = localEvents().length;
    const today = new Date().toISOString().slice(0, 10);
    const games = st.games
      .map((g) => {
        const opp = opponentOf(g);
        const vs = opp ? opp.name : "";
        return `
          <li class="shots-game-row">
            <button type="button" class="shots-game-btn" data-open-game="${g.id}">
              <strong>${escapeHtml(String(g.date).slice(0, 10))}</strong>
              <span>vs ${escapeHtml(vs)} · ${escapeHtml(g.game_type)}</span>
            </button>
          </li>`;
      })
      .join("");
    const csvBox = st.csvPending
      ? `
        <div class="shots-confirm">
          <h3>New teams in this CSV</h3>
          <p>Confirm these names before anything is created. Typos should be cancelled and fixed in the file.</p>
          <ul>${st.csvPending.newNames.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul>
          <div class="tracker-toolbar">
            <button type="button" class="btn btn-primary" id="csv-confirm">Create teams and import</button>
            <button type="button" class="btn btn-ghost" id="csv-cancel">Cancel</button>
          </div>
        </div>`
      : "";

    root().innerHTML = `
      <div class="shots-admin">
        ${trackerNav("games")}
        <h1>Games</h1>
        <p class="muted">Pick a season, then a game — or add one if it wasn't pre-loaded.</p>
        ${st.error ? `<p class="shots-error">${escapeHtml(st.error)}</p>` : ""}
        <label class="shots-field">Season
          <select id="season-pick">${seasonOptions(st.seasonId, false)}</select>
        </label>
        <ul class="shots-game-list">${games || `<li class="muted">No games in this season yet.</li>`}</ul>

        <h2>Add game</h2>
        <form id="new-game-form" class="shots-form">
          <label class="shots-field">Date <input type="date" id="new-game-date" required value="${today}" /></label>
          <label class="shots-field">Type
            <select id="new-game-type">${GAME_TYPES.map((t) => `<option value="${t}">${t}</option>`).join("")}</select>
          </label>
          <label class="shots-field">Season
            <select id="new-game-season">${seasonOptions(st.seasonId, true)}</select>
          </label>
          <div id="new-season-extra" hidden>
            <label class="shots-field">Season label <input type="text" id="new-season-label" placeholder="2026 Fall" /></label>
            <label class="shots-field">Year <input type="number" id="new-season-year" value="${new Date().getFullYear()}" /></label>
          </div>
          <label class="shots-field">Home
            <select id="new-game-home">${teamOptions(brighton()?.id, true)}</select>
          </label>
          <input type="text" id="new-home-name" class="text-gate-input" placeholder="New home team name" hidden />
          <label class="shots-field">Away
            <select id="new-game-away">${teamOptions("", true)}</select>
          </label>
          <input type="text" id="new-away-name" class="text-gate-input" placeholder="New away team name" hidden />
          <button type="submit" class="btn btn-primary">Start tracking</button>
        </form>

        <h2>Bulk upload</h2>
        <p class="muted">CSV columns in order: date, home_team, away_team, season_label, game_type. CRLF preferred.</p>
        <input type="file" id="schedule-csv" accept=".csv,text/csv" />
        ${csvBox}

        ${
          localCount
            ? `<h2>Import this device's saved game</h2>
          <p class="muted">${localCount} play(s) in localStorage will be copied into a new shared game. The original is not deleted.</p>
          <form id="import-local-form" class="shots-form">
            <label class="shots-field">Date <input type="date" id="import-date" required value="${today}" /></label>
            <label class="shots-field">Season <select id="import-season">${seasonOptions(st.seasonId, false)}</select></label>
            <label class="shots-field">Opponent <input type="text" id="import-opponent" value="${escapeHtml(localUiV1().opponent || "")}" placeholder="Opponent" /></label>
            <label class="shots-field">Type
              <select id="import-type">${GAME_TYPES.map((t) => `<option value="${t}">${t}</option>`).join("")}</select>
            </label>
            <button type="submit" class="btn btn-secondary">Import saved game</button>
          </form>`
            : ""
        }
      </div>`;

    $("#season-pick")?.addEventListener("change", (e) => selectSeason(e.target.value));
    $$("[data-open-game]").forEach((btn) => {
      btn.addEventListener("click", () => selectGame(btn.getAttribute("data-open-game")));
    });
    const bindNewToggle = (sel, extra) => {
      $(sel)?.addEventListener("change", () => {
        const show = $(sel).value === "__new__";
        if ($(extra)) $(extra).hidden = !show;
      });
    };
    bindNewToggle("#new-game-home", "#new-home-name");
    bindNewToggle("#new-game-away", "#new-away-name");
    $("#new-game-season")?.addEventListener("change", () => {
      const extra = $("#new-season-extra");
      if (extra) extra.hidden = $("#new-game-season").value !== "__new__";
    });
    $("#new-game-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        st.error = "";
        await createGameFromForm();
      } catch (err) {
        st.error = err.message || "Could not add game";
        draw();
      }
    });
    $("#schedule-csv")?.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const rows = parseScheduleCsv(text);
        const names = newTeamNames(rows);
        if (names.length) {
          st.csvPending = { rows, newNames: names };
          draw();
          return;
        }
        await importScheduleRows(rows, []);
      } catch (err) {
        st.error = err.message || "CSV import failed";
        draw();
      }
    });
    $("#csv-confirm")?.addEventListener("click", async () => {
      try {
        await importScheduleRows(st.csvPending.rows, st.csvPending.newNames);
      } catch (err) {
        st.error = err.message || "CSV import failed";
        draw();
      }
    });
    $("#csv-cancel")?.addEventListener("click", () => {
      st.csvPending = null;
      draw();
    });
    $("#import-local-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        st.error = "";
        st.loading = true;
        draw();
        await importLocalStorageGame();
      } catch (err) {
        st.loading = false;
        st.error = err.message || "Import failed";
        draw();
      }
    });
  }

  function locatePitchPoint(rawX, rawY) {
    const x = Math.max(0, Math.min(PW, rawX));
    const y = Math.max(0, Math.min(FIELD_Y_MAX, rawY));
    if (y >= HALF_L) {
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, zoneId: "DEF", zoneLabel: "Defensive half" };
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
    return loc?.zoneLabel || loc?.zone_label || "—";
  }

  function formatXY(loc) {
    if (!loc || loc.x == null) return "—";
    return `${Number(loc.x).toFixed(1)}, ${Number(loc.y).toFixed(1)}`;
  }

  function formatShotTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function csvEscape(value) {
    const s = String(value ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function downloadCsv(filename, headers, rows) {
    const lines = [headers.join(",")];
    rows.forEach((cols) => lines.push(cols.join(",")));
    const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast("CSV exported");
  }

  function shotCsvRow(ev, extra) {
    const team = eventTeam(ev);
    return [
      extra?.date || ev.gameDate || ev.game?.date || st.game?.date || "",
      extra?.opponent || ev.opponentName || opponentOf(st.game)?.name || "",
      extra?.season || ev.seasonLabel || ev.game?.season?.label || st.game?.season?.label || "",
      periodCsv(eventPeriod(ev)),
      team === "opp" ? "opponent" : "us",
      ev.createdAt || ev.created_at || "",
      ev.shooterNumber ?? ev.jersey_number_at_time ?? "",
      csvEscape(ev.shooterName || ev.player?.name || ""),
      ev.position || "",
      csvEscape(SHOT_RESULT_LABELS[ev.result] || ev.result),
      ev.missDirection || ev.miss_direction || "",
      ev.shot?.zoneId ?? ev.zone_id ?? "",
      csvEscape(ev.shot?.zoneLabel || ev.zone_label || ""),
      ev.shot?.x ?? ev.x ?? "",
      ev.shot?.y ?? ev.y ?? "",
      ev.assist?.number ?? "",
      csvEscape(ev.assist?.name || ev.assist_player?.name || ""),
      ev.assist ? ASSIST_TYPE_LABELS[ev.assist.type] || ev.assist.type : ev.assist_type || "",
      ev.assist?.position || ev.assist_position || "",
      ev.assist?.zoneId ?? ev.assist_zone_id ?? "",
      csvEscape(ev.assist?.zoneLabel || ev.assist_zone_label || ""),
      ev.assist?.x ?? ev.assist_x ?? "",
      ev.assist?.y ?? ev.assist_y ?? "",
    ];
  }

  const CSV_HEADERS = [
    "date",
    "opponent",
    "season",
    "half",
    "team",
    "time",
    "player_number",
    "player_name",
    "position",
    "result",
    "miss_direction",
    "shot_zone_id",
    "shot_zone",
    "shot_x",
    "shot_y",
    "assisted_by_number",
    "assisted_by_name",
    "assist_type",
    "assist_position",
    "assist_zone_id",
    "assist_zone",
    "assist_x",
    "assist_y",
  ];

  function exportShotsCsv(events, filename) {
    if (!events.length) {
      showToast("No shots to export");
      return;
    }
    downloadCsv(
      filename || `bengals-shots-${new Date().toISOString().slice(0, 10)}.csv`,
      CSV_HEADERS,
      events.map((ev) => shotCsvRow(ev))
    );
  }

  function pitchFromSvgPoint(sx, sy, swapped) {
    if (swapped) return { x: PW - sy, y: sx };
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
    const swapped = !!opts.swapped;
    const team = opts.team || "us";
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
    const pending = st.pending;
    const modalLoc = shotModalDraft.location;
    const active = recordingTeam() === team;
    if (active && pending?.assist?.location) {
      const a = pending.assist.location;
      pendingDots.push(`<circle class="tracker-pending assist" cx="${a.x}" cy="${a.y}" r="1.15" />`);
    }
    if (active && modalLoc && shotModal && !shotModal.hidden) {
      pendingDots.push(`<circle class="tracker-pending" cx="${modalLoc.x}" cy="${modalLoc.y}" r="1.25" />`);
    }
    const numRot = swapped ? 90 : -90;
    const markers = events
      .filter((ev) => eventPeriod(ev) === (opts.period || st.period) && eventTeam(ev) === team)
      .map((ev) => {
        let html = "";
        if (ev.assist) {
          html += `<line class="tracker-assist-line" x1="${ev.assist.x}" y1="${ev.assist.y}" x2="${ev.shot.x}" y2="${ev.shot.y}" />`;
          html += `<circle class="tracker-assist-dot" cx="${ev.assist.x}" cy="${ev.assist.y}" r="0.9" />`;
        }
        html += `<circle class="tracker-shot-dot ${escapeHtml(ev.result)}" cx="${ev.shot.x}" cy="${ev.shot.y}" r="1.7" />`;
        if (ev.shooterNumber !== undefined && ev.shooterNumber !== null && ev.shooterNumber !== "") {
          html += `<text class="tracker-shot-num" x="${ev.shot.x}" y="${ev.shot.y}" transform="rotate(${numRot} ${ev.shot.x} ${ev.shot.y})">${escapeHtml(String(ev.shooterNumber))}</text>`;
        }
        return `<g class="tracker-event ${team === "opp" ? "is-opp" : ""} ${ev.saveFailed ? "is-failed" : ""}" data-event-id="${escapeHtml(ev.id)}">${html}</g>`;
      })
      .join("");
    const inner = swapped
      ? `translate(0, ${PW}) rotate(-90)`
      : `translate(${HALF_L}, 0) rotate(90)`;
    const viewBox = swapped ? "-3.5 -1 64.8 70" : "-9.4 -1 64.8 70";
    return `
      <svg class="pitch-svg tracker-pitch-svg ${team === "opp" ? "is-opp-pitch" : "is-us-pitch"}" data-pitch-team="${team}" viewBox="${viewBox}" role="application" aria-label="${team === "opp" ? "Opponent" : "Brighton"} attacking half. Goal ${swapped ? "on the left" : "on the right"}.">
        <g transform="${inner}">
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
          <text class="tracker-goal-label" x="${PW / 2}" y="-1.85" transform="rotate(${numRot} ${PW / 2} -1.85)">GOAL</text>
          <g class="tracker-markers">${markers}${pendingDots.join("")}</g>
        </g>
      </svg>`;
  }

  function resetTrackerDraft() {
    st.mode = "idle";
    st.pending = null;
    shotModalDraft.step = "first";
    shotModalDraft.phase = "action";
    shotModalDraft.location = null;
    shotModalDraft.player = null;
    shotModalDraft.action = null;
    shotModalDraft.position = "";
    shotModalDraft.missDirection = "";
    shotModalDraft.subSlotId = null;
    shotModalDraft.justAddedNumber = "";
  }

  function closeShotModal() {
    if (shotModal) shotModal.hidden = true;
    shotModalDraft.player = null;
    shotModalDraft.action = null;
    shotModalDraft.phase = "action";
    shotModalDraft.location = null;
    shotModalDraft.position = "";
    shotModalDraft.missDirection = "";
    shotModalDraft.subSlotId = null;
    shotModalDraft.justAddedNumber = "";
  }

  function dismissShotModal() {
    closeShotModal();
    if (st.view === "shots") draw({ keepScroll: true });
  }

  function fillShotModal(step, location) {
    shotModalDraft.step = step;
    shotModalDraft.phase = "action";
    shotModalDraft.location = location;
    shotModalDraft.player = null;
    shotModalDraft.action = null;
    shotModalDraft.position = "";
    shotModalDraft.missDirection = "";
    shotModalDraft.subSlotId = null;
    shotModalDraft.justAddedNumber = "";
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
    if (action.result === "foul") return "Foul";
    if (action.result === "corner") return "Corner";
    if (action.result === "pk-goal") return "PK Goal";
    if (action.result === "pk-missed") return "PK Miss";
    return action.label || "";
  }

  function usedThisGameNumbers(team) {
    const nums = new Set();
    st.shots.forEach((ev) => {
      if (eventTeam(ev) !== team) return;
      if (ev.shooterNumber) nums.add(String(ev.shooterNumber));
      if (ev.assist?.number) nums.add(String(ev.assist.number));
    });
    return [...nums].sort((a, b) => Number(a) - Number(b));
  }

  function advanceAfterAction() {
    const action = shotModalDraft.action;
    if (needsMissDirection(action) && !shotModalDraft.missDirection) {
      shotModalDraft.phase = "miss-dir";
    } else {
      shotModalDraft.phase = "player";
      if (!shotModalDraft.position && lineupIsSet()) {
        const onField = onFieldPlayers(recordingTeam());
        if (onField.length === 1) shotModalDraft.position = onField[0].slotCode;
      }
    }
    renderShotModal();
  }

  function renderShotModal() {
    const title = $("#shot-modal-title");
    const locEl = $("#shot-modal-location");
    const actionLabel = $("#shot-action-label");
    const playerHeading = $("#shot-modal-heading");
    const playerGrid = $("#shot-player-grid");
    const actionGrid = $("#shot-action-grid");
    const backBtn = $("#shot-modal-back");
    const panel = $(".shot-modal-panel", shotModal);
    const nudge = $("#shot-lineup-nudge");
    const nudgeText = $("#shot-lineup-nudge-text");
    const posGrid = $("#shot-position-grid");
    if (!shotModal || !playerGrid || !actionGrid) return;
    if (actionLabel) actionLabel.hidden = true;
    playerGrid.classList.remove("is-formation");

    const step = shotModalDraft.step;
    const phase = shotModalDraft.phase;
    const loc = shotModalDraft.location;
    const locText = loc ? `${formatLoc(loc)}  ·  (${formatXY(loc)})` : "";
    const inSubFlow = phase === "sub-slot" || phase === "sub-pick";
    if (panel) panel.classList.toggle("is-player-phase", phase === "player" || phase === "miss-dir" || inSubFlow);
    if (backBtn) backBtn.hidden = phase === "action";
    if (posGrid) posGrid.hidden = phase !== "player";

    if (nudge) {
      const showNudge = phase === "player" && recordingTeam() === "us" && !lineupIsSet();
      nudge.hidden = !showNudge;
      if (nudgeText && showNudge) {
        nudgeText.textContent = "No starting lineup set — position is optional. Set defaults below the pitch.";
      }
    }

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
        const assistBtns = TRACKER_ASSIST_ACTIONS.map(
          (a) =>
            `<button type="button" class="shot-action-btn is-assist" data-action-id="${escapeHtml(a.id)}">${escapeHtml(ASSIST_TYPE_LABELS[a.type])}</button>`
        ).join("");
        const otherBtns = TRACKER_OTHER_ACTIONS.map(
          (a) =>
            `<button type="button" class="shot-action-btn is-${a.result}" data-action-id="${escapeHtml(a.id)}">${escapeHtml(actionShortLabel(a))}</button>`
        ).join("");
        actionGrid.innerHTML = `
          <p class="shot-action-heading">Assist</p>
          <div class="shot-action-row shot-action-row-3">${assistBtns}</div>
          <p class="shot-action-heading">Shot</p>
          <div class="shot-action-row shot-action-row-fill">${shotBtns}</div>
          <p class="shot-action-heading">Set piece / foul</p>
          <div class="shot-action-row shot-action-row-fill">${otherBtns}</div>`;
      }
      return;
    }

    if (phase === "miss-dir") {
      const chosen = shotModalDraft.action;
      title.textContent = "Where did it miss?";
      locEl.textContent = chosen ? `${actionShortLabel(chosen)}  ·  ${locText}` : locText;
      if (playerHeading) playerHeading.hidden = true;
      playerGrid.hidden = true;
      actionGrid.hidden = false;
      actionGrid.innerHTML = `
        <div class="shot-action-row shot-action-row-fill">
          ${MISS_DIRECTIONS.map(
            (d) =>
              `<button type="button" class="shot-action-btn is-miss-dir" data-miss-dir="${d}">${escapeHtml(MISS_DIRECTION_LABELS[d])}</button>`
          ).join("")}
        </div>`;
      return;
    }

    if (phase === "sub-slot") {
      title.textContent = "Sub into which position?";
      locEl.textContent = "Pick the slot to swap, then choose who comes in.";
      if (playerHeading) playerHeading.hidden = true;
      if (posGrid) posGrid.hidden = true;
      actionGrid.hidden = true;
      playerGrid.hidden = false;
      playerGrid.classList.add("is-formation");
      const cards = FORMATION_LAYOUT.map((layout) => {
        const slot = POSITION_SLOTS.find((s) => s.id === layout.id);
        const filled = slotPlayer("us", layout.id);
        const who = filled ? playerDisplayName(filled) : "Empty";
        return `
          <button type="button" class="formation-card is-pick" style="${formationCardStyle(layout)}" data-sub-slot-pick="${layout.id}">
            <span class="formation-card-name">${escapeHtml(who)}</span>
            <span class="formation-card-meta">${formationMeta(slot?.code || layout.code, filled)}</span>
          </button>`;
      }).join("");
      playerGrid.innerHTML = formationPitchShell(cards);
      return;
    }

    if (phase === "sub-pick") {
      const slot = POSITION_SLOTS.find((s) => s.id === Number(shotModalDraft.subSlotId));
      const group = slot?.group || "";
      const groupLabel = POSITION_GROUPS.find((g) => g.id === group)?.label || group;
      title.textContent = `Who comes in at ${slot?.code || ""}?`;
      locEl.textContent = `${groupLabel} first, then other varsity, then JV.`;
      if (playerHeading) playerHeading.hidden = true;
      if (posGrid) posGrid.hidden = true;
      actionGrid.hidden = true;
      playerGrid.hidden = false;
      playerGrid.classList.remove("is-formation");
      const used = usedLineupNumbers("us", shotModalDraft.subSlotId);
      const all = sortPlayers(rosterPlayers("us")).filter((p) => !used.has(String(p.number)));
      const preferred = all.filter((p) => p.squad !== "jv" && playerInGroup(p, group));
      const varsityRest = all.filter((p) => p.squad !== "jv" && !playerInGroup(p, group));
      const jv = all.filter((p) => p.squad === "jv");
      const btn = (p, tag) => `
        <button type="button" class="shot-player-btn" data-sub-pick-id="${escapeHtml(String(p.id || ""))}" data-sub-pick-number="${escapeHtml(String(p.number))}">
          <span class="name">${escapeHtml(playerDisplayName(p))}</span>
          <span class="num">#${escapeHtml(String(p.number))}${tag ? ` · ${tag}` : ""}</span>
        </button>`;
      playerGrid.innerHTML =
        (preferred.length ? `<div class="shot-quick-label">${escapeHtml(groupLabel)}</div>${preferred.map((p) => btn(p, "")).join("")}` : "") +
        (varsityRest.length ? `<div class="shot-quick-label">Other varsity</div>${varsityRest.map((p) => btn(p, "")).join("")}` : "") +
        (jv.length ? `<div class="shot-quick-label">JV</div>${jv.map((p) => btn(p, "JV")).join("")}` : "") +
        (!preferred.length && !varsityRest.length && !jv.length ? `<p class="muted">No available players.</p>` : "");
      return;
    }

    const chosen = shotModalDraft.action;
    const team = recordingTeam();
    title.textContent = playerWhoLabel(chosen);
    const missBit = shotModalDraft.missDirection
      ? ` · ${MISS_DIRECTION_LABELS[shotModalDraft.missDirection]}`
      : "";
    locEl.textContent = chosen
      ? `${actionShortLabel(chosen)}${chosen.kind === "assist" ? " assist" : ""}${missBit}  ·  ${locText}`
      : locText;
    const onField = onFieldPlayers(team);
    const showFormation = onField.length > 0;
    if (playerHeading) {
      playerHeading.hidden = false;
      playerHeading.textContent = showFormation
        ? "Tap a player on the pitch. Sub or switch team up top."
        : "Optional position, then player. Skip is a valid save.";
    }
    playerGrid.hidden = false;
    actionGrid.hidden = true;
    if (posGrid) {
      posGrid.hidden = showFormation;
      if (!showFormation) {
        posGrid.innerHTML = POSITION_CODES.map(
          (code) =>
            `<button type="button" class="shot-pos-btn ${shotModalDraft.position === code ? "is-on" : ""}" data-shot-pos="${code}">${code}</button>`
        ).join("");
      }
    }

    const rosterList = sortPlayers(rosterPlayers(team));
    const onFieldNums = new Set(onField.map((p) => String(p.number)));
    const oppLabel = opponentOf(st.game)?.name || "Opponent";
    const justAdded = shotModalDraft.justAddedNumber
      ? rosterList.find((p) => String(p.number) === String(shotModalDraft.justAddedNumber))
      : null;

    const toolbar = `
      <div class="shot-team-bar">
        <div class="half-toggle shot-team-toggle" role="tablist" aria-label="Recording team">
          <button type="button" class="half-toggle-btn ${team === "us" ? "is-on" : ""}" data-shot-team="us">Brighton</button>
          <button type="button" class="half-toggle-btn ${team === "opp" ? "is-on" : ""}" data-shot-team="opp">${escapeHtml(oppLabel)}</button>
        </div>
        <div class="shot-team-actions">
          ${
            team === "us"
              ? `<button type="button" class="btn btn-ghost shot-bar-btn is-sub-in" data-sub-in="1">Sub player in</button>`
              : ""
          }
          <button type="button" class="btn btn-ghost shot-bar-btn" data-player-skip="1">Unknown</button>
          <button type="button" class="btn btn-ghost shot-bar-btn" data-player-add="1">Add number</button>
        </div>
      </div>`;

    const playerBtn = (p, extra = "", selected = false) => {
      const label = team === "opp" && !p.name && !p.short ? `#${p.number}` : escapeHtml(playerDisplayName(p));
      const posHint = p.slotCode ? ` · ${p.slotCode}` : "";
      return `
        <button type="button" class="shot-player-btn ${selected ? "is-selected" : ""}" data-player-number="${escapeHtml(String(p.number))}" data-player-id="${escapeHtml(p.id || "")}" data-player-team="${team}" data-slot-code="${escapeHtml(p.slotCode || "")}">
          <span class="name">${label}</span>
          <span class="num">${escapeHtml(String(p.number))}${posHint}${extra}</span>
        </button>`;
    };

    const formationPickCards = (forTeam) =>
      FORMATION_LAYOUT.map((layout) => {
        const p = slotPlayer(forTeam, layout.id);
        if (!p) {
          return `
            <div class="formation-card is-empty" style="${formationCardStyle(layout)}">
              <span class="formation-card-name">Empty</span>
              <span class="formation-card-meta">${escapeHtml(layout.code)}</span>
            </div>`;
        }
        const label =
          forTeam === "opp" && !p.name && !p.short
            ? `#${escapeHtml(String(p.number))}`
            : escapeHtml(playerDisplayName(p));
        return `
          <button type="button" class="formation-card is-pick" style="${formationCardStyle(layout)}" data-player-number="${escapeHtml(String(p.number))}" data-player-id="${escapeHtml(p.id || "")}" data-player-team="${forTeam}" data-slot-code="${escapeHtml(layout.code)}">
            <span class="formation-card-name">${label}</span>
            <span class="formation-card-meta">${formationMeta(layout.code, p)}</span>
          </button>`;
      }).join("");

    let html = toolbar;
    if (justAdded) {
      html += `<div class="shot-quick-label">Just added</div>${playerBtn(justAdded, " · new", true)}`;
    }
    if (showFormation) {
      html += formationPitchShell(formationPickCards(team));
      if (team === "opp") {
        const rest = rosterList.filter(
          (p) => !onFieldNums.has(String(p.number)) && String(p.number) !== String(shotModalDraft.justAddedNumber || "")
        );
        const quick = usedThisGameNumbers("opp").filter(
          (num) => !onFieldNums.has(String(num)) && String(num) !== String(shotModalDraft.justAddedNumber || "")
        );
        if (quick.length) {
          html += `<div class="shot-quick-label">Also used this game</div>${quick
            .map((num) => {
              const p = rosterList.find((x) => String(x.number) === String(num)) || { number: num, id: "" };
              return playerBtn(p, " · game");
            })
            .join("")}`;
        }
        if (rest.length) html += `<div class="shot-quick-label">Bench / roster</div>${rest.map((p) => playerBtn(p)).join("")}`;
      }
    } else if (team === "opp") {
      const quick = usedThisGameNumbers("opp")
        .filter((num) => String(num) !== String(shotModalDraft.justAddedNumber || ""))
        .map((num) => {
          const p = rosterList.find((x) => String(x.number) === String(num)) || { number: num, id: "" };
          return playerBtn(p, " · game");
        })
        .join("");
      if (quick) html += `<div class="shot-quick-label">Used this game</div>${quick}`;
      const rest = rosterList.filter((p) => String(p.number) !== String(shotModalDraft.justAddedNumber || ""));
      if (rest.length) html += `<div class="shot-quick-label">Roster</div>${rest.map((p) => playerBtn(p)).join("")}`;
      if (!justAdded && !quick && !rest.length) {
        html += `<p class="muted shot-empty-roster">No numbers yet — tap Add number.</p>`;
      }
    } else {
      const rest = rosterList.filter((p) => String(p.number) !== String(shotModalDraft.justAddedNumber || ""));
      html += rest.map((p) => playerBtn(p)).join("");
      if (!justAdded && !rest.length) {
        html += `<p class="muted shot-empty-roster">No roster loaded — tap Add number.</p>`;
      }
    }
    playerGrid.classList.toggle("is-formation", html.includes("formation-pitch"));
    playerGrid.innerHTML = html;
  }

  function playerFromRoster(team, playerId, number) {
    const onField = onFieldPlayers(team);
    if (playerId) {
      const fromField = onField.find((p) => p.id === playerId);
      if (fromField) return fromField;
    }
    if (number != null && number !== "") {
      const fromField = onField.find((p) => String(p.number) === String(number));
      if (fromField) return fromField;
    }
    const list = rosterPlayers(team);
    if (playerId) return list.find((p) => p.id === playerId) || null;
    if (number != null && number !== "") return list.find((p) => String(p.number) === String(number)) || null;
    return null;
  }

  function openNumberPicker(onPick) {
    const modal = $("#number-pick-modal");
    const select = $("#number-pick-select");
    if (!modal || !select) return;
    const used = new Set(rosterPlayers(recordingTeam()).map((p) => String(p.number)));
    select.innerHTML = jerseyChoices()
      .map((num) => `<option value="${num}" ${used.has(num) ? "disabled" : ""}>${num}</option>`)
      .join("");
    const first = jerseyChoices().find((n) => !used.has(n));
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
      const value = String(select.value || "");
      if (!value) {
        showToast("Pick a jersey number");
        return;
      }
      const opt = Array.from(select.options).find((o) => o.value === value);
      if (opt?.disabled) {
        showToast("That number is already on the roster");
        return;
      }
      finish(value);
    };
    cancelBtns.forEach((el) => {
      el.onclick = () => finish(null);
    });
  }

  function playerFromRosterRow(team, row, number) {
    if (!row && (number == null || number === "")) return null;
    return {
      id: row?.player_id || row?.player?.id || "",
      number: String(row?.jersey_number ?? number),
      name: row?.player?.name || null,
      short: row?.player?.short_name || null,
      short_name: row?.player?.short_name || null,
      team,
    };
  }

  async function refreshRecordingRoster() {
    const team = recordingTeam();
    const teamId = recordingTeamId();
    if (!teamId || !st.game?.season_id) throw new Error("No team/season for roster");
    const rows = await API.roster(teamId, st.game.season_id);
    if (team === "us") st.ourRoster = rows;
    else st.oppRoster = rows;
    return rows;
  }

  async function pickNewJersey() {
    openNumberPicker(async (num) => {
      try {
        const team = recordingTeam();
        const teamId = recordingTeamId();
        if (!teamId) throw new Error("No team selected");
        const row = await API.ensureRosterPlayer(teamId, st.game.season_id, num, null);
        await refreshRecordingRoster();
        const player =
          playerFromRoster(team, row?.player_id || row?.player?.id, num) || playerFromRosterRow(team, row, num);
        if (!player) throw new Error("Number saved but not on roster yet");
        shotModalDraft.justAddedNumber = String(num);
        showToast(`#${num} added — tap to use`);
        renderShotModal();
      } catch (err) {
        showToast(err.message || "Could not add number");
      }
    });
  }

  async function completeShotModal() {
    const action = shotModalDraft.action;
    if (!action) return;
    const player = shotModalDraft.player || null;
    if (shotModalDraft.step === "first" && action.kind === "assist") {
      st.pending = {
        assist: {
          player,
          type: action.type,
          location: shotModalDraft.location,
          position: shotModalDraft.position || "",
        },
      };
      st.mode = "awaiting-shot-location";
      closeShotModal();
      shotModalDraft.location = null;
      draw();
      showToast("Tap where the shot was taken");
      return;
    }
    if (action.kind === "shot") {
      const assist = shotModalDraft.step === "shot" ? st.pending?.assist : null;
      await commitShotEvent(action.result, player, assist || null);
    }
  }

  function payloadFromDraft(result, shooter, assist) {
    const loc = shotModalDraft.location;
    const teamId = recordingTeamId();
    return {
      id: global.crypto.randomUUID(),
      game_id: st.gameId,
      period: st.period,
      team_id: teamId,
      player_id: shooter?.id || null,
      jersey_number_at_time: shooter ? String(shooter.number) : null,
      position: shotModalDraft.position || null,
      x: loc.x,
      y: loc.y,
      zone_id: loc.zoneId,
      zone_label: loc.zoneLabel,
      result,
      miss_direction: RESULTS_NEEDING_MISS_DIR.has(result) ? shotModalDraft.missDirection || null : null,
      assist_player_id: assist?.player?.id || null,
      assist_type: assist ? assist.type : null,
      assist_position: assist?.position || null,
      assist_x: assist ? assist.location.x : null,
      assist_y: assist ? assist.location.y : null,
      assist_zone_id: assist ? assist.location.zoneId : null,
      assist_zone_label: assist ? assist.location.zoneLabel : null,
    };
  }

  async function commitShotEvent(result, shooter, assist) {
    const loc = shotModalDraft.location;
    if (!loc) return;
    const team = recordingTeam();
    const payload = payloadFromDraft(result, shooter, assist);
    const view = mapShot({
      ...payload,
      created_at: new Date().toISOString(),
      player: shooter ? { id: shooter.id, name: shooter.name, short_name: shooter.short } : null,
      assist_player: assist?.player
        ? { id: assist.player.id, name: assist.player.name, short_name: assist.player.short }
        : null,
      saveFailed: false,
      pendingPayload: payload,
    });
    view.team = team;
    view.shooterNumber = shooter ? String(shooter.number) : "";
    if (view.assist && assist?.player) view.assist.number = String(assist.player.number || "");
    st.shots = [view, ...st.shots];
    closeShotModal();
    resetTrackerDraft();
    draw();
    const missBit = view.missDirection ? ` (${MISS_DIRECTION_LABELS[view.missDirection]})` : "";
    const extra = view.assist
      ? ` (assist: ${view.assist.number ? (team === "opp" ? `Opp #${view.assist.number}` : view.assist.short || firstName(view.assist.name) || `#${view.assist.number}`) : "untagged"})`
      : "";
    showToast(`${SHOT_RESULT_LABELS[result]}${missBit} — ${playerLabel(shooter ? Object.assign({ team }, shooter) : null)}${extra}`);
    const saved = await API.insertShot(payload);
    if (!saved.ok) {
      view.saveFailed = true;
      view.pendingPayload = payload;
      showToast("Not saved — check connection");
      draw({ keepScroll: true });
      return;
    }
    const idx = st.shots.findIndex((s) => s.id === view.id);
    if (idx >= 0) st.shots[idx] = mapShot(saved.data);
    draw({ keepScroll: true });
  }

  async function retryShot(id) {
    const ev = st.shots.find((s) => s.id === id);
    if (!ev?.pendingPayload) return;
    const saved = await API.insertShot(ev.pendingPayload);
    if (!saved.ok) {
      showToast("Not saved — check connection");
      return;
    }
    const idx = st.shots.findIndex((s) => s.id === id);
    if (idx >= 0) st.shots[idx] = mapShot(saved.data);
    showToast("Saved");
    draw({ keepScroll: true });
  }

  function bindShotModal() {
    if (!shotModal || shotModal.dataset.bound === "1") return;
    shotModal.dataset.bound = "1";
    shotModal.addEventListener("click", async (e) => {
      const posBtn = e.target.closest("[data-shot-pos]");
      if (posBtn) {
        const code = posBtn.getAttribute("data-shot-pos");
        shotModalDraft.position = shotModalDraft.position === code ? "" : code;
        renderShotModal();
        return;
      }
      const missBtn = e.target.closest("[data-miss-dir]");
      if (missBtn) {
        shotModalDraft.missDirection = missBtn.getAttribute("data-miss-dir") || "";
        shotModalDraft.phase = "player";
        renderShotModal();
        return;
      }
      const teamBtn = e.target.closest("[data-shot-team]");
      if (teamBtn) {
        const next = teamBtn.getAttribute("data-shot-team") === "opp" ? "opp" : "us";
        if (st.team !== next) {
          st.team = next;
          saveUi();
          shotModalDraft.player = null;
          shotModalDraft.position = "";
          shotModalDraft.justAddedNumber = "";
        }
        renderShotModal();
        return;
      }
      if (e.target.closest("[data-sub-in]")) {
        shotModalDraft.phase = "sub-slot";
        shotModalDraft.subSlotId = null;
        renderShotModal();
        return;
      }
      const subSlotBtn = e.target.closest("[data-sub-slot-pick]");
      if (subSlotBtn) {
        shotModalDraft.subSlotId = Number(subSlotBtn.getAttribute("data-sub-slot-pick"));
        shotModalDraft.phase = "sub-pick";
        renderShotModal();
        return;
      }
      const subPickBtn = e.target.closest("[data-sub-pick-number]");
      if (subPickBtn) {
        const slotId = Number(shotModalDraft.subSlotId);
        const slot = POSITION_SLOTS.find((s) => s.id === slotId);
        const number = subPickBtn.getAttribute("data-sub-pick-number");
        const playerId = subPickBtn.getAttribute("data-sub-pick-id");
        const player = playerFromRoster("us", playerId, number);
        if (!player || !slot) return;
        assignSlot("us", slotId, {
          id: player.id || "",
          number: String(player.number),
          name: player.name || "",
          short: player.short || player.short_name || "",
        });
        st.lineup.set = true;
        saveLineupBag();
        shotModalDraft.position = slot.code;
        shotModalDraft.phase = "player";
        shotModalDraft.subSlotId = null;
        showToast(`${playerDisplayName(player)} in at ${slot.code}`);
        renderShotModal();
        return;
      }
      if (e.target.closest("[data-player-skip]")) {
        shotModalDraft.player = null;
        await completeShotModal();
        return;
      }
      if (e.target.closest("[data-player-add]")) {
        pickNewJersey();
        return;
      }
      const playerBtn = e.target.closest("[data-player-number]");
      if (playerBtn) {
        const team = playerBtn.getAttribute("data-player-team") || recordingTeam();
        const number = playerBtn.getAttribute("data-player-number");
        const playerId = playerBtn.getAttribute("data-player-id");
        const slotCode = playerBtn.getAttribute("data-slot-code") || "";
        shotModalDraft.player = playerFromRoster(team, playerId, number) || {
          id: playerId || "",
          number: String(number),
          name: null,
          short: null,
          team,
        };
        shotModalDraft.justAddedNumber = "";
        if (slotCode && !shotModalDraft.position) shotModalDraft.position = slotCode;
        else if (shotModalDraft.player?.slotCode && !shotModalDraft.position) {
          shotModalDraft.position = shotModalDraft.player.slotCode;
        }
        await completeShotModal();
        return;
      }
      const actionBtn = e.target.closest("[data-action-id]");
      if (actionBtn) {
        const action = TRACKER_FIRST_ACTIONS.find((a) => a.id === actionBtn.getAttribute("data-action-id"));
        if (!action) return;
        shotModalDraft.action = action;
        shotModalDraft.missDirection = "";
        advanceAfterAction();
      }
    });
    $("#shot-modal-back")?.addEventListener("click", () => {
      if (shotModalDraft.phase === "sub-pick") {
        shotModalDraft.phase = "sub-slot";
        shotModalDraft.subSlotId = null;
        renderShotModal();
        return;
      }
      if (shotModalDraft.phase === "sub-slot") {
        shotModalDraft.phase = "player";
        shotModalDraft.subSlotId = null;
        renderShotModal();
        return;
      }
      if (shotModalDraft.phase === "player" && needsMissDirection(shotModalDraft.action)) {
        shotModalDraft.phase = "miss-dir";
        shotModalDraft.player = null;
        shotModalDraft.missDirection = "";
        renderShotModal();
        return;
      }
      if (shotModalDraft.phase === "miss-dir") {
        shotModalDraft.phase = "action";
        shotModalDraft.action = null;
        shotModalDraft.missDirection = "";
        renderShotModal();
        return;
      }
      shotModalDraft.phase = "action";
      shotModalDraft.player = null;
      shotModalDraft.action = null;
      shotModalDraft.missDirection = "";
      shotModalDraft.subSlotId = null;
      renderShotModal();
    });
    $("#shot-goto-lineup")?.addEventListener("click", () => {
      dismissShotModal();
      setTimeout(() => $("#lineup-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    });
    $$("[data-close-shot-modal]").forEach((el) =>
      el.addEventListener("click", () => {
        const openedAt = Number(shotModal.dataset.openedAt || 0);
        if (Date.now() - openedAt < 450) return;
        dismissShotModal();
      })
    );
  }

  function bindTrackerPitches() {
    const awaitingShot = st.mode === "awaiting-shot-location";
    $$("[data-pitch-team]").forEach((svg) => {
      const team = svg.getAttribute("data-pitch-team");
      const wrap = svg.closest(".tracker-pitch-wrap");
      const block = svg.closest(".tracker-pitch-block");
      const canSecondTap = awaitingShot && recordingTeam() === team;
      wrap?.classList.toggle("is-recording", canSecondTap || !awaitingShot);
      block?.classList.toggle("is-active", canSecondTap || (!awaitingShot && recordingTeam() === team));
      let lastTapAt = 0;
      let lastTapX = 0;
      let lastTapY = 0;
      const onTap = (evt) => {
        if (!shotModal.hidden) return;
        const now = Date.now();
        const p = svgEventPoint(svg, evt);
        const pitch = pitchFromSvgPoint(p.x, p.y, st.swapSides);
        const loc = locatePitchPoint(pitch.x, pitch.y);
        const nearPrev = Math.hypot(p.x - lastTapX, p.y - lastTapY) < 8;
        const isDouble = now - lastTapAt < 420 && nearPrev;
        lastTapAt = now;
        lastTapX = p.x;
        lastTapY = p.y;
        evt.preventDefault();
        evt.stopPropagation();

        if (awaitingShot) {
          if (recordingTeam() !== team) {
            showToast("Finish this shot on the same team’s pitch");
            return;
          }
          fillShotModal("shot", loc);
          draw({ keepScroll: true });
          return;
        }

        if (!isDouble) return;
        st.team = team === "opp" ? "opp" : "us";
        st.mode = "idle";
        st.pending = null;
        saveUi();
        fillShotModal("first", loc);
        draw({ keepScroll: true });
      };
      svg.addEventListener("pointerup", onTap);
    });
  }

  function trackerSummary(events) {
    const n = (result) => events.filter((e) => e.result === result).length;
    const assists = events.filter((e) => e.assist).length;
    return {
      goals: n("goal") + n("pk-goal"),
      onTarget: n("on-target"),
      blocked: n("blocked"),
      missed: n("missed") + n("pk-missed"),
      fouls: n("foul"),
      corners: n("corner"),
      pks: n("pk-goal") + n("pk-missed"),
      assists,
      total: events.length,
    };
  }

  function summaryPills(sum) {
    return `
      <span class="pill">Plays <strong>${sum.total}</strong></span>
      <span class="pill">Goals <strong>${sum.goals}</strong></span>
      <span class="pill">On target <strong>${sum.onTarget}</strong></span>
      <span class="pill">Blocked <strong>${sum.blocked}</strong></span>
      <span class="pill">Missed <strong>${sum.missed}</strong></span>
      <span class="pill">Fouls <strong>${sum.fouls}</strong></span>
      <span class="pill">Corners <strong>${sum.corners}</strong></span>
      <span class="pill">PKs <strong>${sum.pks}</strong></span>
      <span class="pill">Assists <strong>${sum.assists}</strong></span>`;
  }

  function unitsBreakdown(events) {
    const posCounts = {};
    const pairCounts = {};
    const missByPlayer = {};
    events.forEach((ev) => {
      if (eventTeam(ev) !== "us") return;
      const shotResults = ["goal", "on-target", "blocked", "missed", "pk-goal", "pk-missed"];
      if (!shotResults.includes(ev.result)) return;
      const pos = ev.position || "—";
      posCounts[pos] = (posCounts[pos] || 0) + 1;
      if (ev.assist) {
        const aPos = ev.assist.position || "—";
        const key = `${aPos} → ${pos}`;
        pairCounts[key] = (pairCounts[key] || 0) + 1;
      }
      if (ev.missDirection) {
        const who = eventPersonLabel("us", ev.shooterNumber, ev.shooterName, ev.shooterShort);
        if (!missByPlayer[who]) missByPlayer[who] = { over: 0, short: 0, "wide-left": 0, "wide-right": 0 };
        missByPlayer[who][ev.missDirection] = (missByPlayer[who][ev.missDirection] || 0) + 1;
      }
    });
    const topPos = Object.entries(posCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const topPairs = Object.entries(pairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const missRows = Object.entries(missByPlayer)
      .map(([who, dirs]) => ({ who, ...dirs, total: dirs.over + dirs.short + dirs["wide-left"] + dirs["wide-right"] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
    return { topPos, topPairs, missRows };
  }

  function unitsMarkup(events) {
    const { topPos, topPairs, missRows } = unitsBreakdown(events);
    if (!topPos.length && !topPairs.length && !missRows.length) {
      return `<p class="muted">Record positions on shots (and assists) to see which units create chances.</p>`;
    }
    return `
      <div class="units-grid">
        <div>
          <h3 class="tracker-half-heading">Positions producing shots</h3>
          <ul class="units-list">
            ${topPos.map(([pos, n]) => `<li><strong>${escapeHtml(pos)}</strong> <span class="muted">${n}</span></li>`).join("") || "<li class='muted'>None yet</li>"}
          </ul>
        </div>
        <div>
          <h3 class="tracker-half-heading">Units / partnerships</h3>
          <ul class="units-list">
            ${topPairs.map(([pair, n]) => `<li><strong>${escapeHtml(pair)}</strong> <span class="muted">${n}</span></li>`).join("") || "<li class='muted'>Need assists with positions</li>"}
          </ul>
        </div>
        <div>
          <h3 class="tracker-half-heading">Miss trends</h3>
          <ul class="units-list">
            ${
              missRows
                .map(
                  (r) =>
                    `<li><strong>${escapeHtml(r.who)}</strong> <span class="muted">O${r.over} S${r.short} WL${r["wide-left"]} WR${r["wide-right"]}</span></li>`
                )
                .join("") || "<li class='muted'>No miss directions yet</li>"
            }
          </ul>
        </div>
      </div>`;
  }

  function eventPersonLabel(team, number, name, short) {
    const hasNum = number !== undefined && number !== null && String(number) !== "";
    if (!hasNum && !name && !short) return "—";
    if (!hasNum) return short || firstName(name) || name || "—";
    if (team === "opp") return name || short ? `${short || firstName(name)} #${number}` : `Opp #${number}`;
    if (short) return `#${number} ${short}`;
    const nick = firstName(name);
    return nick ? `#${number} ${nick}` : `#${number}`;
  }

  function shotTableRows(events, opts = {}) {
    if (!events.length) {
      return `<tr><td colspan="12" class="empty-state" style="padding:1.25rem">No plays yet.</td></tr>`;
    }
    return events
      .map((ev) => {
        const team = eventTeam(ev);
        const player = eventPersonLabel(team, ev.shooterNumber, ev.shooterName, ev.shooterShort);
        const assistBy = ev.assist ? eventPersonLabel(team, ev.assist.number, ev.assist.name, ev.assist.short) : "—";
        const assistType = ev.assist ? ASSIST_TYPE_LABELS[ev.assist.type] || ev.assist.type : "—";
        const assistPos = ev.assist?.position ? ` · ${ev.assist.position}` : "";
        const assistCell = ev.assist
          ? `${escapeHtml(formatLoc(ev.assist))}<br /><span class="muted">${escapeHtml(formatXY(ev.assist))}</span>`
          : "—";
        const resultLabel = SHOT_RESULT_LABELS[ev.result] || ev.result;
        const missLabel = ev.missDirection ? MISS_DIRECTION_LABELS[ev.missDirection] || ev.missDirection : "—";
        const failed = ev.saveFailed
          ? `<button type="button" class="btn btn-ghost shots-retry" data-retry-shot="${escapeHtml(ev.id)}">Retry save</button>`
          : "";
        const extra = opts.showGame && ev.gameDate ? `<td>${escapeHtml(ev.gameDate)}</td>` : "";
        return `
          <tr class="${ev.saveFailed ? "is-unsaved" : ""}">
            <td class="tracker-delete-cell">
              <button type="button" class="icon-btn tracker-delete" data-delete-shot="${escapeHtml(ev.id)}" aria-label="Delete shot">×</button>
            </td>
            <td>${escapeHtml(formatShotTime(ev.createdAt))}${failed}</td>
            ${extra}
            <td><span class="team-chip ${team === "opp" ? "is-opp" : "is-us"}">${escapeHtml(teamLabel(team, ev))}</span></td>
            <td><button type="button" class="linkish" data-edit-shot="${escapeHtml(ev.id)}">${escapeHtml(player)}</button></td>
            <td>${escapeHtml(ev.position || "—")}</td>
            <td><span class="shot-result-pill ${escapeHtml(ev.result)}">${escapeHtml(resultLabel)}</span></td>
            <td>${escapeHtml(missLabel)}</td>
            <td>${escapeHtml(assistBy)}${escapeHtml(assistPos)}</td>
            <td>${escapeHtml(assistType)}</td>
            <td class="tracker-coord-cell">${escapeHtml(formatLoc(ev.shot))}<br /><span class="muted">${escapeHtml(formatXY(ev.shot))}</span></td>
            <td class="tracker-coord-cell">${assistCell}</td>
          </tr>`;
      })
      .join("");
  }

  function shotTableMarkup(title, events) {
    return `
      <h3 class="tracker-half-heading">${escapeHtml(title)}</h3>
      <div class="tracker-summary">${summaryPills(trackerSummary(events))}</div>
      <div class="tracker-table-wrap">
        <table class="tracker-table">
          <thead>
            <tr>
              <th class="tracker-delete-cell"><span class="sr-only">Delete</span></th>
              <th>Time</th>
              <th>Team</th>
              <th>Player</th>
              <th>Pos</th>
              <th>Result</th>
              <th>Miss</th>
              <th>Assisted by</th>
              <th>Assist type</th>
              <th>Shot location</th>
              <th>Assist location</th>
            </tr>
          </thead>
          <tbody>${shotTableRows(events)}</tbody>
        </table>
      </div>`;
  }

  function bindLogActions() {
    $$("[data-delete-shot]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-delete-shot");
        const ev = st.shots.find((e) => e.id === id);
        const label = ev
          ? `${SHOT_RESULT_LABELS[ev.result] || ev.result} by ${eventPersonLabel(eventTeam(ev), ev.shooterNumber, ev.shooterName, ev.shooterShort)}`
          : "this recording";
        if (!confirm(`Delete ${label}?`)) return;
        if (ev?.saveFailed) {
          st.shots = st.shots.filter((e) => e.id !== id);
          draw({ keepScroll: true });
          return;
        }
        const result = await API.deleteShot(id);
        if (!result.ok) {
          showToast("Not saved — check connection");
          return;
        }
        st.shots = st.shots.filter((e) => e.id !== id);
        draw({ keepScroll: true });
      });
    });
    $$("[data-retry-shot]").forEach((btn) => {
      btn.addEventListener("click", () => retryShot(btn.getAttribute("data-retry-shot")));
    });
    $$("[data-edit-shot]").forEach((btn) => {
      btn.addEventListener("click", () => openEditShot(btn.getAttribute("data-edit-shot")));
    });
  }

  function openEditShot(id) {
    const ev = st.shots.find((s) => s.id === id) || st.history.rows?.find((s) => s.id === id);
    if (!ev) return;
    const modal = $("#shot-edit-modal");
    if (!modal) return;
    modal.dataset.shotId = id;
    const team = eventTeam(ev);
    const players = sortPlayers(rosterPlayers(team));
    if (ev.player_id && !players.find((p) => p.id === ev.player_id)) {
      players.unshift({
        id: ev.player_id,
        number: ev.shooterNumber,
        name: ev.shooterName,
        short: ev.shooterShort,
        team,
      });
    }
    $("#shot-edit-result").value = ev.result;
    $("#shot-edit-position").value = ev.position || "";
    const missSel = $("#shot-edit-miss");
    if (missSel) {
      missSel.value = ev.missDirection || "";
      missSel.disabled = !RESULTS_NEEDING_MISS_DIR.has(ev.result);
    }
    $("#shot-edit-player").innerHTML =
      `<option value="">Unknown / untagged</option>` +
      players
        .map(
          (p) =>
            `<option value="${p.id}" ${p.id === ev.player_id ? "selected" : ""}>${escapeHtml(playerDisplayName(p))} (#${escapeHtml(String(p.number))})</option>`
        )
        .join("");
    $("#shot-edit-name").value = ev.shooterName || "";
    $("#shot-edit-short").value = ev.shooterShort || "";
    modal.hidden = false;
  }

  function bindEditModal() {
    const modal = $("#shot-edit-modal");
    if (!modal || modal.dataset.bound === "1") return;
    modal.dataset.bound = "1";
    $$("[data-close-shot-edit]").forEach((el) => {
      el.addEventListener("click", () => {
        modal.hidden = true;
      });
    });
    $("#shot-edit-result")?.addEventListener("change", () => {
      const missSel = $("#shot-edit-miss");
      if (!missSel) return;
      const needs = RESULTS_NEEDING_MISS_DIR.has($("#shot-edit-result").value);
      missSel.disabled = !needs;
      if (!needs) missSel.value = "";
    });
    $("#shot-edit-save")?.addEventListener("click", async () => {
      const id = modal.dataset.shotId;
      const ev = st.shots.find((s) => s.id === id) || st.history.rows?.find((s) => s.id === id);
      if (!ev) return;
      const playerId = $("#shot-edit-player").value || null;
      const team = eventTeam(ev);
      const player = playerId ? playerFromRoster(team, playerId, null) : null;
      const result = $("#shot-edit-result").value;
      const missVal = $("#shot-edit-miss")?.value || "";
      const patch = {
        result,
        position: $("#shot-edit-position").value || null,
        miss_direction: RESULTS_NEEDING_MISS_DIR.has(result) ? missVal || null : null,
        player_id: playerId,
        jersey_number_at_time: player ? String(player.number) : ev.shooterNumber || null,
      };
      const saved = await API.updateShot(id, patch);
      if (!saved.ok) {
        showToast("Not saved — check connection");
        return;
      }
      const name = $("#shot-edit-name").value.trim();
      const short = $("#shot-edit-short").value.trim();
      const pid = playerId || ev.player_id;
      if (pid && (name || short)) {
        await API.updatePlayer(pid, { name: name || null, short_name: short || null });
        if (st.view === "shots-history") await runHistoryQuery();
        else if (st.game) await loadGameContext();
      } else {
        const mapped = mapShot(saved.data);
        const idx = st.shots.findIndex((s) => s.id === id);
        if (idx >= 0) st.shots[idx] = mapped;
        if (st.history.rows) {
          const hIdx = st.history.rows.findIndex((s) => s.id === id);
          if (hIdx >= 0) st.history.rows[hIdx] = Object.assign({}, st.history.rows[hIdx], mapped);
        }
      }
      modal.hidden = true;
      showToast("Shot updated");
      draw({ keepScroll: true });
    });
  }

  function usSelectOptions(slotId) {
    const current = slotPlayer("us", slotId);
    const used = usedLineupNumbers("us", slotId);
    const group = groupForSlot(slotId);
    const all = sortPlayers(rosterPlayers("us"));
    const opts = [`<option value="">—</option>`];

    const pushOpt = (p, suffix = "") => {
      const taken = used.has(String(p.number));
      const selected = current && String(current.number) === String(p.number);
      opts.push(
        `<option value="${escapeHtml(String(p.id || p.number))}" data-number="${escapeHtml(String(p.number))}" ${taken && !selected ? "disabled" : ""} ${selected ? "selected" : ""}>${escapeHtml(playerDisplayName(p))} (#${escapeHtml(String(p.number))})${suffix}</option>`
      );
    };

    const inGroup = all.filter((p) => p.squad !== "jv" && playerInGroup(p, group));
    const varsityRest = all.filter((p) => p.squad !== "jv" && !playerInGroup(p, group));
    const jv = all.filter((p) => p.squad === "jv");

    if (inGroup.length) {
      opts.push(`<optgroup label="${escapeHtml(POSITION_GROUPS.find((g) => g.id === group)?.label || group)}">`);
      inGroup.forEach((p) => pushOpt(p));
      opts.push(`</optgroup>`);
    }
    if (varsityRest.length) {
      opts.push(`<optgroup label="Varsity">`);
      varsityRest.forEach((p) => pushOpt(p));
      opts.push(`</optgroup>`);
    }
    if (jv.length) {
      opts.push(`<optgroup label="JV">`);
      jv.forEach((p) => pushOpt(p, " · JV"));
      opts.push(`</optgroup>`);
    }
    return opts.join("");
  }

  function oppSelectOptions(slotId) {
    const current = slotPlayer("opp", slotId);
    const used = usedLineupNumbers("opp", slotId);
    const opts = [`<option value="">—</option>`];
    const roster = sortPlayers(rosterPlayers("opp"));
    if (roster.length) {
      roster.forEach((p) => {
        const taken = used.has(String(p.number));
        const selected = current && String(current.number) === String(p.number);
        opts.push(
          `<option value="${escapeHtml(String(p.id || p.number))}" data-number="${escapeHtml(String(p.number))}" ${taken && !selected ? "disabled" : ""} ${selected ? "selected" : ""}>${
            p.name || p.short ? escapeHtml(playerDisplayName(p)) + ` (#${escapeHtml(String(p.number))})` : `#${escapeHtml(String(p.number))}`
          }</option>`
        );
      });
    } else {
      jerseyChoices().forEach((num) => {
        const taken = used.has(num);
        const selected = current && String(current.number) === num;
        opts.push(
          `<option value="n-${num}" data-number="${num}" ${taken && !selected ? "disabled" : ""} ${selected ? "selected" : ""}>${num}</option>`
        );
      });
    }
    return opts.join("");
  }

  function lineupEditorMarkup() {
    const team = st.lineup.edit === "opp" ? "opp" : "us";
    const count = onFieldPlayers(team).length;
    const cards = FORMATION_LAYOUT.map((layout) => {
      const slot = POSITION_SLOTS.find((s) => s.id === layout.id) || layout;
      const filled = slotPlayer(team, slot.id);
      const select =
        team === "opp"
          ? `<select class="lineup-select formation-card-select" data-lineup-team="opp" data-lineup-slot="${slot.id}" aria-label="${escapeHtml(slot.code)}">${oppSelectOptions(slot.id)}</select>`
          : `<select class="lineup-select formation-card-select" data-lineup-team="us" data-lineup-slot="${slot.id}" aria-label="${escapeHtml(slot.code)}">${usSelectOptions(slot.id)}</select>`;
      return `
        <div class="formation-card is-editor" style="${formationCardStyle(layout)}">
          ${select}
          <span class="formation-card-meta">${formationMeta(slot.code, filled)}</span>
          <button type="button" class="btn btn-ghost lineup-sub" data-sub-slot="${slot.id}" ${filled && team === "us" ? "" : "disabled"} title="Sub from position group">Sub</button>
        </div>`;
    }).join("");
    const defaultCount = defaultLineupCount();
    return `
      <section class="lineup-section" id="lineup-section">
        <div class="lineup-header">
          <h2>Starting lineup · 4-3-3</h2>
          <button type="button" class="btn ${lineupIsSet() ? "btn-secondary" : "btn-primary"}" id="set-positions-btn">${lineupIsSet() ? "Positions locked" : "Use this lineup"}</button>
        </div>
        <p class="muted lineup-help">${
          lineupIsSet()
            ? "Tap Sub on a card to swap. Dropdowns list that position group first."
            : "Assign the XI on the pitch, then tap Use this lineup."
        }</p>
        <div class="half-toggle lineup-team-toggle" role="tablist" aria-label="Lineup team">
          <button type="button" class="half-toggle-btn ${team === "us" ? "is-on" : ""}" data-lineup-edit="us">Brighton</button>
          <button type="button" class="half-toggle-btn ${team === "opp" ? "is-on" : ""}" data-lineup-edit="opp">${escapeHtml(opponentOf(st.game)?.name || "Opponent")}</button>
        </div>
        <p class="lineup-count">${count}/11 on the field</p>
        ${formationPitchShell(cards)}
        <div class="lineup-actions">
          <button type="button" class="btn btn-ghost" id="save-default-lineup" ${onFieldPlayers("us").length ? "" : "disabled"}>Save as default</button>
          <button type="button" class="btn btn-ghost" id="restore-default-lineup">Restore default${defaultCount ? ` (${defaultCount})` : ""}</button>
        </div>
      </section>`;
  }

  function openSubPicker(slotId) {
    const modal = $("#lineup-sub-modal");
    const list = $("#lineup-sub-list");
    const title = $("#lineup-sub-title");
    if (!modal || !list) return;
    const slot = POSITION_SLOTS.find((s) => s.id === Number(slotId));
    const group = slot?.group || "";
    const groupLabel = POSITION_GROUPS.find((g) => g.id === group)?.label || group;
    const used = usedLineupNumbers("us", slotId);
    const all = sortPlayers(rosterPlayers("us")).filter((p) => !used.has(String(p.number)));
    const preferred = all.filter((p) => p.squad !== "jv" && playerInGroup(p, group));
    const varsityRest = all.filter((p) => p.squad !== "jv" && !playerInGroup(p, group));
    const jv = all.filter((p) => p.squad === "jv");

    const btn = (p, tag) => `
      <button type="button" class="shot-player-btn" data-pick-sub="${escapeHtml(String(p.id || ""))}" data-pick-number="${escapeHtml(String(p.number))}">
        <span class="name">${escapeHtml(playerDisplayName(p))}</span>
        <span class="num">#${escapeHtml(String(p.number))}${tag ? ` · ${tag}` : ""}</span>
      </button>`;

    if (title) title.textContent = `Sub ${slot?.code || ""} · ${groupLabel}`;
    list.innerHTML =
      (preferred.length ? `<div class="shot-quick-label">${escapeHtml(groupLabel)}</div>${preferred.map((p) => btn(p, "")).join("")}` : "") +
      (varsityRest.length ? `<div class="shot-quick-label">Other varsity</div>${varsityRest.map((p) => btn(p, "")).join("")}` : "") +
      (jv.length ? `<div class="shot-quick-label">JV</div>${jv.map((p) => btn(p, "JV")).join("")}` : "") +
      (!preferred.length && !varsityRest.length && !jv.length ? `<p class="muted">No available players.</p>` : "");
    modal.dataset.slotId = String(slotId);
    modal.hidden = false;
  }

  function bindLineupEditor() {
    $$("[data-lineup-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        st.lineup.edit = btn.getAttribute("data-lineup-edit") === "opp" ? "opp" : "us";
        saveLineupBag();
        draw({ keepScroll: true });
      });
    });
    $("#set-positions-btn")?.addEventListener("click", () => {
      st.lineup.set = true;
      saveLineupBag();
      showToast("Lineup ready — on-field players will appear first");
      draw({ keepScroll: true });
    });
    $("#save-default-lineup")?.addEventListener("click", () => {
      saveCurrentAsDefault();
      draw({ keepScroll: true });
    });
    $("#restore-default-lineup")?.addEventListener("click", () => restoreDefaultLineup());
    $$(".lineup-select").forEach((sel) => {
      sel.addEventListener("change", () => {
        const team = sel.getAttribute("data-lineup-team") === "opp" ? "opp" : "us";
        const slotId = Number(sel.getAttribute("data-lineup-slot"));
        const opt = sel.selectedOptions[0];
        if (!sel.value) {
          assignSlot(team, slotId, null);
          draw({ keepScroll: true });
          return;
        }
        const number = opt?.getAttribute("data-number") || sel.value.replace(/^n-/, "");
        const list = rosterPlayers(team);
        const fromRoster =
          list.find((p) => p.id && p.id === sel.value) ||
          list.find((p) => String(p.number) === String(number)) ||
          null;
        const player = fromRoster || {
          id: sel.value.startsWith("n-") ? "" : sel.value,
          number,
          name: "",
          short: "",
        };
        assignSlot(team, slotId, {
          id: player.id || "",
          number: String(player.number),
          name: player.name || "",
          short: player.short || player.short_name || "",
        });
        draw({ keepScroll: true });
      });
    });
    $$("[data-sub-slot]").forEach((btn) => {
      btn.addEventListener("click", () => openSubPicker(Number(btn.getAttribute("data-sub-slot"))));
    });
  }

  function bindLineupSubModal() {
    const modal = $("#lineup-sub-modal");
    if (!modal || modal.dataset.bound === "1") return;
    modal.dataset.bound = "1";
    $$("[data-close-lineup-sub]").forEach((el) => {
      el.addEventListener("click", () => {
        modal.hidden = true;
      });
    });
    modal.addEventListener("click", (e) => {
      const pick = e.target.closest("[data-pick-sub]");
      if (!pick) return;
      const slotId = Number(modal.dataset.slotId);
      const number = pick.getAttribute("data-pick-number");
      const playerId = pick.getAttribute("data-pick-sub");
      const player = playerFromRoster("us", playerId, number);
      if (!player) return;
      assignSlot("us", slotId, {
        id: player.id || "",
        number: String(player.number),
        name: player.name || "",
        short: player.short || player.short_name || "",
      });
      modal.hidden = true;
      st.lineup.set = true;
      saveLineupBag();
      showToast(`Subbed in ${playerDisplayName(player)}`);
      draw({ keepScroll: true });
    });
  }

  function renderRecorder(opts = {}) {
    bindShotModal();
    bindEditModal();
    const scrollY = window.scrollY;
    const events = st.shots;
    const period = st.period;
    const etMode = period === "ET1" || period === "ET2";
    const firstHalf = events.filter((e) => eventPeriod(e) === "1");
    const secondHalf = events.filter((e) => eventPeriod(e) === "2");
    const etOne = events.filter((e) => eventPeriod(e) === "ET1");
    const etTwo = events.filter((e) => eventPeriod(e) === "ET2");
    const showEtLog = etMode || etOne.length > 0 || etTwo.length > 0;
    const awaitingShot = st.mode === "awaiting-shot-location";
    const goalSide = st.swapSides ? "left" : "right";
    let status = `Double-tap a spot on either pitch to start a play. ${periodLabel(period)} · goal on the ${goalSide}.`;
    if (awaitingShot) {
      const a = st.pending?.assist;
      status = a
        ? `Assist: ${playerLabel(a.player ? Object.assign({ team: recordingTeam() }, a.player) : null)} (${ASSIST_TYPE_LABELS[a.type]}). Tap the shot on the ${teamLabel(recordingTeam())} pitch.`
        : `Tap where the shot was taken on the ${teamLabel(recordingTeam())} pitch.`;
    }
    const usActive = recordingTeam() === "us";
    const pitchOpts = { showGrid: st.showGrid, period, swapped: st.swapSides };

    root().innerHTML = `
      <div class="tracker-page">
        ${trackerNav("shots")}
        <p class="shots-game-label">${escapeHtml(gameTitle(st.game))}</p>
        <section class="tracker-stage">
          <div class="half-toggle" role="tablist" aria-label="Match period">
            ${
              etMode
                ? `<button type="button" class="half-toggle-btn ${period === "ET1" ? "is-on" : ""}" data-set-period="ET1">ET 1</button>
            <button type="button" class="half-toggle-btn ${period === "ET2" ? "is-on" : ""}" data-set-period="ET2">ET 2</button>
            <button type="button" class="half-toggle-btn is-et" data-et-toggle aria-label="Back to regular time">90</button>`
                : `<button type="button" class="half-toggle-btn ${period === "1" ? "is-on" : ""}" data-set-period="1">1st Half</button>
            <button type="button" class="half-toggle-btn ${period === "2" ? "is-on" : ""}" data-set-period="2">2nd Half</button>
            <button type="button" class="half-toggle-btn is-et" data-et-toggle aria-label="Extra time">ET</button>`
            }
          </div>
          <div class="tracker-toolbar">
            ${
              awaitingShot
                ? `<button type="button" class="btn btn-secondary" id="tracker-cancel-record">Cancel assist</button>`
                : ""
            }
            <button type="button" class="btn btn-ghost" id="tracker-swap">${st.swapSides ? "Goal left" : "Swap sides"}</button>
            <button type="button" class="btn btn-ghost" id="tracker-export" ${events.length ? "" : "disabled"}>CSV</button>
            <button type="button" class="btn btn-ghost" id="tracker-toggle-grid">${st.showGrid ? "Hide zones" : "Zones"}</button>
          </div>
          <p class="tracker-status ${awaitingShot ? "is-live" : ""}" id="tracker-status">${escapeHtml(status)}</p>
          <div class="tracker-pitches">
            <div class="tracker-pitch-block ${usActive || !awaitingShot ? "is-active" : ""}">
              <p class="tracker-pitch-caption">Brighton · double-tap to record</p>
              <div class="pitch-wrap tracker-pitch-wrap" id="tracker-pitch-us">${halfPitchMarkup(events, Object.assign({ team: "us" }, pitchOpts))}</div>
            </div>
            <div class="tracker-pitch-block is-opp ${!usActive || !awaitingShot ? "is-active" : ""}">
              <p class="tracker-pitch-caption">${escapeHtml(opponentOf(st.game)?.name || "Opponent")} · double-tap to record</p>
              <div class="pitch-wrap tracker-pitch-wrap" id="tracker-pitch-opp">${halfPitchMarkup(events, Object.assign({ team: "opp" }, pitchOpts))}</div>
            </div>
          </div>
        </section>
        ${lineupEditorMarkup()}
        <section class="tracker-units" id="tracker-units">
          <h2>Units &amp; trends</h2>
          ${unitsMarkup(events.filter((e) => eventTeam(e) === "us"))}
        </section>
        <section class="tracker-log" id="tracker-log">
          <h2>Recorded plays</h2>
          ${shotTableMarkup("1st Half", firstHalf)}
          ${shotTableMarkup("2nd Half", secondHalf)}
          ${showEtLog ? shotTableMarkup("ET 1", etOne) + shotTableMarkup("ET 2", etTwo) : ""}
        </section>
      </div>`;

    $("#tracker-cancel-record")?.addEventListener("click", () => {
      closeShotModal();
      resetTrackerDraft();
      draw();
    });
    $$("[data-set-period]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = normalizePeriod(btn.getAttribute("data-set-period"));
        if (next === st.period) return;
        st.period = next;
        saveUi();
        resetTrackerDraft();
        closeShotModal();
        draw({ keepScroll: true });
      });
    });
    $("[data-et-toggle]")?.addEventListener("click", () => {
      st.period = period === "ET1" || period === "ET2" ? "2" : "ET1";
      saveUi();
      resetTrackerDraft();
      closeShotModal();
      draw({ keepScroll: true });
    });
    $("#tracker-swap")?.addEventListener("click", () => {
      st.swapSides = !st.swapSides;
      saveUi();
      draw({ keepScroll: true });
    });
    $("#tracker-toggle-grid")?.addEventListener("click", () => {
      st.showGrid = !st.showGrid;
      saveUi();
      draw({ keepScroll: true });
    });
    $("#tracker-export")?.addEventListener("click", () => exportShotsCsv(events));
    bindTrackerPitches();
    bindLineupEditor();
    bindLineupSubModal();
    bindLogActions();
    if (opts.keepScroll) window.scrollTo(0, scrollY);
  }

  function toFullFieldPoint(loc, period, team) {
    const x = Number(loc.x);
    const y = Number(loc.y);
    const usAttacksRight = period !== "2" && period !== "ET2";
    const attacksRight = team === "opp" ? !usAttacksRight : usAttacksRight;
    if (!attacksRight) return { fx: y, fy: PW - x };
    return { fx: PL - y, fy: x };
  }

  function resultFill(result) {
    if (result === "goal" || result === "pk-goal") return "#f0c14b";
    if (result === "on-target") return "#ffffff";
    if (result === "blocked") return "#e07a3d";
    if (result === "foul") return "#9b59b6";
    if (result === "corner") return "#3498db";
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
        const stroke = team === "opp" ? "#c0392b" : ev.result === "missed" || ev.result === "pk-missed" ? "#ffffff" : "#0b1f33";
        const numFill = team === "opp" || ev.result === "missed" || ev.result === "pk-missed" ? "#ffffff" : "#0b1f33";
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
      <svg id="shot-map-svg" class="shot-map-svg" viewBox="-3.2 -3.2 111.4 74.4" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Full-field shot map.">
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

  function renderMap() {
    const events = st.shots;
    const firstHalf = events.filter((e) => eventPeriod(e) === "1");
    const secondHalf = events.filter((e) => eventPeriod(e) === "2");
    const etOne = events.filter((e) => eventPeriod(e) === "ET1");
    const etTwo = events.filter((e) => eventPeriod(e) === "ET2");
    const hasEt = etOne.length > 0 || etTwo.length > 0;
    const vs = opponentOf(st.game)?.name || "";
    const dateLabel = st.game?.date || "";
    root().innerHTML = `
      <div class="shot-map-page">
        ${trackerNav("map")}
        <div class="shot-map-actions no-print">
          <a class="btn btn-ghost" href="#shots">Back</a>
          <button type="button" class="btn btn-primary" id="shot-map-print">Print / PDF</button>
          <button type="button" class="btn btn-ghost" id="shot-map-save" ${events.length ? "" : "disabled"}>Save image</button>
        </div>
        <div class="shot-map-print" id="shot-map-print-root">
          <header class="shot-map-header">
            <h1>Brighton Bengals</h1>
            <p>
              <span class="shot-map-vs-print">${vs ? `vs ${escapeHtml(vs)}` : ""}</span>
              <span class="muted"> · ${escapeHtml(String(dateLabel))}</span>
            </p>
          </header>
          <div class="shot-map-pitch">${fullFieldMarkup(events)}</div>
          <p class="shot-map-caption">1st half and ET 1: we attack the right goal, they attack the left. 2nd half and ET 2 reverse. Gold = goal · White = on target · Orange = blocked · Hollow = missed · Blue dot = assist · Red ring = opponent.</p>
          <div class="shot-map-stats">
            <div><h2>1st Half</h2><div class="tracker-summary">${summaryPills(trackerSummary(firstHalf))}</div></div>
            <div><h2>2nd Half</h2><div class="tracker-summary">${summaryPills(trackerSummary(secondHalf))}</div></div>
            ${
              hasEt
                ? `<div><h2>ET 1</h2><div class="tracker-summary">${summaryPills(trackerSummary(etOne))}</div></div>
            <div><h2>ET 2</h2><div class="tracker-summary">${summaryPills(trackerSummary(etTwo))}</div></div>`
                : ""
            }
          </div>
        </div>
      </div>`;
    $("#shot-map-print")?.addEventListener("click", () => window.print());
    $("#shot-map-save")?.addEventListener("click", () => downloadSummaryImage());
  }

  function historyViewRow(row) {
    const mapped = mapShot(row);
    mapped.game = row.game;
    mapped.gameDate = row.game?.date || "";
    const b = brighton();
    mapped.opponentName = "";
    if (row.game) {
      mapped.opponentName =
        row.game.home_team_id === b?.id ? row.game.away_team?.name || "" : row.game.home_team?.name || "";
    }
    mapped.seasonLabel = row.game?.season?.label || "";
    mapped.shooterName = row.player?.name || mapped.shooterName;
    mapped.shooterShort = row.player?.short_name || mapped.shooterShort;
    return mapped;
  }

  async function runHistoryQuery() {
    const f = st.history;
    f.loading = true;
    draw();
    const filters = {};
    if (f.playerId) filters.playerId = f.playerId;
    if (f.seasonId === "__last3") filters.seasonYearMin = new Date().getFullYear() - 2;
    else if (f.seasonId) filters.seasonId = f.seasonId;
    if (f.opponentId) filters.opponentId = f.opponentId;
    if (f.depth === "outside") filters.depthIds = OUTSIDE_BOX_DEPTHS;
    if (f.depth === "box") filters.depthIds = ["6Y", "PS", "BOX"];
    if (f.depth && f.depth !== "outside" && f.depth !== "box" && f.depth !== "") {
      filters.depthIds = [f.depth];
    }
    try {
      const rows = await API.queryShots(filters);
      f.rows = rows.map(historyViewRow);
      f.loading = false;
    } catch (err) {
      st.error = err.message || "Query failed";
      f.loading = false;
    }
    draw();
  }

  function renderHistory() {
    bindEditModal();
    const f = st.history;
    const oppTeams = st.teams.filter((t) => !t.is_brighton);
    const rows = f.rows;
    root().innerHTML = `
      <div class="shots-admin shots-history">
        ${trackerNav("history")}
        <h1>Season history</h1>
        <p class="muted">Filter by player, opponent, and depth. Naming a player updates every shot tied to that player.</p>
        ${st.error ? `<p class="shots-error">${escapeHtml(st.error)}</p>` : ""}
        <form id="history-form" class="shots-form">
          <label class="shots-field">Season
            <select id="hist-season">
              <option value="">All seasons</option>
              <option value="__last3" ${f.seasonId === "__last3" ? "selected" : ""}>Last 3 years</option>
              ${seasonOptions(f.seasonId === "__last3" ? "" : f.seasonId, false)}
            </select>
          </label>
          <label class="shots-field">Player
            <select id="hist-player">
              <option value="">All players</option>
              ${st.namedPlayers
                .map(
                  (p) =>
                    `<option value="${p.id}" ${p.id === f.playerId ? "selected" : ""}>${escapeHtml(p.short_name || firstName(p.name) || p.name)}</option>`
                )
                .join("")}
            </select>
          </label>
          <label class="shots-field">Opponent
            <select id="hist-opp">
              <option value="">All opponents</option>
              ${oppTeams
                .map((t) => `<option value="${t.id}" ${t.id === f.opponentId ? "selected" : ""}>${escapeHtml(t.name)}</option>`)
                .join("")}
            </select>
          </label>
          <label class="shots-field">Depth
            <select id="hist-depth">
              <option value="" ${f.depth === "" ? "selected" : ""}>All locations</option>
              <option value="outside" ${f.depth === "outside" ? "selected" : ""}>Outside the box</option>
              <option value="box" ${f.depth === "box" ? "selected" : ""}>In the box</option>
              <option value="D" ${f.depth === "D" ? "selected" : ""}>Top of the box / Zone 14</option>
              <option value="AT" ${f.depth === "AT" ? "selected" : ""}>Attacking third</option>
              <option value="DEF" ${f.depth === "DEF" ? "selected" : ""}>Defensive half</option>
            </select>
          </label>
          <button type="submit" class="btn btn-primary">Run query</button>
        </form>
        ${
          rows
            ? `          <div class="tracker-toolbar">
            <span class="pill">Matches <strong>${rows.length}</strong></span>
            <button type="button" class="btn btn-ghost" id="hist-export" ${rows.length ? "" : "disabled"}>CSV of this view</button>
          </div>
          <section class="tracker-units">
            <h2>Units &amp; trends (Brighton)</h2>
            ${unitsMarkup(rows.filter((e) => eventTeam(e) === "us"))}
          </section>
          <div class="tracker-table-wrap">
            <table class="tracker-table">
              <thead>
                <tr>
                  <th class="tracker-delete-cell"><span class="sr-only">Delete</span></th>
                  <th>Time</th>
                  <th>Game</th>
                  <th>Team</th>
                  <th>Player</th>
                  <th>Pos</th>
                  <th>Result</th>
                  <th>Miss</th>
                  <th>Assisted by</th>
                  <th>Assist type</th>
                  <th>Shot location</th>
                  <th>Assist location</th>
                </tr>
              </thead>
              <tbody>${shotTableRows(rows, { showGame: true })}</tbody>
            </table>
          </div>
          <p class="muted">Open a past game from Games, then Map, to see that game's full-field shot map.</p>`
            : `<p class="muted">Run a query to see shots across games.</p>`
        }
      </div>`;
    $("#history-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      st.history.seasonId = $("#hist-season").value;
      st.history.playerId = $("#hist-player").value;
      st.history.opponentId = $("#hist-opp").value;
      st.history.depth = $("#hist-depth").value;
      runHistoryQuery();
    });
    $("#hist-export")?.addEventListener("click", () => {
      exportShotsCsv(
        (rows || []).map((ev) => {
          ev.game = ev.game;
          return Object.assign({}, ev, {});
        }),
        `bengals-shots-filtered-${new Date().toISOString().slice(0, 10)}.csv`
      );
    });
    if (rows) {
      $$("[data-delete-shot]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-delete-shot");
          if (!confirm("Delete this shot from the shared database?")) return;
          const result = await API.deleteShot(id);
          if (!result.ok) {
            showToast("Not saved — check connection");
            return;
          }
          st.history.rows = st.history.rows.filter((s) => s.id !== id);
          st.shots = st.shots.filter((s) => s.id !== id);
          draw({ keepScroll: true });
        });
      });
      $$("[data-edit-shot]").forEach((btn) => {
        btn.addEventListener("click", () => openEditShot(btn.getAttribute("data-edit-shot")));
      });
    }
  }

  function draw(opts = {}) {
    const el = root();
    if (!el) return;
    if (!API || !API.isConfigured()) {
      renderSetup();
      return;
    }
    if (!st.booted) {
      renderLoading("Connecting…");
      return;
    }
    if (!st.session) {
      renderPin();
      return;
    }
    if (st.loading) {
      renderLoading("Loading…");
      return;
    }
    const view = st.view;
    if (view === "shots-games") {
      renderGames();
      return;
    }
    if (view === "shots-history") {
      renderHistory();
      return;
    }
    if (!st.gameId || !st.game) {
      renderGames();
      return;
    }
    if (view === "shots-map") {
      renderMap();
      return;
    }
    renderRecorder(opts);
  }

  global.ShotTracker = {
    render(view) {
      st.view = view || "shots";
      if (!st.booted) {
        draw();
        boot();
        return;
      }
      draw();
    },
    onLeave() {
      closeShotModal();
      resetTrackerDraft();
      const edit = $("#shot-edit-modal");
      if (edit) edit.hidden = true;
    },
    onEscape() {
      if (shotModal && !shotModal.hidden) {
        dismissShotModal();
        return true;
      }
      const sub = $("#lineup-sub-modal");
      if (sub && !sub.hidden) {
        sub.hidden = true;
        return true;
      }
      const edit = $("#shot-edit-modal");
      if (edit && !edit.hidden) {
        edit.hidden = true;
        return true;
      }
      return false;
    },
  };
})(window);
