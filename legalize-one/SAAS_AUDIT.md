# Legalize One — Auditoria e plano para SaaS multiempresa

> Documento vivo. Fase 1 (auditoria) + desenho da arquitetura + roadmap. Atualizado a cada etapa.
> Escopo: somente a pasta `legalize-one/` (a raiz do repositório é o projeto PlanoUP, que não é tocado).

---

## 1. Arquitetura atual

| Item              | Hoje                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Framework         | React 19 SPA + Vite 8 (sem SSR), React Router 8 (`createBrowserRouter`)                    |
| Linguagem         | TypeScript 6 (strict), JSX                                                                 |
| Estilo            | Tailwind CSS v4 (tokens de marca em `@theme` → variáveis CSS `--color-*`)                  |
| Banco             | **Nenhum.** Dados em arquivos TS (`src/data/*`) lidos por `services/propertyService.ts`    |
| Autenticação      | **Nenhuma**                                                                                |
| Storage           | Arquivos estáticos em `public/` (GLB 25,6 MB + poster); fotos de demonstração no Unsplash  |
| Deploy            | Vercel, projeto `legalize-one` (Root Directory `legalize-one`, preset Vite, SPA rewrite)   |
| Principais libs   | three + @react-three/fiber + drei (chunk lazy), lucide-react, @fontsource (Inter)          |
| Qualidade         | oxlint, `tsc -b`, testes E2E Playwright (fora do repositório, scratchpad das sprints)      |
| Analytics         | `lib/analytics.ts` → `dataLayer` / `fbq` / `gtag` (Pixel e GA4 ainda não instalados)       |

Rotas públicas: `/`, `/imoveis`, `/imovel/:slug`, `/vender`, `*` (404). Estados de UI na URL: `?tour=`, `?modelo3d=1`,
filtros de busca. A experiência 3D (GLB) é carregada sob demanda e configurada por imóvel (`model3DConfig`).

## 2. Funcionalidades existentes (preservar)

- Home completa (hero, busca, diferenciais, destaques, Legalize 3D Experience com o modelo interativo em destaque,
  documentação, CTA final) — responsiva, mobile first.
- Listagem `/imoveis` com filtros na URL; filtros em bottom sheet no celular.
- Página do imóvel: galeria, preço, specs, diferenciais, documentação verificada, CTAs WhatsApp/agendar, relacionados.
- Tour por fotos 360° (modo imersivo, planta, hotspots, deep link `?tour=`).
- Modelo 3D interativo (GLB): capa → loader real → composição, Planta, Ambientes, hotspots, fallback, imersivo mobile.
- `/vender`: formulário de captação em etapas (hoje só envia para o WhatsApp + evento).
- Favoritos (localStorage), CTA fixo contextual, camadas acessíveis, ~40 eventos de analytics.

## 3. Dados hardcoded (dependem do código / deploy)

| O quê                                   | Onde                                                    |
| --------------------------------------- | ------------------------------------------------------- |
| Nome, razão social, slogan, e-mail, telefone, endereço, CRECI | `config/site.ts`                    |
| WhatsApp (env `VITE_WHATSAPP_NUMBER` ou provisório)          | `config/site.ts`, `lib/whatsapp.ts`  |
| Menu principal                          | `config/site.ts` (`mainNav`)                            |
| Logo (SVG + texto "LEGALIZE")           | `components/ui/Logo.tsx`                                |
| Cores da marca                          | `index.css` (`@theme`)                                  |
| 10 imóveis, fotos, descrições, preços   | `data/properties.ts`                                    |
| Tour 360 (cenas, hotspots, planta)      | `data/tours.ts`                                         |
| Config do modelo 3D (câmeras, hotspots) | `data/property3DConfig.ts` + GLB em `public/models/`    |
| Textos institucionais / diferenciais    | `data/content.ts`, componentes da Home                  |
| Filtros (tipos, faixas de preço)        | `data/filters.ts`                                       |
| Horário de atendimento                  | `components/layout/Header.tsx`                          |
| Imóvel de destaque do 3D na Home        | `components/home/Experience3D.tsx` (slug fixo)          |
| Leads                                   | **não são gravados** — apenas abrem o WhatsApp          |

## 4. O que impede operar como SaaS (gap)

1. Sem banco: todo conteúdo exige editar código + novo deploy.
2. Sem conceito de empresa (tenant): marca, contato e catálogo são únicos e globais.
3. Sem autenticação/perfis/permissões; sem painel.
4. Sem upload/Storage de mídia (fotos, planta, GLB).
5. Leads não registrados; analytics só no navegador (nada persistido por imóvel/empresa).
6. Sem planos/limites; sem gestão da plataforma (super admin).
7. Identificação do site por domínio inexistente (um build = uma marca).

## 5. Riscos durante a transformação

| Risco                                                         | Mitigação                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Quebrar o site em produção ao trocar a fonte de dados         | **Modo duplo**: sem variáveis do Supabase o app usa o catálogo atual (comportamento idêntico). Backend só liga quando configurado. |
| Vazamento entre imobiliárias                                  | RLS em todas as tabelas + funções `SECURITY DEFINER` mínimas, testadas com Postgres real (PGlite) |
| Expor segredos                                                | Frontend só com URL + anon key (pública por design). `service_role` apenas em funções de servidor (fase futura) |
| URLs públicas (`/imovel/:slug`) mudarem                       | Slug único por tenant; slugs atuais preservados no seed                   |
| Experiência 3D quebrar                                        | Mesmo `Model3DConfig` guardado em `jsonb`; viewer não muda               |
| Cores/branding customizados quebrarem o layout                | Tema aplicado só sobrescrevendo as variáveis CSS existentes; tenant padrão não sobrescreve nada |
| Bundle maior                                                  | Cliente Supabase carregado sob demanda (import dinâmico) só quando configurado |
| Leads/eventos abertos para spam                               | Inserção pública apenas via RPC com validação, sem leitura anônima; rate limit na fase de leads |

## 6. Reutilização (preservado)

Todo o front público: layout, Header/Footer, Home, cards, galeria, filtros, página do imóvel, tour 360, todo o
`components/three/*`, hooks de UI (`useModal`, `uiStore`, `useMediaQuery`), `lib/images` (já preparado para Storage),
`lib/analytics` (passa a também persistir eventos). As páginas continuam chamando a mesma camada `services/*` —
só a implementação por trás muda.

---

## 7. Arquitetura proposta

```
Navegador (SPA React — Vercel)
 ├─ Site público  ── resolve tenant pelo domínio ──┐
 ├─ /entrar, /dashboard (fases 3–6)                │  supabase-js (anon key + JWT do usuário)
 └─ lib/analytics → RPC track_event                │
                                                   ▼
Supabase (Postgres + Auth + Storage)
 ├─ RLS em todas as tabelas por tenant_id
 ├─ RPCs públicas validadas: resolve_tenant, submit_lead, track_event
 ├─ Leitura pública por RPC: get_tenant_profile, get_published_properties, get_published_media
 │   (views em schema `private`, fora da API; mascaram endereço)
 └─ Storage: buckets por tipo, pastas por tenant (<tenant_id>/...)
Funções de servidor (fase posterior: Vercel Functions ou Supabase Edge)
 └─ operações com service_role: convite de usuários, criação de tenant pelo super admin, domínios, cobrança
```

**Por que Supabase:** Postgres com RLS (isolamento no banco), Auth pronto (e-mail/senha, magic link), Storage com
políticas, e o projeto já previa `VITE_SUPABASE_*`. Mantemos a SPA (sem migrar para Next.js): menor risco.

### 7.1 Estratégia multi-tenant

- **Modelo:** banco compartilhado, `tenant_id` em todas as tabelas de negócio, RLS obrigatória.
- **Identificação do tenant no site público:** `hostname` → tabela `tenant_domains` (RPC `resolve_tenant`):
  - `imobiliaria.legalizeone.com` (subdomínio) e `www.imobiliariaxyz.com.br` (domínio próprio) usam o mesmo
    mecanismo — só muda o registro em `tenant_domains` (+ domínio adicionado na Vercel na fase de white label).
  - Fallback: `VITE_DEFAULT_TENANT` (slug) — mantém o domínio atual funcionando como a Legalize.
- **Isolamento no painel:** o usuário só enxerga tenants dos quais é membro (`tenant_members`); políticas usam
  funções `is_tenant_member` / `has_tenant_role` (`SECURITY DEFINER`, `search_path` fixo).
- **Público:** anônimo lê apenas imóveis **publicados** de tenants **ativos**, via views que ocultam campos
  internos (ex.: número exato quando `hide_exact_address`). Não há `select` anônimo em tabelas base.

### 7.2 Autenticação e perfis

- Supabase Auth (e-mail + senha; magic link opcional). Sessão no navegador; a anon key é pública por design —
  a segurança vem da RLS.
- `profiles.is_platform_admin` → **Super admin** (Legalize One).
- `tenant_members.role` ∈ `owner | admin | broker`:
  - `owner`/`admin` → **Admin da imobiliária** (configura empresa, imóveis, corretores, leads, usuários).
  - `broker` → **Corretor** (lê imóveis do tenant, edita os atribuídos a ele, vê os próprios leads).
- Permissões escaláveis: matriz central `ROLE_PERMISSIONS` no front (UI) + as mesmas regras nas políticas RLS
  (fonte de verdade). Novos papéis = nova linha na matriz + políticas.

### 7.3 Planos e entitlements

- Tabela `plans` (START, PRO, PREMIUM) com `limits` e `features` em `jsonb`; `subscriptions` por tenant.
- Função `tenant_entitlements(tenant)` no banco + `lib/entitlements.ts` no front (`can()`, `limitOf()`).
- Limites críticos aplicados no banco (trigger: máximo de imóveis ativos); a UI só reflete. Nada de
  `if (plan === 'PRO')` espalhado.

### 7.4 Leads e analytics (dados para "Performance Digital")

- `leads` (+ `lead_notes`): canal (whatsapp, info_request, visit_request, call, form), imóvel, corretor, origem,
  página, UTMs, status do funil (novo → … → convertido/perdido). Inserção pública só via `submit_lead`.
- `analytics_events`: tipo (lista fechada), tenant, imóvel, sessão anônima, data, caminho, referrer, UTMs,
  metadados não pessoais. Inserção pública só via `track_event`. Sem IP, sem nome/telefone.
- Agregações mensais (`tenant_monthly_metrics`) e o "Potencial de Conversão" serão regras explícitas sobre esses
  dados (sem fingir IA).

## 8. Modelo de dados (migration `0001_saas_foundation.sql`)

| Tabela              | Papel                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------- |
| `profiles`          | 1:1 com `auth.users`; nome, `is_platform_admin`                                         |
| `plans`             | Catálogo de planos (limites e recursos em `jsonb`)                                      |
| `tenants`           | Imobiliária: slug, nome, status (`active`/`suspended`), plano                           |
| `subscriptions`     | Plano/estado por tenant (cobrança futura)                                               |
| `tenant_members`    | Usuário × tenant × papel                                                                |
| `tenant_settings`   | Marca, cores, logo, contato, redes, horário, mensagens, onboarding                       |
| `tenant_domains`    | Hostnames do tenant (subdomínio / domínio próprio)                                      |
| `brokers`           | Corretores (podem ou não ter login)                                                     |
| `properties`        | Imóvel completo: endereço, características, status, slug único por tenant, 3D (`jsonb`) |
| `property_media`    | Fotos, vídeos, plantas, tours e modelos 3D, com ordem e capa                            |
| `leads`, `lead_notes` | Contatos e acompanhamento                                                             |
| `analytics_events`  | Eventos de uso (sem dados pessoais)                                                     |

Views (schema `private`, migration 0002): `public_tenant_profiles`, `public_properties`, `public_property_media`.
RPCs: `resolve_tenant`, `get_tenant_profile`, `get_published_properties`, `get_published_media`, `submit_lead`,
`track_event`, `create_tenant_with_owner`, `tenant_entitlements`.

## 9. Roadmap técnico

| Etapa | Entrega                                                                                       | Estado        |
| ----- | --------------------------------------------------------------------------------------------- | ------------- |
| 0     | Auditoria + arquitetura (este documento)                                                       | ✅            |
| 1     | **Fundação**: schema + RLS + testes de isolamento; tenant no front (config/tema/contato); camada de dados com modo duplo; pipeline de eventos/leads; entitlements; cliente de auth | ✅ (ver §10) |
| 2     | Projeto Supabase real + import do catálogo atual (seed) + site público lendo do banco         | próximo       |
| 3     | `/entrar` + onboarding (4 passos) + `/dashboard` (layout, overview com dados reais/empty states) | —          |
| 4     | CRUD de imóveis + upload de mídia (Storage) + 3D administrável + publicação com slug           | —             |
| 5     | Leads (captura em todos os CTAs + `/dashboard/leads`)                                         | —             |
| 6     | Analytics (`/dashboard/analytics`, Potencial de Conversão, base do relatório mensal)          | —             |
| 7     | Corretores e usuários; super admin; planos aplicados; white label por domínio                 | —             |

---

## 10. Fundação implementada (etapa 1)

### Banco (`supabase/`)
- `migrations/0001_saas_foundation.sql` — 13 tabelas com `tenant_id` + RLS, FKs compostas `(tenant_id, id)` (um
  imóvel não pode apontar para corretor/lead de outra imobiliária), `tenant_id` imutável, slug automático único por
  tenant, `published_at` automático, limite de imóveis e recurso 3D por plano (trigger), guardas de papel (corretor
  não muda status/3D; owner não muda plano/status), views públicas que ocultam endereço exato, RPCs públicas validadas
  (anti-abuso simples em leads), Storage com pastas `<tenant_id>/…`.
- `migrations/0002_harden_api_surface.sql` — resposta ao linter de segurança do Supabase: views públicas e
  funções auxiliares de autorização movidas para o schema `private` (não exposto pela API); leitura pública passa
  por `get_tenant_profile` / `get_published_properties` / `get_published_media`; funções de trigger sem `EXECUTE`
  para os papéis da API. Restam no linter só os avisos das 8 funções públicas intencionais.
- `seed_catalog.sql` — catálogo da Legalize (10 imóveis, 25 fotos, tour 360, config 3D), gerado de `src/data` por
  `scripts/export-catalog.ts` (`npm run catalog:export`), idempotente. `src/__tests__/catalog.test.ts` aplica tudo
  no PGlite e confere, como visitante anônimo, que o conversor devolve exatamente o catálogo da V1.
- `seed.sql` — planos START / PRO / PREMIUM (provisórios) e o tenant **Legalize** com a marca e os contatos atuais.
- `tests/rls.test.mjs` — **32 testes** em Postgres 18 real (PGlite) com os papéis `anon`/`authenticated` e JWT
  simulado: isolamento de leitura/escrita entre tenants, corretor × admin × super admin, site público só com
  publicados, tenant suspenso some, domínio → tenant, validações de lead, analytics sem vazamento, limites de plano,
  Storage por pasta, e salvaguardas (toda tabela com RLS; anônimo só lê `plans` diretamente; conjunto exato de
  funções `security definer` expostas).

### Frontend (`src/`)
- **Modo duplo** (`lib/backend.ts`): sem `VITE_SUPABASE_URL`/`ANON_KEY` → comportamento da V1, verificado
  pixel a pixel contra a versão publicada. Com backend → dados da imobiliária do domínio.
- **Tenant** (`tenant/`): resolução por domínio com fallback `VITE_DEFAULT_TENANT`; marca, contato, WhatsApp, logo,
  favicon e cores aplicados por variáveis CSS (Header, Footer, título, `whatsappLink`). Domínio próprio e subdomínio
  usam o mesmo mecanismo (`tenant_domains`).
- **Dados** (`services/`): repositório Supabase convertendo as views públicas no mesmo tipo `Property` (3D preservado
  via `model3d` jsonb); carregado sob demanda.
- **Leads** (`services/leadService.ts`): RPC `submit_lead` com sessão/UTMs; ligado ao formulário "Vender".
- **Eventos** (`lib/eventSink.ts`, `lib/attribution.ts`): `track()` passa a gravar `page_view`, `property_view`,
  `3d_open`, `3d_interaction`, `tour_open`, `whatsapp_click`, `visit_request`, `search` (em lote, sem PII).
- **Planos/permissões** (`lib/entitlements.ts`, `lib/permissions.ts`): fontes únicas para a interface.
- **Auth** (`auth/`, `/entrar`, `/dashboard`): sessão Supabase, vínculos e papel, guarda de rota; painel mínimo.
- **Impacto no carregamento inicial:** +6 KB gzip (~4,5%). Supabase, repositório, login e painel são chunks sob
  demanda que o site público não baixa.

### Etapa 2 — Painel: imóveis
- `migrations/0003_panel_properties.sql` — corretor cadastra imóvel próprio só como rascunho; destaque, verificação
  de documentos, status, 3D e tour são do gerente; Storage `property-media/<tenant>/<imóvel>/…` com escrita por
  imóvel (gerente/admin da plataforma: qualquer imóvel da imobiliária; corretor: só os seus). 34 testes de RLS.
- Painel: layout com menu (lateral no desktop, inferior no celular), seletor de imobiliária (admin da plataforma),
  visão geral, lista de imóveis (busca, filtros por status), cadastro/edição com validação em português, fotos
  (WebP ≤ 2000 px gerado no navegador, ordem, capa espelhada em `cover_image_url`), publicar/arquivar/excluir.
- Validado no navegador (gerente e corretor, desktop e celular) com backend simulado; regras de acesso validadas
  no Postgres (PGlite) e no projeto real.

### Etapa 3 — Painel: contatos (leads)
- `migrations/0004_panel_leads.sql` — colegas da mesma imobiliária veem o nome uns dos outros (autor das
  anotações); corretor registra contato só em nome próprio. 36 testes de RLS.
- Painel: lista com filtros por situação e busca (nome, telefone, e-mail, imóvel), selo de contatos novos no menu,
  detalhe com atendimento (WhatsApp/ligar/e-mail), situação, responsável, dados editáveis, anotações e origem.
- Production ligada ao banco desde a etapa 2 (site idêntico ao anterior, verificado em 16 comparações de tela).

### Etapa 4 — Painel: Resultados
- `migrations/0005_tenant_metrics.sql` — `tenant_metrics(tenant, dias)`: totais do período e do anterior, série
  diária (fuso de São Paulo), números por imóvel e origens; só gerente/admin da plataforma. 37 testes de RLS.
- Potencial de Conversão (`src/dashboard/conversion.ts`): 70% taxa de contato (meta 8%) + 30% taxa de imersão
  3D/tour (meta 35%); sem 3D/tour só contato; mínimo de 10 visitantes. Testado em `conversion.test.ts`.
- Painel: indicadores com variação, gráfico diário com dica e tabela equivalente, funil, origens, ranking com dica
  por imóvel. Corretor não vê o menu nem os dados.

### Ainda mock/hardcoded (próximas etapas)
- Catálogo, tours 360 e config 3D: já importados para o banco; `src/data` continua como fonte do modo V1 (sem
  backend). O GLB e o poster seguem servidos pelo próprio site (`/models/…`), referenciados no `model3d` do imóvel.
- Conteúdo institucional da Home (hero, diferenciais, documentação, CTA final) e o imóvel em destaque do 3D na Home
  (`Experience3D.tsx`) são da Legalize — viram configuração do tenant na etapa do site dinâmico.
- Menu principal e filtros (tipos/faixas de preço); finalidade "temporada" exibida como aluguel; tipos novos
  (sala comercial, galpão…) ainda sem filtro.
- Leads só são gravados pelo formulário "Vender"; CTAs de WhatsApp/agendar dos imóveis ainda só abrem o WhatsApp
  (etapa de leads). `gallery_interaction` e `phone_click` ainda não são emitidos.

### Riscos / pendências conhecidas
- Projeto Supabase real criado (`legalize-one`, ref `nngmusfeumqwvmcjrgrz`): migrations, seed e catálogo
  aplicados; o catálogo no banco confere byte a byte (checksum) com o gerado e validado localmente.
- O Supabase concede privilégios padrão a `anon` em tabelas NOVAS: toda migration futura deve habilitar RLS e
  revisar grants (o teste de salvaguarda falha se esquecer).
- Anti-abuso de leads é básico (por sessão); para produção aberta, adicionar rate limit por IP numa função de
  servidor e captcha invisível.
