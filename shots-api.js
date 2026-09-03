/**
 * Brighton Shot Tracker — Supabase access layer.
 *
 * Known gap (Phase 2): writes are online-only. Spotty stadium wifi is not
 * queued or synced. Failed inserts stay on-screen as "not saved" so the coach
 * can retry. Offline-first / conflict resolution is out of scope.
 *
 * Also out of scope: per-coach attribution, shot audit trail, realtime
 * multi-device live updates (UI has manual Sync), xG / video / formation drawing.
 */
(function (global) {
  "use strict";

  const cfg = () => global.SHOTS_CONFIG || {};

  let client = null;

  function isConfigured() {
    const c = cfg();
    return !!(c.supabaseUrl && c.supabaseAnonKey && global.supabase);
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!client) {
      const c = cfg();
      client = global.supabase.createClient(c.supabaseUrl, c.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
    }
    return client;
  }

  function pinValue() {
    return String(cfg().pin || "KEPPA").trim().toUpperCase();
  }

  function throwIfError(error, fallback) {
    if (error) throw new Error(error.message || fallback || "Request failed");
  }

  const SHOT_SELECT_CORE = `
    *,
    player:players!shots_player_id_fkey (id, name, short_name),
    fouler:players!shots_fouler_player_id_fkey (id, name, short_name),
    assist_player:players!shots_assist_player_id_fkey (id, name, short_name)
  `;
  const SHOT_SELECT = `${SHOT_SELECT_CORE.trim()},
    second_assist_player:players!second_assist_player_id (id, name, short_name)
  `;

  function isMissingRelationship(error) {
    const msg = String(error?.message || "");
    return /could not find a relationship/i.test(msg) || /schema cache/i.test(msg);
  }

  async function runShotSelect(build) {
    const first = await build(SHOT_SELECT);
    if (!first.error || !isMissingRelationship(first.error)) return first;
    return build(SHOT_SELECT_CORE);
  }

  const GAME_SELECT = `
    *,
    season:seasons (*),
    home_team:teams!games_home_team_id_fkey (*),
    away_team:teams!games_away_team_id_fkey (*),
    our_team:teams!games_our_team_id_fkey (*)
  `;

  const ROSTER_SELECT = `
    *,
    player:players (*)
  `;

  const api = {
    isConfigured,
    pinValue,
    getClient,

    async getSession() {
      const sb = getClient();
      if (!sb) return null;
      const { data } = await sb.auth.getSession();
      return data.session || null;
    },

    async signInWithPin(entered) {
      if (String(entered || "").trim().toUpperCase() !== pinValue()) {
        return { ok: false, error: "Wrong PIN" };
      }
      const sb = getClient();
      if (!sb) return { ok: false, error: "Supabase is not configured" };
      const { data, error } = await sb.auth.signInAnonymously();
      if (error) {
        return {
          ok: false,
          error: error.message || "Sign-in failed. Enable Anonymous auth in Supabase.",
        };
      }
      return { ok: true, session: data.session };
    },

    async signOut() {
      const sb = getClient();
      if (sb) await sb.auth.signOut();
    },

    async teams() {
      const { data, error } = await getClient().from("teams").select("*").order("name");
      throwIfError(error, "Could not load teams");
      return data || [];
    },

    async seasons() {
      const { data, error } = await getClient()
        .from("seasons")
        .select("*")
        .order("year", { ascending: false })
        .order("label", { ascending: false });
      throwIfError(error, "Could not load seasons");
      return data || [];
    },

    async games(seasonId) {
      let q = getClient().from("games").select(GAME_SELECT).order("date", { ascending: false });
      if (seasonId) q = q.eq("season_id", seasonId);
      const { data, error } = await q;
      throwIfError(error, "Could not load games");
      return data || [];
    },

    async game(id) {
      const { data, error } = await getClient().from("games").select(GAME_SELECT).eq("id", id).single();
      throwIfError(error, "Could not load game");
      return data;
    },

    async createTeam(name) {
      const { data, error } = await getClient()
        .from("teams")
        .insert({ name: String(name).trim(), is_brighton: false })
        .select()
        .single();
      throwIfError(error, "Could not create team");
      return data;
    },

    async createSeason(year, label) {
      const { data, error } = await getClient()
        .from("seasons")
        .insert({ year: Number(year), label: String(label).trim() })
        .select()
        .single();
      throwIfError(error, "Could not create season");
      return data;
    },

    async createGame(row) {
      const { data, error } = await getClient().from("games").insert(row).select(GAME_SELECT).single();
      throwIfError(error, "Could not create game");
      return data;
    },

    async roster(teamId, seasonId) {
      const { data, error } = await getClient()
        .from("rosters")
        .select(ROSTER_SELECT)
        .eq("team_id", teamId)
        .eq("season_id", seasonId)
        .order("jersey_number");
      throwIfError(error, "Could not load roster");
      return data || [];
    },

    async ensureRosterPlayer(teamId, seasonId, jerseyNumber, name) {
      const jersey = String(jerseyNumber);
      const existing = await getClient()
        .from("rosters")
        .select(ROSTER_SELECT)
        .eq("team_id", teamId)
        .eq("season_id", seasonId)
        .eq("jersey_number", jersey)
        .maybeSingle();
      throwIfError(existing.error, "Could not look up roster");
      if (existing.data) return existing.data;

      const playerInsert = await getClient()
        .from("players")
        .insert({
          name: name ? String(name).trim() : null,
          short_name: null,
        })
        .select()
        .single();
      throwIfError(playerInsert.error, "Could not create player");

      const rosterInsert = await getClient()
        .from("rosters")
        .insert({
          team_id: teamId,
          season_id: seasonId,
          player_id: playerInsert.data.id,
          jersey_number: jersey,
          squad: "varsity",
        })
        .select(ROSTER_SELECT)
        .single();
      if (rosterInsert.error) {
        const again = await getClient()
          .from("rosters")
          .select(ROSTER_SELECT)
          .eq("team_id", teamId)
          .eq("season_id", seasonId)
          .eq("jersey_number", jersey)
          .maybeSingle();
        if (again.data) return again.data;
        throwIfError(rosterInsert.error, "Could not add roster row");
      }
      return rosterInsert.data;
    },

    async updatePlayer(id, patch) {
      const { data, error } = await getClient().from("players").update(patch).eq("id", id).select().single();
      throwIfError(error, "Could not update player");
      return data;
    },

    async shotsForGame(gameId) {
      const { data, error } = await runShotSelect((select) =>
        getClient().from("shots").select(select).eq("game_id", gameId).order("created_at", { ascending: false })
      );
      throwIfError(error, "Could not load shots");
      return data || [];
    },

    async insertShot(row) {
      const { data, error } = await runShotSelect((select) =>
        getClient().from("shots").insert(row).select(select).single()
      );
      if (!error) return { ok: true, data };
      if (/second_assist_|schema cache|Could not find/i.test(error.message || "")) {
        const slim = { ...row };
        Object.keys(slim).forEach((k) => {
          if (k.startsWith("second_assist_")) delete slim[k];
        });
        const retry = await runShotSelect((select) =>
          getClient().from("shots").insert(slim).select(select).single()
        );
        if (!retry.error) return { ok: true, data: retry.data };
        return { ok: false, error: retry.error.message || "Not saved — check connection" };
      }
      return { ok: false, error: error.message || "Not saved — check connection" };
    },

    async updateShot(id, patch) {
      const { data, error } = await runShotSelect((select) =>
        getClient().from("shots").update(patch).eq("id", id).select(select).single()
      );
      if (error) return { ok: false, error: error.message || "Not saved — check connection" };
      return { ok: true, data };
    },

    async deleteShot(id) {
      const { error } = await getClient().from("shots").delete().eq("id", id);
      if (error) return { ok: false, error: error.message || "Could not delete" };
      return { ok: true };
    },

    async queryShots(filters) {
      const extra = `,
          game:games!shots_game_id_fkey (
            id, date, game_type, season_id, home_team_id, away_team_id, our_team_id,
            season:seasons (*),
            home_team:teams!games_home_team_id_fkey (*),
            away_team:teams!games_away_team_id_fkey (*)
          ),
          team:teams!shots_team_id_fkey (*)
        `;
      const applyFilters = (q) => {
        if (filters.playerId) q = q.eq("player_id", filters.playerId);
        if (filters.teamId) q = q.eq("team_id", filters.teamId);
        if (filters.gameId) q = q.eq("game_id", filters.gameId);
        if (filters.result) q = q.eq("result", filters.result);
        if (filters.period) q = q.eq("period", filters.period);
        if (filters.zoneId) q = q.eq("zone_id", filters.zoneId);
        if (filters.zonePrefix) q = q.like("zone_id", `${filters.zonePrefix}%`);
        if (filters.zoneIds && filters.zoneIds.length) q = q.in("zone_id", filters.zoneIds);
        if (filters.depthIds && filters.depthIds.length) {
          const ors = filters.depthIds
            .map((d) => (d === "DEF" ? "zone_id.eq.DEF" : `zone_id.like.%-${d}`))
            .join(",");
          q = q.or(ors);
        }
        return q.order("created_at", { ascending: false }).limit(5000);
      };
      const { data, error } = await runShotSelect((select) =>
        applyFilters(getClient().from("shots").select(`${select}${extra}`))
      );
      throwIfError(error, "Could not query shots");
      let rows = data || [];

      if (filters.seasonId) {
        rows = rows.filter((s) => s.game && s.game.season_id === filters.seasonId);
      }
      if (filters.opponentId) {
        rows = rows.filter(
          (s) =>
            s.game &&
            (s.game.home_team_id === filters.opponentId || s.game.away_team_id === filters.opponentId)
        );
      }
      if (filters.seasonYearMin) {
        rows = rows.filter((s) => s.game?.season && s.game.season.year >= filters.seasonYearMin);
      }
      return rows;
    },

    async namedPlayers() {
      const { data, error } = await getClient()
        .from("players")
        .select("*")
        .not("name", "is", null)
        .order("name");
      throwIfError(error, "Could not load players");
      return data || [];
    },

    /**
     * Natural-language explore via Edge Function explore-shots.
     * Requires staff PIN session. OPENAI_API_KEY must be set as a Supabase secret.
     */
    async explore(question, history) {
      const sb = getClient();
      if (!sb) return { ok: false, error: "Supabase is not configured" };
      const { data, error } = await sb.functions.invoke("explore-shots", {
        body: {
          question: String(question || "").trim(),
          history: Array.isArray(history) ? history : [],
        },
      });
      const payload = data && typeof data === "object" ? data : null;
      if (error) {
        const msg =
          (payload && payload.error) ||
          error.message ||
          "Explore request failed. Deploy explore-shots and set OPENAI_API_KEY.";
        return { ok: false, error: msg, data: payload };
      }
      if (payload && payload.error) {
        return { ok: false, error: payload.error, data: payload };
      }
      return { ok: true, data: payload };
    },
  };

  global.ShotAPI = api;
})(window);
