-- Brighton Shot Tracker — Phase 2 schema
-- Run this in the Supabase SQL editor (once per project).
--
-- Dashboard steps after this script:
--   1. Authentication → Providers → Anonymous → Enable
--   2. Copy Project URL + anon public key into shots-config.js
--
-- Out of scope for this phase (do not add here):
--   per-coach accounts/attribution, shot edit-history, offline sync, realtime.

create extension if not exists pgcrypto;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_brighton boolean not null default false
);

-- Exactly one Brighton row.
create unique index if not exists teams_one_brighton
  on public.teams ((true)) where is_brighton;

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  label text not null unique
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text,
  short_name text,
  position_groups text[] not null default '{}'
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  date date not null,
  game_type text not null check (game_type in ('preseason', 'region', 'playoffs', 'friendly', 'other')),
  home_team_id uuid not null references public.teams (id),
  away_team_id uuid not null references public.teams (id),
  our_team_id uuid not null references public.teams (id),
  created_at timestamptz not null default now()
);

create table if not exists public.rosters (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  season_id uuid not null references public.seasons (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  jersey_number text not null,
  squad text not null default 'varsity' check (squad in ('varsity', 'jv')),
  unique (team_id, season_id, player_id),
  unique (team_id, season_id, jersey_number)
);

create table if not exists public.shots (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  period text not null check (period in ('1', '2', 'ET1', 'ET2')),
  team_id uuid not null references public.teams (id),
  player_id uuid references public.players (id),
  jersey_number_at_time text,
  position text check (
    position is null
    or position in ('GK', 'RB', 'LB', 'RCB', 'LCB', 'DM', 'RW', 'RM', 'CF', 'LM', 'LW')
  ),
  x numeric not null,
  y numeric not null,
  zone_id text,
  zone_label text,
  result text not null check (
    result in (
      'goal',
      'on-target',
      'blocked',
      'missed',
      'foul',
      'corner',
      'pk-goal',
      'pk-missed'
    )
  ),
  miss_direction text check (
    miss_direction is null
    or miss_direction in ('over', 'short', 'wide-left', 'wide-right')
  ),
  -- Free Kick: player_id is the infringer. PK: player_id is the taker; fouler_* is the infringer.
  fouler_player_id uuid references public.players (id),
  fouler_jersey_number_at_time text,
  assist_player_id uuid references public.players (id),
  assist_type text check (assist_type is null or assist_type in ('pass', 'gap', 'cross')),
  assist_position text check (
    assist_position is null
    or assist_position in (
      'GK', 'RB', 'LB', 'RCB', 'LCB', 'DM', 'RW', 'RM', 'CF', 'LM', 'LW'
    )
  ),
  assist_x numeric,
  assist_y numeric,
  assist_zone_id text,
  assist_zone_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shots_game_id_idx on public.shots (game_id);
create index if not exists shots_player_id_idx on public.shots (player_id);
create index if not exists shots_fouler_player_id_idx on public.shots (fouler_player_id);
create index if not exists shots_team_id_idx on public.shots (team_id);
create index if not exists games_season_id_idx on public.games (season_id);
create index if not exists games_date_idx on public.games (date desc);
create index if not exists rosters_team_season_idx on public.rosters (team_id, season_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shots_set_updated_at on public.shots;
create trigger shots_set_updated_at
before update on public.shots
for each row execute procedure public.set_updated_at();

alter table public.teams enable row level security;
alter table public.seasons enable row level security;
alter table public.players enable row level security;
alter table public.games enable row level security;
alter table public.rosters enable row level security;
alter table public.shots enable row level security;

-- Anonymous auth sessions are `authenticated`. PIN is a client-side gate only.
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

grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke all on all tables in schema public from anon;

-- Seed Brighton + 2026 Fall varsity roster (jersey numbers are per-roster-row).
insert into public.teams (name, is_brighton)
values ('Brighton', true)
on conflict (name) do nothing;

insert into public.seasons (year, label)
values (2026, '2026 Fall')
on conflict (label) do nothing;

-- Sample opponent so history filters have something to join against after seed.
insert into public.teams (name, is_brighton)
values ('Olympus', false)
on conflict (name) do nothing;

insert into public.players (name, short_name)
select v.name, v.short
from (
  values
    ('Lilah Sligting',    null),
    ('Madeline Nate',     'Maddie'),
    ('Kate Coccimiglio',  'Kate'),
    ('Addison Despain',   'Addison'),
    ('Georgia Mikell',    'Georgia'),
    ('Tae Hansen',        'Tae'),
    ('Kailee Deeds',      'Kailee'),
    ('Saige Thurgood',    'Saige'),
    ('Jaqueline Scott',   'Jackie'),
    ('Stella Bollinger',  'Stella'),
    ('Jane Thackeray',    'Jane'),
    ('Shai Farrer',       'Shai'),
    ('Savanna Zenger',    'Savvy'),
    ('Grace Slagle',      'Grace'),
    ('Charlotte Jacobsen','Sharky'),
    ('Natalia Shepherd',  'Natalia'),
    ('Abigail Platz',     'Abby'),
    ('Ariana Mlikota',    'Ari'),
    ('Finley Thomas',     'Finley'),
    ('Michi Matsumori',   null),
    ('Svea Johnson',      null),
    ('Audrey Curry',      null),
    ('Paisley Beckstead', null),
    ('Olivia West',       null),
    ('Jocelyn Waddoups',  null),
    ('Samantha Wood',     null),
    ('Jane Erickson',     null),
    ('Hadlee Winegar',    null),
    ('Sierra Smith',      null),
    ('Sophi Samani',      null),
    ('Ruby Beckstead',    null),
    ('Abigail Tait',      null),
    ('Alegra Frye',       null),
    ('Susie Soffe',       null),
    ('Caroline Sadler',   null),
    ('Lyla Thomas',       null),
    ('Avery Christensen', null),
    ('Charlotte McKinney','Charli')
) as v(name, short)
where not exists (
  select 1 from public.players p where p.name = v.name
);

insert into public.rosters (team_id, season_id, player_id, jersey_number, squad)
select t.id, s.id, p.id, j.jersey, j.squad
from public.teams t
join public.seasons s on s.label = '2026 Fall'
join (
  values
    ('1',  'Lilah Sligting',    'varsity'),
    ('2',  'Madeline Nate',     'varsity'),
    ('5',  'Kate Coccimiglio',  'varsity'),
    ('8',  'Addison Despain',   'varsity'),
    ('9',  'Georgia Mikell',    'varsity'),
    ('11', 'Tae Hansen',        'varsity'),
    ('13', 'Kailee Deeds',      'varsity'),
    ('15', 'Saige Thurgood',    'varsity'),
    ('17', 'Jaqueline Scott',   'varsity'),
    ('18', 'Stella Bollinger',  'varsity'),
    ('19', 'Jane Thackeray',    'varsity'),
    ('20', 'Shai Farrer',       'varsity'),
    ('24', 'Savanna Zenger',    'varsity'),
    ('25', 'Grace Slagle',      'varsity'),
    ('26', 'Charlotte Jacobsen','varsity'),
    ('27', 'Natalia Shepherd',  'varsity'),
    ('29', 'Abigail Platz',     'varsity'),
    ('32', 'Ariana Mlikota',    'varsity'),
    ('33', 'Finley Thomas',     'varsity'),
    ('0',  'Michi Matsumori',   'jv'),
    ('00', 'Svea Johnson',      'jv'),
    ('3',  'Audrey Curry',      'jv'),
    ('4',  'Paisley Beckstead', 'jv'),
    ('6',  'Olivia West',       'jv'),
    ('7',  'Jocelyn Waddoups',  'jv'),
    ('10', 'Samantha Wood',     'jv'),
    ('12', 'Jane Erickson',     'jv'),
    ('14', 'Hadlee Winegar',    'jv'),
    ('16', 'Sierra Smith',      'jv'),
    ('21', 'Sophi Samani',      'jv'),
    ('22', 'Ruby Beckstead',    'jv'),
    ('28', 'Abigail Tait',      'jv'),
    ('30', 'Alegra Frye',       'jv'),
    ('34', 'Susie Soffe',       'jv'),
    ('36', 'Caroline Sadler',   'jv'),
    ('37', 'Lyla Thomas',       'jv'),
    ('38', 'Avery Christensen', 'jv'),
    ('39', 'Charlotte McKinney','jv')
) as j(jersey, name, squad) on true
join public.players p on p.name = j.name
where t.is_brighton
on conflict (team_id, season_id, jersey_number) do nothing;

-- Default position groups for varsity
update public.players set position_groups = array['GK'] where name = 'Lilah Sligting';
update public.players set position_groups = array['CB'] where name in ('Jane Thackeray', 'Shai Farrer', 'Tae Hansen');
update public.players set position_groups = array['CB', 'OB'] where name = 'Finley Thomas';
update public.players set position_groups = array['OB', 'MID'] where name in ('Saige Thurgood', 'Madeline Nate');
update public.players set position_groups = array['OB', 'FWD'] where name in ('Addison Despain', 'Georgia Mikell');
update public.players set position_groups = array['MID', 'FWD'] where name = 'Savanna Zenger';
update public.players set position_groups = array['MID'] where name in ('Jaqueline Scott', 'Charlotte Jacobsen', 'Stella Bollinger', 'Grace Slagle');
update public.players set position_groups = array['FWD'] where name in ('Ariana Mlikota', 'Kailee Deeds', 'Abigail Platz', 'Kate Coccimiglio', 'Natalia Shepherd');
