-- DEV ONLY — fake franchise + season so nobody mistakes this for real Brighton data.
-- Do NOT run on PROD.
--
-- What it does:
--   • Renames the is_brighton team → Medville Marauders
--   • Creates season "DEV Sandbox" with made-up roster names
--   • Adds cartoon opponents + mixed game types + shots
--
-- Prerequisites: migrations applied.
-- Safe to re-run: skips if season label 'DEV Sandbox' already exists
--   (re-run still forces team rename if needed).
--
-- Dashboard: DEV project → SQL Editor → paste → Run

do $$
declare
  marauders uuid;
  season uuid;
  opp_rivals uuid;
  opp_comets uuid;
  opp_badgers uuid;
  g_pre uuid;
  g_home uuid;
  g_away uuid;
  g_friendly uuid;
  g_empty uuid;
  -- Medville XI (fake)
  p_pip uuid;
  p_ziggy uuid;
  p_nova uuid;
  p_beetle uuid;
  p_maple uuid;
  p_cosmo uuid;
  p_pixel uuid;
  p_waffles uuid;
  -- Opponents
  p_rival9 uuid;
  p_comet10 uuid;
begin
  -- Home side: keep is_brighton=true (app/RLS expect one "us" team), rename for clarity
  update public.teams
  set name = 'Medville Marauders'
  where is_brighton
    and name is distinct from 'Medville Marauders';

  select id into marauders from public.teams where is_brighton limit 1;
  if marauders is null then
    raise exception 'Home team (is_brighton) missing — run migrations first';
  end if;

  if exists (select 1 from public.seasons where label = 'DEV Sandbox') then
    raise notice 'DEV Sandbox already present — skip games/shots (team rename applied if needed)';
    return;
  end if;

  insert into public.seasons (year, label)
  values (2099, 'DEV Sandbox')
  returning id into season;

  -- Cartoon opponents
  insert into public.teams (name, is_brighton)
  values
    ('Rivertown Rivals', false),
    ('Cedar Comets', false),
    ('Bogwater Badgers', false)
  on conflict (name) do nothing;

  select id into opp_rivals from public.teams where name = 'Rivertown Rivals';
  select id into opp_comets from public.teams where name = 'Cedar Comets';
  select id into opp_badgers from public.teams where name = 'Bogwater Badgers';

  -- Obviously fake Marauders players
  insert into public.players (name, short_name, position_groups) values
    ('Pippa "Pip" McNoodle', 'Pip', array['FWD']),
    ('Ziggy Thunderfoot', 'Ziggy', array['MID']),
    ('Nova Sparkles', 'Nova', array['FWD']),
    ('Beetlejuice Carver', 'Beetle', array['CB']),
    ('Maple Syrupson', 'Maple', array['OB']),
    ('Cosmo Driftwood', 'Cosmo', array['MID']),
    ('Pixel Vanderguard', 'Pixel', array['MID', 'FWD']),
    ('Captain Waffles', 'Waffles', array['GK'])
  ;

  select id into p_pip from public.players where name = 'Pippa "Pip" McNoodle' limit 1;
  select id into p_ziggy from public.players where name = 'Ziggy Thunderfoot' limit 1;
  select id into p_nova from public.players where name = 'Nova Sparkles' limit 1;
  select id into p_beetle from public.players where name = 'Beetlejuice Carver' limit 1;
  select id into p_maple from public.players where name = 'Maple Syrupson' limit 1;
  select id into p_cosmo from public.players where name = 'Cosmo Driftwood' limit 1;
  select id into p_pixel from public.players where name = 'Pixel Vanderguard' limit 1;
  select id into p_waffles from public.players where name = 'Captain Waffles' limit 1;

  insert into public.rosters (team_id, season_id, player_id, jersey_number, squad)
  values
    (marauders, season, p_waffles, '1', 'varsity'),
    (marauders, season, p_maple, '2', 'varsity'),
    (marauders, season, p_beetle, '4', 'varsity'),
    (marauders, season, p_cosmo, '6', 'varsity'),
    (marauders, season, p_ziggy, '8', 'varsity'),
    (marauders, season, p_pip, '9', 'varsity'),
    (marauders, season, p_nova, '10', 'varsity'),
    (marauders, season, p_pixel, '11', 'varsity')
  on conflict (team_id, season_id, jersey_number) do nothing;

  insert into public.players (name, short_name) values
    ('Rival Robot #9', 'R9'),
    ('Comet Kid', 'Comet');
  select id into p_rival9 from public.players where name = 'Rival Robot #9' limit 1;
  select id into p_comet10 from public.players where name = 'Comet Kid' limit 1;

  insert into public.rosters (team_id, season_id, player_id, jersey_number, squad)
  values
    (opp_rivals, season, p_rival9, '9', 'varsity'),
    (opp_comets, season, p_comet10, '10', 'varsity')
  on conflict do nothing;

  -- Games
  insert into public.games (season_id, date, game_type, home_team_id, away_team_id, our_team_id)
  values (season, '2099-03-01', 'preseason', marauders, opp_rivals, marauders)
  returning id into g_pre;

  insert into public.games (season_id, date, game_type, home_team_id, away_team_id, our_team_id)
  values (season, '2099-03-08', 'region', marauders, opp_comets, marauders)
  returning id into g_home;

  insert into public.games (season_id, date, game_type, home_team_id, away_team_id, our_team_id)
  values (season, '2099-03-15', 'region', opp_badgers, marauders, marauders)
  returning id into g_away;

  insert into public.games (season_id, date, game_type, home_team_id, away_team_id, our_team_id)
  values (season, '2099-03-22', 'friendly', marauders, opp_rivals, marauders)
  returning id into g_friendly;

  insert into public.games (season_id, date, game_type, home_team_id, away_team_id, our_team_id)
  values (season, '2099-03-29', 'region', marauders, opp_badgers, marauders)
  returning id into g_empty;

  -- Preseason
  insert into public.shots (
    game_id, period, team_id, player_id, jersey_number_at_time, position,
    x, y, zone_id, zone_label, result, miss_direction,
    assist_player_id, assist_type, assist_position, assist_x, assist_y
  ) values
    (g_pre, '1', marauders, p_pip, '9', 'CF', 34.0, 11.0, 'C-PS', 'Box · Center', 'goal', null,
      p_pixel, 'cross', 'LW', 8.0, 20.0),
    (g_pre, '1', marauders, p_nova, '10', 'CF', 38.0, 14.0, 'RHS-PS', 'Box · Right half-space', 'on-target', null,
      p_ziggy, 'pass', 'CM', 30.0, 28.0),
    (g_pre, '2', marauders, p_pixel, '11', 'RW', 55.0, 16.0, 'RW-BOX', 'Box · Right wide', 'missed', 'over',
      null, null, null, null, null),
    (g_pre, '2', opp_rivals, p_rival9, '9', null, 32.0, 12.0, 'C-PS', 'Box · Center', 'blocked', null,
      null, null, null, null, null);

  -- Region home
  insert into public.shots (
    game_id, period, team_id, player_id, jersey_number_at_time, position,
    x, y, zone_id, zone_label, result, miss_direction,
    assist_player_id, assist_type, assist_position, assist_x, assist_y
  ) values
    (g_home, '1', marauders, p_nova, '10', 'LW', 10.0, 13.0, 'LW-BOX', 'Box · Left wide', 'goal', null,
      p_beetle, 'pass', 'LCB', 20.0, 40.0),
    (g_home, '1', marauders, p_pip, '9', 'CF', 34.5, 18.0, 'C-D', 'Zone 14', 'on-target', null,
      p_cosmo, 'gap', 'CM', 34.0, 30.0),
    (g_home, '1', marauders, p_maple, '2', 'LB', 12.0, 35.0, 'LB-CH', 'Channel · Left', 'blocked', null,
      null, null, null, null, null),
    (g_home, '2', marauders, p_nova, '10', 'CF', 30.0, 9.0, 'C-PS', 'Box · Center', 'missed', 'wide-left',
      p_pixel, 'cross', 'RW', 58.0, 18.0),
    (g_home, '2', marauders, p_ziggy, '8', 'CM', 36.0, 22.0, 'C-D', 'Zone 14', 'corner', null,
      null, null, null, null, null),
    (g_home, '2', opp_comets, p_comet10, '10', null, 40.0, 11.0, 'RHS-PS', 'Box · Right half-space', 'goal', null,
      null, null, null, null, null),
    (g_home, '2', opp_comets, p_comet10, '10', null, 28.0, 15.0, 'C-PS', 'Box · Center', 'on-target', null,
      null, null, null, null, null);

  -- Region away
  insert into public.shots (
    game_id, period, team_id, player_id, jersey_number_at_time, position,
    x, y, zone_id, zone_label, result, miss_direction,
    assist_player_id, assist_type, assist_position, assist_x, assist_y,
    fouler_player_id, fouler_jersey_number_at_time
  ) values
    (g_away, '1', marauders, p_pip, '9', 'CF', 33.0, 10.5, 'C-PS', 'Box · Center', 'pk-goal', null,
      null, null, null, null, null, p_comet10, '10'),
    (g_away, '1', marauders, p_cosmo, '6', 'CM', 34.0, 24.0, 'C-D', 'Zone 14', 'foul', null,
      null, null, null, null, null, null, null),
    (g_away, '2', marauders, p_nova, '10', 'LW', 14.0, 12.0, 'LW-BOX', 'Box · Left wide', 'goal', null,
      p_maple, 'cross', 'LB', 6.0, 22.0, null, null),
    (g_away, '2', marauders, p_pixel, '11', 'RW', 52.0, 20.0, 'RW-CH', 'Channel · Right', 'missed', 'short',
      null, null, null, null, null, null, null),
    (g_away, '2', opp_badgers, null, '7', null, 36.0, 13.0, 'C-PS', 'Box · Center', 'missed', 'over',
      null, null, null, null, null, null, null);

  -- Friendly (excluded from official aggregates by default)
  insert into public.shots (
    game_id, period, team_id, player_id, jersey_number_at_time, position,
    x, y, zone_id, zone_label, result
  ) values
    (g_friendly, '1', marauders, p_nova, '10', 'CF', 34.0, 12.0, 'C-PS', 'Box · Center', 'goal'),
    (g_friendly, '1', marauders, p_pip, '9', 'CF', 40.0, 16.0, 'RHS-PS', 'Box · Right half-space', 'on-target'),
    (g_friendly, '2', opp_rivals, p_rival9, '9', null, 30.0, 14.0, 'C-PS', 'Box · Center', 'blocked');

  raise notice 'DEV Sandbox ready: Medville Marauders, season %, fake roster + shots', season;
end;
$$;
