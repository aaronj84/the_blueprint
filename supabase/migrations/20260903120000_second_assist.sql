-- Second assist: the pass that leads to the assist (pre-assist).
-- Mirrors assist_* columns. Optional; existing rows stay null.

alter table public.shots
  add column if not exists second_assist_player_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'shots_second_assist_player_id_fkey'
  ) then
    alter table public.shots
      add constraint shots_second_assist_player_id_fkey
      foreign key (second_assist_player_id) references public.players (id);
  end if;
end $$;

alter table public.shots
  add column if not exists second_assist_type text;

alter table public.shots
  add column if not exists second_assist_position text;

alter table public.shots
  add column if not exists second_assist_x numeric;

alter table public.shots
  add column if not exists second_assist_y numeric;

alter table public.shots
  add column if not exists second_assist_zone_id text;

alter table public.shots
  add column if not exists second_assist_zone_label text;

alter table public.shots drop constraint if exists shots_second_assist_type_check;
alter table public.shots
  add constraint shots_second_assist_type_check
  check (second_assist_type is null or second_assist_type in ('pass', 'gap', 'cross'));

alter table public.shots drop constraint if exists shots_second_assist_position_check;
alter table public.shots
  add constraint shots_second_assist_position_check
  check (
    second_assist_position is null
    or second_assist_position in ('GK', 'RB', 'LB', 'RCB', 'LCB', 'DM', 'RW', 'RM', 'CF', 'LM', 'LW')
  );

create index if not exists shots_second_assist_player_id_idx on public.shots (second_assist_player_id);

comment on column public.shots.second_assist_player_id is
  'Player who made the pass before the assist (pre-assist / 2nd assist).';

-- Extra columns must be appended so CREATE OR REPLACE VIEW stays compatible.
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
  (s.result in ('goal', 'pk-goal')) as is_goal,
  s.second_assist_player_id,
  s.second_assist_type
from public.shots s
join public.games g on g.id = s.game_id
left join public.players p on p.id = s.player_id
left join public.teams opp on opp.id = case
  when g.home_team_id = g.our_team_id then g.away_team_id
  else g.home_team_id
end;

create or replace view public.v_brighton_shots_official as
select *
from public.v_brighton_shots
where stat_scope in ('official', 'preseason')
  and is_tracked = true;

grant select on public.v_brighton_shots to authenticated, service_role;
grant select on public.v_brighton_shots_official to authenticated, service_role;
