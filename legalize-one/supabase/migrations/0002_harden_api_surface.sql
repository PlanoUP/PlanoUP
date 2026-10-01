-- =====================================================================================
-- Endurecimento da superfície da API (resposta ao linter de segurança do Supabase)
--
-- 1. As views públicas saem do schema `public` (exposto pela Data API) para `private`
--    (não exposto). O site lê por funções explícitas, com o tenant como parâmetro.
-- 2. Funções auxiliares de autorização (usadas pelas políticas) também vão para `private`:
--    continuam executáveis pelos papéis (as políticas precisam), mas não viram endpoints RPC.
-- 3. Funções de trigger deixam de ser executáveis pelos papéis da API (triggers continuam
--    disparando: o privilégio EXECUTE não é verificado no disparo).
-- API pública intencional que permanece: resolve_tenant, get_tenant_profile,
-- get_published_properties, get_published_media, submit_lead, track_event (anon) e
-- create_tenant_with_owner, tenant_entitlements (autenticado) — todas validam no servidor.
-- =====================================================================================

create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 1. Views → private
-- ---------------------------------------------------------------------------
alter view public.public_tenant_profiles set schema private;
alter view public.public_properties set schema private;
alter view public.public_property_media set schema private;
revoke all on private.public_tenant_profiles, private.public_properties, private.public_property_media
  from anon, authenticated;

create function public.get_tenant_profile(p_tenant_id uuid)
returns setof private.public_tenant_profiles
language sql stable security definer set search_path = '' as $$
  select * from private.public_tenant_profiles v where v.tenant_id = p_tenant_id
$$;

create function public.get_published_properties(p_tenant_id uuid)
returns setof private.public_properties
language sql stable security definer set search_path = '' as $$
  select * from private.public_properties v where v.tenant_id = p_tenant_id
$$;

create function public.get_published_media(p_tenant_id uuid)
returns setof private.public_property_media
language sql stable security definer set search_path = '' as $$
  select * from private.public_property_media v where v.tenant_id = p_tenant_id
$$;

revoke execute on function public.get_tenant_profile(uuid), public.get_published_properties(uuid),
  public.get_published_media(uuid) from public;
grant execute on function public.get_tenant_profile(uuid), public.get_published_properties(uuid),
  public.get_published_media(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Auxiliares de autorização → private (as políticas referenciam por OID e seguem válidas)
-- ---------------------------------------------------------------------------
alter function public.is_platform_admin() set schema private;
alter function public.has_tenant_role(uuid, public.member_role[]) set schema private;
alter function public.is_tenant_member(uuid) set schema private;
alter function public.is_tenant_manager(uuid) set schema private;
alter function public.current_broker_id(uuid) set schema private;
alter function public.plan_entitlements(uuid) set schema private;
alter function public.is_client_role() set schema private;
alter function public.try_uuid(text) set schema private;

-- Corpos que citavam os nomes antigos (texto) são recriados com os novos nomes.
create or replace function private.is_tenant_manager(p_tenant_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_tenant_role(p_tenant_id, array['owner', 'admin']::public.member_role[])
$$;

create or replace function public.guard_broker_self_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if private.is_client_role() and not (private.is_tenant_manager(new.tenant_id) or private.is_platform_admin())
     and (new.user_id is distinct from old.user_id or new.active is distinct from old.active) then
    raise exception 'not allowed to change broker access' using errcode = '42501';
  end if;
  return new;
end $$;

create or replace function public.guard_broker_property_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if private.is_client_role() and not (private.is_tenant_manager(new.tenant_id) or private.is_platform_admin())
     and (new.status is distinct from old.status
          or new.broker_id is distinct from old.broker_id
          or new.slug is distinct from old.slug
          or new.model3d is distinct from old.model3d) then
    raise exception 'brokers cannot change status, owner, slug or 3D of a property' using errcode = '42501';
  end if;
  return new;
end $$;

create or replace function public.guard_tenant_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if private.is_client_role() and not private.is_platform_admin()
     and (new.status is distinct from old.status or new.plan_code is distinct from old.plan_code
          or new.slug is distinct from old.slug) then
    raise exception 'only platform admins can change tenant status, plan or slug' using errcode = '42501';
  end if;
  return new;
end $$;

create or replace function public.tenant_entitlements(p_tenant_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not (private.is_tenant_member(p_tenant_id) or private.is_platform_admin()) then
    raise exception 'not a member of this tenant' using errcode = '42501';
  end if;
  return private.plan_entitlements(p_tenant_id);
end $$;

create or replace function public.enforce_property_plan() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  ent jsonb := private.plan_entitlements(new.tenant_id);
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

-- As políticas executam as auxiliares com o papel de quem consulta.
grant execute on function private.is_platform_admin(), private.has_tenant_role(uuid, public.member_role[]),
  private.is_tenant_member(uuid), private.is_tenant_manager(uuid), private.current_broker_id(uuid),
  private.is_client_role(), private.try_uuid(text) to anon, authenticated;
revoke execute on function private.plan_entitlements(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Funções de trigger fora da API
-- ---------------------------------------------------------------------------
revoke execute on function public.properties_prepare(), public.enforce_property_plan(),
  public.guard_broker_self_update(), public.guard_broker_property_update(), public.guard_tenant_update(),
  public.prevent_tenant_change(), public.set_updated_at(), public.handle_new_user()
  from public, anon, authenticated;
