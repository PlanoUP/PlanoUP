-- =====================================================================================
-- Clientes em processo de compra/financiamento (painel da equipe).
-- Só acréscimos — nada existente é removido nem muda de comportamento.
--
-- • clients: cadastro do comprador (identificação, renda, família), imóvel de interesse,
--   corretor responsável e etapa do processo.
-- • client_documents: documentos enviados (arquivos num bucket PRIVADO; acesso por link temporário).
-- • client_events: histórico automático (cadastro, mudança de etapa, documentos).
--
-- Quem vê o quê (igual aos contatos): gerente vê todos da imobiliária; corretor só os dele.
-- Dados pessoais (CPF, renda): nunca aparecem em funções públicas; só a equipe autorizada lê.
-- =====================================================================================

-- docs_pending = falta documento · in_review = em análise/andamento · approved · rejected · withdrawn = desistência
create type public.client_stage as enum ('docs_pending', 'in_review', 'approved', 'rejected', 'withdrawn');
create type public.income_type as enum ('formal', 'informal', 'mixed');
create type public.marital_status as enum ('single', 'married', 'stable_union', 'divorced', 'widowed');
create type public.client_doc_status as enum ('received', 'accepted', 'rejected');

-- CPF com dígitos verificadores válidos (11 dígitos, sem máscara).
create function private.valid_cpf(p text) returns boolean
language plpgsql immutable set search_path = '' as $$
declare
  s int;
  d int;
  i int;
begin
  if p !~ '^[0-9]{11}$' or p ~ '^(.)\1{10}$' then
    return false;
  end if;
  for k in 9..10 loop
    s := 0;
    for i in 1..k loop
      s := s + substr(p, i, 1)::int * (k + 2 - i);
    end loop;
    d := (s * 10) % 11;
    if d = 10 then d := 0; end if;
    if d <> substr(p, k + 1, 1)::int then
      return false;
    end if;
  end loop;
  return true;
end $$;
grant execute on function private.valid_cpf(text) to authenticated;

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  broker_id uuid,
  property_id uuid,
  lead_id uuid references public.leads (id) on delete set null,
  full_name text not null check (char_length(full_name) between 3 and 120),
  cpf text not null check (private.valid_cpf(cpf)),
  phone text not null check (phone ~ '^[0-9]{10,13}$'),
  email text check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 160),
  instagram text check (char_length(instagram) <= 60),
  birth_date date check (birth_date between date '1900-01-01' and current_date),
  monthly_income numeric(12, 2) check (monthly_income >= 0 and monthly_income < 10000000),
  income_type public.income_type not null default 'formal',
  marital_status public.marital_status,
  dependents smallint not null default 0 check (dependents between 0 and 20),
  -- Valores da negociação (opcionais): avaliação do banco, financiado, entrada/subsídio.
  appraisal_value numeric(14, 2) check (appraisal_value >= 0),
  financing_value numeric(14, 2) check (financing_value >= 0),
  stage public.client_stage not null default 'docs_pending',
  stage_changed_at timestamptz not null default now(),
  notes text check (char_length(notes) <= 4000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, cpf),
  foreign key (tenant_id, broker_id) references public.brokers (tenant_id, id) on delete set null (broker_id),
  foreign key (tenant_id, property_id) references public.properties (tenant_id, id) on delete set null (property_id)
);
create index clients_tenant_stage_idx on public.clients (tenant_id, stage, updated_at desc);
create index clients_broker_idx on public.clients (broker_id);
create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger clients_tenant_immutable before update on public.clients
  for each row execute function public.prevent_tenant_change();

create table public.client_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id uuid not null,
  kind text not null check (kind ~ '^[a-z_]{2,40}$'),
  storage_path text not null unique check (char_length(storage_path) <= 300),
  file_name text not null check (char_length(file_name) between 1 and 200),
  content_type text check (char_length(content_type) <= 100),
  size_bytes integer check (size_bytes between 0 and 26214400),
  status public.client_doc_status not null default 'received',
  uploaded_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (tenant_id, client_id) references public.clients (tenant_id, id) on delete cascade
);
create index client_documents_client_idx on public.client_documents (client_id, created_at);
create trigger client_documents_tenant_immutable before update on public.client_documents
  for each row execute function public.prevent_tenant_change();

create table public.client_events (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id uuid not null,
  kind text not null check (kind in ('created', 'stage', 'document_added', 'document_removed', 'document_status', 'note')),
  detail jsonb not null default '{}'::jsonb,
  actor_id uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (tenant_id, client_id) references public.clients (tenant_id, id) on delete cascade
);
create index client_events_client_idx on public.client_events (client_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Acesso
-- ---------------------------------------------------------------------------
create function private.can_access_client(p_tenant_id uuid, p_client_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_tenant_manager(p_tenant_id) or private.is_platform_admin()
    or exists (select 1 from public.clients c
               where c.id = p_client_id and c.tenant_id = p_tenant_id
                 and c.broker_id is not null and c.broker_id = private.current_broker_id(p_tenant_id))
$$;
revoke execute on function private.can_access_client(uuid, uuid) from public, anon;
grant execute on function private.can_access_client(uuid, uuid) to authenticated;

alter table public.clients enable row level security;
alter table public.client_documents enable row level security;
alter table public.client_events enable row level security;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.client_documents to authenticated;
grant select on public.client_events to authenticated;

create policy clients_select on public.clients for select to authenticated
  using (private.is_tenant_manager(tenant_id) or private.is_platform_admin()
         or (broker_id is not null and broker_id = private.current_broker_id(tenant_id)));
-- Corretor cadastra clientes sempre em nome próprio.
create policy clients_insert on public.clients for insert to authenticated
  with check (private.is_tenant_manager(tenant_id) or private.is_platform_admin()
              or (broker_id is not null and broker_id = private.current_broker_id(tenant_id)));
create policy clients_update on public.clients for update to authenticated
  using (private.is_tenant_manager(tenant_id) or private.is_platform_admin()
         or (broker_id is not null and broker_id = private.current_broker_id(tenant_id)))
  with check (private.is_tenant_manager(tenant_id) or private.is_platform_admin()
              or (broker_id is not null and broker_id = private.current_broker_id(tenant_id)));
create policy clients_delete on public.clients for delete to authenticated
  using (private.is_tenant_manager(tenant_id) or private.is_platform_admin());

create policy client_documents_select on public.client_documents for select to authenticated
  using (private.can_access_client(tenant_id, client_id));
create policy client_documents_insert on public.client_documents for insert to authenticated
  with check (private.can_access_client(tenant_id, client_id));
-- Aprovar/recusar documento: gerente.
create policy client_documents_update on public.client_documents for update to authenticated
  using (private.is_tenant_manager(tenant_id) or private.is_platform_admin())
  with check (private.is_tenant_manager(tenant_id) or private.is_platform_admin());
create policy client_documents_delete on public.client_documents for delete to authenticated
  using (private.can_access_client(tenant_id, client_id));

create policy client_events_select on public.client_events for select to authenticated
  using (private.can_access_client(tenant_id, client_id));

-- O imóvel de interesse precisa ser da mesma imobiliária (garantido pela FK composta);
-- o corretor não pode passar o cliente para outro corretor (só o gerente).
create function public.guard_client_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if private.is_client_role() and not (private.is_tenant_manager(new.tenant_id) or private.is_platform_admin())
     and new.broker_id is distinct from old.broker_id then
    raise exception 'not allowed to reassign client' using errcode = '42501';
  end if;
  if new.stage is distinct from old.stage then
    new.stage_changed_at := now();
  end if;
  return new;
end $$;
create trigger clients_guard before update on public.clients
  for each row execute function public.guard_client_update();
revoke execute on function public.guard_client_update() from public, anon, authenticated;

-- Histórico automático
create function public.log_client_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'clients' then
    if tg_op = 'INSERT' then
      insert into public.client_events (tenant_id, client_id, kind, detail)
      values (new.tenant_id, new.id, 'created', jsonb_build_object('stage', new.stage));
    elsif new.stage is distinct from old.stage then
      insert into public.client_events (tenant_id, client_id, kind, detail)
      values (new.tenant_id, new.id, 'stage', jsonb_build_object('from', old.stage, 'to', new.stage));
    end if;
    return new;
  end if;
  -- client_documents
  if tg_op = 'INSERT' then
    insert into public.client_events (tenant_id, client_id, kind, detail)
    values (new.tenant_id, new.client_id, 'document_added', jsonb_build_object('kind', new.kind, 'file', new.file_name));
    return new;
  elsif tg_op = 'UPDATE' then
    if new.status is distinct from old.status then
      insert into public.client_events (tenant_id, client_id, kind, detail)
      values (new.tenant_id, new.client_id, 'document_status', jsonb_build_object('kind', new.kind, 'file', new.file_name, 'status', new.status));
    end if;
    return new;
  else
    -- Exclusão em cascata do cliente: não registra (o histórico some junto).
    if exists (select 1 from public.clients c where c.id = old.client_id) then
      insert into public.client_events (tenant_id, client_id, kind, detail)
      values (old.tenant_id, old.client_id, 'document_removed', jsonb_build_object('kind', old.kind, 'file', old.file_name));
    end if;
    return old;
  end if;
end $$;
revoke execute on function public.log_client_event() from public, anon, authenticated;
create trigger clients_log after insert or update on public.clients
  for each row execute function public.log_client_event();
create trigger client_documents_log after insert or update or delete on public.client_documents
  for each row execute function public.log_client_event();

-- ---------------------------------------------------------------------------
-- Arquivos: bucket PRIVADO `client-documents`, pasta <tenant_id>/<client_id>/arquivo
-- (novas políticas, separadas das existentes — os buckets públicos não mudam).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('client-documents', 'client-documents', false, 26214400,
   array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

create policy client_docs_storage_select on storage.objects for select to authenticated
  using (bucket_id = 'client-documents'
         and private.can_access_client(private.try_uuid((storage.foldername(name))[1]), private.try_uuid((storage.foldername(name))[2])));
create policy client_docs_storage_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'client-documents'
              and private.can_access_client(private.try_uuid((storage.foldername(name))[1]), private.try_uuid((storage.foldername(name))[2])));
create policy client_docs_storage_delete on storage.objects for delete to authenticated
  using (bucket_id = 'client-documents'
         and private.can_access_client(private.try_uuid((storage.foldername(name))[1]), private.try_uuid((storage.foldername(name))[2])));
