-- PAINT CONTROL ATI — seed data
--
-- Run this AFTER schema.sql, once, in the Supabase SQL Editor. It populates
-- the 31 ATI units, one responsible (Eugênio Vale), the 12 activities from
-- the Cronograma Plurianual - Plano de Manutenção - Pintura (2027-2029),
-- the 13 items from the Cronograma Plurianual - Revitalização - Pintura
-- (2027-2029), which live in their own table (revitalization_activities)
-- since they track site areas, not registered ATI units, and the 21 budget
-- lines (10 workforce roles + 11 equipment items) in cost_items — a budget
-- register, not tied to units/responsibles.
--
-- Safe to re-run: it clears these tables first (activity_history →
-- activities → revitalization_activities → responsibles → units →
-- cost_items, respecting foreign keys) before re-inserting, so running it
-- twice does not create duplicates.

truncate table activity_history, activities, revitalization_activities, responsibles, units, cost_items cascade;

-- ---------------------------------------------------------------------
-- units (31 rows, fixed UUIDs — some TAGs repeat on purpose, see §7)
-- ---------------------------------------------------------------------
insert into units (id, tag, name) values
  ('5680d790-3b07-4520-b271-3b3cd14c8c77', 'UEB', '(ATI) UEB1 - Unidade Biodiesel desativada'),
  ('9940d274-d428-4558-89c1-35abf71358b6', 'CARREGAM', '(ATI) Carregamento GLP - Diesel'),
  ('c1c906a2-694f-42cf-9483-0628fa792376', 'ATI', '(ATI) Ativo Industrial de Guamaré'),
  ('5c7a11ea-070e-4474-b6b7-13ec8850ba44', 'BAP', '(ATI) Base de Apoio Ativo Industrial'),
  ('7ceea253-78ec-4cb6-92d6-cef011d66a72', 'ECR', 'Estação de Carregamento'),
  ('63293cde-97a5-4311-ae27-8d93352391bf', 'ECSA', '(ATI) Estação de Compressão e Secagem de Ar'),
  ('1e4f8f69-ffd9-49e0-a60a-0f21afecd969', 'ECUB-II', '(ATI) ECUB II - Estação Recompressão'),
  ('18381681-f0ae-489b-8f78-78c976cd88a9', 'ECUB-V', '(ATI) ECUB V - Estação Compressores Ubarana V'),
  ('aaa89aa3-6e3d-440a-be84-551642f21fcc', 'ECUB-VI', '(ATI) ECUB VI Estação Compressores Ubarana VI'),
  ('23f266a0-5db5-4174-bab0-c366b33a2a2b', 'ECUBIAIV', '(ATI) ECUB I-III-IV Estação Compressores Ubarana'),
  ('40d0e498-6f60-42d9-89f0-36c9ca5fb0fe', 'EIA', '(ATI) EIA - Estação Injeção de Água Ubarana'),
  ('b6a20e02-db49-478d-9f57-f48e308d88d6', 'EMEDS', '(ATI) EMEDS - Estações de Medição'),
  ('886422d4-caa9-4d17-8a90-ce4ccb5d2645', 'ETA', '(ATI) ETA - Estação de Tratamento de Água'),
  ('e2ae4945-af13-43c8-9465-9e26930f3ba2', 'ETAP', '(ATI) ETAP - Estação Tratamento Água Produzida'),
  ('2d0afc27-5730-4a6f-9ce5-f8f710946a0d', 'ETE', '(ATI) ETE - Estação Tratamento de Efluentes'),
  ('1ebe8c59-ce68-4c16-8b65-697c41f128b3', 'ETO', '(ATI) ETO - Estação de Tratamento de Óleo'),
  ('4f6f81c4-a6e5-43ff-8f7c-0468d6b8d173', 'LAB', '(ATI) Laboratório Análises Químicas'),
  ('f4fe22a9-6741-42db-add6-bd0f0988530f', 'SE-5142', '(ATI) SE-5142 Subestação 138 kV'),
  ('536eb393-8cac-48ec-b479-b44db022c1bb', 'SE-522', '(ATI) SE-522 Subestação 69/4.16 kV'),
  ('c22ba18c-0838-4cd3-a7fd-8a16ac467666', 'TAG', 'Terminal Guamaré'),
  ('2dc0b874-5855-4a18-a0b1-e5be35a8ff62', 'U260', '(ATI) U260 - Unidade de Diesel'),
  ('e4cd067e-4865-41c8-89eb-2d1de32df573', 'U270', '(ATI) U270 - Unidade de QAV'),
  ('9f069bc1-4bf9-422a-aaae-660382c253d7', 'U280A', '(ATI) U280A Unidade Tratamento Cáustico (UTC)'),
  ('f5e5d8c6-bfb8-4ed1-aaec-ec8f0c31761b', 'UEB', 'Unidade Biodiesel'),
  ('c04af494-797e-409d-8951-e45ced0181ce', 'UEP', '(ATI) UEP - Unidade Estabilização de Pescada'),
  ('ddb2f9bc-1943-4098-b75a-98adea34dcfa', 'UPGN III', '(ATI) UPGN III Unidade Processamento de Gás'),
  ('b529a78d-57f2-47c3-ba98-b84837c5cd15', 'UPGN-I', '(ATI) UPGN I Unidade Processamento de Gás'),
  ('a30eb3b1-12c5-4fce-957b-4edd91b3c230', 'UPGN-II', '(ATI) UPGN II Unidade Processamento de Gás'),
  ('829ce07b-3590-4cbf-b75e-b006758d775a', 'UPGN-III', '(ATI) UPGN III Unidade Processamento de Gás'),
  ('6c59d08d-9fb3-4336-bd5d-0a0069bb4225', 'UTE', '(ATI) UTE - Unidade de Transferência e Estocagem'),
  ('dcb0ef3a-0d76-49f6-8e8b-611005ffbef5', 'UTG', '(ATI) UTG - Unidade de Tratamento de Gás');

-- ---------------------------------------------------------------------
-- responsibles
-- ---------------------------------------------------------------------
insert into responsibles (id, name, company, role, email, phone, active) values
  ('75a4b678-2367-4019-a3e6-83c11c9d3f01', 'Eugênio Vale', '', '', '', '', true);

-- ---------------------------------------------------------------------
-- activities — Cronograma Plurianual - Plano de Manutenção - Pintura (2027-2029)
-- ---------------------------------------------------------------------
insert into activities (
  id, unit_id, tag, local, title, description, priority, responsible_id,
  estimated_area_m2, request_date, needed_date, programmed_date, actual_start_date,
  expected_end_date, actual_end_date, surface_type, surface_preparation, paint_system,
  primer, intermediate_coat, finish_coat, coats_count, technical_notes, status, progress,
  impediment, general_notes, work_order, note, reference, completed_steps
) values
  ('9cf1532a-ba38-4d39-88d0-2036e4e902b5', '2dc0b874-5855-4a18-a0b1-e5be35a8ff62', '', 'DIESEL', 'Plano de Manutenção de Pintura — DIESEL', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2027-07-31', '2027-04-01', null, '2027-06-30', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]),
  ('8203f43e-47d4-4212-907f-e8f5211144a0', '2d0afc27-5730-4a6f-9ce5-f8f710946a0d', '', 'ETE I III E SÃO', 'Plano de Manutenção de Pintura — ETE I III E SÃO', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2027-10-31', '2027-07-01', null, '2027-09-30', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]),
  ('8a5695dd-0fc7-4132-91f1-7e11a1199dbd', 'e4cd067e-4865-41c8-89eb-2d1de32df573', '', 'U 270', 'Plano de Manutenção de Pintura — U 270', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2027-12-31', '2027-09-01', null, '2027-11-30', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]),
  ('0cde1036-eb87-4b1d-9c61-5f8117028850', '9f069bc1-4bf9-422a-aaae-660382c253d7', '', 'U 280', 'Plano de Manutenção de Pintura — U 280', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2028-03-31', '2027-12-01', null, '2028-02-29', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]),
  ('c6fc6c92-6d08-40ee-a32c-488b4bdc6921', 'c22ba18c-0838-4cd3-a7fd-8a16ac467666', '', 'TAG/GASFOR', 'Plano de Manutenção de Pintura — TAG/GASFOR', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2028-06-30', '2028-03-01', null, '2028-05-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]),
  ('a95477f0-c598-44df-bf02-3a7cd9e632cf', '1ebe8c59-ce68-4c16-8b65-697c41f128b3', '', 'ETO', 'Plano de Manutenção de Pintura — ETO', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2028-09-30', '2028-06-01', null, '2028-08-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]),
  ('c3fbe7a1-0423-49dd-8b68-807146996537', '23f266a0-5db5-4174-bab0-c366b33a2a2b', '', 'ECUB I A IV', 'Plano de Manutenção de Pintura — ECUB I A IV', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2028-12-31', '2028-09-01', null, '2028-11-30', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]),
  ('b8c46e78-bf17-4386-a66e-e7aaa261daf6', 'b529a78d-57f2-47c3-ba98-b84837c5cd15', '', 'UPGN I II E III', 'Plano de Manutenção de Pintura — UPGN I II E III', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2029-02-28', '2028-11-01', null, '2029-01-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]),
  ('a8c56c41-be64-4338-b5c1-398ae0533936', '18381681-f0ae-489b-8f78-78c976cd88a9', '', 'ECUB V', 'Plano de Manutenção de Pintura — ECUB V', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2029-05-31', '2029-02-01', null, '2029-04-30', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]),
  ('68cc54fe-7d6d-4e66-9f79-b6854d8fb91e', 'aaa89aa3-6e3d-440a-be84-551642f21fcc', '', 'ECUB VI', 'Plano de Manutenção de Pintura — ECUB VI', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2029-07-31', '2029-04-01', null, '2029-06-30', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]),
  ('888a62a8-705f-407d-84f1-351cac78916e', 'dcb0ef3a-0d76-49f6-8e8b-611005ffbef5', '', 'UTG I II E III', 'Plano de Manutenção de Pintura — UTG I II E III', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2029-09-30', '2029-06-01', null, '2029-08-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]),
  ('833b0968-715a-49af-a637-61d992d3d424', '6c59d08d-9fb3-4336-bd5d-0a0069bb4225', '', 'UTE TER FLARE E UEP', 'Plano de Manutenção de Pintura — UTE TER FLARE E UEP', 'Atividade extraída do Cronograma Plurianual de Manutenção - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2029-11-30', '2029-08-01', null, '2029-10-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Manutenção - Pintura.', '', '', '', array[]::text[]);

-- ---------------------------------------------------------------------
-- revitalization_activities — Cronograma Plurianual - Revitalização - Pintura (2027-2029)
-- Control kept separate from `activities`: tracks site areas/facilities,
-- not registered ATI units.
-- ---------------------------------------------------------------------
insert into revitalization_activities (
  id, area, title, description, priority, responsible_id,
  estimated_area_m2, request_date, needed_date, programmed_date, actual_start_date,
  expected_end_date, actual_end_date, surface_type, surface_preparation, paint_system,
  primer, intermediate_coat, finish_coat, coats_count, technical_notes, status, progress,
  impediment, general_notes, work_order, note, reference
) values
  ('1f0a2b3c-4d5e-4f60-8172-93a4b5c6d7e1', 'Pátio de Sucata', 'Revitalização de Pintura — Pátio de Sucata', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2027-12-31', '2027-10-01', null, '2027-11-30', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', ''),
  ('2f1a3b4c-5d6e-4f71-9283-a4b5c6d7e8f2', 'Biodiesel I', 'Revitalização de Pintura — Biodiesel I', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2028-05-31', '2027-09-01', null, '2028-04-30', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', ''),
  ('3f2a4b5c-6d7e-4f82-a394-b5c6d7e8f9a3', 'Porto', 'Revitalização de Pintura — Porto', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2027-10-31', '2027-09-01', null, '2027-10-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', ''),
  ('4f3a5b6c-7d8e-4f93-b4a5-c6d7e8f9a0b4', 'Subestação', 'Revitalização de Pintura — Subestação', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2028-10-31', '2027-10-01', null, '2028-09-30', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', ''),
  ('5f4a6b7c-8d9e-4fa4-c5b6-d7e8f9a0b1c5', 'ECUB I A IV', 'Revitalização de Pintura — ECUB I A IV', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2028-09-30', '2028-09-01', null, '2028-09-30', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', ''),
  ('6f5a7b8c-9d0e-4fb5-d6c7-e8f9a0b1c2d6', 'Galpão H', 'Revitalização de Pintura — Galpão H', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2028-11-30', '2028-09-01', null, '2028-10-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', ''),
  ('7f6a8b9c-0d1e-4fc6-e7d8-f9a0b1c2d3e7', 'Bicicletário', 'Revitalização de Pintura — Bicicletário', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P4', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, null, null, null, null, null, '', '', '', '', '', '', null, '', 'Backlog', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura. Sem datas definidas no cronograma.', '', '', ''),
  ('8f7a9b0c-1d2e-4fd7-f8e9-a0b1c2d3e4f8', 'Área do Hidrojato', 'Revitalização de Pintura — Área do Hidrojato', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2028-11-30', '2028-05-01', null, '2028-10-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', ''),
  ('9f8a0b1c-2d3e-4fe8-a9fa-b1c2d3e4f5a9', 'Mesanino', 'Revitalização de Pintura — Mesanino', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2028-08-31', '2028-05-01', null, '2028-07-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', ''),
  ('af9a1b2c-3d4e-4ff9-baba-c2d3e4f5a6ba', 'UTA', 'Revitalização de Pintura — UTA', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2027-11-30', '2027-09-01', null, '2027-10-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', ''),
  ('b0a2b3c4-4d5e-4f0a-8b8b-d3e4f5a6b7cb', 'Caldeiraria', 'Revitalização de Pintura — Caldeiraria', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2027-12-31', '2027-12-01', null, '2027-12-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', ''),
  ('c1b3c4d5-5e6f-4f1b-9c9c-e4f5a6b7c8dc', 'Praça Maquete', 'Revitalização de Pintura — Praça Maquete', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2027-12-31', '2027-12-01', null, '2027-12-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', ''),
  ('d2c4d5e6-6f70-4f2c-adad-f5a6b7c8d9ed', 'Gaveteiro', 'Revitalização de Pintura — Gaveteiro', 'Atividade extraída do Cronograma Plurianual de Revitalização - Pintura.', 'P3', '75a4b678-2367-4019-a3e6-83c11c9d3f01', null, null, '2028-01-31', '2027-12-01', null, '2028-01-31', null, '', '', '', '', '', '', null, '', 'Programado', 0, '', 'Origem: Cronograma Plurianual de Revitalização - Pintura.', '', '', '');

-- ---------------------------------------------------------------------
-- cost_items — Efetivo Total / Custo Total / Equipamentos / Custo
-- "realizado" columns start null; the team fills them in as actuals come in.
-- ---------------------------------------------------------------------
insert into cost_items (
  id, category, name, regime, quantity, hourly_rate, hours_per_day, days_per_year,
  planned_monthly_cost, planned_annual_cost, actual_monthly_cost, actual_annual_cost, notes
) values
  ('299c534e-196b-483d-8f89-787bab212688', 'Mão de Obra', 'Encarregado', 'Mensalista', 2, 95.1, 9, 262, 18687.15, 224245.80, null, null, ''),
  ('bfd26436-c3ec-431a-b3e3-390334730060', 'Mão de Obra', 'Pintor', 'Mensalista', 18, 62.93, 9, 262, 12365.75, 148388.94, null, null, ''),
  ('779a02e6-fb08-48b1-92f9-4fe6ef1d022e', 'Mão de Obra', 'Montador de andaimes', 'Mensalista', 12, 62.8, 9, 262, 12340.20, 148082.40, null, null, ''),
  ('ddc84298-1802-4f81-b900-f15c8ded96ca', 'Mão de Obra', 'Auxiliar de andaimes', 'Mensalista', 6, 47.57, 9, 262, 9347.50, 112170.06, null, null, ''),
  ('cb2016de-00f8-448f-91b3-baa89dab0af8', 'Mão de Obra', 'Caldeireiro', 'Mensalista', 4, 69.13, 9, 262, 13584.05, 163008.54, null, null, ''),
  ('4d722a52-4e9f-420e-91b4-fc5d3d25ca72', 'Mão de Obra', 'Auxiliar de caldeiraria', 'Mensalista', 4, 47.52, 9, 262, 9337.68, 112052.16, null, null, ''),
  ('b62a9375-fbf3-4387-8192-c47a383bc8ac', 'Mão de Obra', 'Pedreiro', 'Mensalista', 2, 52.91, 9, 262, 10396.82, 124761.78, null, null, ''),
  ('4117bc67-b8cf-4e55-ac4c-88014beb7cdb', 'Mão de Obra', 'Auxiliar de pedreiro', 'Mensalista', 4, 47.4, 9, 262, 9314.10, 111769.20, null, null, ''),
  ('58d8319f-888e-459f-82e4-5f603623b96a', 'Mão de Obra', 'Soldador', 'Mensalista', 2, 69.31, 9, 262, 13619.42, 163432.98, null, null, ''),
  ('0a0323d1-06d2-4fa8-8f45-e64a5b52583b', 'Mão de Obra', 'Isolador', 'Mensalista', 2, 77.89, 9, 262, 15305.39, 183664.62, null, null, ''),
  ('1f6664c9-658b-42e5-a373-2515828b7d5a', 'Equipamento', 'Gerador', 'Locação', 2, null, null, null, 7700.00, 92400.00, null, null, ''),
  ('5a95b619-47c3-4280-b353-67ecd167b0c1', 'Equipamento', 'Bitoneira', 'Objeto Contratado', 3, null, null, null, 0, 0, null, null, ''),
  ('9b705633-7408-47d5-87f0-5e27b36b71f5', 'Equipamento', 'Conjunto de oxicorte', 'Objeto Contratado', 4, null, null, null, 0, 0, null, null, ''),
  ('85027030-181f-4872-98e2-57c92b261dd2', 'Equipamento', 'Máquina de solda', 'Objeto Contratado', 2, null, null, null, 0, 0, null, null, ''),
  ('eb7db3f9-8d79-42bc-95c7-1d5287e63a04', 'Equipamento', 'PTA', 'Locação', 1, null, null, null, 43000.00, 516000.00, null, null, ''),
  ('32ede91b-d45e-4716-9fdf-b6f67abe310a', 'Equipamento', 'Caminhão Munck', 'Locação', 1, null, null, null, 50000.00, 600000.00, null, null, ''),
  ('db52a63a-5a79-4899-88cd-4a6561b78af3', 'Equipamento', 'Andaimes', 'Efetivo Brava', 8000, null, null, null, 0, 0, null, null, ''),
  ('14d58555-8b7a-4cf2-afe1-5572024a617a', 'Equipamento', 'Abraçadeiras', 'Efetivo Brava', 5400, null, null, null, 0, 0, null, null, ''),
  ('cbc8fc48-c65f-4be9-b59d-6ece569821e9', 'Equipamento', 'Barracas', 'Efetivo Brava', 2, null, null, null, 0, 0, null, null, ''),
  ('1687afae-21c3-4e37-aea2-3af0ab79d651', 'Equipamento', 'Container', 'Efetivo Brava', 1, null, null, null, 0, 0, null, null, ''),
  ('45f5219b-edbd-4f26-af22-563c8f4ec1f7', 'Equipamento', 'Compressor', 'Efetivo Brava', 1, null, null, null, 0, 0, null, null, '');
