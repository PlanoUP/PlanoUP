-- =====================================================================================
-- Verificação em duas etapas (senha + código do aplicativo autenticador), exigida no BANCO.
--
-- • Quem ativou a verificação só acessa dados de imobiliária com a sessão confirmada pelo
--   código (JWT com aal = 'aal2'). Uma senha vazada, sozinha, não abre nada.
-- • Administrador da plataforma: poderes de plataforma SÓ com aal2 (obrigatório).
-- Feito nas funções auxiliares usadas por todas as políticas e RPCs (create or replace mantém
-- as referências), então vale para tabelas, Storage e funções de uma vez.
-- =====================================================================================

-- A sessão atual cumpre a verificação exigida para este usuário?
create function private.mfa_satisfied() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified'
      )
$$;
grant execute on function private.mfa_satisfied() to anon, authenticated;

create or replace function private.is_platform_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
     and coalesce((select p.is_platform_admin from public.profiles p where p.id = auth.uid()), false)
$$;

create or replace function private.has_tenant_role(p_tenant_id uuid, p_roles public.member_role[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.mfa_satisfied() and exists (
    select 1 from public.tenant_members m
    where m.tenant_id = p_tenant_id and m.user_id = auth.uid() and m.role = any (p_roles)
  )
$$;

create or replace function private.is_tenant_member(p_tenant_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.mfa_satisfied() and exists (
    select 1 from public.tenant_members m where m.tenant_id = p_tenant_id and m.user_id = auth.uid()
  )
$$;

create or replace function private.current_broker_id(p_tenant_id uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select b.id from public.brokers b
  where b.tenant_id = p_tenant_id and b.user_id = auth.uid() and b.active and private.mfa_satisfied()
$$;

create or replace function private.shares_tenant(p_user_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.mfa_satisfied() and exists (
    select 1 from public.tenant_members me
    join public.tenant_members other on other.tenant_id = me.tenant_id
    where me.user_id = auth.uid() and other.user_id = p_user_id
  )
$$;

-- Políticas que liberavam pelo próprio usuário (sem passar pelas auxiliares) também exigem a verificação.
alter policy brokers_update on public.brokers
  using (private.is_tenant_manager(tenant_id) or (user_id = auth.uid() and private.mfa_satisfied()) or private.is_platform_admin())
  with check (private.is_tenant_manager(tenant_id) or (user_id = auth.uid() and private.mfa_satisfied()) or private.is_platform_admin());

alter policy lead_notes_delete on public.lead_notes
  using ((author_id = auth.uid() and private.mfa_satisfied()) or private.is_tenant_manager(tenant_id));
