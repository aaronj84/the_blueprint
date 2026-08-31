-- DEV repair: restore table grants + RLS for anonymous staff sessions.
-- Run in DEV project SQL Editor (bhs-shot-tracker-dev) as postgres.
-- Safe to re-run.

grant usage on schema public to authenticated, anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;

-- Views used by Explore / history
do $$
begin
  if to_regclass('public.v_brighton_shots') is not null then
    execute 'grant select on public.v_brighton_shots to authenticated, service_role';
  end if;
  if to_regclass('public.v_brighton_shots_official') is not null then
    execute 'grant select on public.v_brighton_shots_official to authenticated, service_role';
  end if;
  if to_regclass('public.v_brighton_games') is not null then
    execute 'grant select on public.v_brighton_games to authenticated, service_role';
  end if;
end;
$$;

revoke all on all tables in schema public from anon;

alter table public.teams enable row level security;
alter table public.seasons enable row level security;
alter table public.players enable row level security;
alter table public.games enable row level security;
alter table public.rosters enable row level security;
alter table public.shots enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['teams', 'seasons', 'players', 'games', 'rosters', 'shots']
  loop
    execute format('drop policy if exists shots_select on public.%I', t);
    execute format('drop policy if exists shots_insert on public.%I', t);
    execute format('drop policy if exists shots_update on public.%I', t);
    execute format('drop policy if exists shots_delete on public.%I', t);
    execute format('create policy shots_select on public.%I for select to authenticated using (true)', t);
    execute format('create policy shots_insert on public.%I for insert to authenticated with check (true)', t);
    execute format('create policy shots_update on public.%I for update to authenticated using (true) with check (true)', t);
    execute format('create policy shots_delete on public.%I for delete to authenticated using (true)', t);
  end loop;
end;
$$;

-- Future tables inherit grants for authenticated
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

notify pgrst, 'reload schema';
