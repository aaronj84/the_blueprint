-- Free-kick / PK infringement: who committed the foul.
-- Prefer re-running schema.sql (now covers this). Kept for older runbooks.
-- Safe to re-run.
-- Free Kick events still use player_id for the infringer.
-- PK Goal / PK Missed use player_id for the taker and fouler_* for the infringer.

alter table public.shots
  add column if not exists fouler_player_id uuid references public.players (id);

alter table public.shots
  add column if not exists fouler_jersey_number_at_time text;

create index if not exists shots_fouler_player_id_idx on public.shots (fouler_player_id);
