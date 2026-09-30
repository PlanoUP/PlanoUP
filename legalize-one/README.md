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

Requer Node.js 20.19+ (recomendado 22). Copie `.env.example` para `.env` para configurar o número do WhatsApp e
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
- **Tour 3D**: `PropertyTour` (`src/types/tour.ts`) suporta `tourType` = `mock | matterport | kuula | iframe`,
  `tourUrl`, `scenes` e `hotspots`. Com `tourType` diferente de `mock` e `tourUrl`, o componente renderiza o iframe do provedor.
- **Analytics / Meta Pixel**: `src/lib/analytics.ts` — todos os eventos (busca, WhatsApp, tour, lead) passam por `track()`,
  que já envia para `dataLayer`, `fbq` e `gtag` quando presentes.
- **WhatsApp**: `src/lib/whatsapp.ts` + `VITE_WHATSAPP_NUMBER`.

## Imagens

URLs de imagem são montadas em `src/lib/images.ts`:

- `unsplash(id, largura)` — fotos de demonstração atuais;
- `storageImage('pasta/arquivo.jpg', { width })` — Supabase Storage (retorna vazio enquanto não configurado);
- `resizeImage(src, largura)` — variação de largura respeitando o provedor (usado nas miniaturas do tour).

O `SmartImage` exibe a ilustração arquitetônica (`SceneArt`) enquanto a foto carrega, se ela falhar ou se a URL
estiver vazia — a experiência não depende do Unsplash estar disponível. Migrar para o Supabase Storage é trocar as
chamadas `unsplash(...)` por `storageImage(...)` nos dados, sem alterar componentes.
