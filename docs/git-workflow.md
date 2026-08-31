# Git workflow: dev → prod

You work on **`dev`**, promote with a PR to **`main`**. Merging does **not** delete `dev`.

```text
feature branch (optional)
        │
        ▼
       dev  ── CI: tests + migrations → DEV Supabase
        │
        │  Pull Request
        ▼
      main  ── GitHub Pages (prod site)
            ── migrations → PROD Supabase
```

---

## One-time setup

1. Finish [dev-environment.md](dev-environment.md) (DEV project + GitHub secrets + Pages → GitHub Actions).
2. Create the `dev` branch from current `main` if it does not exist:

```bash
git checkout main
git pull
git checkout -b dev
git push -u origin dev
```

3. Optional later: on GitHub → Settings → Branches → protect `main` so PRs require a green `CI` check.

---

## Day-to-day

```bash
git checkout dev
# … edit code / add supabase/migrations/….sql …
git add -A
git commit -m "Describe why"
git push origin dev
```

GitHub Actions on `dev`:

- **CI** — API integration + Playwright smokes against **DEV**
- **Supabase migrate** — `supabase db push` to **DEV**

Fix failures on `dev` before opening a PR.

---

## Promote to prod

1. Open a PR: **base `main` ← compare `dev`**  
   (`gh pr create --base main --head dev` or the GitHub UI)
2. Review the diff. Merge when green.
3. After merge:
   - **Pages** workflow publishes the static site with **PROD** Supabase URL/anon
   - **Supabase migrate** applies pending migrations to **PROD**
4. Keep coding on `dev`. Do **not** delete `dev` when the PR asks; leave the branch.

That PR **is** the migrate-to-prod path for both frontend and schema.

---

## Short-lived feature branches

Optional if a change is large:

```bash
git checkout dev
git checkout -b feature/my-change
# … work …
git push -u origin feature/my-change
# PR into dev first, then later promote dev → main
```

---

## Visual drift (later)

Screenshot baselines are deferred. When you want them, add Playwright screenshot comparisons on `dev` PRs and update baselines only when UI changes are intentional.
