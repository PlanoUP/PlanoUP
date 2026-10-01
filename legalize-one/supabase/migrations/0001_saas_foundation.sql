-- =====================================================================================
-- Legalize One — Fundação SaaS multiempresa (multi-tenant)
--
-- Princípios:
--   • Toda tabela de negócio tem tenant_id e RLS habilitada (isolamento NO BANCO).
--   • Anônimo nunca lê tabelas base: só views públicas (imóveis publicados, perfil público
--     da imobiliária) e RPCs validadas (resolve_tenant, submit_lead, track_event).
--   • Funções SECURITY DEFINER com search_path vazio e nomes totalmente qualificados.
--   • Chaves estrangeiras compostas (tenant_id, id) impedem vínculos entre tenants.
--   • Limites de plano aplicados por trigger (a interface apenas reflete).
-- Compatível com Supabase (auth.uid(), roles anon/authenticated, storage.objects).
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.tenant_status as enum ('active', 'suspended');
create type public.member_role as enum ('owner', 'admin', 'broker');
create type public.property_status as enum ('draft', 'published', 'sold', 'rented', 'archived');
create type public.property_purpose as enum ('venda', 'aluguel', 'temporada');
create type public.media_kind as enum ('photo', 'video', 'floor_plan', 'virtual_tour', 'model_3d');
create type public.lead_status as enum ('new', 'contacted', 'visit_scheduled', 'negotiation', 'converted', 'lost');
create type public.lead_channel as enum ('whatsapp', 'info_request', 'visit_request', 'call', 'form');
create type public.domain_kind as enum ('subdomain', 'custom');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- tenant_id é imutável: um registro nunca "muda de imobiliária".
create function public.prevent_tenant_change() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.tenant_id is distinct from old.tenant_id then
    raise exception 'tenant_id is immutable' using errcode = '42501';
  end if;
  return new;
end $$;

-- Slug ASCII (sem depender da extensão unaccent).
create function public.slugify(value text) returns text
language sql immutable set search_path = '' as $$
  select trim(both '-' from regexp_replace(
    lower(translate(coalesce(value, ''),
      'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ',
      'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn')),
    '[^a-z0-9]+', '-', 'g'))
$$;

create function public.try_uuid(value text) returns uuid
language plpgsql immutable set search_path = '' as $$
begin
  return value::uuid;
exception when others then
  return null;
end $$;

-- Chamadas do navegador chegam como anon/authenticated; servidor (service_role, migrations) é confiável.
-- Usada em triggers SEM security definer, onde current_user é o papel de quem chamou.
create function public.is_client_role() returns boolean
language sql stable set search_path = '' as $$
  select current_user in ('anon', 'authenticated')
$$;

-- ---------------------------------------------------------------------------
-- Perfis (1:1 com auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Planos e tenants
-- ---------------------------------------------------------------------------
create table public.plans (
  code text primary key check (code ~ '^[a-z0-9_]+$'),
  name text not null,
  position smallint not null default 0,
  -- Limites numéricos (null = ilimitado): max_properties, max_users, max_brokers
  limits jsonb not null default '{}'::jsonb,
  -- Recursos ligados/desligados: model3d, analytics_advanced, reports, premium_listings, custom_domain…
  features jsonb not null default '{}'::jsonb,
  active boolean not null default true
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 48),
  name text not null check (char_length(name) between 2 and 120),
  status public.tenant_status not null default 'active',
  plan_code text not null default 'start' references public.plans (code),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger tenants_updated_at before update on public.tenants
  for each row execute function public.set_updated_at();

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants (id) on delete cascade,
  plan_code text not null references public.plans (code),
  status public.subscription_status not null default 'trialing',
  current_period_end timestamptz,
  provider text,
  provider_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();
create trigger subscriptions_tenant_immutable before update on public.subscriptions
  for each row execute function public.prevent_tenant_change();

create table public.tenant_members (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'admin',
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);
create index tenant_members_user_idx on public.tenant_members (user_id);
create trigger tenant_members_tenant_immutable before update on public.tenant_members
  for each row execute function public.prevent_tenant_change();

create table public.tenant_settings (
  tenant_id uuid primary key references public.tenants (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 120),
  legal_name text check (char_length(legal_name) <= 160),
  tagline text check (char_length(tagline) <= 160),
  creci text check (char_length(creci) <= 40),
  phone text check (phone ~ '^[0-9]{8,15}$'),
  whatsapp text check (whatsapp ~ '^[0-9]{8,15}$'),
  whatsapp_message text check (char_length(whatsapp_message) <= 500),
  email text check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  address_line text check (char_length(address_line) <= 200),
  city text check (char_length(city) <= 80),
  state text check (state ~ '^[A-Z]{2}$'),
  logo_url text check (char_length(logo_url) <= 500),
  favicon_url text check (char_length(favicon_url) <= 500),
  primary_color text check (primary_color ~* '^#[0-9a-f]{6}$'),
  secondary_color text check (secondary_color ~* '^#[0-9a-f]{6}$'),
  instagram_url text check (char_length(instagram_url) <= 300),
  facebook_url text check (char_length(facebook_url) <= 300),
  business_hours text check (char_length(business_hours) <= 120),
  onboarding_completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create trigger tenant_settings_updated_at before update on public.tenant_settings
  for each row execute function public.set_updated_at();
create trigger tenant_settings_tenant_immutable before update on public.tenant_settings
  for each row execute function public.prevent_tenant_change();

-- Hostnames que identificam o site público do tenant (subdomínio ou domínio próprio).
create table public.tenant_domains (
  hostname text primary key check (hostname = lower(hostname) and hostname ~ '^[a-z0-9.-]+$'),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  kind public.domain_kind not null default 'subdomain',
  is_primary boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create index tenant_domains_tenant_idx on public.tenant_domains (tenant_id);

-- ---------------------------------------------------------------------------
-- Funções de autorização (usadas pelas políticas)
-- ---------------------------------------------------------------------------
create function public.is_platform_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_platform_admin from public.profiles p where p.id = auth.uid()), false)
$$;

create function public.has_tenant_role(p_tenant_id uuid, p_roles public.member_role[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.tenant_members m
    where m.tenant_id = p_tenant_id and m.user_id = auth.uid() and m.role = any (p_roles)
  )
$$;

create function public.is_tenant_member(p_tenant_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.tenant_members m where m.tenant_id = p_tenant_id and m.user_id = auth.uid()
  )
$$;

create function public.is_tenant_manager(p_tenant_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.has_tenant_role(p_tenant_id, array['owner', 'admin']::public.member_role[])
$$;

-- ---------------------------------------------------------------------------
-- Corretores
-- ---------------------------------------------------------------------------
create table public.brokers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  creci text check (char_length(creci) <= 40),
  phone text check (phone ~ '^[0-9]{8,15}$'),
  whatsapp text check (whatsapp ~ '^[0-9]{8,15}$'),
  email text check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  photo_url text check (char_length(photo_url) <= 500),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, user_id)
);
create trigger brokers_updated_at before update on public.brokers
  for each row execute function public.set_updated_at();
create trigger brokers_tenant_immutable before update on public.brokers
  for each row execute function public.prevent_tenant_change();

create function public.current_broker_id(p_tenant_id uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select b.id from public.brokers b where b.tenant_id = p_tenant_id and b.user_id = auth.uid() and b.active
$$;

-- Corretor só altera dados de contato do próprio cadastro.
create function public.guard_broker_self_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if public.is_client_role() and not (public.is_tenant_manager(new.tenant_id) or public.is_platform_admin())
     and (new.user_id is distinct from old.user_id or new.active is distinct from old.active) then
    raise exception 'not allowed to change broker access' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger brokers_guard_self before update on public.brokers
  for each row execute function public.guard_broker_self_update();

-- ---------------------------------------------------------------------------
-- Imóveis e mídia
-- ---------------------------------------------------------------------------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  broker_id uuid,
  code text check (char_length(code) <= 40),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 3 and 140),
  type text not null check (type in (
    'casa', 'casa-condominio', 'apartamento', 'cobertura', 'terreno', 'sala-comercial', 'loja', 'galpao', 'rural')),
  purpose public.property_purpose not null default 'venda',
  status public.property_status not null default 'draft',
  price numeric(14, 2) check (price >= 0),
  condo_fee numeric(12, 2) check (condo_fee >= 0),
  iptu numeric(12, 2) check (iptu >= 0),
  description text check (char_length(description) <= 8000),
  -- Endereço
  zip_code text check (zip_code ~ '^[0-9]{8}$'),
  street text check (char_length(street) <= 160),
  street_number text check (char_length(street_number) <= 20),
  complement text check (char_length(complement) <= 80),
  neighborhood text check (char_length(neighborhood) <= 80),
  city text check (char_length(city) <= 80),
  state text check (state ~ '^[A-Z]{2}$'),
  latitude numeric(9, 6) check (latitude between -90 and 90),
  longitude numeric(9, 6) check (longitude between -180 and 180),
  hide_exact_address boolean not null default true,
  -- Características
  bedrooms smallint not null default 0 check (bedrooms between 0 and 99),
  suites smallint not null default 0 check (suites between 0 and 99),
  bathrooms smallint not null default 0 check (bathrooms between 0 and 99),
  parking smallint not null default 0 check (parking between 0 and 99),
  built_area numeric(10, 2) check (built_area >= 0),
  total_area numeric(12, 2) check (total_area >= 0),
  floor smallint check (floor between -5 and 200),
  furnished boolean not null default false,
  amenities text[] not null default '{}' check (cardinality(amenities) <= 60),
  -- Características extensíveis (piscina, área gourmet, elevador, academia, portaria, pet friendly…)
  characteristics jsonb not null default '{}'::jsonb check (jsonb_typeof(characteristics) = 'object'),
  featured boolean not null default false,
  documentation_verified boolean not null default false,
  cover_image_url text check (char_length(cover_image_url) <= 500),
  -- Experiência 3D (mesmo formato do visualizador atual):
  -- { "enabled": true, "url": "...glb", "poster": "...webp", "config": Model3DConfig }
  model3d jsonb check (model3d is null or jsonb_typeof(model3d) = 'object'),
  -- Tour virtual por fotos 360° / embed externo
  virtual_tour jsonb check (virtual_tour is null or jsonb_typeof(virtual_tour) = 'object'),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, slug),
  foreign key (tenant_id, broker_id) references public.brokers (tenant_id, id) on delete set null (broker_id)
);
create unique index properties_tenant_code_idx on public.properties (tenant_id, code) where code is not null;
create index properties_tenant_status_idx on public.properties (tenant_id, status);
create index properties_broker_idx on public.properties (broker_id);
create trigger properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();
create trigger properties_tenant_immutable before update on public.properties
  for each row execute function public.prevent_tenant_change();

-- Slug automático, único dentro do tenant (ex.: casa-condominio-capim-macio-natal).
create function public.properties_prepare() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  base text;
  candidate text;
  n int := 1;
begin
  if new.slug is null or new.slug = '' then
    base := public.slugify(concat_ws(' ', new.title, new.neighborhood, new.city));
    base := left(coalesce(nullif(base, ''), 'imovel'), 100);
    candidate := base;
    while exists (
      select 1 from public.properties p
      where p.tenant_id = new.tenant_id and p.slug = candidate and p.id is distinct from new.id
    ) loop
      n := n + 1;
      candidate := base || '-' || n;
    end loop;
    new.slug := candidate;
  end if;
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end $$;
create trigger properties_prepare before insert or update on public.properties
  for each row execute function public.properties_prepare();

-- Corretor não troca status, responsável nem endereço público do imóvel.
create function public.guard_broker_property_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if public.is_client_role() and not (public.is_tenant_manager(new.tenant_id) or public.is_platform_admin())
     and (new.status is distinct from old.status
          or new.broker_id is distinct from old.broker_id
          or new.slug is distinct from old.slug
          or new.model3d is distinct from old.model3d) then
    raise exception 'brokers cannot change status, owner, slug or 3D of a property' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger properties_guard_broker before update on public.properties
  for each row execute function public.guard_broker_property_update();

create table public.property_media (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  property_id uuid not null,
  kind public.media_kind not null default 'photo',
  url text check (char_length(url) <= 1000),
  storage_path text check (char_length(storage_path) <= 500),
  alt text check (char_length(alt) <= 200),
  position integer not null default 0,
  is_cover boolean not null default false,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  check (url is not null or storage_path is not null),
  foreign key (tenant_id, property_id) references public.properties (tenant_id, id) on delete cascade
);
create index property_media_property_idx on public.property_media (property_id, position);
create unique index property_media_one_cover_idx on public.property_media (property_id) where is_cover;
create trigger property_media_tenant_immutable before update on public.property_media
  for each row execute function public.prevent_tenant_change();

-- ---------------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  property_id uuid,
  broker_id uuid,
  name text check (char_length(name) <= 120),
  phone text check (phone ~ '^[0-9]{8,15}$'),
  email text check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text check (char_length(message) <= 2000),
  channel public.lead_channel not null,
  status public.lead_status not null default 'new',
  source text check (char_length(source) <= 60),
  page_path text check (char_length(page_path) <= 300),
  referrer text check (char_length(referrer) <= 300),
  utm_source text check (char_length(utm_source) <= 100),
  utm_medium text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  utm_term text check (char_length(utm_term) <= 100),
  utm_content text check (char_length(utm_content) <= 100),
  session_id text check (char_length(session_id) <= 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, property_id) references public.properties (tenant_id, id) on delete set null (property_id),
  foreign key (tenant_id, broker_id) references public.brokers (tenant_id, id) on delete set null (broker_id)
);
create index leads_tenant_created_idx on public.leads (tenant_id, created_at desc);
create index leads_broker_idx on public.leads (broker_id);
create trigger leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();
create trigger leads_tenant_immutable before update on public.leads
  for each row execute function public.prevent_tenant_change();

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  lead_id uuid not null,
  author_id uuid references auth.users (id) on delete set null default auth.uid(),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  foreign key (tenant_id, lead_id) references public.leads (tenant_id, id) on delete cascade
);
create index lead_notes_lead_idx on public.lead_notes (lead_id, created_at);

-- ---------------------------------------------------------------------------
-- Analytics (sem dados pessoais)
-- ---------------------------------------------------------------------------
create table public.analytics_events (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  property_id uuid,
  event_type text not null check (event_type in (
    'page_view', 'property_view', 'gallery_interaction', '3d_open', '3d_interaction', 'tour_open',
    'whatsapp_click', 'phone_click', 'lead_created', 'visit_request', 'search')),
  session_id text check (char_length(session_id) <= 64),
  occurred_at timestamptz not null default now(),
  path text check (char_length(path) <= 300),
  referrer text check (char_length(referrer) <= 300),
  utm_source text check (char_length(utm_source) <= 100),
  utm_medium text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  utm_term text check (char_length(utm_term) <= 100),
  utm_content text check (char_length(utm_content) <= 100),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and pg_column_size(metadata) <= 2048),
  foreign key (tenant_id, property_id) references public.properties (tenant_id, id) on delete set null (property_id)
);
create index analytics_events_tenant_time_idx on public.analytics_events (tenant_id, occurred_at desc);
create index analytics_events_property_time_idx on public.analytics_events (tenant_id, property_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- Planos: entitlements centralizados + limites aplicados no banco
-- ---------------------------------------------------------------------------
create function public.plan_entitlements(p_tenant_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('plan', pl.code, 'limits', pl.limits, 'features', pl.features)
  from public.tenants t join public.plans pl on pl.code = t.plan_code
  where t.id = p_tenant_id
$$;

-- Versão exposta (só membros do tenant ou admin da plataforma).
create function public.tenant_entitlements(p_tenant_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not (public.is_tenant_member(p_tenant_id) or public.is_platform_admin()) then
    raise exception 'not a member of this tenant' using errcode = '42501';
  end if;
  return public.plan_entitlements(p_tenant_id);
end $$;

create function public.enforce_property_plan() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  ent jsonb := public.plan_entitlements(new.tenant_id);
  max_props int := nullif(ent #>> '{limits,max_properties}', '')::int;
  active_count int;
begin
  if max_props is not null and new.status <> 'archived'
     and (tg_op = 'INSERT' or old.status = 'archived') then
    select count(*) into active_count from public.properties p
    where p.tenant_id = new.tenant_id and p.status <> 'archived' and p.id <> new.id;
    if active_count >= max_props then
      raise exception 'plan_limit_reached:max_properties' using errcode = 'P0001';
    end if;
  end if;
  if coalesce((new.model3d ->> 'enabled')::boolean, false)
     and not coalesce((ent #>> '{features,model3d}')::boolean, false) then
    raise exception 'plan_feature_unavailable:model3d' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger properties_enforce_plan before insert or update of status, model3d on public.properties
  for each row execute function public.enforce_property_plan();

-- tenants: só o admin da plataforma muda status/plano.
create function public.guard_tenant_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if public.is_client_role() and not public.is_platform_admin()
     and (new.status is distinct from old.status or new.plan_code is distinct from old.plan_code
          or new.slug is distinct from old.slug) then
    raise exception 'only platform admins can change tenant status, plan or slug' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger tenants_guard before update on public.tenants
  for each row execute function public.guard_tenant_update();

-- =====================================================================================
-- RLS
-- =====================================================================================
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.tenants enable row level security;
alter table public.subscriptions enable row level security;
alter table public.tenant_members enable row level security;
alter table public.tenant_settings enable row level security;
alter table public.tenant_domains enable row level security;
alter table public.brokers enable row level security;
alter table public.properties enable row level security;
alter table public.property_media enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.analytics_events enable row level security;

-- Privilégios explícitos (o Supabase concede tudo por padrão; aqui fechamos e reabrimos o necessário).
revoke all on all tables in schema public from anon, authenticated;
grant select on public.plans to anon, authenticated;
grant select, update (full_name) on public.profiles to authenticated;
grant select, update on public.tenants to authenticated;
grant select on public.subscriptions to authenticated;
grant select, insert, update, delete on public.tenant_members to authenticated;
grant select, update on public.tenant_settings to authenticated;
grant select on public.tenant_domains to authenticated;
grant select, insert, update, delete on public.brokers to authenticated;
grant select, insert, update, delete on public.properties to authenticated;
grant select, insert, update, delete on public.property_media to authenticated;
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, delete on public.lead_notes to authenticated;
grant select on public.analytics_events to authenticated;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_platform_admin());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- plans (catálogo público)
create policy plans_read on public.plans for select to anon, authenticated using (active or public.is_platform_admin());

-- tenants
create policy tenants_select on public.tenants for select to authenticated
  using (public.is_tenant_member(id) or public.is_platform_admin());
create policy tenants_update on public.tenants for update to authenticated
  using (public.has_tenant_role(id, array['owner']::public.member_role[]) or public.is_platform_admin())
  with check (public.has_tenant_role(id, array['owner']::public.member_role[]) or public.is_platform_admin());

-- subscriptions
create policy subscriptions_select on public.subscriptions for select to authenticated
  using (public.is_tenant_manager(tenant_id) or public.is_platform_admin());

-- tenant_members (só owner concede o papel owner)
create policy members_select on public.tenant_members for select to authenticated
  using (public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy members_insert on public.tenant_members for insert to authenticated
  with check (
    (public.is_tenant_manager(tenant_id) and (role <> 'owner' or public.has_tenant_role(tenant_id, array['owner']::public.member_role[])))
    or public.is_platform_admin());
create policy members_update on public.tenant_members for update to authenticated
  using (public.is_tenant_manager(tenant_id) or public.is_platform_admin())
  with check (
    (public.is_tenant_manager(tenant_id) and (role <> 'owner' or public.has_tenant_role(tenant_id, array['owner']::public.member_role[])))
    or public.is_platform_admin());
create policy members_delete on public.tenant_members for delete to authenticated
  using ((public.is_tenant_manager(tenant_id) and role <> 'owner') or public.is_platform_admin());

-- tenant_settings
create policy settings_select on public.tenant_settings for select to authenticated
  using (public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy settings_update on public.tenant_settings for update to authenticated
  using (public.is_tenant_manager(tenant_id) or public.is_platform_admin())
  with check (public.is_tenant_manager(tenant_id) or public.is_platform_admin());

-- tenant_domains (cadastro de domínio passa pela plataforma — evita sequestro de hostname)
create policy domains_select on public.tenant_domains for select to authenticated
  using (public.is_tenant_member(tenant_id) or public.is_platform_admin());

-- brokers
create policy brokers_select on public.brokers for select to authenticated
  using (public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy brokers_insert on public.brokers for insert to authenticated
  with check (public.is_tenant_manager(tenant_id) or public.is_platform_admin());
create policy brokers_update on public.brokers for update to authenticated
  using (public.is_tenant_manager(tenant_id) or user_id = auth.uid() or public.is_platform_admin())
  with check (public.is_tenant_manager(tenant_id) or user_id = auth.uid() or public.is_platform_admin());
create policy brokers_delete on public.brokers for delete to authenticated
  using (public.is_tenant_manager(tenant_id) or public.is_platform_admin());

-- properties
create policy properties_select on public.properties for select to authenticated
  using (public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy properties_insert on public.properties for insert to authenticated
  with check (public.is_tenant_manager(tenant_id) or public.is_platform_admin());
create policy properties_update on public.properties for update to authenticated
  using (public.is_tenant_manager(tenant_id) or broker_id = public.current_broker_id(tenant_id) or public.is_platform_admin())
  with check (public.is_tenant_manager(tenant_id) or broker_id = public.current_broker_id(tenant_id) or public.is_platform_admin());
create policy properties_delete on public.properties for delete to authenticated
  using (public.is_tenant_manager(tenant_id) or public.is_platform_admin());

-- property_media
create policy media_select on public.property_media for select to authenticated
  using (public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy media_write on public.property_media for all to authenticated
  using (public.is_tenant_manager(tenant_id) or public.is_platform_admin()
         or exists (select 1 from public.properties p where p.id = property_id
                    and p.broker_id = public.current_broker_id(p.tenant_id)))
  with check (public.is_tenant_manager(tenant_id) or public.is_platform_admin()
              or exists (select 1 from public.properties p where p.id = property_id and p.tenant_id = property_media.tenant_id
                         and p.broker_id = public.current_broker_id(p.tenant_id)));

-- leads (corretor vê/atualiza apenas os seus)
create policy leads_select on public.leads for select to authenticated
  using (public.is_tenant_manager(tenant_id) or broker_id = public.current_broker_id(tenant_id) or public.is_platform_admin());
create policy leads_insert on public.leads for insert to authenticated
  with check (public.is_tenant_manager(tenant_id) or public.is_platform_admin());
create policy leads_update on public.leads for update to authenticated
  using (public.is_tenant_manager(tenant_id) or broker_id = public.current_broker_id(tenant_id) or public.is_platform_admin())
  with check (public.is_tenant_manager(tenant_id) or broker_id = public.current_broker_id(tenant_id) or public.is_platform_admin());
create policy leads_delete on public.leads for delete to authenticated
  using (public.is_tenant_manager(tenant_id) or public.is_platform_admin());

-- lead_notes (quem vê o lead vê/cria notas; apaga só a própria)
create policy lead_notes_select on public.lead_notes for select to authenticated
  using (exists (select 1 from public.leads l where l.id = lead_id));
create policy lead_notes_insert on public.lead_notes for insert to authenticated
  with check (author_id = auth.uid() and exists (select 1 from public.leads l where l.id = lead_id and l.tenant_id = lead_notes.tenant_id));
create policy lead_notes_delete on public.lead_notes for delete to authenticated
  using (author_id = auth.uid() or public.is_tenant_manager(tenant_id));

-- analytics (leitura para gestores; escrita só via track_event)
create policy analytics_select on public.analytics_events for select to authenticated
  using (public.is_tenant_manager(tenant_id) or public.is_platform_admin());

-- =====================================================================================
-- Superfície pública (anônimo): views filtradas + RPCs validadas
-- =====================================================================================

-- Perfil público da imobiliária (apenas tenants ativos; sem dados internos).
create view public.public_tenant_profiles as
  select t.id as tenant_id, t.slug, s.display_name, s.legal_name, s.tagline, s.creci, s.phone, s.whatsapp, s.whatsapp_message,
         s.email, s.address_line, s.city, s.state, s.logo_url, s.favicon_url, s.primary_color, s.secondary_color,
         s.instagram_url, s.facebook_url, s.business_hours
  from public.tenants t join public.tenant_settings s on s.tenant_id = t.id
  where t.status = 'active';

-- Imóveis publicados de tenants ativos; endereço exato oculto quando pedido.
create view public.public_properties as
  select p.id, p.tenant_id, p.slug, p.code, p.title, p.type, p.purpose, p.price, p.condo_fee, p.iptu,
         p.description, p.neighborhood, p.city, p.state,
         case when p.hide_exact_address then null else p.street end as street,
         case when p.hide_exact_address then null else p.street_number end as street_number,
         case when p.hide_exact_address then null else p.complement end as complement,
         case when p.hide_exact_address then null else p.zip_code end as zip_code,
         case when p.hide_exact_address then round(p.latitude, 2) else p.latitude end as latitude,
         case when p.hide_exact_address then round(p.longitude, 2) else p.longitude end as longitude,
         p.bedrooms, p.suites, p.bathrooms, p.parking, p.built_area, p.total_area, p.floor, p.furnished,
         p.amenities, p.characteristics, p.featured, p.documentation_verified, p.cover_image_url,
         case when coalesce((p.model3d ->> 'enabled')::boolean, false) then p.model3d end as model3d,
         p.virtual_tour, p.published_at,
         b.name as broker_name, b.creci as broker_creci, b.whatsapp as broker_whatsapp, b.photo_url as broker_photo_url
  from public.properties p
  join public.tenants t on t.id = p.tenant_id and t.status = 'active'
  left join public.brokers b on b.id = p.broker_id and b.active
  where p.status = 'published';

create view public.public_property_media as
  select m.id, m.tenant_id, m.property_id, m.kind, m.url, m.storage_path, m.alt, m.position, m.is_cover, m.metadata
  from public.property_media m
  join public.properties p on p.id = m.property_id and p.status = 'published'
  join public.tenants t on t.id = m.tenant_id and t.status = 'active';

grant select on public.public_tenant_profiles, public.public_properties, public.public_property_media to anon, authenticated;

-- Identifica a imobiliária pelo domínio (ou slug, como fallback).
create function public.resolve_tenant(p_hostname text default null, p_slug text default null)
returns table (tenant_id uuid, slug text)
language sql stable security definer set search_path = '' as $$
  select r.tenant_id, r.slug from (
    select t.id as tenant_id, t.slug, 0 as priority
    from public.tenant_domains d join public.tenants t on t.id = d.tenant_id
    where p_hostname is not null and d.hostname = lower(split_part(p_hostname, ':', 1)) and t.status = 'active'
    union all
    select t.id, t.slug, 1 from public.tenants t
    where p_slug is not null and t.slug = lower(p_slug) and t.status = 'active'
  ) r
  order by r.priority
  limit 1
$$;

create function public.clean_utm(p_utm jsonb, p_key text) returns text
language sql immutable set search_path = '' as $$
  select nullif(left(trim(coalesce(p_utm ->> p_key, '')), 100), '')
$$;

-- Registro de evento anônimo (lista fechada de tipos; metadados pequenos; sem PII).
create function public.track_event(
  p_tenant_id uuid,
  p_event_type text,
  p_property_id uuid default null,
  p_session_id text default null,
  p_path text default null,
  p_referrer text default null,
  p_utm jsonb default '{}'::jsonb,
  p_metadata jsonb default '{}'::jsonb
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_property uuid;
begin
  if not exists (select 1 from public.tenants t where t.id = p_tenant_id and t.status = 'active') then
    return; -- silencioso: não revela quais tenants existem
  end if;
  if p_property_id is not null then
    select p.id into v_property from public.properties p
    where p.id = p_property_id and p.tenant_id = p_tenant_id and p.status = 'published';
  end if;
  insert into public.analytics_events (tenant_id, property_id, event_type, session_id, path, referrer,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, metadata)
  values (p_tenant_id, v_property, p_event_type, left(p_session_id, 64), left(p_path, 300), left(p_referrer, 300),
    public.clean_utm(p_utm, 'utm_source'), public.clean_utm(p_utm, 'utm_medium'), public.clean_utm(p_utm, 'utm_campaign'),
    public.clean_utm(p_utm, 'utm_term'), public.clean_utm(p_utm, 'utm_content'),
    case when jsonb_typeof(p_metadata) = 'object' and pg_column_size(p_metadata) <= 2048 then p_metadata else '{}'::jsonb end);
end $$;

-- Criação pública de lead (validação no servidor; anônimo nunca lê leads).
create function public.submit_lead(
  p_tenant_id uuid,
  p_channel text,
  p_property_id uuid default null,
  p_name text default null,
  p_phone text default null,
  p_email text default null,
  p_message text default null,
  p_source text default null,
  p_page_path text default null,
  p_referrer text default null,
  p_session_id text default null,
  p_utm jsonb default '{}'::jsonb
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_channel public.lead_channel;
  v_property public.properties%rowtype;
  v_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '');
  v_name text := nullif(left(trim(coalesce(p_name, '')), 120), '');
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_id uuid;
begin
  if not exists (select 1 from public.tenants t where t.id = p_tenant_id and t.status = 'active') then
    raise exception 'invalid tenant' using errcode = '22023';
  end if;
  begin
    v_channel := p_channel::public.lead_channel;
  exception when others then
    raise exception 'invalid channel' using errcode = '22023';
  end;
  if p_property_id is not null then
    select * into v_property from public.properties p
    where p.id = p_property_id and p.tenant_id = p_tenant_id and p.status = 'published';
    if not found then
      raise exception 'invalid property' using errcode = '22023';
    end if;
  end if;
  if v_phone is not null and v_phone !~ '^[0-9]{8,15}$' then
    raise exception 'invalid phone' using errcode = '22023';
  end if;
  if v_email is not null and v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email' using errcode = '22023';
  end if;
  -- Formulários exigem identificação; clique no WhatsApp/ligação pode ser anônimo.
  if v_channel in ('info_request', 'visit_request', 'form') and (v_name is null or (v_phone is null and v_email is null)) then
    raise exception 'name and phone or email are required' using errcode = '22023';
  end if;
  -- Proteção simples contra abuso: até 20 leads por sessão a cada 10 minutos.
  if p_session_id is not null and (
    select count(*) from public.leads l
    where l.tenant_id = p_tenant_id and l.session_id = p_session_id and l.created_at > now() - interval '10 minutes'
  ) >= 20 then
    raise exception 'too many requests' using errcode = '53400';
  end if;

  insert into public.leads (tenant_id, property_id, broker_id, name, phone, email, message, channel, source, page_path,
    referrer, session_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content)
  values (p_tenant_id, v_property.id, v_property.broker_id, v_name, v_phone, v_email, left(p_message, 2000), v_channel,
    left(p_source, 60), left(p_page_path, 300), left(p_referrer, 300), left(p_session_id, 64),
    public.clean_utm(p_utm, 'utm_source'), public.clean_utm(p_utm, 'utm_medium'), public.clean_utm(p_utm, 'utm_campaign'),
    public.clean_utm(p_utm, 'utm_term'), public.clean_utm(p_utm, 'utm_content'))
  returning id into v_id;

  insert into public.analytics_events (tenant_id, property_id, event_type, session_id, path, metadata)
  values (p_tenant_id, v_property.id, 'lead_created', left(p_session_id, 64), left(p_page_path, 300),
    jsonb_build_object('channel', v_channel));
  return v_id;
end $$;

-- Onboarding: usuário autenticado cria a própria imobiliária (vira owner).
create function public.create_tenant_with_owner(p_slug text, p_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  insert into public.tenants (slug, name, created_by) values (lower(p_slug), p_name, v_user) returning id into v_id;
  insert into public.tenant_settings (tenant_id, display_name) values (v_id, p_name);
  insert into public.subscriptions (tenant_id, plan_code, status) values (v_id, 'start', 'trialing');
  insert into public.tenant_members (tenant_id, user_id, role) values (v_id, v_user, 'owner');
  return v_id;
end $$;

-- Execução: helpers internos não ficam expostos ao anônimo.
revoke execute on function public.plan_entitlements(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.resolve_tenant(text, text) to anon, authenticated;
grant execute on function public.track_event(uuid, text, uuid, text, text, text, jsonb, jsonb) to anon, authenticated;
grant execute on function public.submit_lead(uuid, text, uuid, text, text, text, text, text, text, text, text, jsonb) to anon, authenticated;
revoke execute on function public.create_tenant_with_owner(text, text) from public, anon;
grant execute on function public.create_tenant_with_owner(text, text) to authenticated;
revoke execute on function public.tenant_entitlements(uuid) from public, anon;
grant execute on function public.tenant_entitlements(uuid) to authenticated;

-- =====================================================================================
-- Storage: pastas por tenant (<tenant_id>/...) — escrita só por gestores do tenant
-- =====================================================================================
insert into storage.buckets (id, name, public) values
  ('property-media', 'property-media', true),
  ('tenant-assets', 'tenant-assets', true)
on conflict (id) do nothing;

-- Listagem (painel): só membros do tenant. Download de bucket público não depende desta política.
create policy tenant_storage_select on storage.objects for select to authenticated
  using (bucket_id in ('property-media', 'tenant-assets')
         and public.is_tenant_member(public.try_uuid((storage.foldername(name))[1])));
create policy tenant_storage_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('property-media', 'tenant-assets')
              and public.is_tenant_manager(public.try_uuid((storage.foldername(name))[1])));
create policy tenant_storage_update on storage.objects for update to authenticated
  using (bucket_id in ('property-media', 'tenant-assets')
         and public.is_tenant_manager(public.try_uuid((storage.foldername(name))[1])))
  with check (bucket_id in ('property-media', 'tenant-assets')
              and public.is_tenant_manager(public.try_uuid((storage.foldername(name))[1])));
create policy tenant_storage_delete on storage.objects for delete to authenticated
  using (bucket_id in ('property-media', 'tenant-assets')
         and public.is_tenant_manager(public.try_uuid((storage.foldername(name))[1])));
