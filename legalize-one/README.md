# Legalize One

Plataforma imobiliária da **Legalize Soluções Imobiliárias** — _do documento à chave._

React + TypeScript + Vite + Tailwind CSS v4 + React Router + Lucide.

## Versão atual — LEGALIZE ONE · V1 3D EXPERIENCE

| Item            | Valor                                                             |
| --------------- | ----------------------------------------------------------------- |
| Versão          | **1.0.0** (`package.json`)                                        |
| Tag Git         | `legalize-one-v1-3d-experience`                                   |
| Estado          | Demonstração (dados mock, sem backend/login)                      |
| Production      | V1 publicada em 30/09/2026 — `legalize-one.vercel.app`            |

Checkpoint criado antes de novas funcionalidades. Para voltar a este estado:
`git checkout legalize-one-v1-3d-experience`.

**Após a V1 (em Preview):** na Home, o destaque do Legalize 3D Experience passou a ser o modelo 3D interativo
(vitrine com a capa do modelo + "Explorar modelo 3D", que abre o visualizador direto na página do imóvel); o tour
por fotos 360° virou opção secundária ("Fazer tour por fotos").

### Funcionalidades disponíveis

- **Home**: hero, busca com filtros, diferenciais, imóveis em destaque, seção Legalize 3D Experience (destaque para
  o modelo 3D interativo; tour por fotos 360° como secundário), linha do tempo da documentação e CTA final.
- **Imóveis** (`/imoveis`): listagem com filtros na URL (finalidade, região, tipo, preço, quartos, ordem); no celular,
  filtros em bottom sheet com contagem ao vivo. Selos distintos "3D interativo" (navy/dourado) e "Tour 3D" (verde).
- **Detalhes do imóvel** (`/imovel/:slug`): galeria, preço, especificações, diferenciais, documentação verificada,
  CTAs de WhatsApp/agendamento e imóveis relacionados.
- **Tour 360 (Legalize 3D Experience)**: modo imersivo com ambientes, planta sincronizada, hotspots
  (navegação/informação/destaque), transições e abertura por URL (`?tour=<cena>`).
- **Modelo 3D interativo (GLB)**: capa → carregamento com progresso real → composição arquitetônica inicial;
  Visão geral · Planta (Terreno + cortes por pavimento) · Ambientes · Tela cheia; Redefinir visão; hotspots;
  CTA "Gostou do imóvel? · Agendar visita"; fallback quando o dispositivo não suporta WebGL ou o arquivo falha.
- **Vender** (`/vender`): formulário de captação em etapas.
- **Mobile first**: CTA fixo contextual, camadas acessíveis (Esc, foco, scroll travado), campos ≥ 16px, alvos ≥ 44px;
  no celular o modelo 3D abre imersivo (100dvh) e, ao fechar, a página volta à mesma posição.
- **Analytics**: todos os eventos passam por `track()` (dataLayer / Meta Pixel / GA4 quando configurados) —
  ver [Eventos](#eventos).

### Primeiro imóvel com modelo 3D

| Campo        | Valor                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| Imóvel       | `lg-006` — Casa em condomínio, Capim Macio (Natal/RN)                    |
| Rota         | `/imovel/casa-condominio-capim-macio-natal` (seção `#modelo-3d`)         |
| Arquivo      | `public/models/casa-mobiliada/casa-mobiliada.glb` — 25,6 MB, original, sem conversão |
| Capa         | `public/models/casa-mobiliada/poster.webp` (80 KB, renderizada do próprio modelo) |
| Configuração | `casaMobiliadaModel` em `src/data/property3DConfig.ts`                   |
| Modelo       | 921 mil triângulos · 2207 malhas → 270 draw calls após otimização        |
| Ambientes    | Visão geral, Fachada, Sala, Cozinha, Área externa                        |
| Hotspots     | Garagem coberta, Cozinha integrada, Bancada em mármore                   |

### Arquitetura do 3D (resumo)

```
PropertyDetails
└─ Property3DExperience      capa, WebGL check, imersivo na URL (?modelo3d=1) — SEM three.js
   └─ lazy(Property3DViewer) chunk sob demanda (three + R3F + drei, ~272 KB gzip)
      ├─ loadModel.ts        fetch com progresso real + cancelamento → GLTFLoader.parseAsync
      ├─ prepareModel.ts     mescla por material, centraliza pelo bounding box, dispose
      ├─ Property3DCanvas    dpr [1, 1.5], frameloop "demand", luz leve + ambiente procedural
      │  ├─ Property3DControls   OrbitControls + transições esféricas, limites, intro de câmera
      │  │  └─ cameraGoals.ts   composição/planta/ambientes a partir do modelo e da tela
      │  └─ Property3DHotspots  marcadores DOM ancorados na geometria
      ├─ Property3DToolbar / Property3DLoader / Property3DFallback / Property3DErrorBoundary
      └─ BottomSheet         "Explore os ambientes"
```

Dados por imóvel: `has3DModel`, `model3DUrl`, `model3DPoster`, `model3DConfig` (`src/types/property.ts`,
`src/types/model3d.ts`). Detalhes em [Modelo 3D interativo (GLB)](#modelo-3d-interativo-glb).

### Limitações conhecidas

- **Performance real não medida em celulares**: testes automatizados rodam com WebGL por CPU (SwiftShader); FPS e
  tempo do primeiro quadro precisam ser medidos em aparelhos reais.
- **Arquivo pesado (25,6 MB)**: sem compressão (Draco/Meshopt) nem versão mobile reduzida; leitura e otimização
  rodam na thread principal (~1–2 s de travamento em aparelhos fracos, além da compilação do primeiro quadro).
- **Ambientes em corte ("casa de bonecas")**: sem caminhada em primeira pessoa pelo interior.
- **Planta**: "Terreno" mostra a cobertura como laje; pavimentos aparecem apenas em corte, por escolha do usuário.
- **Poucos hotspots** (3), todos ancorados em objetos nomeados; sem hotspot da piscina (geometria da água pouco confiável).
- **Mobile em retrato**: ambientes centralizados, mas com espaço livre acima do modelo.
- **Tablets (< 1024 px)** usam o modo imersivo do celular.
- **Dados de demonstração**: imóveis, fotos (Unsplash) e WhatsApp provisório (`5584999999999`); sem Supabase,
  login ou painel administrativo.
- **Previews protegidos** pela Vercel Authentication (acesso apenas ao time PlanoUp).

## Rodando

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # typecheck + build de produção
npm run preview  # serve o build
```

Requer Node.js 22.x (fixado em `engines`). Copie `.env.example` para `.env`. Todas as variáveis são opcionais:
sem o Supabase o site roda no **modo V1** (catálogo local, marca Legalize).

```bash
npm run lint       # oxlint
npm run typecheck  # tsc -b
npm test           # testes unitários (Vitest) — src/__tests__
npm run test:db    # migrations + RLS em Postgres real embutido (PGlite) — supabase/tests
```

## Deploy na Vercel

O app fica na subpasta `legalize-one/` do repositório (a raiz contém outro projeto, PlanoUP).

| Configuração     | Valor                        |
| ---------------- | ---------------------------- |
| Root Directory   | `legalize-one`               |
| Framework Preset | Vite                         |
| Install Command  | `npm ci`                     |
| Build Command    | `npm run build`              |
| Output Directory | `dist`                       |
| Node.js          | 22.x                         |

`vercel.json` (dentro de `legalize-one/`) já define esses comandos, o fallback de SPA
(qualquer rota que não seja arquivo estático → `index.html`, permitindo refresh em `/imoveis` e `/imovel/:slug`)
e cache imutável para `/assets/*`. Arquivos inexistentes em `/assets/` retornam 404 real.

### Variáveis de ambiente

| Variável                       | Obrigatória | Uso                                                                  |
| ------------------------------ | ----------- | -------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`            | Não†        | Liga a plataforma (imobiliária, imóveis, leads e eventos no banco)   |
| `VITE_SUPABASE_ANON_KEY`       | Não†        | Chave pública (anon/publishable) do projeto Supabase                 |
| `VITE_SUPABASE_STORAGE_BUCKET` | Não         | Bucket das mídias (padrão `property-media`)                           |
| `VITE_DEFAULT_TENANT`          | Não         | Imobiliária quando o domínio não identifica nenhuma (padrão `legalize`) |
| `VITE_WHATSAPP_NUMBER`         | Não*        | WhatsApp no modo V1 (sem backend)                                    |
| `VITE_META_PIXEL_ID`           | Não         | Futuro                                                               |
| `VITE_GA_MEASUREMENT_ID`       | Não         | Futuro                                                               |

† As duas juntas ligam o backend; sem elas, modo V1. \* Sem ela o modo V1 usa o número provisório `5584999999999`.
Variáveis `VITE_*` são públicas e embutidas no build (refaça o deploy após alterar). A `service_role` do Supabase
**nunca** vai para o frontend.

## Plataforma SaaS (fundação multiempresa)

Arquitetura, modelo de dados, riscos e roadmap: [`SAAS_AUDIT.md`](./SAAS_AUDIT.md).

- **Banco:** `supabase/migrations/0001_saas_foundation.sql` (tabelas por `tenant_id`, RLS em todas, RPCs
  `resolve_tenant` / `submit_lead` / `track_event` / `create_tenant_with_owner`, limites de plano, Storage por
  pasta de tenant) + `0002_harden_api_surface.sql` (views e auxiliares de autorização no schema `private`, fora da
  API; o site lê por `get_tenant_profile` / `get_published_properties` / `get_published_media`) +
  `supabase/seed.sql` (planos provisórios e a Legalize como primeiro tenant).
- **Catálogo:** `supabase/seed_catalog.sql` importa os imóveis de `src/data` (fotos, tour 360 e 3D) para a Legalize.
  É gerado por `npm run catalog:export` (IDs determinísticos, idempotente) e o teste `catalog.test.ts` garante que o
  banco devolve exatamente o catálogo da V1.
- **Projeto Supabase:** `legalize-one` (ref `nngmusfeumqwvmcjrgrz`, São Paulo) com 0001, 0002, seed e catálogo
  aplicados.
- **Ativar num projeto Supabase:** `supabase link --project-ref <ref>` → `supabase db push` → rodar `supabase/seed.sql`
  e `supabase/seed_catalog.sql` no SQL Editor → definir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` na Vercel → novo deploy. Promover o primeiro
  super admin: `update profiles set is_platform_admin = true where id = '<uuid do usuário>';` (SQL Editor).
- **Frontend:** `src/tenant/` (imobiliária ativa por domínio, tema por variáveis CSS, marca/contato),
  `src/lib/backend.ts` (modo duplo), `src/lib/supabase.ts` (cliente sob demanda), `src/services/repositories/`
  (imóveis do banco → mesmo tipo `Property`), `src/lib/eventSink.ts` + `attribution.ts` (eventos sem dados pessoais),
  `src/services/leadService.ts`, `src/lib/entitlements.ts` (planos), `src/lib/permissions.ts` (papéis), `src/auth/`.
- **Painel (área oculta, sem links no site, `noindex`):** `/entrar` e `/dashboard`.
  - Visão geral (imóveis por status, plano e uso) e **Imóveis**: lista com busca/filtros, cadastro e edição completos,
    publicação/arquivamento, exclusão e **fotos** (envio do celular/computador, otimização automática para WebP,
    ordem, capa). Código em `src/dashboard/` e `src/pages/dashboard/`.
  - Papéis: **Gerente** (owner/admin) gerencia tudo da imobiliária; **Corretor** cadastra rascunhos e edita só os
    próprios imóveis (status, destaque e "documentação verificada" ficam com o gerente — regra no banco, migration
    0003). Admin da plataforma alterna entre imobiliárias.
  - **Contatos**: caixa de entrada dos leads (formulários do site + contatos registrados pela equipe), situação
    (novo → em atendimento → visita agendada → em negociação → fechado/perdido), atendimento com 1 toque
    (WhatsApp com saudação, ligar, e-mail; contato novo vira "em atendimento"), corretor responsável, anotações
    da equipe, origem/campanha (UTM). Corretor vê e registra só os próprios contatos (migration 0004).
  - **Resultados** (só gerentes): visitantes, imóveis vistos, aberturas de 3D/tour, cliques para contato e contatos,
    com comparação ao período anterior (7/30/90 dias); visitantes por dia; funil do clique ao contato; origem dos
    visitantes; **Potencial de Conversão** por imóvel — regra explícita em `src/dashboard/conversion.ts`, explicada
    na tela. Números agregados no banco por `tenant_metrics` (migration 0005), sem expor eventos brutos.
  - Sem backend, `/entrar` informa que o painel ainda não está ativo.

## Rotas

| Rota            | Página                                   |
| --------------- | ---------------------------------------- |
| `/`             | Home                                     |
| `/imoveis`      | Listagem com filtros na URL              |
| `/imovel/:slug` | Detalhes do imóvel (galeria, tour, docs) |
| `/vender`       | Captação de imóveis (formulário)         |
| `/entrar`       | Entrada do painel da imobiliária         |
| `/dashboard`    | Painel (protegido)                       |

Filtros da listagem via query string: `finalidade` (`venda`/`aluguel`), `regiao`, `tipo`, `preco`, `quartos`, `ordem`.

## Estrutura

```
src/
  components/
    layout/         Header, Footer, CTA mobile fixo, SiteLayout
    home/           Seções da Home (Hero, Benefits, Experience3D, ...)
    properties/     PropertyCard, FeaturedProperties, specs, favoritos
    tour/           Tour3DPreview + hotspots, planta, miniaturas, iframe externo
    forms/          PropertySearch, campos de busca
    ui/             Button, Badge, Logo, SmartImage, ...
    illustrations/  SceneArt (fallback vetorial de imagens)
  config/           Marca padrão, integrações, menu
  data/             MOCK DATA (modo V1: imóveis, tours, filtros, textos)
  tenant/           Imobiliária ativa: resolução por domínio, tema, store
  auth/             Sessão, papéis e guarda de rotas do painel
  services/         Camada de dados (modo duplo: catálogo local ou Supabase), leads
  lib/              analytics + eventSink, attribution, backend/supabase, entitlements, permissions, images
  hooks/ utils/ types/ routes/ pages/
supabase/
  migrations/       Schema + RLS (0001), superfície da API (0002), painel de imóveis (0003), contatos (0004), resultados (0005)
  seed.sql          Planos e tenant inicial
  seed_catalog.sql  Catálogo da Legalize (gerado por scripts/export-catalog.ts)
  tests/            Isolamento entre imobiliárias (PGlite)
```

## Pontos de integração

- **Supabase**: ver _Plataforma SaaS_ acima — `services/propertyService.ts` já escolhe entre catálogo local e banco.
- **Tour 3D**: ver a seção _Legalize 3D Experience_ abaixo.
- **Analytics / Meta Pixel**: `src/lib/analytics.ts` — todos os eventos (busca, WhatsApp, tour, lead) passam por `track()`,
  que já envia para `dataLayer`, `fbq` e `gtag` quando presentes.
- **WhatsApp**: `src/lib/whatsapp.ts` — número e mensagem da imobiliária ativa (`VITE_WHATSAPP_NUMBER` no modo V1).

## Legalize 3D Experience

Fluxo: **entrada** (`TourEntry` / `TourCtaCard`) → **modo imersivo** (`ImmersiveTour`, chunk carregado sob demanda).

- `useTourLauncher` abre o tour pela URL (`?tour=<cena>`): o "voltar" do celular fecha o tour, e links diretos
  (`/imovel/<slug>?tour=cozinha`) abrem no ambiente escolhido.
- Modo imersivo: topo (fechar, imóvel, ambiente, contador, tela cheia) · centro (renderizador) · base (ambientes,
  planta, anterior/próximo). Controles recolhem após 4s sem interação; fechar nunca some. Esc fecha o card e depois o tour.
- Planta: painel sincronizado no desktop; bottom sheet no mobile/tablet. Tocar em um cômodo navega para a cena.
- Hotspots: `navigation` (pílula com destino), `info` (ponto "+") e `feature` (destaque comercial dourado).
- Transição entre ambientes: a cena atual "avança" em direção ao ponto clicado enquanto a nova surge (desligada com
  `prefers-reduced-motion`).

### Dois modos (`src/types/tour.ts`)

| Modo       | `tourType`                     | Renderizador (`components/tour/renderers`)                  |
| ---------- | ------------------------------ | ----------------------------------------------------------- |
| `tour-360` | `mock`, `panorama`             | `PanoramaRenderer` (hoje: panorâmica plana arrastável)      |
| externo    | `matterport`, `kuula`, `iframe` | `EmbedRenderer` (iframe, só monta no modo imersivo)        |
| `model-3d` | `model` (+ `tour.model` GLB/GLTF) | `ModelRenderer` (chunk lazy; ponto de entrada da engine) |

Todos seguem `TourRendererProps`, então a interface imersiva não muda com a tecnologia.

- **360 real**: cenas com `panorama: { src, projection: 'equirectangular', initialPan }` e hotspots com
  `spherical: { yaw, pitch }`. Falta apenas um renderizador WebGL esférico com o mesmo contrato.
- **GLB/GLTF**: `tour.model: { format, url, poster, unitsPerMeter }`, cenas com `viewpoint: { position, target }` e
  hotspots com `point: [x, y, z]`. A engine (Three.js/React Three Fiber) entra em `ModelRenderer` sem pesar no resto.

### Eventos

`tour_entry_viewed`, `tour_started`, `tour_opened`, `tour_scene_changed` (`source`), `tour_hotspot_clicked` (`kind`),
`tour_floorplan_opened` (`surface`), `tour_fullscreen_entered`, `tour_completed`, `tour_closed`,
`property_tour_cta_clicked`, `property_whatsapp_clicked`, `property_schedule_clicked`, `filters_opened`.

Modelo 3D: `model3d_card_viewed`, `model3d_cta_clicked`, `model3d_started` (`source`), `model3d_loaded` (`duration_ms`, `download_ms`, `parse_ms`, `prepare_ms`, `draw_calls`, `triangles`),
`model3d_load_failed` (`reason`), `model3d_view_changed`, `model3d_plan_view`, `model3d_hotspot_clicked`,
`model3d_fullscreen_entered`, `model3d_fullscreen_exited`, `model3d_view_reset`, `model3d_rooms_opened`,
`model3d_closed`, `model3d_whatsapp_clicked`, `model3d_schedule_clicked`.

## Modelo 3D interativo (GLB)

Experiência diferente do tour 360: **"Explore o imóvel por todos os ângulos"**. Stack: `three` +
`@react-three/fiber` + `@react-three/drei`, isolados em um chunk carregado somente após o clique em
**Explorar modelo 3D** (a Home e a página do imóvel nunca baixam o GLB sozinhas).

- Fluxo: capa → fade → loader "LEGALIZE 3D EXPERIENCE · Preparando sua visita…" (progresso real em bytes) →
  primeiro quadro desenhado → fade do loader → pequena entrada de câmera (desligada com `prefers-reduced-motion`).
- Desktop: abre no próprio card (altura proporcional à tela) com **Tela cheia**. Celular/tablet (< 1024 px): abre
  direto em modo imersivo (100vw × 100dvh, sem header/CTA fixo); ao fechar, a página volta exatamente onde estava.
- Barra: **Visão geral · Planta · Ambientes · Tela cheia** + **Redefinir visão** (volta exatamente à composição inicial).
- Planta: vista superior de baixa perspectiva (FOV 16°), sem girar. Abre em **Terreno** (lote inteiro, sem cortes);
  os pavimentos (Térreo/Social/Superior) são cortes opcionais escolhidos pelo usuário.
- Ambientes: bottom sheet "Explore os ambientes" (Visão geral + viewpoints configurados).
- Transições: interpolação esférica em torno do alvo (~850 ms, easing suave); qualquer gesto interrompe a animação.
- Limites: não passa abaixo do horizonte, zoom entre 0,2× o raio e 1,8× a distância da visão geral, pan preso ao volume.
- CTA "Gostou do imóvel? · Agendar visita" discreto no canto (desktop) / compacto na base (celular); some durante gestos,
  com a lista de ambientes aberta e na planta (celular).
- Home: `Property3DShowcase` (vitrine com a capa do modelo, sem three.js). "Explorar modelo 3D" navega para o imóvel
  com `state.autoStart3D` (`autoStart.ts`) e o visualizador abre direto; o pedido é consumido na chegada, então
  recarregar ou voltar à página não reabre o modelo sozinho.
- Componentes: `src/components/three/` — `Property3DExperience` (capa → visualizador, sem three.js),
  `Property3DViewer` (chunk lazy), `Property3DCanvas`, `Property3DControls`, `Property3DHotspots`,
  `Property3DToolbar`, `Property3DLoader`, `Property3DErrorBoundary`, `Property3DFallback`.
- Carregamento: `loadModel.ts` baixa via `fetch` com progresso real e cancelamento; `prepareModel.ts` agrupa
  geometrias por material (2207 → 270 draw calls no modelo atual) e centraliza pelo bounding box.
- Câmera: `cameraGoals.ts` enquadra a composição a partir do volume configurado, da direção e da área livre da tela
  (descontando as barras), em perspectiva real — vale para paisagem e retrato.
- Performance: `dpr={[1, 1.5]}`, `frameloop="demand"` (sem giro automático: nada é desenhado com o modelo parado),
  sem sombras/pós-processamento, ambiente procedural (sem HDR para baixar), tone mapping Neutral, Canvas desmontado e
  memória da GPU liberada ao fechar. `model3d_loaded` informa `download_ms`, `parse_ms` e `prepare_ms`.

### Configurar / trocar o modelo de um imóvel

1. Coloque o arquivo em `public/models/<slug>/<arquivo>.glb` (ou use uma URL do Supabase Storage no futuro).
2. No imóvel (`src/data/properties.ts`):
   ```ts
   has3DModel: true,
   model3DUrl: '/models/<slug>/<arquivo>.glb',
   model3DPoster: '/models/<slug>/poster.webp',
   model3DConfig: meuModelo, // src/data/property3DConfig.ts
   ```
3. Em `src/data/property3DConfig.ts` (tudo centralizado por imóvel):
   - `presentation` — composição inicial: `focus` (volume da casa), `azimuth`, `elevation`, `fill`;
   - `planFocus` / `planLevels` — área da planta e cortes por pavimento;
   - `viewpoints` — `{ id, label, description, icon, cameraPosition, target, cutHeight? }`;
   - `hotspots`, `sizeBytes`, `minDistance`, `maxDistance`.

   Câmeras usam coordenadas **normalizadas pelo bounding box** (o helper `m()` converte metros da cena centralizada);
   hotspots usam coordenadas **originais do arquivo**, tiradas da geometria nomeada. Sem configuração, o modelo abre
   enquadrado automaticamente.

## Mobile

- Busca: no celular, "Onde você quer morar?" + filtros em bottom sheet (contagem ao vivo); tablet/desktop mantêm o formulário completo.
- CTA fixo (`MobileStickyCTA`): some com camadas abertas (tour, filtros, menu), teclado ativo e enquanto a busca do hero
  está visível; páginas podem trocar as ações (`setStickyActions`) — no imóvel: WhatsApp + Agendar visita.
- Camadas (`useModal` + `lib/uiStore`): Esc fecha só a do topo, foco preso e devolvido, scroll travado.
- Campos com fonte ≥ 16px abaixo de `lg` (sem zoom automático no iOS) e alvos de toque ≥ 44px.

## Imagens

URLs de imagem são montadas em `src/lib/images.ts`:

- `unsplash(id, largura)` — fotos de demonstração atuais;
- `storageImage('pasta/arquivo.jpg', { width })` — Supabase Storage (retorna vazio enquanto não configurado);
- `resizeImage(src, largura)` — variação de largura respeitando o provedor (usado nas miniaturas do tour);
- `buildSrcSet(src)` — usado pelo `SmartImage` quando recebe `sizes`, para o celular não baixar fotos de 2000px.

O `SmartImage` exibe a ilustração arquitetônica (`SceneArt`) enquanto a foto carrega, se ela falhar ou se a URL
estiver vazia — a experiência não depende do Unsplash estar disponível. Migrar para o Supabase Storage é trocar as
chamadas `unsplash(...)` por `storageImage(...)` nos dados, sem alterar componentes.
