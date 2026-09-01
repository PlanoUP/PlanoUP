-- PAINT CONTROL ATI — Supabase schema
--
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query).
-- It creates every table the app needs (units, responsibles, activities,
-- activity_history, revitalization_activities, cost_items) and enables
-- Realtime so every connected browser sees changes as they happen. Run
-- seed.sql afterwards to populate the data.
--
-- Safe to re-run: every statement is idempotent (tables use
-- IF NOT EXISTS, policies are dropped and recreated, and the Realtime
-- publication is only extended for tables not already in it) — running
-- this again after adding new tables (like the Revitalização/Custos ones)
-- only adds what's missing, it never errors on what's already there.
--
-- RLS policies below split read from write: anyone can SELECT (no login
-- needed to view the dashboard), but INSERT/UPDATE/DELETE require being
-- signed in via Supabase Auth (a single shared "editor" account — see
-- src/lib/paint-control/authStore.ts). This is the real enforcement layer:
-- the app's UI hides edit controls from logged-out visitors, but even a
-- direct API call without a valid session is rejected here. Full
-- per-user roles (ADMIN / GESTOR / EXECUTOR / VISUALIZACAO from §25 of the
-- product spec) are a future step; today it's a single binary gate.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- units
-- ---------------------------------------------------------------------
create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  tag text not null,
  name text not null
);

alter table units enable row level security;
drop policy if exists "units_anon_all" on units;
drop policy if exists "units_select_all" on units;
drop policy if exists "units_write_authenticated" on units;
create policy "units_select_all" on units for select using (true);
create policy "units_write_authenticated" on units for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- responsibles
-- ---------------------------------------------------------------------
create table if not exists responsibles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null default '',
  role text not null default '',
  email text not null default '',
  phone text not null default '',
  active boolean not null default true
);

alter table responsibles enable row level security;
drop policy if exists "responsibles_anon_all" on responsibles;
drop policy if exists "responsibles_select_all" on responsibles;
drop policy if exists "responsibles_write_authenticated" on responsibles;
create policy "responsibles_select_all" on responsibles for select using (true);
create policy "responsibles_write_authenticated" on responsibles for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,

  tag text not null default '',
  local text not null default '',
  title text not null default '',
  description text not null default '',

  priority text not null check (priority in ('P1', 'P2', 'P3', 'P4')),
  responsible_id uuid references responsibles(id) on delete set null,
  participant_ids uuid[] not null default '{}',
  estimated_area_m2 numeric,
  request_date date,
  needed_date date,
  programmed_date date,
  actual_start_date date,
  expected_end_date date,
  actual_end_date date,

  surface_type text not null default '',
  surface_preparation text not null default '',
  paint_system text not null default '',
  primer text not null default '',
  intermediate_coat text not null default '',
  finish_coat text not null default '',
  coats_count int,
  technical_notes text not null default '',

  status text not null default 'Backlog' check (status in (
    'Backlog', 'Aguardando Programação', 'Programado', 'Aguardando Liberação',
    'Liberado', 'Em Execução', 'Paralisado', 'Em Inspeção', 'Concluído', 'Cancelado'
  )),
  progress int not null default 0 check (progress between 0 and 100),
  impediment text not null default '',
  general_notes text not null default '',
  work_order text not null default '',
  note text not null default '',
  reference text not null default '',
  completed_steps text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activities_unit_id_idx on activities(unit_id);
create index if not exists activities_responsible_id_idx on activities(responsible_id);

alter table activities enable row level security;
drop policy if exists "activities_anon_all" on activities;
drop policy if exists "activities_select_all" on activities;
drop policy if exists "activities_write_authenticated" on activities;
create policy "activities_select_all" on activities for select using (true);
create policy "activities_write_authenticated" on activities for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- activity_history
-- ---------------------------------------------------------------------
create table if not exists activity_history (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  action text not null,
  message text not null,
  author_name text not null default 'Usuário',
  created_at timestamptz not null default now()
);

create index if not exists activity_history_activity_id_idx on activity_history(activity_id);

alter table activity_history enable row level security;
drop policy if exists "activity_history_anon_all" on activity_history;
drop policy if exists "activity_history_select_all" on activity_history;
drop policy if exists "activity_history_write_authenticated" on activity_history;
create policy "activity_history_select_all" on activity_history for select using (true);
create policy "activity_history_write_authenticated" on activity_history for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- revitalization_activities
--
-- Kept as a control deliberately separate from `activities`: it tracks
-- site facilities/areas (pátio de sucata, subestação, galpões, etc.) that
-- don't correspond to any of the 31 registered ATI process units, so it
-- uses a free-text `area` instead of a unit_id FK. Everything else mirrors
-- the planning/control fields on `activities` for consistency.
-- ---------------------------------------------------------------------
create table if not exists revitalization_activities (
  id uuid primary key default gen_random_uuid(),

  area text not null default '',
  title text not null default '',
  description text not null default '',

  priority text not null check (priority in ('P1', 'P2', 'P3', 'P4')),
  responsible_id uuid references responsibles(id) on delete set null,
  estimated_area_m2 numeric,
  request_date date,
  needed_date date,
  programmed_date date,
  actual_start_date date,
  expected_end_date date,
  actual_end_date date,

  surface_type text not null default '',
  surface_preparation text not null default '',
  paint_system text not null default '',
  primer text not null default '',
  intermediate_coat text not null default '',
  finish_coat text not null default '',
  coats_count int,
  technical_notes text not null default '',

  status text not null default 'Backlog' check (status in (
    'Backlog', 'Aguardando Programação', 'Programado', 'Aguardando Liberação',
    'Liberado', 'Em Execução', 'Paralisado', 'Em Inspeção', 'Concluído', 'Cancelado'
  )),
  progress int not null default 0 check (progress between 0 and 100),
  impediment text not null default '',
  general_notes text not null default '',
  work_order text not null default '',
  note text not null default '',
  reference text not null default '',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists revitalization_activities_responsible_id_idx
  on revitalization_activities(responsible_id);

alter table revitalization_activities enable row level security;
drop policy if exists "revitalization_activities_anon_all" on revitalization_activities;
drop policy if exists "revitalization_activities_select_all" on revitalization_activities;
drop policy if exists "revitalization_activities_write_authenticated" on revitalization_activities;
create policy "revitalization_activities_select_all" on revitalization_activities
  for select using (true);
create policy "revitalization_activities_write_authenticated" on revitalization_activities
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- cost_items
--
-- Budget register, not a schedule: workforce (efetivo) and equipment
-- lines behind the painting contract, tracking "previsto" (planned) vs
-- "realizado" (actual) cost so they can be compared month to month.
-- ---------------------------------------------------------------------
create table if not exists cost_items (
  id uuid primary key default gen_random_uuid(),

  category text not null check (category in ('Mão de Obra', 'Equipamento')),
  name text not null default '',
  regime text not null default '',
  quantity numeric not null default 0,

  hourly_rate numeric,
  hours_per_day numeric,
  days_per_year numeric,

  planned_monthly_cost numeric not null default 0,
  planned_annual_cost numeric not null default 0,
  actual_monthly_cost numeric,
  actual_annual_cost numeric,

  notes text not null default '',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table cost_items enable row level security;
drop policy if exists "cost_items_anon_all" on cost_items;
drop policy if exists "cost_items_select_all" on cost_items;
drop policy if exists "cost_items_write_authenticated" on cost_items;
create policy "cost_items_select_all" on cost_items for select using (true);
create policy "cost_items_write_authenticated" on cost_items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- Realtime: broadcast row changes to every connected browser
--
-- Wrapped in a guard because "alter publication ... add table" has no
-- IF NOT EXISTS form in Postgres — without the guard, re-running this
-- script errors on the second run with "relation is already member of
-- publication".
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['activities', 'responsibles', 'activity_history', 'revitalization_activities', 'cost_items']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;
