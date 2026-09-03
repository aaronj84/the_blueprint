-- One-off: shots landed on the September rematches instead of last week's games.
--
-- Wrong → correct:
--   2026-09-17 Brighton vs Viewmont  →  2026-08-25 Viewmont vs Brighton
--   2026-09-22 Brighton vs Woods Cross → 2026-08-27 Woods Cross vs Brighton
--
-- Run in Supabase SQL editor (prod). Preview first, then the DO block.

-- ---------------------------------------------------------------------------
-- Preview: what will move
-- ---------------------------------------------------------------------------
with pairs as (
  select * from (
    values
      ('2026-09-17'::date, 'Brighton', 'Viewmont',    '2026-08-25'::date, 'Viewmont',    'Brighton'),
      ('2026-09-22'::date, 'Brighton', 'Woods Cross', '2026-08-27'::date, 'Woods Cross', 'Brighton')
  ) as v(from_date, from_home, from_away, to_date, to_home, to_away)
),
resolved as (
  select
    p.from_date,
    p.to_date,
    p.from_away as opponent,
    gf.id as from_game_id,
    gt.id as to_game_id,
    (select count(*) from public.shots s where s.game_id = gf.id) as shots_on_wrong_game,
    (select count(*) from public.shots s where s.game_id = gt.id) as shots_already_on_correct_game
  from pairs p
  join public.teams fh on fh.name = p.from_home
  join public.teams fa on fa.name = p.from_away
  join public.teams th on th.name = p.to_home
  join public.teams ta on ta.name = p.to_away
  left join public.games gf
    on gf.date = p.from_date
   and gf.home_team_id = fh.id
   and gf.away_team_id = fa.id
  left join public.games gt
    on gt.date = p.to_date
   and gt.home_team_id = th.id
   and gt.away_team_id = ta.id
)
select * from resolved
order by from_date;

-- ---------------------------------------------------------------------------
-- Apply: move shots (safe to re-run — no-op if wrong games already empty)
-- ---------------------------------------------------------------------------
do $$
declare
  season uuid;
  from_id uuid;
  to_id uuid;
  moved int;
  total_moved int := 0;
  pair record;
begin
  select id into season from public.seasons where label = '2026 Fall' limit 1;
  if season is null then
    raise exception 'Missing season 2026 Fall';
  end if;

  for pair in
    select * from (
      values
        ('2026-09-17'::date, 'Brighton', 'Viewmont',    '2026-08-25'::date, 'Viewmont',    'Brighton'),
        ('2026-09-22'::date, 'Brighton', 'Woods Cross', '2026-08-27'::date, 'Woods Cross', 'Brighton')
    ) as v(from_date, from_home, from_away, to_date, to_home, to_away)
  loop
    select g.id into from_id
    from public.games g
    join public.teams h on h.id = g.home_team_id and h.name = pair.from_home
    join public.teams a on a.id = g.away_team_id and a.name = pair.from_away
    where g.season_id = season and g.date = pair.from_date;

    select g.id into to_id
    from public.games g
    join public.teams h on h.id = g.home_team_id and h.name = pair.to_home
    join public.teams a on a.id = g.away_team_id and a.name = pair.to_away
    where g.season_id = season and g.date = pair.to_date;

    if from_id is null then
      raise exception 'Missing wrong-game row: % % vs %', pair.from_date, pair.from_home, pair.from_away;
    end if;
    if to_id is null then
      raise exception 'Missing correct-game row: % % vs %', pair.to_date, pair.to_home, pair.to_away;
    end if;

    update public.shots
    set game_id = to_id
    where game_id = from_id;

    get diagnostics moved = row_count;
    total_moved := total_moved + moved;
    raise notice 'Moved % shots: % % vs % → % % vs %',
      moved,
      pair.from_date, pair.from_home, pair.from_away,
      pair.to_date, pair.to_home, pair.to_away;
  end loop;

  raise notice 'Done. Total shots reassigned: %', total_moved;
end;
$$;

-- ---------------------------------------------------------------------------
-- Verify: September rematches should show 0 shots; Aug games should have them
-- ---------------------------------------------------------------------------
select
  g.date,
  h.name as home,
  a.name as away,
  count(s.id) as shot_count
from public.games g
join public.teams h on h.id = g.home_team_id
join public.teams a on a.id = g.away_team_id
left join public.shots s on s.game_id = g.id
where g.date in (
  '2026-08-25', '2026-08-27',
  '2026-09-17', '2026-09-22'
)
group by g.date, h.name, a.name
order by g.date;
