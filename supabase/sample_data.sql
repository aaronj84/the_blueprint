-- Sample multi-game dataset for Phase 2 history queries.
-- Safe to re-run: skips if Brighton vs Olympus 2026-08-12 already exists.
-- Coordinates use the tracker pitch (x 0–68 width, y 0 at the attacking goal).

do $$
declare
  brighton uuid;
  olympus uuid;
  season uuid;
  kate uuid;
  saige uuid;
  game1 uuid;
  game2 uuid;
begin
  select id into brighton from public.teams where is_brighton limit 1;
  select id into olympus from public.teams where name = 'Olympus' limit 1;
  select id into season from public.seasons where label = '2026 Fall' limit 1;
  select r.player_id into kate
    from public.rosters r
    where r.team_id = brighton and r.season_id = season and r.jersey_number = '5';
  select r.player_id into saige
    from public.rosters r
    where r.team_id = brighton and r.season_id = season and r.jersey_number = '15';

  if brighton is null or olympus is null or season is null or kate is null then
    raise notice 'Seed skipped: run schema.sql first';
    return;
  end if;

  if exists (
    select 1 from public.games
    where season_id = season and date = '2026-08-12'
      and home_team_id = brighton and away_team_id = olympus
  ) then
    raise notice 'Sample games already present';
    return;
  end if;

  insert into public.games (season_id, date, game_type, home_team_id, away_team_id, our_team_id)
  values (season, '2026-08-12', 'region', brighton, olympus, brighton)
  returning id into game1;

  insert into public.games (season_id, date, game_type, home_team_id, away_team_id, our_team_id)
  values (season, '2026-08-19', 'region', olympus, brighton, brighton)
  returning id into game2;

  -- Kate: one in the box, one from outside (top of the box / Zone 14).
  insert into public.shots (
    game_id, period, team_id, player_id, jersey_number_at_time, position,
    x, y, zone_id, zone_label, result
  ) values
    (game1, '1', brighton, kate, '5', 'CF', 34.0, 12.0, 'C-PS', 'Box · Center', 'goal'),
    (game1, '2', brighton, kate, '5', 'CF', 34.2, 18.4, 'C-D', 'Zone 14', 'on-target'),
    (game1, '2', brighton, saige, '15', 'LW', 8.0, 14.0, 'LW-BOX', 'Box · Left wide', 'missed'),
    (game2, '1', brighton, kate, '5', 'AM', 33.8, 22.0, 'C-D', 'Zone 14', 'blocked'),
    (game2, '1', brighton, kate, '5', 'AM', 40.0, 9.5, 'RHS-PS', 'Box · Right half-space', 'goal');

  -- Unnamed Olympus #17 — naming that players row later should relabel both shots.
  insert into public.players (name, short_name) values (null, null);
  insert into public.rosters (team_id, season_id, player_id, jersey_number)
  select olympus, season, p.id, '17'
  from public.players p
  where p.name is null
    and not exists (select 1 from public.rosters r where r.player_id = p.id)
  order by p.id desc
  limit 1;

  insert into public.shots (
    game_id, period, team_id, player_id, jersey_number_at_time,
    x, y, zone_id, zone_label, result
  )
  select game2, '2', olympus, r.player_id, '17', 30.0, 10.0, 'C-PS', 'Box · Center', 'on-target'
  from public.rosters r
  where r.team_id = olympus and r.season_id = season and r.jersey_number = '17';
end;
$$;
