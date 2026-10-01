-- =====================================================================================
-- Painel — contatos (leads)
--
-- 1. Colegas da mesma imobiliária veem o nome uns dos outros (autor das anotações,
--    corretor responsável). Só o nome: e-mail/telefone de usuários não ficam em profiles.
-- 2. Corretor registra contato recebido por WhatsApp/telefone em nome próprio
--    (o gerente registra para qualquer corretor ou para a imobiliária).
-- Ajustes no lugar (alter policy), sem recriar políticas.
-- =====================================================================================

-- O usuário atual e `p_user_id` trabalham numa mesma imobiliária?
create function private.shares_tenant(p_user_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.tenant_members me
    join public.tenant_members other on other.tenant_id = me.tenant_id
    where me.user_id = auth.uid() and other.user_id = p_user_id
  )
$$;
grant execute on function private.shares_tenant(uuid) to authenticated;

alter policy profiles_select on public.profiles
  using (id = auth.uid() or private.is_platform_admin() or private.shares_tenant(id));

alter policy leads_insert on public.leads
  with check (
    private.is_tenant_manager(tenant_id) or private.is_platform_admin()
    or (broker_id is not null and broker_id = private.current_broker_id(tenant_id))
  );
