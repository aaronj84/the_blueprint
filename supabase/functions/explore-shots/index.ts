/**
 * Explore Shot Tracker data with natural language.
 * Secrets: OPENAI_API_KEY
 * Auto: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SCHEMA_PROMPT = `You are a soccer analytics assistant for Brighton High School girls varsity (the Bengals).
You answer coach questions by writing ONE read-only PostgreSQL SELECT (or WITH … SELECT) against this schema.

TABLES
- teams(id uuid, name text, is_brighton boolean) — exactly one Brighton row (is_brighton=true)
- seasons(id uuid, year int, label text)
- players(id uuid, name text, short_name text, position_groups text[]) — groups: GK, OB, CB, MID, FWD
- games(id uuid, season_id uuid, date date, game_type text, home_team_id uuid, away_team_id uuid, our_team_id uuid)
  game_type in: preseason|region|playoffs|friendly|other
- rosters(id uuid, team_id uuid, season_id uuid, player_id uuid, jersey_number text, squad text) — squad: varsity|jv
- shots(id uuid, game_id uuid, period text, team_id uuid, player_id uuid, jersey_number_at_time text,
    position text, x numeric, y numeric, zone_id text, zone_label text, result text, miss_direction text,
    fouler_player_id uuid, fouler_jersey_number_at_time text,
    assist_player_id uuid, assist_type text, assist_position text,
    assist_x numeric, assist_y numeric, assist_zone_id text, assist_zone_label text,
    created_at timestamptz, updated_at timestamptz)

SHOT / ASSIST SEMANTICS
- result: goal|on-target|blocked|missed|foul|corner|pk-goal|pk-missed
- "on frame" / "on target" ≈ result in ('goal','on-target','pk-goal')
- assist_type: pass|gap|cross (gap = through-ball / gap pass)
- position / assist_position: GK,RB,LB,RCB,LCB,DM,RW,RM,CM,CF,LM,AM,LW
- Midfielders for assists: assist_position in ('DM','LM','RM','CM','AM') OR assist player's position_groups includes MID
- Forwards: position in ('LW','CF','RW','AM') OR position_groups includes FWD
- period: '1'|'2'|'ET1'|'ET2'
- Coordinates: x is across the pitch (0–68), y is depth from attacking goal line toward halfway (meters). Attacking half only for most shots.
- zone_id like "C-BOX", "LHS-D", "DEF" — channel (LW|LHS|C|RHS|RW) + depth (6Y|PS|BOX|D|AT|HALF) or DEF

JOINS
- Opponent of a game: the team that is not our_team_id among home/away
- Brighton shots: shots.team_id = games.our_team_id
- Opponent shots: shots.team_id <> games.our_team_id
- Prefer joining players for names: coalesce(short_name, name)
- Prefer joining teams for opponent names

RULES
- Output JSON only, no markdown fences.
- sql must be a single SELECT/WITH, no semicolons, no writes, no DDL.
- Always LIMIT results (default 100, max 200).
- Prefer aggregations for trends; include player/team names via joins, not bare UUIDs.
- If asking for a pitch map / locations, SELECT columns named x and y (and optional result, jersey/player label).
- If the question is ambiguous, choose the most useful Brighton-focused interpretation.
- answer: 1–4 short sentences for coaches (no SQL jargon). After data returns you will not re-run; write answer as if summarizing what the query will show — the client may display answer + table.
- viz: "table" | "pitch" | "none" — use pitch when spatial layout matters and x,y are selected.

Return exactly:
{"sql":"...","answer":"...","viz":"table"}`;

type ExploreBody = {
  question?: string;
  history?: { role: string; content: string }[];
};

type LlmPlan = {
  sql: string;
  answer: string;
  viz: "table" | "pitch" | "none";
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function validateSql(sql: string): string {
  let cleaned = String(sql || "").trim();
  cleaned = cleaned.replace(/;\s*$/, "");
  if (!cleaned) throw new Error("Model returned empty SQL");
  if (/;\s*\S/.test(cleaned)) throw new Error("Multiple SQL statements are not allowed");
  if (!/^\s*(with|select)\b/i.test(cleaned)) {
    throw new Error("Only SELECT queries are allowed");
  }
  const forbidden =
    /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|execute|do|set\s+|reset|notify|listen|unlisten|vacuum|analyze|reindex|cluster|comment|security|owner|policy|function|procedure|trigger|extension|schema|database|role|user|password)\b/i;
  if (forbidden.test(cleaned)) throw new Error("Forbidden keyword in SQL");
  if (!/\blimit\b/i.test(cleaned)) {
    cleaned = `SELECT * FROM (${cleaned}) AS explore_q LIMIT 100`;
  }
  return cleaned;
}

function parsePlan(raw: string): LlmPlan {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(text) as LlmPlan;
  if (!parsed || typeof parsed.sql !== "string") throw new Error("Invalid model response");
  const viz = parsed.viz === "pitch" || parsed.viz === "none" ? parsed.viz : "table";
  return {
    sql: parsed.sql,
    answer: String(parsed.answer || "").trim() || "Here is what I found.",
    viz,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!openaiKey) return jsonResponse({ error: "OPENAI_API_KEY is not configured" }, 500);
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return jsonResponse({ error: "Supabase env is not configured" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Missing authorization" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return jsonResponse({ error: "Sign in with the staff PIN first" }, 401);
    }

    const body = (await req.json()) as ExploreBody;
    const question = String(body.question || "").trim();
    if (!question) return jsonResponse({ error: "Ask a question about the shot data" }, 400);
    if (question.length > 2000) return jsonResponse({ error: "Question is too long" }, 400);

    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const messages: { role: string; content: string }[] = [
      { role: "system", content: SCHEMA_PROMPT },
      ...history
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1500) })),
      { role: "user", content: question },
    ];

    const llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (!llmRes.ok) {
      const errText = await llmRes.text();
      console.error("OpenAI error", llmRes.status, errText);
      return jsonResponse({ error: "OpenAI request failed" }, 502);
    }

    const llmJson = await llmRes.json();
    const content = llmJson?.choices?.[0]?.message?.content;
    if (!content) return jsonResponse({ error: "Empty model response" }, 502);

    const plan = parsePlan(content);
    const sql = validateSql(plan.sql);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: rows, error: rpcErr } = await admin.rpc("explore_readonly", { query: sql });
    if (rpcErr) {
      console.error("RPC error", rpcErr, sql);
      return jsonResponse(
        {
          error: "Query failed. Try rephrasing.",
          detail: rpcErr.message,
          sql,
          answer: plan.answer,
        },
        400
      );
    }

    const list = Array.isArray(rows) ? rows : [];
    const columns =
      list.length > 0 && list[0] && typeof list[0] === "object"
        ? Object.keys(list[0] as Record<string, unknown>)
        : [];

    let answer = plan.answer;
    try {
      const sample = list.slice(0, 40);
      const narrateRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You summarize soccer shot-tracker query results for Brighton coaches. Reply with 1–4 plain sentences. Be factual from the rows only. No SQL, no markdown, no preamble.",
            },
            {
              role: "user",
              content: `Question: ${question}\nRow count: ${list.length}\nSample rows JSON:\n${JSON.stringify(sample)}`,
            },
          ],
        }),
      });
      if (narrateRes.ok) {
        const narrateJson = await narrateRes.json();
        const narrated = String(narrateJson?.choices?.[0]?.message?.content || "").trim();
        if (narrated) answer = narrated;
      }
    } catch (narrateErr) {
      console.error("Narrate error", narrateErr);
    }

    return jsonResponse({
      answer,
      viz: plan.viz,
      sql,
      columns,
      rows: list.slice(0, 200),
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Explore failed" },
      500
    );
  }
});
