-- Live clock state so a watcher phone can poll the same game clock.

alter table public.games
  add column if not exists clock_period text;

alter table public.games
  add column if not exists clock_elapsed_sec integer;

alter table public.games
  add column if not exists clock_running boolean;

alter table public.games
  add column if not exists clock_started_at timestamptz;

alter table public.games drop constraint if exists games_clock_period_check;
alter table public.games
  add constraint games_clock_period_check
  check (clock_period is null or clock_period in ('1', '2', 'ET1', 'ET2'));

alter table public.games drop constraint if exists games_clock_elapsed_sec_check;
alter table public.games
  add constraint games_clock_elapsed_sec_check
  check (clock_elapsed_sec is null or clock_elapsed_sec >= 0);

comment on column public.games.clock_period is
  'Current period last published by the tracking device.';
comment on column public.games.clock_elapsed_sec is
  'Elapsed seconds into clock_period at clock_started_at (or now, if not running).';
comment on column public.games.clock_running is
  'true while the tracking device clock is running. null = never published.';
comment on column public.games.clock_started_at is
  'When the current run started. Watchers add now - clock_started_at to clock_elapsed_sec.';
