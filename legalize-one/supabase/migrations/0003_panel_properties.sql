-- =====================================================================================
-- Painel — módulo de imóveis
--
-- 1. Corretor cadastra imóvel próprio, sempre como RASCUNHO (o gerente revisa e publica).
-- 2. Corretor não altera destaque, "documentação verificada" nem tour/3D (decisões do gerente).
-- 3. Fotos: pasta `<tenant_id>/<property_id>/…` no bucket property-media. Gerente e admin da
--    plataforma gravam em qualquer imóvel da imobiliária; corretor só nos imóveis dele.
--    Logo/identidade (tenant-assets) continuam só com o gerente.
-- =====================================================================================

-- Pode alterar as fotos deste imóvel? (gerente, admin da plataforma ou corretor responsável)
create function private.can_edit_property(p_tenant_id uuid, p_property_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_tenant_id is not null and (
    private.is_tenant_manager(p_tenant_id)
    or private.is_platform_admin()
    or exists (
      select 1 from public.properties p
      where p.id = p_property_id and p.tenant_id = p_tenant_id
        and p.broker_id is not null and p.broker_id = private.current_broker_id(p_tenant_id)
    )
  )
$$;
grant execute on function private.can_edit_property(uuid, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1. Cadastro de imóvel pelo corretor
-- ---------------------------------------------------------------------------
alter policy properties_insert on public.properties
  with check (
    private.is_tenant_manager(tenant_id) or private.is_platform_admin()
    or (broker_id is not null and broker_id = private.current_broker_id(tenant_id)
        and status = 'draft' and not featured and not documentation_verified
        and model3d is null and virtual_tour is null)
  );

-- ---------------------------------------------------------------------------
-- 2. Campos reservados ao gerente
-- ---------------------------------------------------------------------------
create or replace function public.guard_broker_property_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if private.is_client_role() and not (private.is_tenant_manager(new.tenant_id) or private.is_platform_admin())
     and (new.status is distinct from old.status
          or new.broker_id is distinct from old.broker_id
          or new.slug is distinct from old.slug
          or new.featured is distinct from old.featured
          or new.documentation_verified is distinct from old.documentation_verified
          or new.model3d is distinct from old.model3d
          or new.virtual_tour is distinct from old.virtual_tour) then
    raise exception 'brokers cannot change status, owner, slug, highlights, verification or 3D/tour of a property'
      using errcode = '42501';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Storage
-- ---------------------------------------------------------------------------
-- Políticas existentes ajustadas no lugar (alter policy): fotos por imóvel; identidade só gerente.
alter policy tenant_storage_select on storage.objects
  using (bucket_id in ('property-media', 'tenant-assets')
         and (private.is_tenant_member(private.try_uuid((storage.foldername(name))[1])) or private.is_platform_admin()));

alter policy tenant_storage_insert on storage.objects
  with check (
    (bucket_id = 'property-media'
     and private.can_edit_property(private.try_uuid((storage.foldername(name))[1]), private.try_uuid((storage.foldername(name))[2])))
    or (bucket_id = 'tenant-assets'
        and (private.is_tenant_manager(private.try_uuid((storage.foldername(name))[1])) or private.is_platform_admin()))
  );

alter policy tenant_storage_update on storage.objects
  using (
    (bucket_id = 'property-media'
     and private.can_edit_property(private.try_uuid((storage.foldername(name))[1]), private.try_uuid((storage.foldername(name))[2])))
    or (bucket_id = 'tenant-assets'
        and (private.is_tenant_manager(private.try_uuid((storage.foldername(name))[1])) or private.is_platform_admin()))
  )
  with check (
    (bucket_id = 'property-media'
     and private.can_edit_property(private.try_uuid((storage.foldername(name))[1]), private.try_uuid((storage.foldername(name))[2])))
    or (bucket_id = 'tenant-assets'
        and (private.is_tenant_manager(private.try_uuid((storage.foldername(name))[1])) or private.is_platform_admin()))
  );

alter policy tenant_storage_delete on storage.objects
  using (
    (bucket_id = 'property-media'
     and private.can_edit_property(private.try_uuid((storage.foldername(name))[1]), private.try_uuid((storage.foldername(name))[2])))
    or (bucket_id = 'tenant-assets'
        and (private.is_tenant_manager(private.try_uuid((storage.foldername(name))[1])) or private.is_platform_admin()))
  );
