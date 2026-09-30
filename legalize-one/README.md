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

Copie `.env.example` para `.env` para configurar o número do WhatsApp e (futuramente) Supabase, Meta Pixel e GA4.

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
  hooks/ lib/ utils/ types/ routes/ pages/
```

## Pontos de integração

- **Supabase**: `src/services/propertyService.ts` — as funções já são assíncronas; basta trocar o corpo.
- **Tour 3D**: `PropertyTour` (`src/types/tour.ts`) suporta `tourType` = `mock | matterport | kuula | iframe`,
  `tourUrl`, `scenes` e `hotspots`. Com `tourType` diferente de `mock` e `tourUrl`, o componente renderiza o iframe do provedor.
- **Analytics / Meta Pixel**: `src/lib/analytics.ts` — todos os eventos (busca, WhatsApp, tour, lead) passam por `track()`,
  que já envia para `dataLayer`, `fbq` e `gtag` quando presentes.
- **WhatsApp**: `src/lib/whatsapp.ts` + `VITE_WHATSAPP_NUMBER`.

## Imagens

As fotos são do Unsplash. O componente `SmartImage` mostra uma ilustração arquitetônica (`SceneArt`)
enquanto carrega ou se a foto falhar, então nenhuma imagem aparece quebrada.
