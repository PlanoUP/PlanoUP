-- PAINT CONTROL ATI — demo seed data
--
-- Run this AFTER schema.sql, once, in the Supabase SQL Editor. It populates
-- the 31 ATI units, the 8 demo responsibles and the 15 demo activities —
-- the same data the app used to show from localStorage — so the shared
-- database starts out looking identical to the old single-browser demo.
--
-- Safe to re-run: it clears these four tables first (activity_history →
-- activities → responsibles → units, respecting foreign keys) before
-- re-inserting, so running it twice does not create duplicates.

truncate table activity_history, activities, responsibles, units cascade;

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
-- responsibles (8 rows)
-- ---------------------------------------------------------------------
insert into responsibles (id, name, company, role, email, phone, active) values
  ('13f0ec0c-3d6b-4b78-8bd4-d701fc4ea0c6', 'Carlos Menezes', 'Pintura Industrial Ltda', 'Encarregado de Pintura', 'carlos.menezes@pinturaindustrial.com.br', '(84) 99123-4501', true),
  ('212ef616-6e1d-4f0d-a58e-6463a0202eef', 'Fernanda Lopes', 'Pintura Industrial Ltda', 'Engenheira de Pintura', 'fernanda.lopes@pinturaindustrial.com.br', '(84) 99123-4502', true),
  ('c002aed4-d2da-4317-8eec-978504ff92f5', 'Roberto Alves', 'Petrobras', 'Inspetor de Pintura N2', 'roberto.alves@petrobras.com.br', '(84) 99123-4503', true),
  ('77f03add-034d-4ed3-a171-a5d77d32b241', 'Juliana Costa', 'Petrobras', 'Coordenadora de Manutenção', 'juliana.costa@petrobras.com.br', '(84) 99123-4504', true),
  ('5b675a50-95eb-4b63-a6cc-846e9e4bf7e6', 'Marcos Vinícius', 'Andaimes & Cia', 'Encarregado de Andaimes', 'marcos.vinicius@andaimesecia.com.br', '(84) 99123-4505', true),
  ('4295fbf3-f85d-4fef-9863-35185c3b64d8', 'Ana Beatriz Souza', 'Pintura Industrial Ltda', 'Pintora Industrial', 'ana.souza@pinturaindustrial.com.br', '(84) 99123-4506', true),
  ('d169dca3-dc49-4357-a183-d046420d21cc', 'Paulo Ricardo', 'Jateamento Norte', 'Encarregado de Jateamento', 'paulo.ricardo@jateamentonorte.com.br', '(84) 99123-4507', true),
  ('a6c66d40-cead-409c-8155-903cf23fc5c8', 'Diego Nascimento', 'Pintura Industrial Ltda', 'Técnico de Pintura', 'diego.nascimento@pinturaindustrial.com.br', '(84) 99123-4508', false);

-- ---------------------------------------------------------------------
-- activities (15 demo rows across U260, U270, UPGN III + a few others)
-- ---------------------------------------------------------------------
insert into activities (
  id, unit_id, tag, local, title, description, priority, responsible_id,
  estimated_area_m2, request_date, needed_date, programmed_date, actual_start_date,
  expected_end_date, actual_end_date, surface_type, surface_preparation, paint_system,
  primer, intermediate_coat, finish_coat, coats_count, technical_notes, status, progress,
  impediment, general_notes, work_order, note, reference, completed_steps
) values
  ('556b9577-19cd-4812-a23d-daa1767f27dc', '2dc0b874-5855-4a18-a0b1-e5be35a8ff62', 'TQ-26001', 'Área de Tancagem', 'Recuperação de pintura externa', 'Recuperação completa da pintura externa do casco e teto do tanque.', 'P1', '13f0ec0c-3d6b-4b78-8bd4-d701fc4ea0c6', 480, '2026-06-10', '2026-08-20', '2026-08-05', '2026-08-10', '2026-08-30', null, 'Aço carbono', 'Jateamento abrasivo Sa 2½', 'Epóxi + Poliuretano — C5-M', 'Epóxi rico em zinco (75µm)', 'Epóxi alta espessura (150µm)', 'Poliuretano acrílico (50µm)', 3, '', 'Em Execução', 35, '', '', 'OS-48213', 'NF-2201', 'ISO 12944 C5-M', array['levantamento','programacao','liberacao','preparacao_superficie']),
  ('d8652bec-5df1-4403-a842-012401b2c7cc', '2dc0b874-5855-4a18-a0b1-e5be35a8ff62', 'P-26004A', 'Pátio de Bombas', 'Preparação e pintura do conjunto motobomba', 'Preparação de superfície e pintura completa do conjunto motobomba P-26004A.', 'P2', '212ef616-6e1d-4f0d-a58e-6463a0202eef', 25, '2026-08-01', '2026-09-15', '2026-09-01', null, null, null, 'Aço carbono', 'Lixamento e limpeza mecânica', 'Epóxi + Esmalte sintético', '', '', '', null, '', 'Programado', 0, '', '', 'OS-48260', '', '', array['levantamento','programacao']),
  ('f248d4e6-d823-42b4-aa3c-4cb99a28e734', '2dc0b874-5855-4a18-a0b1-e5be35a8ff62', 'Linha 8"-260-XX', 'Rack de Tubulação', 'Recuperação do sistema de pintura', 'Recuperação pontual do sistema de pintura em trecho de linha de 8 polegadas.', 'P3', '5b675a50-95eb-4b63-a6cc-846e9e4bf7e6', 140, '2026-07-20', '2026-09-05', '2026-08-15', '2026-08-18', '2026-09-02', null, 'Aço carbono', 'Jateamento abrasivo Sa 2½', 'Epóxi + Poliuretano', '', '', '', 3, '', 'Em Execução', 80, '', '', 'OS-48190', '', '', array['levantamento','programacao','liberacao','preparacao_superficie','primer','pintura_intermediaria','acabamento']),
  ('4a018b58-ec3b-4c6f-85c2-3c0f72f7f050', 'e4cd067e-4865-41c8-89eb-2d1de32df573', 'TQ-27003', 'Tancagem QAV', 'Pintura de recuperação do costado', 'Recuperação do sistema de pintura do costado do tanque de QAV.', 'P2', '4295fbf3-f85d-4fef-9863-35185c3b64d8', 620, '2026-07-15', '2026-09-10', '2026-08-28', null, null, null, '', '', '', '', '', '', null, '', 'Aguardando Liberação', 10, '', '', 'OS-48301', '', '', array['levantamento','programacao']),
  ('893f2a1e-0a49-464e-8379-c64c45a00363', 'e4cd067e-4865-41c8-89eb-2d1de32df573', 'EST-27010', 'Estrutura Metálica Pipe Rack', 'Repintura de estrutura metálica', 'Repintura de estrutura metálica do pipe rack, com tratamento de pontos de corrosão.', 'P1', 'd169dca3-dc49-4357-a183-d046420d21cc', 310, '2026-06-25', '2026-08-22', '2026-08-10', '2026-08-12', '2026-08-28', null, '', 'Jateamento localizado Sa 2½', '', '', '', '', null, '', 'Paralisado', 45, 'Aguardando liberação para trabalho a quente nas proximidades.', '', 'OS-48155', '', '', array['levantamento','programacao','liberacao','preparacao_superficie']),
  ('6acdcbed-17c6-40bf-875e-51eb584d402c', 'e4cd067e-4865-41c8-89eb-2d1de32df573', 'VLV-27015', 'Área de Válvulas', 'Pintura pontual pós-manutenção', 'Pintura de retoque em válvulas após intervenção de manutenção mecânica.', 'P4', 'a6c66d40-cead-409c-8155-903cf23fc5c8', 8, '2026-08-18', '2026-10-05', null, null, null, null, '', '', '', '', '', '', null, '', 'Backlog', 0, '', '', '', '', '', array[]::text[]),
  ('9cd07afd-1cfc-4e0c-b713-71a7b3470084', 'ddb2f9bc-1943-4098-b75a-98adea34dcfa', 'TQ-29001', 'Área de Processo', 'Pintura de vaso separador', 'Recuperação da pintura do vaso separador trifásico após inspeção.', 'P1', '13f0ec0c-3d6b-4b78-8bd4-d701fc4ea0c6', 95, '2026-07-01', '2026-08-25', '2026-08-05', '2026-08-06', '2026-08-27', null, '', 'Jateamento abrasivo Sa 2½', 'Epóxi + Poliuretano — C5-M', '', '', '', 3, '', 'Em Inspeção', 95, '', '', 'OS-48050', '', '', array['levantamento','programacao','liberacao','preparacao_superficie','primer','pintura_intermediaria','acabamento','inspecao']),
  ('b2e581cf-9335-478b-961f-b50327580321', 'ddb2f9bc-1943-4098-b75a-98adea34dcfa', 'LINHA-29-08', 'Rack de Interligação', 'Recuperação de pintura em linhas de processo', 'Recuperação de pintura em trecho de linhas de interligação de processo.', 'P2', '212ef616-6e1d-4f0d-a58e-6463a0202eef', 210, '2026-08-05', '2026-09-20', '2026-09-05', null, null, null, '', '', '', '', '', '', null, '', 'Programado', 0, '', '', '', '', '', array['levantamento','programacao']),
  ('533ad950-54b0-4c99-abec-21cb930781c2', 'ddb2f9bc-1943-4098-b75a-98adea34dcfa', 'EST-29-02', 'Estrutura de Suporte', 'Pintura de estrutura de suporte de tubulação', 'Pintura de estrutura metálica de suporte de tubulação de processo.', 'P3', '5b675a50-95eb-4b63-a6cc-846e9e4bf7e6', 60, '2026-08-10', '2026-09-12', '2026-08-29', null, null, null, '', '', '', '', '', '', null, '', 'Liberado', 5, '', '', '', '', '', array['levantamento','programacao','liberacao']),
  ('e5fbf365-8639-434b-af45-0658c71e9b32', '886422d4-caa9-4d17-8a90-ce4ccb5d2645', 'FLT-04', 'Filtro de Areia', 'Pintura de recuperação de tanque filtro', 'Recuperação da pintura externa do tanque filtro de areia nº 4.', 'P2', '4295fbf3-f85d-4fef-9863-35185c3b64d8', 75, '2026-08-12', '2026-09-18', null, null, null, null, '', '', '', '', '', '', null, '', 'Aguardando Programação', 0, '', '', '', '', '', array[]::text[]),
  ('9a2e216b-6e01-417f-9af0-255faabf3780', 'dcb0ef3a-0d76-49f6-8e8b-611005ffbef5', 'TQ-UTG-01', 'Área de Regeneração', 'Pintura de vaso de regeneração de glicol', 'Pintura completa do vaso de regeneração de glicol após reparo mecânico.', 'P1', 'd169dca3-dc49-4357-a183-d046420d21cc', 110, '2026-07-28', '2026-08-30', '2026-08-27', null, null, null, '', '', '', '', '', '', null, '', 'Liberado', 0, '', '', '', '', '', array['levantamento','programacao','liberacao']),
  ('e92093d9-fa38-4c0a-8054-78739d405336', 'c22ba18c-0838-4cd3-a7fd-8a16ac467666', 'DUTO-TAG-12', 'Faixa de Duto', 'Pintura de sinalização e faixa de duto', 'Repintura de faixas de identificação e sinalização ao longo do duto.', 'P4', '5b675a50-95eb-4b63-a6cc-846e9e4bf7e6', 40, '2026-08-15', '2026-10-10', null, null, null, null, '', '', '', '', '', '', null, '', 'Backlog', 0, '', '', '', '', '', array[]::text[]),
  ('9f168f37-beb7-47ba-8a38-765a6aa489f2', '9f069bc1-4bf9-422a-aaae-660382c253d7', 'REATOR-01', 'Área de Reação', 'Pintura interna de reator (revestimento especial)', 'Aplicação de revestimento especial interno do reator de tratamento cáustico.', 'P1', 'c002aed4-d2da-4317-8eec-978504ff92f5', 55, '2026-06-05', '2026-08-24', '2026-08-01', '2026-08-02', '2026-08-25', null, '', 'Jateamento Sa 3', 'Revestimento epóxi novolac', '', '', '', null, '', 'Paralisado', 20, 'Aguardando parada programada da unidade para liberação de espaço confinado.', '', 'OS-47990', '', '', array['levantamento','programacao','liberacao']),
  ('9906b739-ab47-4bf7-abf3-730c55808a05', '63293cde-97a5-4311-ae27-8d93352391bf', 'COMP-01', 'Casa de Compressores', 'Pintura de skid de compressor', 'Pintura completa do skid do compressor de ar de serviço nº 1.', 'P3', '13f0ec0c-3d6b-4b78-8bd4-d701fc4ea0c6', 30, '2026-07-10', '2026-09-25', '2026-08-10', '2026-08-11', '2026-08-20', '2026-08-20', '', '', '', '', '', '', null, '', 'Concluído', 100, '', '', 'OS-48001', '', '', array['levantamento','programacao','liberacao','preparacao_superficie','primer','pintura_intermediaria','acabamento','inspecao','concluido']),
  ('5a06c0f9-7264-4ee0-878e-12877e0480e9', '2d0afc27-5730-4a6f-9ce5-f8f710946a0d', 'TQ-ETE-02', 'Bacia de Contenção', 'Pintura de bacia de contenção', 'Pintura de impermeabilização e sinalização da bacia de contenção.', 'P3', '212ef616-6e1d-4f0d-a58e-6463a0202eef', 90, '2026-07-05', '2026-09-01', null, null, null, null, '', '', '', '', '', '', null, '', 'Cancelado', 0, '', 'Cancelado — escopo absorvido pela OS-48001.', '', '', '', array[]::text[]);
