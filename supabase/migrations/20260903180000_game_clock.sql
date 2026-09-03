-- Game clock: per-game count-up / countdown, and elapsed seconds stamped on each play.

alter table public.games
  add column if not exists clock_direction text;

alter table public.games
  add column if not exists clock_half_length_sec integer not null default 2400;

alter table public.games
  add column if not exists clock_et_length_sec integer not null default 600;

alter table public.games drop constraint if exists games_clock_direction_check;
alter table public.games
  add constraint games_clock_direction_check
  check (clock_direction is null or clock_direction in ('up', 'down'));

alter table public.games drop constraint if exists games_clock_half_length_sec_check;
alter table public.games
  add constraint games_clock_half_length_sec_check
  check (clock_half_length_sec > 0 and clock_half_length_sec <= 7200);

alter table public.games drop constraint if exists games_clock_et_length_sec_check;
alter table public.games
  add constraint games_clock_et_length_sec_check
  check (clock_et_length_sec > 0 and clock_et_length_sec <= 3600);

comment on column public.games.clock_direction is
  'null = clock off. down = HS countdown from clock_half_length_sec. up = count up from 0.';
comment on column public.games.clock_half_length_sec is
  'Regulation half length in seconds. Default 2400 (40:00 HS).';
comment on column public.games.clock_et_length_sec is
  'Extra-time period length in seconds. Default 600 (10:00).';

alter table public.shots
  add column if not exists game_clock_seconds integer;

alter table public.shots drop constraint if exists shots_game_clock_seconds_check;
alter table public.shots
  add constraint shots_game_clock_seconds_check
  check (game_clock_seconds is null or game_clock_seconds >= 0);

comment on column public.shots.game_clock_seconds is
  'Elapsed seconds into the period when the play happened (after stamp offset). Display as remaining time when the game counts down.';

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
  s.second_assist_type,
  s.game_clock_seconds
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
