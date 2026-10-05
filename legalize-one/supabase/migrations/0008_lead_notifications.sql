-- =====================================================================================
-- Aviso por e-mail de contato novo (Edge Function `notify-lead`).
-- notified_at marca o envio: cada contato gera no máximo um aviso, mesmo com chamadas repetidas.
-- =====================================================================================
alter table public.leads add column notified_at timestamptz;
