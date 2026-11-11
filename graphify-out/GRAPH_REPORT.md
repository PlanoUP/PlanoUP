# Graph Report - relatorio-executivo-revisao-visual  (2026-11-11)

## Corpus Check
- 257 files · ~90,922 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 1224 nodes · 4222 edges · 37 communities (34 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b26b551b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useBravaData
- lucide-react
- reports/page.tsx
- tanksRepo.ts
- EquipmentMapExplorer.tsx
- AssetMapExplorer.tsx
- equipamentos/[tag]/page.tsx
- SectionHeading
- brava/layout.tsx
- package.json
- units/context.tsx
- units/materials/calculations.ts
- cn
- MapTourPanel.tsx
- isRequestEditor
- client.ts
- brava/types.ts
- EquipmentMaterialFormDrawer.tsx
- next
- cn.ts
- editAuth.ts
- getSql
- ensureSchema
- TankCard.tsx
- equipmentMaterialsRepo.ts
- EquipmentMaterialsSection.tsx
- compilerOptions
- schema.ts
- mapCalloutOffsetsRepo.ts
- FeaturedTankCard.tsx
- mapCoordinatesRepo.ts
- CampoTankPage
- Fotos do painel/dashboard do mapa — Tank Control
- Vídeos de manutenção — Tank Control
- icon.tsx
- next.config.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 132 edges
2. `lucide-react` - 89 edges
3. `next` - 77 edges
4. `formatShort()` - 67 edges
5. `useBravaData()` - 61 edges
6. `getSql()` - 60 edges
7. `isRequestEditor()` - 54 edges
8. `react` - 53 edges
9. `SectionHeading()` - 51 edges
10. `ensureSchema()` - 49 edges

## Surprising Connections (you probably didn't know these)
- `handleCloseWeek()` --calls--> `formatShort()`  [EXTRACTED]
  src/app/brava/reports/page.tsx → src/lib/brava/date-utils.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/materials/calculations.ts → src/lib/brava/date-utils.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/units/materials/calculations.ts → src/lib/brava/date-utils.ts
- `MaterialRiskResult` --references--> `MaterialRiskLevel`  [EXTRACTED]
  src/lib/brava/units/materials/calculations.ts → src/lib/brava/materials/types.ts
- `POST()` --calls--> `verifyEditPassword()`  [EXTRACTED]
  src/app/api/auth/login/route.ts → src/lib/auth/editAuth.ts

## Import Cycles
- None detected.

## Communities (37 total, 3 thin omitted)

### Community 0 - "useBravaData"
Cohesion: 0.05
Nodes (95): react, TAB_KEYS, TabKey, TABS, TankDetailPage(), MateriaisTab(), GanttChart(), Legend() (+87 more)

### Community 1 - "lucide-react"
Cohesion: 0.05
Nodes (69): lucide-react, inter, jbmono, metadata, RootLayout(), Home(), applications, Applications() (+61 more)

### Community 2 - "reports/page.tsx"
Cohesion: 0.06
Nodes (67): ExecutiveReportsPage(), mostRecentMonday(), reportId(), ReportsPageContent(), handleChangeAvancos(), handleChangeCriticalPoints(), handleChangeDecisoes(), handleChangeRiscos() (+59 more)

### Community 3 - "tanksRepo.ts"
Cohesion: 0.05
Nodes (71): INSPECTION_INVENTORY, InspectionInventoryItem, ActiveParams, buildActive(), buildConcluded(), buildFromSchedule(), buildNoProject(), buildScheduled() (+63 more)

### Community 4 - "EquipmentMapExplorer.tsx"
Cohesion: 0.06
Nodes (57): MapaContent(), UnidadesMapaPage(), EquipmentMapAreaSelector(), EquipmentListEntry, EquipmentMapAssetListPanel(), EquipmentMapCalibrationPanel(), EquipmentMapExplorer(), jumpTo() (+49 more)

### Community 5 - "AssetMapExplorer.tsx"
Cohesion: 0.06
Nodes (52): MapaContent(), MapaPage(), AssetMapExplorer(), jumpTo(), MAINTENANCE_STATUSES, FullscreenControlBar(), FullscreenSummary, KpiChip() (+44 more)

### Community 6 - "equipamentos/[tag]/page.tsx"
Cohesion: 0.10
Nodes (42): ConsolidadoContent(), ConsolidatedPage(), TabKey, TABS, MAINTENANCE_STATUSES, UnidadesCustosPage(), EquipmentDetailPage(), TAB_KEYS (+34 more)

### Community 7 - "SectionHeading"
Cohesion: 0.10
Nodes (32): BravaOverviewPage(), UnidadesConsolidatedPage(), AttentionPanel(), KIND_META, CronogramaTab(), ConsolidatedGantt(), LegendDot(), FILTER_OPTIONS (+24 more)

### Community 8 - "brava/layout.tsx"
Cohesion: 0.08
Nodes (34): BravaLayout(), manrope, metadata, DataStatusGate(), EditPasswordModal(), MobileTopBar(), TANQUES_NAV_ITEMS, UNIDADES_NAV_ITEMS (+26 more)

### Community 9 - "package.json"
Cohesion: 0.07
Nodes (36): dependencies, framer-motion@^11.11.17, lucide-react@^0.454.0, @neondatabase/serverless@^1.1.0, next@14.2.35, react@^18.3.1, react-dom@^18.3.1, recharts@^2.15.0 (+28 more)

### Community 10 - "units/context.tsx"
Cohesion: 0.12
Nodes (27): UnidadesOverviewPage(), EquipmentControlGrid(), EquipmentFilterBar(), FILTER_OPTIONS, EquipmentKpiRow(), EquipmentProgramOverviewMini(), OPTIONS, UnitFilterBar() (+19 more)

### Community 11 - "units/materials/calculations.ts"
Cohesion: 0.13
Nodes (23): EquipmentMaterialsPage(), EquipmentMaterialsAtRisk(), EquipmentMaterialsFilterBar(), FILTER_OPTIONS, SORT_OPTIONS, UpcomingEquipmentMaterialNeeds(), MaterialAttachment, MaterialHistoryEntry (+15 more)

### Community 12 - "cn"
Cohesion: 0.14
Nodes (20): DeadlinesPanel(), ExecutiveTimeline(), Legend(), Node(), ReportHistoryPanel(), TANQUES_NAV_ITEMS, UNIDADES_NAV_ITEMS, EquipmentExecutiveTimeline() (+12 more)

### Community 13 - "MapTourPanel.tsx"
Cohesion: 0.12
Nodes (15): MapHotspot(), toSvgGeometry(), CarouselButton(), MapTourPanel(), MediaState, PhotoGalleryStrip(), videoSrcForTag(), isMapActive() (+7 more)

### Community 14 - "isRequestEditor"
Cohesion: 0.14
Nodes (20): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), dynamic, PATCH() (+12 more)

### Community 15 - "client.ts"
Cohesion: 0.17
Nodes (17): dynamic, GET(), dynamic, POST(), dynamic, GET(), dynamic, GET() (+9 more)

### Community 16 - "brava/types.ts"
Cohesion: 0.14
Nodes (18): FamilyFilterBar(), OPTIONS, InspectionSummary(), AssetListEntry, Group, compareInspectionPriority(), computeInspectionSummary(), FAMILY_LABELS (+10 more)

### Community 17 - "EquipmentMaterialFormDrawer.tsx"
Cohesion: 0.15
Nodes (17): EquipmentHistorySection(), TimelineEntry, EMPTY_FORM, EquipmentMaterialFormDrawer(), Field(), FormState, materialToForm(), EquipmentMaterialsHomeSummary() (+9 more)

### Community 18 - "next"
Cohesion: 0.14
Nodes (15): next, dynamic, PATCH(), dynamic, PATCH(), dynamic, GET(), ActivityEdit (+7 more)

### Community 19 - "cn.ts"
Cohesion: 0.21
Nodes (13): CampoPage(), DEFAULT_HIDDEN_STATUSES, QUICK_PROGRESS_VALUES, ProgressBar(), StatusBadge(), EquipmentCard(), Stat(), EquipmentStatusBadge() (+5 more)

### Community 20 - "editAuth.ts"
Cohesion: 0.21
Nodes (14): dynamic, POST(), dynamic, dynamic, POST(), EDIT_COOKIE_NAME, EDIT_PASSWORD_KEY, getEditPasswordHash() (+6 more)

### Community 21 - "getSql"
Cohesion: 0.20
Nodes (18): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), getSql(), createCost() (+10 more)

### Community 22 - "ensureSchema"
Cohesion: 0.20
Nodes (17): dynamic, POST(), DELETE(), dynamic, PATCH(), dynamic, GET(), POST() (+9 more)

### Community 23 - "TankCard.tsx"
Cohesion: 0.26
Nodes (15): ExecutiveHeader(), Field(), StatBlock(), STATUS_HEADLINE, InspectionCriticalityBadge(), InspectionTooltip(), Field(), MapAssetDrawer() (+7 more)

### Community 24 - "equipmentMaterialsRepo.ts"
Cohesion: 0.19
Nodes (16): dynamic, POST(), DELETE(), dynamic, PATCH(), dynamic, GET(), POST() (+8 more)

### Community 25 - "EquipmentMaterialsSection.tsx"
Cohesion: 0.19
Nodes (13): EquipmentMapAssetDrawer(), Field(), ATTACHMENT_LABELS, EquipmentMaterialDetailDrawer(), Grid(), Item(), Section(), EquipmentMaterialsSection() (+5 more)

### Community 26 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 27 - "schema.ts"
Cohesion: 0.20
Nodes (11): DELETE(), dynamic, dynamic, GET(), POST(), deleteEquipmentMapCoordinate(), listEquipmentMapCoordinates(), makeId() (+3 more)

### Community 28 - "mapCalloutOffsetsRepo.ts"
Cohesion: 0.26
Nodes (10): DELETE(), dynamic, dynamic, GET(), POST(), backfillLegacyRefSize(), deleteMapCalloutOffset(), listMapCalloutOffsets() (+2 more)

### Community 29 - "FeaturedTankCard.tsx"
Cohesion: 0.28
Nodes (9): BlueprintGrid(), FeaturedTankCard(), Field(), ProgressRing(), EquipmentExecutiveHeader(), Field(), StatBlock(), STATUS_HEADLINE (+1 more)

### Community 30 - "mapCoordinatesRepo.ts"
Cohesion: 0.27
Nodes (9): DELETE(), dynamic, dynamic, GET(), POST(), deleteMapCoordinate(), listMapCoordinates(), makeId() (+1 more)

### Community 31 - "CampoTankPage"
Cohesion: 0.60
Nodes (6): CampoTankPage(), flashSaved(), handleComplete(), handleEdit(), handleProgress(), handleStart()

### Community 32 - "Fotos do painel/dashboard do mapa — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização, Formato, Fotos do painel/dashboard do mapa — Tank Control

### Community 33 - "Vídeos de manutenção — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização semanal, Formato, Vídeos de manutenção — Tank Control

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `useBravaData`, `lucide-react`, `EquipmentMapExplorer.tsx`, `AssetMapExplorer.tsx`, `equipamentos/[tag]/page.tsx`, `SectionHeading`, `brava/layout.tsx`, `package.json`, `units/context.tsx`, `units/materials/calculations.ts`, `cn`, `MapTourPanel.tsx`, `isRequestEditor`, `client.ts`, `brava/types.ts`, `EquipmentMaterialFormDrawer.tsx`, `cn.ts`, `editAuth.ts`, `getSql`, `ensureSchema`, `TankCard.tsx`, `equipmentMaterialsRepo.ts`, `EquipmentMaterialsSection.tsx`, `schema.ts`, `mapCalloutOffsetsRepo.ts`, `FeaturedTankCard.tsx`, `mapCoordinatesRepo.ts`, `icon.tsx`?**
  _High betweenness centrality (0.225) - this node is a cross-community bridge._
- **Should `useBravaData` be split into smaller, more focused modules?**
  _Cohesion score 0.050387596899224806 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `useBravaData`, `reports/page.tsx`, `EquipmentMapExplorer.tsx`, `AssetMapExplorer.tsx`, `equipamentos/[tag]/page.tsx`, `SectionHeading`, `brava/layout.tsx`, `package.json`, `units/context.tsx`, `units/materials/calculations.ts`, `cn`, `MapTourPanel.tsx`, `brava/types.ts`, `EquipmentMaterialFormDrawer.tsx`, `cn.ts`, `TankCard.tsx`, `EquipmentMaterialsSection.tsx`, `FeaturedTankCard.tsx`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.050087361677344205 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `useBravaData`, `reports/page.tsx`, `EquipmentMapExplorer.tsx`, `AssetMapExplorer.tsx`, `equipamentos/[tag]/page.tsx`, `SectionHeading`, `brava/layout.tsx`, `units/context.tsx`, `units/materials/calculations.ts`, `MapTourPanel.tsx`, `brava/types.ts`, `EquipmentMaterialFormDrawer.tsx`, `cn.ts`, `TankCard.tsx`, `EquipmentMaterialsSection.tsx`, `FeaturedTankCard.tsx`, `CampoTankPage`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `reports/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05512016718913271 - nodes in this community are weakly interconnected._
- **Should `tanksRepo.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053164556962025315 - nodes in this community are weakly interconnected._