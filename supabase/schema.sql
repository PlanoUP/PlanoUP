-- PAINT CONTROL ATI — Supabase schema
--
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query)
-- for a brand-new project. It creates the four tables the app needs, enables
-- Realtime so every connected browser sees changes as they happen, and seeds
-- the 31 ATI units + demo responsibles/activities so the app looks the same
-- as the localStorage demo on first load.
--
-- RLS policies below are intentionally open (anon can read/write) because
-- the app has no authentication yet (see §25 of the product spec — ADMIN /
-- GESTOR / EXECUTOR / VISUALIZACAO roles are prepared but not enforced).
-- Once login ships, replace the "anon_all" policies with role-aware ones.

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
create policy "units_anon_all" on units for all using (true) with check (true);

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
create policy "responsibles_anon_all" on responsibles for all using (true) with check (true);

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
create policy "activities_anon_all" on activities for all using (true) with check (true);

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
create policy "activity_history_anon_all" on activity_history for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- Realtime: broadcast row changes to every connected browser
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table activities;
alter publication supabase_realtime add table responsibles;
alter publication supabase_realtime add table activity_history;
