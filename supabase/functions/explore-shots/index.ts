/**
 * Explore Shot Tracker data with natural language.
 * Secrets: OPENAI_API_KEY (required). Optional: EXPLORE_OPENAI_MODEL.
 * Auto: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 *
 * Core logic lives in ../_shared/explore so the benchmark harness can
 * exercise the same prompts, SQL safety, and two-call pipeline.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { runExploreAnalysis } from "../_shared/explore/pipeline.ts";
import { createOpenAiProvider } from "../_shared/explore/providers/openai.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ExploreBody = {
  question?: string;
  history?: { role: string; content: string }[];
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
    const model = Deno.env.get("EXPLORE_OPENAI_MODEL") || "gpt-4o-mini";

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

    const admin = createClient(supabaseUrl, serviceKey);
    const provider = createOpenAiProvider(openaiKey);
    const result = await runExploreAnalysis({
      provider,
      model,
      question,
      history: Array.isArray(body.history) ? body.history : [],
      admin,
    });

    if (!result.success) {
      const status =
        result.error_kind === "sql_execution_failure" || result.error_kind === "unsafe_sql"
          ? 400
          : result.error_kind === "api_error" || result.error_kind === "rate_limit"
          ? 502
          : 500;
      return jsonResponse(
        {
          error:
            result.error_kind === "sql_execution_failure"
              ? "Query failed. Try rephrasing."
              : result.error || "Explore failed",
          detail: result.sql_error || result.error,
          sql: result.sql,
          answer: result.answer || undefined,
        },
        status,
      );
    }

    return jsonResponse({
      answer: result.answer,
      viz: result.viz,
      sql: result.sql,
      columns: result.columns,
      rows: result.rows,
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Explore failed" },
      500,
    );
  }
});
