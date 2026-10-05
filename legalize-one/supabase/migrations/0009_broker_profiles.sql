-- =====================================================================================
-- Modalidade Corretor: página pública do corretor (perfil, imóveis, depoimentos).
-- Só acréscimos — nada existente é removido nem muda de comportamento.
--
-- • tenants.kind: 'agency' (imobiliária, padrão de todas as contas atuais) | 'solo' (corretor autônomo:
--   uma conta com uma pessoa, que é dona e corretora). Estrutura para os dois caminhos:
--     IMOBILIÁRIA → CORRETORES → IMÓVEIS   e   CORRETOR AUTÔNOMO → IMÓVEIS
-- • brokers ganha o perfil público (tudo opcional; só aparece com public_profile = true).
-- • broker_testimonials: depoimentos, já preparados para coleta verificada no futuro.
-- • RPCs públicas de leitura por endereço do perfil + registro de contato direto para o corretor.
-- =====================================================================================

create type public.tenant_kind as enum ('agency', 'solo');
alter table public.tenants add column kind public.tenant_kind not null default 'agency';

-- Plano do corretor autônomo (valores provisórios, como os demais planos).
insert into public.plans (code, name, position, limits, features) values
  ('corretor', 'Corretor', 0,
   '{"max_properties": 30, "max_users": 1, "max_brokers": 1}',
   '{"model3d": false, "virtual_tour": true, "analytics_advanced": false, "reports": false, "premium_listings": false, "custom_domain": false, "support": "whatsapp"}')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Perfil público do corretor
-- ---------------------------------------------------------------------------
create function private.is_reserved_slug(p_slug text) returns boolean
language sql immutable set search_path = '' as $$
  select p_slug = any (array['entrar', 'dashboard', 'imoveis', 'imovel', 'vender', 'privacidade', 'api', 'assets',
    'models', 'corretor', 'corretores', 'admin', 'painel', 'login', 'impulsigo', 'legalize', 'www', 'app', 'suporte'])
$$;
grant execute on function private.is_reserved_slug(text) to anon, authenticated;

alter table public.brokers
  add column profile_slug text unique
    check (profile_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(profile_slug) between 3 and 48
           and not private.is_reserved_slug(profile_slug)),
  add column public_profile boolean not null default false,
  add column headline text check (char_length(headline) <= 140),
  add column bio text check (char_length(bio) <= 1500),
  add column city text check (char_length(city) <= 80),
  add column state text check (state ~ '^[A-Z]{2}$'),
  add column years_experience smallint check (years_experience between 0 and 70),
  add column specialties text[] not null default '{}' check (cardinality(specialties) <= 12),
  add column regions text[] not null default '{}' check (cardinality(regions) <= 12),
  add column languages text[] not null default '{}' check (cardinality(languages) <= 8),
  add column highlights text[] not null default '{}' check (cardinality(highlights) <= 8),
  add column instagram_url text check (char_length(instagram_url) <= 300),
  add column cover_url text check (char_length(cover_url) <= 500),
  add column logo_url text check (char_length(logo_url) <= 500),
  -- Paleta curada (não é cor livre): a página mantém o padrão visual.
  add column accent_color text check (accent_color in ('navy', 'blue', 'emerald', 'wine', 'graphite', 'gold')),
  -- Perfil de demonstração (sem WhatsApp real); só o servidor marca.
  add column is_demo boolean not null default false;

-- O corretor edita o próprio perfil; acesso (login/ativo) e a marca de demonstração continuam com gerente/servidor.
create or replace function public.guard_broker_self_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if private.is_client_role() and not (private.is_tenant_manager(new.tenant_id) or private.is_platform_admin())
     and (new.user_id is distinct from old.user_id or new.active is distinct from old.active) then
    raise exception 'not allowed to change broker access' using errcode = '42501';
  end if;
  if private.is_client_role() and not private.is_platform_admin() and new.is_demo is distinct from old.is_demo then
    raise exception 'not allowed to change demo flag' using errcode = '42501';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Depoimentos
-- ---------------------------------------------------------------------------
-- manual = cadastrado pelo corretor · verified = coleta verificada (futuro) · demo = demonstração
create type public.testimonial_source as enum ('manual', 'verified', 'demo');
create type public.testimonial_status as enum ('published', 'hidden', 'pending');

create table public.broker_testimonials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  broker_id uuid not null,
  author_name text not null check (char_length(author_name) between 2 and 80),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 3 and 800),
  author_photo_url text check (char_length(author_photo_url) <= 500),
  testimonial_date date,
  status public.testimonial_status not null default 'published',
  source public.testimonial_source not null default 'manual',
  position integer not null default 0,
  -- Coleta verificada (futuro): convite enviado ao cliente, que confirma pelo link.
  request_token uuid unique,
  requested_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, broker_id) references public.brokers (tenant_id, id) on delete cascade
);
create index broker_testimonials_broker_idx on public.broker_testimonials (broker_id, position);
create trigger broker_testimonials_updated_at before update on public.broker_testimonials
  for each row execute function public.set_updated_at();
create trigger broker_testimonials_tenant_immutable before update on public.broker_testimonials
  for each row execute function public.prevent_tenant_change();

-- Pela interface só se cadastra depoimento "manual"; verificação e demonstração ficam com o servidor.
create function public.guard_testimonial_source() returns trigger
language plpgsql set search_path = '' as $$
begin
  if private.is_client_role() and not private.is_platform_admin()
     and (new.source <> 'manual' or new.verified_at is not null or new.request_token is not null
          or (tg_op = 'UPDATE' and (new.source is distinct from old.source or new.verified_at is distinct from old.verified_at))) then
    raise exception 'testimonial source is managed by the platform' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger broker_testimonials_guard before insert or update on public.broker_testimonials
  for each row execute function public.guard_testimonial_source();
revoke execute on function public.guard_testimonial_source() from public, anon, authenticated;

alter table public.broker_testimonials enable row level security;
grant select, insert, update, delete on public.broker_testimonials to authenticated;

-- Equipe vê; gerente edita todos; corretor edita só os próprios.
create policy testimonials_select on public.broker_testimonials for select to authenticated
  using (private.is_tenant_member(tenant_id) or private.is_platform_admin());
create policy testimonials_insert on public.broker_testimonials for insert to authenticated
  with check (private.is_tenant_manager(tenant_id) or private.is_platform_admin()
              or broker_id = private.current_broker_id(tenant_id));
create policy testimonials_update on public.broker_testimonials for update to authenticated
  using (private.is_tenant_manager(tenant_id) or private.is_platform_admin() or broker_id = private.current_broker_id(tenant_id))
  with check (private.is_tenant_manager(tenant_id) or private.is_platform_admin() or broker_id = private.current_broker_id(tenant_id));
create policy testimonials_delete on public.broker_testimonials for delete to authenticated
  using (private.is_tenant_manager(tenant_id) or private.is_platform_admin() or broker_id = private.current_broker_id(tenant_id));

-- ---------------------------------------------------------------------------
-- Leitura pública por endereço do perfil (só perfis publicados de corretores ativos em contas ativas)
-- ---------------------------------------------------------------------------
create function private.public_broker(p_slug text) returns setof public.brokers
language sql stable security definer set search_path = '' as $$
  select b.* from public.brokers b
  join public.tenants t on t.id = b.tenant_id and t.status = 'active'
  where b.profile_slug = lower(p_slug) and b.public_profile and b.active
$$;
revoke execute on function private.public_broker(text) from public, anon, authenticated;

create function public.get_broker_profile(p_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'brokerId', b.id, 'tenantId', b.tenant_id, 'slug', b.profile_slug, 'isDemo', b.is_demo,
    'name', b.name, 'creci', b.creci, 'photoUrl', b.photo_url, 'coverUrl', b.cover_url, 'logoUrl', b.logo_url,
    'headline', b.headline, 'bio', b.bio, 'city', b.city, 'state', b.state, 'yearsExperience', b.years_experience,
    'specialties', b.specialties, 'regions', b.regions, 'languages', b.languages, 'highlights', b.highlights,
    'whatsapp', b.whatsapp, 'phone', b.phone, 'email', b.email, 'instagramUrl', b.instagram_url,
    'accentColor', b.accent_color,
    -- Conta: corretor autônomo (marca Impulsigo) ou imobiliária (marca da imobiliária).
    'account', jsonb_build_object('kind', t.kind, 'slug', t.slug, 'name', s.display_name, 'logoUrl', s.logo_url,
                                  'primaryColor', s.primary_color, 'secondaryColor', s.secondary_color)
  )
  from private.public_broker(p_slug) b
  join public.tenants t on t.id = b.tenant_id
  join public.tenant_settings s on s.tenant_id = b.tenant_id
$$;

-- Imóveis do corretor: autônomo = todos os publicados da conta; de imobiliária = os que ele atende.
create function public.get_broker_properties(p_slug text) returns setof private.public_properties
language sql stable security definer set search_path = '' as $$
  select v.* from private.public_properties v
  join private.public_broker(p_slug) b on b.tenant_id = v.tenant_id
  join public.tenants t on t.id = b.tenant_id
  join public.properties p on p.id = v.id
  where t.kind = 'solo' or p.broker_id = b.id
$$;

create function public.get_broker_media(p_slug text) returns setof private.public_property_media
language sql stable security definer set search_path = '' as $$
  select m.* from private.public_property_media m
  where m.property_id in (select x.id from public.get_broker_properties(p_slug) x)
$$;

create function public.get_broker_testimonials(p_slug text)
returns table (id uuid, author_name text, rating smallint, comment text, author_photo_url text,
               testimonial_date date, source public.testimonial_source)
language sql stable security definer set search_path = '' as $$
  select x.id, x.author_name, x.rating, x.comment, x.author_photo_url, x.testimonial_date, x.source
  from public.broker_testimonials x
  join private.public_broker(p_slug) b on b.id = x.broker_id
  where x.status = 'published'
  order by x.position, x.created_at desc
  limit 24
$$;

-- Contato pela página do corretor: mesmas validações do submit_lead + o contato fica com o corretor.
create function public.submit_broker_lead(
  p_broker_slug text,
  p_channel text,
  p_property_id uuid default null,
  p_name text default null,
  p_phone text default null,
  p_email text default null,
  p_message text default null,
  p_page_path text default null,
  p_referrer text default null,
  p_session_id text default null,
  p_utm jsonb default '{}'::jsonb
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_broker public.brokers;
  v_id uuid;
begin
  select * into v_broker from private.public_broker(p_broker_slug);
  if v_broker.id is null then
    raise exception 'invalid broker' using errcode = '22023';
  end if;
  v_id := public.submit_lead(v_broker.tenant_id, p_channel, p_property_id, p_name, p_phone, p_email, p_message,
                             'broker_page', p_page_path, p_referrer, p_session_id, p_utm);
  update public.leads set broker_id = v_broker.id where id = v_id and broker_id is null;
  return v_id;
end $$;

revoke execute on function public.get_broker_profile(text), public.get_broker_properties(text), public.get_broker_media(text),
  public.get_broker_testimonials(text),
  public.submit_broker_lead(text, text, uuid, text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.get_broker_profile(text), public.get_broker_properties(text), public.get_broker_media(text),
  public.get_broker_testimonials(text),
  public.submit_broker_lead(text, text, uuid, text, text, text, text, text, text, text, jsonb) to anon, authenticated;
