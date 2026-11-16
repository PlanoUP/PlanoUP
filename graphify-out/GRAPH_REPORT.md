# Graph Report - PlanoUP  (2026-11-16)

## Corpus Check
- 291 files · ~100,595 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 1371 nodes · 4726 edges · 39 communities (34 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ad4797b5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useBravaData
- lucide-react
- units/materials/calculations.ts
- reports/page.tsx
- react
- brava/layout.tsx
- AssetMapExplorer.tsx
- tanksRepo.ts
- package.json
- EquipmentMapExplorer.tsx
- inspection.ts
- MapTourPanel.tsx
- next
- client.ts
- isRequestEditor
- costsRepo.ts
- cn
- date-utils.ts
- materialsRepo.ts
- fieldUsersRepo.ts
- formatShort
- compilerOptions
- equipmentRepo.ts
- getSql
- equipmentCostsRepo.ts
- campo/[tag]/page.tsx
- equipmentMapCoordinatesRepo.ts
- mapCoordinatesRepo.ts
- next
- brava/context.tsx
- Fotos do painel/dashboard do mapa — Tank Control
- Vídeos de manutenção — Tank Control
- next.config.mjs
- campo/page.tsx
- cn
- icon.tsx
- CLAUDE.md
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 143 edges
2. `lucide-react` - 100 edges
3. `next` - 89 edges
4. `formatShort()` - 81 edges
5. `getSql()` - 76 edges
6. `isRequestEditor()` - 69 edges
7. `useBravaData()` - 65 edges
8. `react` - 64 edges
9. `ensureSchema()` - 64 edges
10. `SectionHeading()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `handleCloseWeek()` --calls--> `formatShort()`  [EXTRACTED]
  src/app/brava/reports/page.tsx → src/lib/brava/date-utils.ts
- `ActiveParams` --references--> `TankStatus`  [EXTRACTED]
  src/lib/brava/data/tanks.ts → src/lib/brava/types.ts
- `FromScheduleParams` --references--> `TankStatus`  [EXTRACTED]
  src/lib/brava/data/tanks.ts → src/lib/brava/types.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/materials/calculations.ts → src/lib/brava/date-utils.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/units/materials/calculations.ts → src/lib/brava/date-utils.ts

## Import Cycles
- None detected.

## Communities (39 total, 5 thin omitted)

### Community 0 - "useBravaData"
Cohesion: 0.06
Nodes (80): TAB_KEYS, TabKey, TABS, TankDetailPage(), MateriaisTab(), GanttChart(), Legend(), MaterialCriticalityBadge() (+72 more)

### Community 1 - "lucide-react"
Cohesion: 0.05
Nodes (70): lucide-react, react, inter, jbmono, metadata, RootLayout(), Home(), applications (+62 more)

### Community 2 - "units/materials/calculations.ts"
Cohesion: 0.07
Nodes (64): EquipmentDetailPage(), TAB_KEYS, TabKey, TABS, EquipmentMaterialsPage(), EquipmentNotes(), EquipmentPlanningEditor(), EquipmentMapAssetDrawer() (+56 more)

### Community 3 - "reports/page.tsx"
Cohesion: 0.06
Nodes (55): ExecutiveReportsPage(), mostRecentMonday(), reportId(), ReportsPageContent(), handleChangeAvancos(), handleChangeCriticalPoints(), handleChangeDecisoes(), handleChangeRiscos() (+47 more)

### Community 4 - "react"
Cohesion: 0.07
Nodes (56): ConsolidadoContent(), ConsolidatedPage(), TabKey, TABS, MAINTENANCE_STATUSES, UnidadesCustosPage(), MapaContent(), UnidadesMapaPage() (+48 more)

### Community 5 - "brava/layout.tsx"
Cohesion: 0.06
Nodes (43): BravaLayout(), manrope, metadata, ActionPlanBanner(), timeAgo(), DataStatusGate(), EditPasswordModal(), MobileTopBar() (+35 more)

### Community 6 - "AssetMapExplorer.tsx"
Cohesion: 0.07
Nodes (45): MapaContent(), MapaPage(), AssetMapExplorer(), jumpTo(), MAINTENANCE_STATUSES, FullscreenControlBar(), FullscreenSummary, KpiChip() (+37 more)

### Community 7 - "tanksRepo.ts"
Cohesion: 0.06
Nodes (61): @react-pdf/renderer@^3.4.4, @react-pdf/renderer, dynamic, GET(), POST(), dynamic, GET(), dynamic (+53 more)

### Community 8 - "package.json"
Cohesion: 0.07
Nodes (38): dependencies, framer-motion@^11.11.17, lucide-react@^0.454.0, @neondatabase/serverless@^1.1.0, next@14.2.35, react@^18.3.1, react-dom@^18.3.1, recharts@^2.15.0 (+30 more)

### Community 9 - "EquipmentMapExplorer.tsx"
Cohesion: 0.07
Nodes (46): EquipmentMapAreaSelector(), EquipmentMapAssetListPanel(), EquipmentMapCalibrationPanel(), EquipmentMapExplorer(), jumpTo(), MAINTENANCE_STATUSES, BASE_FILTERS, EquipmentMapFilterBar() (+38 more)

### Community 10 - "inspection.ts"
Cohesion: 0.06
Nodes (52): AttentionPanel(), KIND_META, KpiRow(), Group, INSPECTION_INVENTORY, InspectionInventoryItem, ActiveParams, buildActive() (+44 more)

### Community 11 - "MapTourPanel.tsx"
Cohesion: 0.12
Nodes (15): MapHotspot(), toSvgGeometry(), CarouselButton(), MapTourPanel(), MediaState, PhotoGalleryStrip(), videoSrcForTag(), isMapActive() (+7 more)

### Community 12 - "next"
Cohesion: 0.26
Nodes (12): dynamic, POST(), dynamic, dynamic, POST(), EDIT_COOKIE_NAME, EDIT_PASSWORD_KEY, getEditPasswordHash() (+4 more)

### Community 13 - "client.ts"
Cohesion: 0.18
Nodes (16): dynamic, GET(), dynamic, POST(), dynamic, GET(), dynamic, GET() (+8 more)

### Community 14 - "isRequestEditor"
Cohesion: 0.19
Nodes (16): dynamic, POST(), DELETE(), dynamic, PATCH(), dynamic, GET(), POST() (+8 more)

### Community 15 - "costsRepo.ts"
Cohesion: 0.18
Nodes (17): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), SEED_COST_ENTRIES, createCost() (+9 more)

### Community 16 - "cn"
Cohesion: 0.05
Nodes (68): BravaOverviewPage(), UnidadesConsolidatedPage(), UnidadesOverviewPage(), ConsolidatedGantt(), LegendDot(), FilterBar(), InspectionSummary(), ProgramOverviewMini() (+60 more)

### Community 17 - "date-utils.ts"
Cohesion: 0.25
Nodes (3): TANQUES_NAV_ITEMS, UNIDADES_NAV_ITEMS, MONTHS_PT

### Community 18 - "materialsRepo.ts"
Cohesion: 0.22
Nodes (18): dynamic, POST(), DELETE(), dynamic, PATCH(), dynamic, GET(), POST() (+10 more)

### Community 19 - "fieldUsersRepo.ts"
Cohesion: 0.23
Nodes (17): dynamic, PATCH(), dynamic, GET(), POST(), toPublicFieldUser(), createFieldUser(), genId() (+9 more)

### Community 20 - "formatShort"
Cohesion: 0.17
Nodes (25): BlueprintGrid(), ExecutiveHeader(), Field(), StatBlock(), STATUS_HEADLINE, FeaturedTankCard(), Field(), BENEFITS (+17 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 22 - "equipmentRepo.ts"
Cohesion: 0.18
Nodes (14): dynamic, PATCH(), dynamic, PATCH(), dynamic, GET(), ActivityEdit, ensureSeeded() (+6 more)

### Community 23 - "getSql"
Cohesion: 0.18
Nodes (16): DELETE(), dynamic, dynamic, GET(), POST(), getSql(), backfillLegacyRefSize(), deleteMapCalloutOffset() (+8 more)

### Community 25 - "equipmentCostsRepo.ts"
Cohesion: 0.23
Nodes (13): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), createEquipmentCost(), deleteEquipmentCost() (+5 more)

### Community 29 - "campo/[tag]/page.tsx"
Cohesion: 0.13
Nodes (19): CampoTankPage(), flashSaved(), handleComplete(), handleEdit(), handleProgress(), handleStart(), QUICK_PROGRESS_VALUES, ActionPlanTrigger() (+11 more)

### Community 31 - "equipmentMapCoordinatesRepo.ts"
Cohesion: 0.27
Nodes (9): DELETE(), dynamic, dynamic, GET(), POST(), deleteEquipmentMapCoordinate(), listEquipmentMapCoordinates(), makeId() (+1 more)

### Community 32 - "mapCoordinatesRepo.ts"
Cohesion: 0.27
Nodes (9): DELETE(), dynamic, dynamic, GET(), POST(), deleteMapCoordinate(), listMapCoordinates(), makeId() (+1 more)

### Community 36 - "next"
Cohesion: 0.07
Nodes (35): next, dynamic, PATCH(), dynamic, GET(), POST(), dynamic, POST() (+27 more)

### Community 38 - "brava/context.tsx"
Cohesion: 0.13
Nodes (21): FamilyFilterBar(), OPTIONS, AssetListEntry, ACTIVITY_STATUS_COLOR, ACTIVITY_STATUS_LABEL, ActivityStatusTag(), PlanningEditor(), flashSaved() (+13 more)

### Community 41 - "Fotos do painel/dashboard do mapa — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização, Formato, Fotos do painel/dashboard do mapa — Tank Control

### Community 42 - "Vídeos de manutenção — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização semanal, Formato, Vídeos de manutenção — Tank Control

### Community 47 - "campo/page.tsx"
Cohesion: 0.24
Nodes (9): CampoPage(), DEFAULT_HIDDEN_STATUSES, FieldLoginCard(), ProgressBar(), FieldAuthContext, FieldAuthContextValue, FieldUserPublic, useFieldAuth() (+1 more)

### Community 50 - "cn"
Cohesion: 0.15
Nodes (20): FieldUserPublic, TagMultiSelect(), DeadlinesPanel(), ExecutiveTimeline(), Legend(), Node(), FILTER_OPTIONS, ReportHistoryPanel() (+12 more)

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `useBravaData`, `lucide-react`, `units/materials/calculations.ts`, `react`, `brava/layout.tsx`, `AssetMapExplorer.tsx`, `tanksRepo.ts`, `package.json`, `EquipmentMapExplorer.tsx`, `inspection.ts`, `MapTourPanel.tsx`, `next`, `client.ts`, `isRequestEditor`, `costsRepo.ts`, `cn`, `date-utils.ts`, `materialsRepo.ts`, `fieldUsersRepo.ts`, `formatShort`, `equipmentRepo.ts`, `getSql`, `equipmentCostsRepo.ts`, `campo/[tag]/page.tsx`, `equipmentMapCoordinatesRepo.ts`, `mapCoordinatesRepo.ts`, `campo/page.tsx`, `cn`, `icon.tsx`?**
  _High betweenness centrality (0.245) - this node is a cross-community bridge._
- **Should `useBravaData` be split into smaller, more focused modules?**
  _Cohesion score 0.059123343527013254 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `useBravaData`, `units/materials/calculations.ts`, `reports/page.tsx`, `react`, `brava/layout.tsx`, `AssetMapExplorer.tsx`, `tanksRepo.ts`, `package.json`, `brava/context.tsx`, `inspection.ts`, `MapTourPanel.tsx`, `EquipmentMapExplorer.tsx`, `campo/page.tsx`, `cn`, `date-utils.ts`, `cn`, `formatShort`, `campo/[tag]/page.tsx`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.05025699600228441 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `useBravaData`, `units/materials/calculations.ts`, `reports/page.tsx`, `react`, `brava/layout.tsx`, `brava/context.tsx`, `AssetMapExplorer.tsx`, `EquipmentMapExplorer.tsx`, `inspection.ts`, `MapTourPanel.tsx`, `campo/page.tsx`, `cn`, `date-utils.ts`, `formatShort`, `campo/[tag]/page.tsx`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Should `units/materials/calculations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06617826617826618 - nodes in this community are weakly interconnected._
- **Should `reports/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05985915492957746 - nodes in this community are weakly interconnected._