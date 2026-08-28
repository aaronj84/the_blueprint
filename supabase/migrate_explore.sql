-- Explore tab: read-only SQL runner for the explore-shots Edge Function.
-- Safe to re-run. Does not modify shot data.
--
-- After running this in the SQL editor:
--   1. Deploy supabase/functions/explore-shots
--   2. supabase secrets set OPENAI_API_KEY=sk-...
--
-- The RPC is SECURITY DEFINER and granted only to service_role so the
-- browser cannot call it directly. The Edge Function verifies the caller's
-- JWT, then runs validated SELECT queries via the service role.
--
-- Test fixture: opponent "Raya Vallecano SC" is hidden from Explore via the
-- explore schema views (search_path). Tracker / Games / History still see it.
--
-- NOTE: PostgreSQL regex uses [[:<:]] / [[:>:]] for word boundaries.
--       JavaScript-style \b means "backspace" in Postgres and breaks checks.

create schema if not exists explore;

-- Filtered catalog for AI inquiries — excludes internal test opponent.
create or replace view explore.teams as
  select t.*
  from public.teams t
  where t.name <> 'Raya Vallecano SC';

create or replace view explore.seasons as
  select * from public.seasons;

create or replace view explore.players as
  select * from public.players;

create or replace view explore.rosters as
  select * from public.rosters;

create or replace view explore.games as
  select g.*
  from public.games g
  where not exists (
    select 1
    from public.teams t
    where t.id in (g.home_team_id, g.away_team_id)
      and t.name = 'Raya Vallecano SC'
  );

create or replace view explore.shots as
  select s.*
  from public.shots s
  where exists (
    select 1
    from explore.games g
    where g.id = s.game_id
  );

create or replace function public.explore_readonly(query text)
returns jsonb
language plpgsql
security definer
set search_path = explore, public
as $$
declare
  cleaned text;
  result jsonb;
begin
  if query is null or length(trim(query)) = 0 then
    raise exception 'Empty query';
  end if;

  cleaned := trim(query);
  cleaned := regexp_replace(cleaned, ';\s*$', '');

  if cleaned ~* ';\s*\S' then
    raise exception 'Multiple statements are not allowed';
  end if;

  if cleaned !~* '^\s*(with|select)([[:space:]]|\(|$)' then
    raise exception 'Only SELECT (or WITH … SELECT) queries are allowed';
  end if;

  if cleaned ~* '[[:<:]](insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|execute|do|set|reset|notify|listen|unlisten|vacuum|analyze|reindex|cluster|comment|security|owner|policy|function|procedure|trigger|extension|schema|database|role|user|password)[[:>:]]' then
    raise exception 'Forbidden keyword in query';
  end if;

  -- Force unqualified names onto explore.* views (never public.shots etc.).
  cleaned := regexp_replace(
    cleaned,
    '\mpublic\.(teams|seasons|players|games|rosters|shots)\M',
    '\1',
    'gi'
  );

  execute format(
    'select coalesce(jsonb_agg(to_jsonb(t)), ''[]''::jsonb)
     from (select * from (%s) as explore_inner limit 200) as t',
    cleaned
  )
  into result;

  return result;
end;
$$;

revoke all on function public.explore_readonly(text) from public;
revoke all on function public.explore_readonly(text) from anon;
revoke all on function public.explore_readonly(text) from authenticated;
grant execute on function public.explore_readonly(text) to service_role;

comment on function public.explore_readonly(text) is
  'Read-only SELECT runner for explore-shots Edge Function (service_role only). Resolves tables via explore schema (excludes Raya Vallecano SC test games).';
