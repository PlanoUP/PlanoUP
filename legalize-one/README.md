# Legalize One

Plataforma imobiliária da **Legalize Soluções Imobiliárias** — _do documento à chave._

React + TypeScript + Vite + Tailwind CSS v4 + React Router + Lucide.

## Rodando

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # typecheck + build de produção
npm run preview  # serve o build
```

Requer Node.js 22.x (fixado em `engines`). Copie `.env.example` para `.env` para configurar o número do WhatsApp e
(futuramente) Supabase, Meta Pixel e GA4 — todas as variáveis são opcionais nesta fase.

```bash
npm run lint       # oxlint
npm run typecheck  # tsc -b
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

| Variável                       | Obrigatória | Uso                                                      |
| ------------------------------ | ----------- | -------------------------------------------------------- |
| `VITE_WHATSAPP_NUMBER`         | Não*        | WhatsApp de atendimento (dígitos com DDI+DDD)            |
| `VITE_SUPABASE_URL`            | Não         | Futuro — ativa URLs do Supabase Storage em `lib/images`  |
| `VITE_SUPABASE_ANON_KEY`       | Não         | Futuro                                                   |
| `VITE_SUPABASE_STORAGE_BUCKET` | Não         | Futuro — bucket das fotos (padrão `imoveis`)             |
| `VITE_META_PIXEL_ID`           | Não         | Futuro                                                   |
| `VITE_GA_MEASUREMENT_ID`       | Não         | Futuro                                                   |

\* Sem ela o site usa o número provisório `5584999999999`. Variáveis `VITE_*` são embutidas no bundle no build:
após alterá-las na Vercel, faça um novo deploy.

## Rotas

| Rota            | Página                                   |
| --------------- | ---------------------------------------- |
| `/`             | Home                                     |
| `/imoveis`      | Listagem com filtros na URL              |
| `/imovel/:slug` | Detalhes do imóvel (galeria, tour, docs) |
| `/vender`       | Captação de imóveis (formulário)         |

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
  config/           Marca, integrações, menu
  data/             MOCK DATA (imóveis, tours, filtros, textos)
  services/         Camada de dados (troca mock → Supabase aqui)
  lib/              analytics, whatsapp, images (URLs de imagem)
  hooks/ utils/ types/ routes/ pages/
```

## Pontos de integração

- **Supabase**: `src/services/propertyService.ts` — as funções já são assíncronas; basta trocar o corpo.
- **Tour 3D**: ver a seção _Legalize 3D Experience_ abaixo.
- **Analytics / Meta Pixel**: `src/lib/analytics.ts` — todos os eventos (busca, WhatsApp, tour, lead) passam por `track()`,
  que já envia para `dataLayer`, `fbq` e `gtag` quando presentes.
- **WhatsApp**: `src/lib/whatsapp.ts` + `VITE_WHATSAPP_NUMBER`.

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

Modelo 3D: `model3d_card_viewed`, `model3d_started`, `model3d_loaded` (`duration_ms`, `download_ms`, `parse_ms`, `prepare_ms`, `draw_calls`, `triangles`),
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
