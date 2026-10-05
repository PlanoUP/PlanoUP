-- =====================================================================================
-- Painel da plataforma: criar e acompanhar imobiliárias (só administrador da plataforma).
--
-- • platform_list_tenants: lista com plano, situação, responsável, números e domínios.
-- • platform_create_tenant: cria imobiliária + configurações + assinatura (+ domínio opcional).
--   O acesso do gerente responsável é criado depois pela Edge Function `team` (precisa da
--   chave de serviço para criar o login).
-- • platform_update_tenant: muda plano e/ou situação (mantém a assinatura em sincronia).
-- • platform_add_domain: liga um endereço (hostname) ao site da imobiliária.
-- =====================================================================================

create function private.require_platform_admin() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_platform_admin() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
end $$;
revoke execute on function private.require_platform_admin() from public, anon, authenticated;

-- "https://www.Exemplo.com.br/x" → "www.exemplo.com.br"
create function private.normalize_hostname(p_value text) returns text
language sql immutable set search_path = '' as $$
  select split_part(split_part(regexp_replace(lower(trim(coalesce(p_value, ''))), '^[a-z]+://', ''), '/', 1), ':', 1)
$$;

create function public.platform_add_domain(p_tenant_id uuid, p_hostname text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_host text := private.normalize_hostname(p_hostname);
  v_owner uuid;
begin
  perform private.require_platform_admin();
  if not exists (select 1 from public.tenants t where t.id = p_tenant_id) then
    raise exception 'tenant_not_found' using errcode = '22023';
  end if;
  if v_host !~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$' or char_length(v_host) > 253 then
    raise exception 'invalid_domain' using errcode = '22023';
  end if;
  select d.tenant_id into v_owner from public.tenant_domains d where d.hostname = v_host;
  if v_owner is not null and v_owner <> p_tenant_id then
    raise exception 'domain_taken' using errcode = '23505';
  end if;
  if v_owner is null then
    insert into public.tenant_domains (hostname, tenant_id, kind, is_primary)
    values (v_host, p_tenant_id, 'custom',
            not exists (select 1 from public.tenant_domains d where d.tenant_id = p_tenant_id));
  end if;
  return v_host;
end $$;

create function public.platform_create_tenant(p_name text, p_slug text, p_plan text default 'start', p_hostname text default null)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_name text := trim(coalesce(p_name, ''));
  v_slug text := lower(trim(coalesce(p_slug, '')));
  v_id uuid;
begin
  perform private.require_platform_admin();
  if char_length(v_name) not between 2 and 120 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(v_slug) not between 3 and 48 then
    raise exception 'invalid_slug' using errcode = '22023';
  end if;
  if not exists (select 1 from public.plans pl where pl.code = p_plan and pl.active) then
    raise exception 'invalid_plan' using errcode = '22023';
  end if;
  if exists (select 1 from public.tenants t where t.slug = v_slug) then
    raise exception 'slug_taken' using errcode = '23505';
  end if;

  insert into public.tenants (slug, name, plan_code, created_by) values (v_slug, v_name, p_plan, auth.uid())
  returning id into v_id;
  insert into public.tenant_settings (tenant_id, display_name) values (v_id, v_name);
  insert into public.subscriptions (tenant_id, plan_code, status) values (v_id, p_plan, 'trialing');
  if nullif(trim(coalesce(p_hostname, '')), '') is not null then
    perform public.platform_add_domain(v_id, p_hostname);
  end if;
  return v_id;
end $$;

create function public.platform_update_tenant(p_tenant_id uuid, p_plan text default null, p_status public.tenant_status default null)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_platform_admin();
  if not exists (select 1 from public.tenants t where t.id = p_tenant_id) then
    raise exception 'tenant_not_found' using errcode = '22023';
  end if;
  if p_plan is not null then
    if not exists (select 1 from public.plans pl where pl.code = p_plan and pl.active) then
      raise exception 'invalid_plan' using errcode = '22023';
    end if;
    update public.tenants set plan_code = p_plan where id = p_tenant_id;
    update public.subscriptions set plan_code = p_plan where tenant_id = p_tenant_id;
  end if;
  if p_status is not null then
    update public.tenants set status = p_status where id = p_tenant_id;
  end if;
end $$;

create function public.platform_list_tenants() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_platform_admin();
  return coalesce((
    select jsonb_agg(row_data order by row_data ->> 'name')
    from (
      select jsonb_build_object(
        'id', t.id,
        'slug', t.slug,
        'name', t.name,
        'status', t.status,
        'plan', t.plan_code,
        'createdAt', t.created_at,
        'members', (select count(*) from public.tenant_members m where m.tenant_id = t.id),
        'properties', (select count(*) from public.properties p where p.tenant_id = t.id and p.status <> 'archived'),
        'published', (select count(*) from public.properties p where p.tenant_id = t.id and p.status = 'published'),
        'leads30d', (select count(*) from public.leads l where l.tenant_id = t.id and l.created_at > now() - interval '30 days'),
        'owner', (
          select jsonb_build_object('name', coalesce(pr.full_name, u.email), 'email', u.email)
          from public.tenant_members m
          join auth.users u on u.id = m.user_id
          left join public.profiles pr on pr.id = m.user_id
          where m.tenant_id = t.id and m.role = 'owner'
          order by m.created_at limit 1),
        'domains', coalesce((
          select jsonb_agg(d.hostname order by d.is_primary desc, d.created_at)
          from public.tenant_domains d where d.tenant_id = t.id), '[]'::jsonb)
      ) as row_data
      from public.tenants t
    ) r
  ), '[]'::jsonb);
end $$;

revoke execute on function public.platform_add_domain(uuid, text), public.platform_create_tenant(text, text, text, text),
  public.platform_update_tenant(uuid, text, public.tenant_status), public.platform_list_tenants() from public, anon;
grant execute on function public.platform_add_domain(uuid, text), public.platform_create_tenant(text, text, text, text),
  public.platform_update_tenant(uuid, text, public.tenant_status), public.platform_list_tenants() to authenticated;
