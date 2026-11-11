# Graph Report - paint-control-ati-system-cjnvq7  (2026-11-11)

## Corpus Check
- 94 files · ~34,235 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 457 nodes · 1402 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `243a0ee4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- lucide-react
- calculations.ts
- store.ts
- [activityId]/page.tsx
- package.json
- ActivityFormPanel.tsx
- ExecutiveReport.tsx
- authStore.ts
- app/layout.tsx
- compilerOptions
- CostSection.tsx
- excelExport.ts
- EquipmentArt.tsx
- ResponsibleFormModal.tsx
- next.config.mjs

## God Nodes (most connected - your core abstractions)
1. `lucide-react` - 46 edges
2. `usePaintControlStore` - 35 edges
3. `react` - 32 edges
4. `isOverdue()` - 26 edges
5. `PageHeader()` - 21 edges
6. `Home()` - 20 edges
7. `CheckoutLink()` - 20 edges
8. `ActivitiesSection()` - 20 edges
9. `ActivityDetailPage()` - 19 edges
10. `EmptyState()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `ProgramacaoPage()` --indirect_call--> `priorityComparator()`  [INFERRED]
  src/app/paint-control-ati/programacao/page.tsx → src/lib/paint-control/calculations.ts
- `handleExport()` --calls--> `exportCostItemToExcel()`  [EXTRACTED]
  src/components/paint-control/CostSection.tsx → src/lib/paint-control/excelExport.ts
- `ScurveItem` --references--> `ActivityStatus`  [EXTRACTED]
  src/lib/paint-control/reportCalculations.ts → src/types/paint-control.ts
- `Home()` --calls--> `WhatsAppSupport()`  [EXTRACTED]
  src/app/page.tsx → src/components/WhatsAppSupport.tsx
- `ActivityDetailPage()` --calls--> `ActivityFormPanel()`  [EXTRACTED]
  src/app/paint-control-ati/atividades/[activityId]/page.tsx → src/components/paint-control/ActivityFormPanel.tsx

## Import Cycles
- None detected.

## Communities (16 total, 2 thin omitted)

### Community 0 - "lucide-react"
Cohesion: 0.08
Nodes (44): lucide-react, Home(), applications, Applications(), audience, Audience(), CheckoutLink(), Props (+36 more)

### Community 1 - "calculations.ts"
Cohesion: 0.09
Nodes (33): react, AtividadesPage(), ConfiguracoesPage(), ROLES, CustosPage(), VisaoGeralPage(), PrioridadesPage(), ResponsaveisPage() (+25 more)

### Community 2 - "store.ts"
Cohesion: 0.08
Nodes (53): SEED_ACTIVITIES, laborItem(), round2(), SEED_COST_ITEMS, SEED_RESPONSIBLES, SEED_REVITALIZATION_ITEMS, SEED_UNITS, UNIT_BY_ID (+45 more)

### Community 3 - "[activityId]/page.tsx"
Cohesion: 0.16
Nodes (30): next, ActivityDetailPage(), InfoRow(), MILESTONE_INDEX, MILESTONES, ProgramacaoPage(), ChartCard(), PRIORITY_HEX (+22 more)

### Community 4 - "package.json"
Cohesion: 0.06
Nodes (42): dependencies, date-fns@^4.4.0, exceljs@^4.4.0, framer-motion@^11.11.17, lucide-react@^0.454.0, next@14.2.35, react@^18.3.1, react-dom@^18.3.1 (+34 more)

### Community 5 - "ActivityFormPanel.tsx"
Cohesion: 0.11
Nodes (24): ActivityFormPanel(), handleSubmit(), activityToForm(), emptyForm(), Field(), FormState, formToPayload(), Section() (+16 more)

### Community 6 - "ExecutiveReport.tsx"
Cohesion: 0.15
Nodes (22): CategoryBadge(), CostTable(), budgetByCategory(), BudgetDonut(), ExecutiveReport(), ProgressDonut(), ReportSection(), ScurveChart() (+14 more)

### Community 7 - "authStore.ts"
Cohesion: 0.13
Nodes (14): metadata, PaintControlLayout(), EditAuthModal(), EditModeButton(), PaintControlShell(), NAV_ITEMS, NavItem(), NavItemData (+6 more)

### Community 8 - "app/layout.tsx"
Cohesion: 0.15
Nodes (15): inter, jbmono, metadata, RootLayout(), handleClick(), MetaPixel(), trackWhatsAppSupportClick(), WhatsAppSupport() (+7 more)

### Community 9 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "CostSection.tsx"
Cohesion: 0.23
Nodes (11): CostFormPanel(), handleSubmit(), emptyForm(), Field(), FormState, formToPayload(), itemToForm(), Section() (+3 more)

### Community 11 - "excelExport.ts"
Cohesion: 0.28
Nodes (12): handleExport(), handleExport(), handleExport(), buildAndDownloadReport(), COMBINING_DIACRITICS, exportActivityToExcel(), exportCostItemToExcel(), exportRevitalizationToExcel() (+4 more)

### Community 12 - "EquipmentArt.tsx"
Cohesion: 0.36
Nodes (10): AirCoolerArt(), EquipmentArt(), FlotadorArt(), FornoArt(), Frame(), MotorCompressorArt(), Props, TanqueArt() (+2 more)

### Community 13 - "ResponsibleFormModal.tsx"
Cohesion: 0.40
Nodes (3): emptyForm(), FormState, ResponsibleFormModal()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `lucide-react` to `calculations.ts`, `[activityId]/page.tsx`, `package.json`, `ActivityFormPanel.tsx`, `ExecutiveReport.tsx`, `authStore.ts`, `app/layout.tsx`, `CostSection.tsx`, `ResponsibleFormModal.tsx`?**
  _High betweenness centrality (0.246) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.08050655811849841 - nodes in this community are weakly interconnected._
- **Why does `react` connect `calculations.ts` to `lucide-react`, `[activityId]/page.tsx`, `package.json`, `ActivityFormPanel.tsx`, `ExecutiveReport.tsx`, `authStore.ts`, `app/layout.tsx`, `CostSection.tsx`, `EquipmentArt.tsx`, `ResponsibleFormModal.tsx`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Should `calculations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09423076923076923 - nodes in this community are weakly interconnected._
- **Why does `next` connect `[activityId]/page.tsx` to `calculations.ts`, `package.json`, `authStore.ts`, `app/layout.tsx`, `EquipmentArt.tsx`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07589285714285714 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06025369978858351 - nodes in this community are weakly interconnected._