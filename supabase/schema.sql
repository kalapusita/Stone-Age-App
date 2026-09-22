-- =========================================================================
-- Life in the Stone Age — database schema
-- Run this once in the Supabase SQL Editor for your project.
-- =========================================================================

create extension if not exists "pgcrypto";

create table if not exists public.investigations (
  id                        uuid primary key default gen_random_uuid(),

  student_name              text not null,
  class_name                text,
  started_at                timestamptz not null default now(),

  -- Investigation One: Fire
  fire_effect_1             text,
  fire_effect_2             text,
  fire_response             text,
  fire_completed_at         timestamptz,

  -- Investigation Two: Cave Art
  cave_art_interpretation   text,
  cave_art_response         text,
  cave_art_completed_at     timestamptz,

  -- Investigation Three: Stone Tools
  stone_tools_response      text,
  stone_tools_completed_at  timestamptz,

  -- Final synthesis
  final_response            text,
  submitted_at              timestamptz,

  status                    text not null default 'in_progress'
                              check (status in ('in_progress', 'submitted')),

  updated_at                timestamptz not null default now()
);

-- Keep updated_at current automatically.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_investigations_updated_at on public.investigations;
create trigger trg_investigations_updated_at
  before update on public.investigations
  for each row execute function public.set_updated_at();

-- =========================================================================
-- Row Level Security
--
-- Design: students have no login, so the app's server-side API routes
-- (using the SERVICE ROLE key, which never reaches the browser) perform
-- all inserts/updates/reads on a student's behalf, keyed by the random
-- UUID "id" the student's browser remembers locally. The service role
-- key bypasses RLS entirely, which is intentional and safe because it is
-- only ever used inside Next.js server route handlers.
--
-- The anonymous (anon) and logged-out public have NO direct table
-- access at all — this is what stops a student from opening the browser
-- console and querying every row. Only an authenticated Supabase user
-- (i.e. a teacher who has signed in) can read/delete rows directly from
-- the browser via Supabase Auth.
-- =========================================================================

alter table public.investigations enable row level security;

-- Explicitly: no policy is created for the anon role, so anon has zero
-- access (RLS defaults to deny). Do not add a permissive anon policy.

drop policy if exists "Teachers can read all investigations" on public.investigations;
create policy "Teachers can read all investigations"
  on public.investigations
  for select
  to authenticated
  using (true);

drop policy if exists "Teachers can delete investigations" on public.investigations;
create policy "Teachers can delete investigations"
  on public.investigations
  for delete
  to authenticated
  using (true);

-- Teachers do not need insert/update from the dashboard, so no policy is
-- granted for those actions even to authenticated users.
