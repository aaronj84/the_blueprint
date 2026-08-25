-- 2026 Brighton varsity schedule (varsity only; BYEs skipped).
-- Safe to re-run: creates missing opponent teams, skips games that already exist
-- for the same date + home + away.
--
-- Run in Supabase SQL editor after schema.sql.
-- Season label: 2026 Fall

do $$
declare
  brighton uuid;
  season uuid;
  home_id uuid;
  away_id uuid;
  g record;
  inserted int := 0;
  skipped int := 0;
begin
  select id into brighton from public.teams where is_brighton limit 1;
  select id into season from public.seasons where label = '2026 Fall' limit 1;

  if brighton is null or season is null then
    raise exception 'Run schema.sql first (need Brighton team + 2026 Fall season)';
  end if;

  insert into public.teams (name, is_brighton)
  select v.name, false
  from (
    values
      ('Orem'),
      ('Cedar'),
      ('Hillcrest'),
      ('Cyprus'),
      ('Morgan'),
      ('Olympus'),
      ('Viewmont'),
      ('Woods Cross'),
      ('Bountiful'),
      ('Alta'),
      ('Skyline')
  ) as v(name)
  where not exists (select 1 from public.teams t where t.name = v.name);

  for g in
    select * from (
      values
        -- Pre-region
        ('2026-08-05'::date, 'Brighton', 'Orem',        'preseason'),
        ('2026-08-07'::date, 'Brighton', 'Cedar',       'preseason'),
        ('2026-08-11'::date, 'Brighton', 'Hillcrest',   'preseason'),
        ('2026-08-13'::date, 'Cyprus',   'Brighton',    'preseason'),
        ('2026-08-17'::date, 'Morgan',   'Brighton',    'preseason'),
        -- Region
        ('2026-08-20'::date, 'Olympus',     'Brighton', 'region'),
        ('2026-08-25'::date, 'Viewmont',    'Brighton', 'region'),
        ('2026-08-27'::date, 'Woods Cross', 'Brighton', 'region'),
        ('2026-09-01'::date, 'Brighton',    'Bountiful','region'),
        ('2026-09-03'::date, 'Alta',        'Brighton', 'region'),
        ('2026-09-08'::date, 'Skyline',     'Brighton', 'region'),
        ('2026-09-15'::date, 'Brighton',    'Olympus',  'region'),
        ('2026-09-17'::date, 'Brighton',    'Viewmont', 'region'),
        ('2026-09-22'::date, 'Brighton',    'Woods Cross','region'),
        ('2026-09-24'::date, 'Bountiful',   'Brighton', 'region'),
        ('2026-09-29'::date, 'Brighton',    'Alta',     'region'),
        ('2026-10-01'::date, 'Brighton',    'Skyline',  'region')
    ) as v(game_date, home_name, away_name, gtype)
  loop
    select id into home_id from public.teams where name = g.home_name;
    select id into away_id from public.teams where name = g.away_name;

    if home_id is null or away_id is null then
      raise exception 'Missing team for % vs %', g.home_name, g.away_name;
    end if;

    if exists (
      select 1 from public.games
      where season_id = season
        and date = g.game_date
        and home_team_id = home_id
        and away_team_id = away_id
    ) then
      skipped := skipped + 1;
      continue;
    end if;

    insert into public.games (
      season_id, date, game_type, home_team_id, away_team_id, our_team_id
    ) values (
      season, g.game_date, g.gtype, home_id, away_id, brighton
    );
    inserted := inserted + 1;
  end loop;

  raise notice 'Varsity schedule: inserted %, skipped existing %', inserted, skipped;
end;
$$;
