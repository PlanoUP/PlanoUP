-- =====================================================================================
-- Imóveis: "reservado para um cliente" e valor de avaliação (laudo). Uso interno da equipe.
-- Só acréscimos: as funções públicas do site não leem estas colunas, então o anúncio não muda.
-- =====================================================================================
alter table public.properties
  add column reserved boolean not null default false,
  add column appraisal_value numeric(14, 2) check (appraisal_value >= 0);
