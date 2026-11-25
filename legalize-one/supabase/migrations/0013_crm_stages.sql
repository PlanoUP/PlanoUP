-- =====================================================================================
-- Legalize Corretor · Fase 01 — novos valores de enum (só acréscimos).
--
-- Fica numa migration própria porque um valor novo de enum só pode ser usado depois que a
-- transação que o criou termina (o Supabase aplica cada migration na sua transação).
--
-- • Funil do CRM em 8 etapas: Novo contato (new) → Em atendimento (contacted) → Qualificado (qualified)
--   → Visita agendada (visit_scheduled) → Negociação (negotiation) → Proposta (proposal)
--   → Ganho (converted) | Perdido (lost).
-- • Conta aguardando aprovação (cadastro aberto do corretor): o site só vai ao ar quando o admin
--   da plataforma muda a situação para 'active' (o site público já filtra status = 'active').
-- =====================================================================================

alter type public.lead_status add value if not exists 'qualified' after 'contacted';
alter type public.lead_status add value if not exists 'proposal' after 'negotiation';

alter type public.tenant_status add value if not exists 'pending';
