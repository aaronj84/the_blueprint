# Shot tracker — Supabase pickup

Use this file when switching machines. Fill in the URL and anon key from the dashboard if they are still blank, then copy them into `shots-config.js` on the other computer.

## Credentials

Paste these into `/shots-config.js` at the repo root:

```js
window.SHOTS_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  pin: "KEPPA"
};
```

| Setting | Value |
| --- | --- |
| PIN (shared staff gate, not per-coach auth) | `KEPPA` |
| Project URL | Project Settings → API → **Project URL** (`https://<ref>.supabase.co`) |
| Anon / public key | Project Settings → API → **anon** `public` |
| Service role key | Do **not** put this in the app or this file |

`shots-config.js` in this repo currently has empty URL/key strings. After you create (or open) the project, paste those two values into the table above **and** into `shots-config.js` before you leave this machine.

## Dashboard (must already be true)

1. SQL editor: run `schema.sql` (this folder) — safe to re-run; additive and non-destructive. Optional: `sample_data.sql`. Older one-off scripts (`migrate_shot_tracker_v3.sql`, `migrate_fouler.sql`) are already covered by `schema.sql`.
2. Authentication → Providers → **Anonymous** → Enable.
3. RLS is in `schema.sql`: `authenticated` can read/write; the PIN only gates sign-in on the client.

## Explore tab (optional AI)

Natural-language questions over shot data (`#shots-explore`). Uses a Supabase Edge Function + OpenAI — **not** your ChatGPT desktop subscription.

1. SQL editor: run `migrate_explore.sql` (creates `explore_readonly` RPC, service_role only). This also hides test opponent **Raya Vallecano SC** from Explore via `explore.*` views — Tracker / Games / History still show it.
2. Create an [OpenAI API](https://platform.openai.com) key. Set a low monthly spend limit (e.g. $5–10).
3. Store the key as a project secret (CLI or Dashboard → Edge Functions → Secrets):

```bash
supabase secrets set OPENAI_API_KEY=sk-...
```

4. Deploy the function:

```bash
supabase functions deploy explore-shots
```

Or paste `functions/explore-shots/index.ts` via the Dashboard → Edge Functions → Create.

5. Confirm the function allows JWT verification (default). The browser sends the anonymous staff session; the function rejects unauthenticated callers.

Cost note: `gpt-4o-mini` is typically cents per hundred coach questions. Edge Function invocations stay within the free quota at this volume.

Optional: set `EXPLORE_OPENAI_MODEL` as a secret to override the default `gpt-4o-mini`.

### Compare models (benchmark harness)

To A/B OpenAI vs Anthropic on the **same** Explore pipeline (prompts → SQL → `explore_readonly` → narrate), see [`../benchmark/README.md`](../benchmark/README.md). Core prompt/SQL logic is shared under `functions/_shared/explore/`.

## Other machine checklist

1. Pull this repo.
2. Confirm `shots-config.js` has the URL, anon key, and PIN above.
3. Serve the site (`python3 -m http.server 8080`) and open `#shots`.
4. Log in with `KEPPA`.

Hashes: `#shots` record · `#shots-games` schedule · `#shots-history` queries · `#shots-explore` AI explore · `#shots-map` game map.
