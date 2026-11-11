# Graph Report - PlanoUP  (2026-11-11)

## Corpus Check
- 38 files · ~7,650 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 176 nodes · 375 edges · 10 communities (8 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `88359bcc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- CheckoutLink
- page.tsx
- trackEvent
- compilerOptions
- CustomModels.tsx
- EquipmentArt.tsx
- EquipmentCard.tsx
- next.config.mjs

## God Nodes (most connected - your core abstractions)
1. `Home()` - 21 edges
2. `CheckoutLink()` - 20 edges
3. `lucide-react` - 18 edges
4. `compilerOptions` - 16 edges
5. `formatPrice()` - 13 edges
6. `CustomModels()` - 11 edges
7. `trackEvent()` - 11 edges
8. `react` - 9 edges
9. `EquipmentArt()` - 9 edges
10. `product` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Home()` --calls--> `CourseBonus()`  [EXTRACTED]
  src/app/page.tsx → src/components/CourseBonus.tsx
- `Home()` --calls--> `CustomModels()`  [EXTRACTED]
  src/app/page.tsx → src/components/CustomModels.tsx
- `Home()` --calls--> `EquipmentGrid()`  [EXTRACTED]
  src/app/page.tsx → src/components/EquipmentGrid.tsx
- `Home()` --calls--> `FAQ()`  [EXTRACTED]
  src/app/page.tsx → src/components/FAQ.tsx
- `Home()` --calls--> `FinalCTA()`  [EXTRACTED]
  src/app/page.tsx → src/components/FinalCTA.tsx

## Import Cycles
- None detected.

## Communities (10 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.07
Nodes (35): dependencies, framer-motion@^11.11.17, lucide-react@^0.454.0, react@^18.3.1, react-dom@^18.3.1, devDependencies, autoprefixer@^10.4.20, postcss@^8.4.47 (+27 more)

### Community 1 - "CheckoutLink"
Cohesion: 0.20
Nodes (17): lucide-react, CheckoutLink(), Props, CourseBonus(), lessons, EquipmentImage(), FinalCTA(), Header() (+9 more)

### Community 2 - "page.tsx"
Cohesion: 0.12
Nodes (19): Home(), applications, Applications(), audience, Audience(), after, before, Comparison() (+11 more)

### Community 3 - "trackEvent"
Cohesion: 0.13
Nodes (18): next@14.2.35, next, inter, jbmono, metadata, RootLayout(), handleClick(), Footer() (+10 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 5 - "CustomModels.tsx"
Cohesion: 0.25
Nodes (13): CustomModels(), choose(), handleSubmit(), update(), validate(), empty, buildCustomRequestMessage(), CustomRequest (+5 more)

### Community 6 - "EquipmentArt.tsx"
Cohesion: 0.36
Nodes (10): AirCoolerArt(), EquipmentArt(), FlotadorArt(), FornoArt(), Frame(), MotorCompressorArt(), Props, TanqueArt() (+2 more)

### Community 7 - "EquipmentCard.tsx"
Cohesion: 0.52
Nodes (4): EquipmentCard(), EquipmentGrid(), Equipment, equipments

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `CheckoutLink` to `package.json`, `page.tsx`, `trackEvent`, `CustomModels.tsx`, `EquipmentCard.tsx`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06612685560053981 - nodes in this community are weakly interconnected._
- **Why does `react` connect `package.json` to `CheckoutLink`, `trackEvent`, `CustomModels.tsx`, `EquipmentArt.tsx`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11965811965811966 - nodes in this community are weakly interconnected._
- **Why does `next` connect `trackEvent` to `package.json`, `EquipmentArt.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `trackEvent` be split into smaller, more focused modules?**
  _Cohesion score 0.12923076923076923 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._