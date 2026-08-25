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

## Other machine checklist

1. Pull this repo.
2. Confirm `shots-config.js` has the URL, anon key, and PIN above.
3. Serve the site (`python3 -m http.server 8080`) and open `#shots`.
4. Log in with `KEPPA`.

Hashes: `#shots` record · `#shots-games` schedule · `#shots-history` queries · `#shots-map` game map.
