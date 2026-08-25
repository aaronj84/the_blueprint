-- Shot tracker enhancements: fouls, corners, PKs, miss direction, assist position.
-- Run in the Supabase SQL editor after schema.sql (safe to re-run).

alter table public.shots drop constraint if exists shots_result_check;
alter table public.shots
  add constraint shots_result_check
  check (
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
  );

alter table public.shots
  add column if not exists miss_direction text;

alter table public.shots drop constraint if exists shots_miss_direction_check;
alter table public.shots
  add constraint shots_miss_direction_check
  check (
    miss_direction is null
    or miss_direction in ('over', 'short', 'wide-left', 'wide-right')
  );

alter table public.shots
  add column if not exists assist_position text;

alter table public.shots drop constraint if exists shots_assist_position_check;
alter table public.shots
  add constraint shots_assist_position_check
  check (
    assist_position is null
    or assist_position in (
      'GK', 'RB', 'LB', 'RCB', 'LCB', 'DM', 'RW', 'CM', 'CF', 'AM', 'LW'
    )
  );
