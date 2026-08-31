-- Semantic layer (from migrate_semantic_layer.sql). Idempotent.

-- Semantic layer: stat_scope + curated Brighton views for Explore.
-- Additive and safe to re-run. Does not drop or rename existing columns/tables.
--
-- House default (enforced by v_brighton_shots_official):
--   Season / aggregate stats include official + preseason, exclude friendlies /
--   exhibition, and exclude untracked games.
--
-- Companion rollback: migrate_semantic_layer_down.sql
--
-- After applying:
--   1. Re-run migrate_explore.sql (exposes views to explore_readonly search_path)
--   2. Redeploy explore-shots if prompts changed
--   3. python -m benchmark.golden --verify

-- ---------------------------------------------------------------------------
-- 3.1 games.stat_scope
-- ---------------------------------------------------------------------------

alter table public.games
  add column if not exists stat_scope text;

comment on column public.games.stat_scope is
  'Scope for season aggregates: official (count), preseason (count by house default), friendly (exclude by default), exhibition (exclude by default).';

-- Backfill from real game_type values (inspect DISTINCT before changing mapping).
-- Live values observed: friendly, preseason, region. Schema also allows playoffs, other.
update public.games
set stat_scope = case
  when game_type in ('region', 'league', 'playoffs') then 'official'
  when game_type = 'preseason' then 'preseason'
  when game_type = 'friendly' then 'friendly'
  else 'exhibition'
end
where stat_scope is null
   or stat_scope not in ('official', 'preseason', 'friendly', 'exhibition');

alter table public.games
  alter column stat_scope set default 'exhibition';

alter table public.games
  alter column stat_scope set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'games_stat_scope_check'
      and conrelid = 'public.games'::regclass
  ) then
    alter table public.games
      add constraint games_stat_scope_check
      check (stat_scope in ('official', 'preseason', 'friendly', 'exhibition'));
  end if;
end;
$$;

-- Keep stat_scope aligned with game_type on write.
create or replace function public.games_sync_stat_scope()
returns trigger
language plpgsql
as $$
begin
  if new.stat_scope is null
     or tg_op = 'INSERT'
     or new.game_type is distinct from old.game_type then
    new.stat_scope := case
      when new.game_type in ('region', 'league', 'playoffs') then 'official'
      when new.game_type = 'preseason' then 'preseason'
      when new.game_type = 'friendly' then 'friendly'
      else 'exhibition'
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists games_sync_stat_scope on public.games;
create trigger games_sync_stat_scope
before insert or update of game_type, stat_scope
on public.games
for each row execute procedure public.games_sync_stat_scope();

-- ---------------------------------------------------------------------------
-- 3.2 is_tracked: computed in views (not a stored column -- lower write-path risk)
-- Definition: game has at least one shots row (either team).
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 4.1 v_brighton_shots -- one row per shot, joins pre-resolved
-- ---------------------------------------------------------------------------

create or replace view public.v_brighton_shots as
select
  s.id as shot_id,
  s.game_id,
  s.team_id,
  s.player_id,
  coalesce(p.short_name, p.name) as player_name,
  s.position,
  s.zone_id,
  s.zone_label,
  s.x,
  s.y,
  s.result,
  s.period,
  s.assist_player_id,
  s.assist_type,
  (s.team_id = g.our_team_id) as is_brighton_shot,
  (s.team_id is distinct from g.our_team_id) as is_shot_against,
  g.date as game_date,
  g.season_id,
  opp.name as opponent_name,
  (g.home_team_id = g.our_team_id) as is_home,
  g.game_type,
  g.stat_scope,
  true as is_tracked,
  (s.result in ('goal', 'on-target', 'pk-goal')) as is_on_frame,
  (s.result in ('goal', 'pk-goal')) as is_goal
from public.shots s
join public.games g on g.id = s.game_id
left join public.players p on p.id = s.player_id
left join public.teams opp on opp.id = case
  when g.home_team_id = g.our_team_id then g.away_team_id
  else g.home_team_id
end;

comment on view public.v_brighton_shots is
  'Curated shot rows for Explore: opponent/home/scope/result flags pre-resolved. Prefer v_brighton_shots_official for season aggregates.';

-- ---------------------------------------------------------------------------
-- 4.2 v_brighton_shots_official -- house default season surface
-- ---------------------------------------------------------------------------

create or replace view public.v_brighton_shots_official as
select *
from public.v_brighton_shots
where stat_scope in ('official', 'preseason')
  and is_tracked = true;

comment on view public.v_brighton_shots_official is
  'Default season-stats surface: official + preseason only; friendlies/exhibition and untracked games excluded.';

-- ---------------------------------------------------------------------------
-- 4.3 v_brighton_games -- one row per game with rollups + tracking flag
-- ---------------------------------------------------------------------------

create or replace view public.v_brighton_games as
select
  g.id as game_id,
  g.season_id,
  g.date as game_date,
  g.game_type,
  g.stat_scope,
  (exists (select 1 from public.shots s where s.game_id = g.id)) as is_tracked,
  opp.name as opponent_name,
  (g.home_team_id = g.our_team_id) as is_home,
  coalesce(agg.shots_for, 0) as shots_for,
  coalesce(agg.shots_against, 0) as shots_against,
  coalesce(agg.goals_for, 0) as goals_for,
  coalesce(agg.goals_against, 0) as goals_against
from public.games g
left join public.teams opp on opp.id = case
  when g.home_team_id = g.our_team_id then g.away_team_id
  else g.home_team_id
end
left join lateral (
  select
    count(*) filter (where s.team_id = g.our_team_id) as shots_for,
    count(*) filter (where s.team_id is distinct from g.our_team_id) as shots_against,
    count(*) filter (
      where s.team_id = g.our_team_id
        and s.result in ('goal', 'pk-goal')
    ) as goals_for,
    count(*) filter (
      where s.team_id is distinct from g.our_team_id
        and s.result in ('goal', 'pk-goal')
    ) as goals_against
  from public.shots s
  where s.game_id = g.id
) agg on true;

comment on view public.v_brighton_games is
  'Per-game context for trends. is_tracked=false means not logged -- do not treat rollups as zero performance.';

grant select on public.v_brighton_shots to authenticated, service_role;
grant select on public.v_brighton_shots_official to authenticated, service_role;
grant select on public.v_brighton_games to authenticated, service_role;
