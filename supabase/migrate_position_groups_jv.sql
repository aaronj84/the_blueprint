-- Position groups, RM/LM rename, JV roster, default group seeds.
-- Run after schema.sql (and migrate_shot_tracker_v3.sql if needed). Safe to re-run.

-- 1) Rename CM → RM, AM → LM on existing shot rows
update public.shots set position = 'RM' where position = 'CM';
update public.shots set position = 'LM' where position = 'AM';
update public.shots set assist_position = 'RM' where assist_position = 'CM';
update public.shots set assist_position = 'LM' where assist_position = 'AM';

alter table public.shots drop constraint if exists shots_position_check;
alter table public.shots
  add constraint shots_position_check
  check (
    position is null
    or position in ('GK', 'RB', 'LB', 'RCB', 'LCB', 'DM', 'RW', 'RM', 'CF', 'LM', 'LW')
  );

alter table public.shots drop constraint if exists shots_assist_position_check;
alter table public.shots
  add constraint shots_assist_position_check
  check (
    assist_position is null
    or assist_position in ('GK', 'RB', 'LB', 'RCB', 'LCB', 'DM', 'RW', 'RM', 'CF', 'LM', 'LW')
  );

-- 2) Squad on roster (varsity | jv)
alter table public.rosters
  add column if not exists squad text;

update public.rosters set squad = 'varsity' where squad is null;

alter table public.rosters drop constraint if exists rosters_squad_check;
alter table public.rosters
  add constraint rosters_squad_check
  check (squad in ('varsity', 'jv'));

alter table public.rosters
  alter column squad set default 'varsity';

alter table public.rosters
  alter column squad set not null;

-- 3) Position groups on players (multi-select)
alter table public.players
  add column if not exists position_groups text[] not null default '{}';

-- 4) Savanna → Savvy nickname
update public.players
set short_name = 'Savvy'
where name = 'Savanna Zenger';

-- 5) Seed varsity position groups (by full name)
do $$
declare
  g record;
begin
  for g in
    select * from (
      values
        ('Jane Thackeray',     array['CB']),
        ('Shai Farrer',        array['CB']),
        ('Tae Hansen',         array['CB']),
        ('Finley Thomas',      array['CB', 'OB']),
        ('Saige Thurgood',     array['OB', 'MID']),
        ('Madeline Nate',      array['OB', 'MID']),
        ('Addison Despain',    array['OB', 'FWD']),
        ('Georgia Mikell',     array['OB', 'FWD']),
        ('Savanna Zenger',     array['MID', 'FWD']),
        ('Jaqueline Scott',    array['MID']),
        ('Charlotte Jacobsen', array['MID']),
        ('Stella Bollinger',   array['MID']),
        ('Grace Slagle',       array['MID']),
        ('Ariana Mlikota',     array['FWD']),
        ('Kailee Deeds',       array['FWD']),
        ('Abigail Platz',      array['FWD']),
        ('Kate Coccimiglio',   array['FWD']),
        ('Natalia Shepherd',   array['FWD']),
        ('Lilah Sligting',     array['GK'])
    ) as v(pname, groups)
  loop
    update public.players
    set position_groups = g.groups
    where name = g.pname;
  end loop;
end;
$$;

-- 6) Mark existing Brighton roster rows as varsity (don't overwrite jv)
update public.rosters r
set squad = 'varsity'
from public.teams t
where r.team_id = t.id
  and t.is_brighton
  and (r.squad is null or r.squad = 'varsity');

-- 7) Insert JV players + roster rows
insert into public.players (name, short_name)
select v.name, v.short
from (
  values
    ('Michi Matsumori', null),
    ('Svea Johnson', null),
    ('Audrey Curry', null),
    ('Paisley Beckstead', null),
    ('Olivia West', null),
    ('Jocelyn Waddoups', null),
    ('Samantha Wood', null),
    ('Jane Erickson', null),
    ('Hadlee Winegar', null),
    ('Sierra Smith', null),
    ('Sophi Samani', null),
    ('Ruby Beckstead', null),
    ('Abigail Tait', null),
    ('Alegra Frye', null),
    ('Susie Soffe', null),
    ('Caroline Sadler', null),
    ('Lyla Thomas', null),
    ('Avery Christensen', null),
    ('Charlotte McKinney', 'Charli')
) as v(name, short)
where not exists (select 1 from public.players p where p.name = v.name);

insert into public.rosters (team_id, season_id, player_id, jersey_number, squad)
select t.id, s.id, p.id, j.jersey, 'jv'
from public.teams t
join public.seasons s on s.label = '2026 Fall'
join (
  values
    ('0',  'Michi Matsumori'),
    ('00', 'Svea Johnson'),
    ('3',  'Audrey Curry'),
    ('4',  'Paisley Beckstead'),
    ('6',  'Olivia West'),
    ('7',  'Jocelyn Waddoups'),
    ('10', 'Samantha Wood'),
    ('12', 'Jane Erickson'),
    ('14', 'Hadlee Winegar'),
    ('16', 'Sierra Smith'),
    ('21', 'Sophi Samani'),
    ('22', 'Ruby Beckstead'),
    ('28', 'Abigail Tait'),
    ('30', 'Alegra Frye'),
    ('34', 'Susie Soffe'),
    ('36', 'Caroline Sadler'),
    ('37', 'Lyla Thomas'),
    ('38', 'Avery Christensen'),
    ('39', 'Charlotte McKinney')
) as j(jersey, name) on true
join public.players p on p.name = j.name
where t.is_brighton
on conflict (team_id, season_id, jersey_number) do update
set squad = excluded.squad;
