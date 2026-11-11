# Graph Report - brava-manutencoes-painel-j9ckvc  (2026-11-11)

## Corpus Check
- 253 files · ~89,451 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 1209 nodes · 4169 edges · 46 communities (43 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0f2a0c34`
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
- TankCard.tsx
- MapTourPanel.tsx
- next
- client.ts
- isRequestEditor
- costsRepo.ts
- cn
- formatShort
- materialsRepo.ts
- units/selectors.ts
- units/types.ts
- compilerOptions
- equipmentRepo.ts
- getSql
- tanks.ts
- equipmentCostsRepo.ts
- MapZoomPan.tsx
- ConsolidatedGantt.tsx
- home-selectors.ts
- brava/types.ts
- EquipmentConsolidatedGantt.tsx
- equipmentMapCoordinatesRepo.ts
- mapCoordinatesRepo.ts
- date-utils.ts
- status-meta.ts
- EquipmentMapHotspot.tsx
- diffDays
- addDays
- PlanningEditor.tsx
- EquipmentControlGrid.tsx
- CampoTankPage
- Fotos do painel/dashboard do mapa — Tank Control
- Vídeos de manutenção — Tank Control
- next.config.mjs
- brava/mapa/page.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 132 edges
2. `lucide-react` - 90 edges
3. `next` - 77 edges
4. `formatShort()` - 69 edges
5. `useBravaData()` - 61 edges
6. `getSql()` - 60 edges
7. `isRequestEditor()` - 54 edges
8. `react` - 53 edges
9. `SectionHeading()` - 51 edges
10. `ensureSchema()` - 49 edges

## Surprising Connections (you probably didn't know these)
- `handleCloseWeek()` --calls--> `formatShort()`  [EXTRACTED]
  src/app/brava/reports/page.tsx → src/lib/brava/date-utils.ts
- `computeUpcomingMilestones()` --calls--> `diffDays()`  [EXTRACTED]
  src/lib/brava/home-selectors.ts → src/lib/brava/date-utils.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/materials/calculations.ts → src/lib/brava/date-utils.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/units/materials/calculations.ts → src/lib/brava/date-utils.ts
- `MaterialRiskResult` --references--> `MaterialRiskLevel`  [EXTRACTED]
  src/lib/brava/units/materials/calculations.ts → src/lib/brava/materials/types.ts

## Import Cycles
- None detected.

## Communities (46 total, 3 thin omitted)

### Community 0 - "useBravaData"
Cohesion: 0.05
Nodes (89): TAB_KEYS, TabKey, TABS, TankDetailPage(), MateriaisTab(), FamilyFilterBar(), OPTIONS, GanttChart() (+81 more)

### Community 1 - "lucide-react"
Cohesion: 0.05
Nodes (69): lucide-react, inter, jbmono, metadata, RootLayout(), Home(), applications, Applications() (+61 more)

### Community 2 - "units/materials/calculations.ts"
Cohesion: 0.06
Nodes (69): EquipmentDetailPage(), TAB_KEYS, TabKey, TABS, EquipmentMaterialsPage(), EquipmentNotes(), ActivityStatusTag(), EquipmentPlanningEditor() (+61 more)

### Community 3 - "reports/page.tsx"
Cohesion: 0.06
Nodes (57): ExecutiveReportsPage(), mostRecentMonday(), reportId(), ReportsPageContent(), handleChangeAvancos(), handleChangeCriticalPoints(), handleChangeDecisoes(), handleChangeRiscos() (+49 more)

### Community 4 - "react"
Cohesion: 0.08
Nodes (47): react, ConsolidadoContent(), ConsolidatedPage(), TabKey, TABS, UnidadesConsolidatedPage(), MAINTENANCE_STATUSES, UnidadesCustosPage() (+39 more)

### Community 5 - "brava/layout.tsx"
Cohesion: 0.07
Nodes (41): BravaLayout(), manrope, metadata, DataStatusGate(), EditPasswordModal(), MobileTopBar(), TANQUES_NAV_ITEMS, UNIDADES_NAV_ITEMS (+33 more)

### Community 6 - "AssetMapExplorer.tsx"
Cohesion: 0.11
Nodes (32): AssetMapExplorer(), jumpTo(), MAINTENANCE_STATUSES, MapAreaSelector(), MapAssetListPanel(), MapCalibrationPanel(), BASE_FILTERS, MapFilterBar() (+24 more)

### Community 7 - "tanksRepo.ts"
Cohesion: 0.11
Nodes (33): dynamic, PATCH(), dynamic, POST(), dynamic, PATCH(), todayISO(), applyExecutionState() (+25 more)

### Community 8 - "package.json"
Cohesion: 0.07
Nodes (36): dependencies, framer-motion@^11.11.17, lucide-react@^0.454.0, @neondatabase/serverless@^1.1.0, next@14.2.35, react@^18.3.1, react-dom@^18.3.1, recharts@^2.15.0 (+28 more)

### Community 9 - "EquipmentMapExplorer.tsx"
Cohesion: 0.14
Nodes (27): EquipmentMapAreaSelector(), EquipmentMapCalibrationPanel(), EquipmentMapExplorer(), jumpTo(), MAINTENANCE_STATUSES, BASE_FILTERS, EquipmentMapFilterBar(), EquipmentMapSummaryCard() (+19 more)

### Community 10 - "TankCard.tsx"
Cohesion: 0.17
Nodes (21): BlueprintGrid(), ExecutiveHeader(), Field(), StatBlock(), STATUS_HEADLINE, FeaturedTankCard(), Field(), BENEFITS (+13 more)

### Community 11 - "MapTourPanel.tsx"
Cohesion: 0.12
Nodes (15): MapHotspot(), toSvgGeometry(), CarouselButton(), MapTourPanel(), MediaState, PhotoGalleryStrip(), videoSrcForTag(), isMapActive() (+7 more)

### Community 12 - "next"
Cohesion: 0.14
Nodes (15): next, dynamic, POST(), dynamic, dynamic, POST(), contentType, size (+7 more)

### Community 13 - "client.ts"
Cohesion: 0.15
Nodes (19): dynamic, GET(), dynamic, GET(), dynamic, POST(), dynamic, GET() (+11 more)

### Community 14 - "isRequestEditor"
Cohesion: 0.22
Nodes (18): dynamic, POST(), DELETE(), dynamic, PATCH(), dynamic, GET(), POST() (+10 more)

### Community 15 - "costsRepo.ts"
Cohesion: 0.18
Nodes (17): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), SEED_COST_ENTRIES, createCost() (+9 more)

### Community 16 - "cn"
Cohesion: 0.27
Nodes (13): CampoPage(), DEFAULT_HIDDEN_STATUSES, QUICK_PROGRESS_VALUES, ProgressBar(), StatusBadge(), EquipmentCard(), Stat(), EquipmentExecutiveHeader() (+5 more)

### Community 17 - "formatShort"
Cohesion: 0.20
Nodes (15): DeadlinesPanel(), ExecutiveTimeline(), Legend(), Node(), InspectionSummary(), UpcomingMaterialNeeds(), SectionHeading(), EquipmentExecutiveTimeline() (+7 more)

### Community 18 - "materialsRepo.ts"
Cohesion: 0.19
Nodes (16): dynamic, POST(), DELETE(), dynamic, PATCH(), dynamic, GET(), POST() (+8 more)

### Community 19 - "units/selectors.ts"
Cohesion: 0.17
Nodes (14): UnidadesOverviewPage(), EquipmentKpiRow(), EquipmentProgramOverviewMini(), UnitSummaryCards(), overallDeviationDays(), weightedProgress(), computeFleetKpis(), computeUnitSummaries() (+6 more)

### Community 20 - "units/types.ts"
Cohesion: 0.16
Nodes (15): EquipmentListEntry, EquipmentMapAssetListPanel(), UnitsContextValue, EQUIPMENT_SEED, item(), slug(), U260_TAGS, U270_TAGS (+7 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 22 - "equipmentRepo.ts"
Cohesion: 0.18
Nodes (14): dynamic, PATCH(), dynamic, PATCH(), dynamic, GET(), ActivityEdit, ensureSeeded() (+6 more)

### Community 23 - "getSql"
Cohesion: 0.19
Nodes (14): DELETE(), dynamic, POST(), getSql(), backfillLegacyRefSize(), deleteMapCalloutOffset(), listMapCalloutOffsets(), makeId() (+6 more)

### Community 24 - "tanks.ts"
Cohesion: 0.20
Nodes (16): ActiveParams, buildActive(), buildConcluded(), buildFromSchedule(), buildNoProject(), buildScheduled(), ConcludedParams, FromScheduleParams (+8 more)

### Community 25 - "equipmentCostsRepo.ts"
Cohesion: 0.23
Nodes (13): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), createEquipmentCost(), deleteEquipmentCost() (+5 more)

### Community 26 - "MapZoomPan.tsx"
Cohesion: 0.25
Nodes (10): FullscreenControlBar(), FullscreenSummary, KpiChip(), HudCorners(), LiveClock(), formatToday(), LiveDate(), MapZoomPan (+2 more)

### Community 27 - "ConsolidatedGantt.tsx"
Cohesion: 0.26
Nodes (10): BravaOverviewPage(), ConsolidatedGantt(), LegendDot(), FilterBar(), KpiRow(), STATUS_SORT_ORDER, TANK_CONTROL_STATUS_OPTIONS, TankControlGrid() (+2 more)

### Community 28 - "home-selectors.ts"
Cohesion: 0.19
Nodes (11): AttentionPanel(), KIND_META, INSPECTION_INVENTORY, InspectionInventoryItem, AttentionItem, AttentionKind, computeAttentionItems(), computeUpcomingMilestones() (+3 more)

### Community 29 - "brava/types.ts"
Cohesion: 0.23
Nodes (11): AssetListEntry, Group, compareInspectionPriority(), INSPECTION_CRITICALITY_META, InspectionCriticalityMeta, InspectionFleetAsset, InspectionPriorityLike, InspectionSummaryCounts (+3 more)

### Community 30 - "EquipmentConsolidatedGantt.tsx"
Cohesion: 0.33
Nodes (9): ProgramOverviewMini(), EquipmentConsolidatedGantt(), LegendDot(), EquipmentGanttChart(), Legend(), buildTimeScale(), MonthTick, monthTicks() (+1 more)

### Community 31 - "equipmentMapCoordinatesRepo.ts"
Cohesion: 0.27
Nodes (9): DELETE(), dynamic, dynamic, GET(), POST(), deleteEquipmentMapCoordinate(), listEquipmentMapCoordinates(), makeId() (+1 more)

### Community 32 - "mapCoordinatesRepo.ts"
Cohesion: 0.27
Nodes (9): DELETE(), dynamic, dynamic, GET(), POST(), deleteMapCoordinate(), listMapCoordinates(), makeId() (+1 more)

### Community 33 - "date-utils.ts"
Cohesion: 0.24
Nodes (6): CronogramaTab(), UpcomingInspectionsTimeline(), formatMonthYear(), MONTHS_PT, parseISO(), toISO()

### Community 34 - "status-meta.ts"
Cohesion: 0.23
Nodes (8): FILTER_OPTIONS, STATUS_OPTIONS, EquipmentMapLegend(), ORDER, STATUS_META, STATUS_ORDER, StatusMeta, EquipmentStatus

### Community 35 - "EquipmentMapHotspot.tsx"
Cohesion: 0.26
Nodes (10): EquipmentMapHotspot(), STATUS_ACCENT_BORDER, STATUS_LINE_CLASS, toSvgGeometry(), CalloutOffset, CalloutPoint, clamp(), computeCalloutLayout() (+2 more)

### Community 36 - "diffDays"
Cohesion: 0.33
Nodes (11): diffDays(), buildInspectionFleet(), getDaysToInspection(), getInspectionCriticality(), getTankFamily(), overallDeviationDays(), weightedProgress(), deriveTank() (+3 more)

### Community 37 - "addDays"
Cohesion: 0.33
Nodes (8): addDays(), applyExecutionState(), buildActivitiesFromTemplate(), markFullyConcluded(), recalculateSchedule(), STAGE_TEMPLATE, StageDef, STANDARD_SHUTDOWN_DAYS

### Community 38 - "PlanningEditor.tsx"
Cohesion: 0.28
Nodes (8): ACTIVITY_STATUS_COLOR, ACTIVITY_STATUS_LABEL, ActivityStatusTag(), PlanningEditor(), flashSaved(), handleResetExecution(), STATUS_OPTIONS, ActivityStatus

### Community 39 - "EquipmentControlGrid.tsx"
Cohesion: 0.36
Nodes (6): EquipmentControlGrid(), EquipmentFilterBar(), FILTER_OPTIONS, OPTIONS, UnitFilterBar(), filterEquipment()

### Community 40 - "CampoTankPage"
Cohesion: 0.60
Nodes (6): CampoTankPage(), flashSaved(), handleComplete(), handleEdit(), handleProgress(), handleStart()

### Community 41 - "Fotos do painel/dashboard do mapa — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização, Formato, Fotos do painel/dashboard do mapa — Tank Control

### Community 42 - "Vídeos de manutenção — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização semanal, Formato, Vídeos de manutenção — Tank Control

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `useBravaData`, `lucide-react`, `units/materials/calculations.ts`, `react`, `brava/layout.tsx`, `AssetMapExplorer.tsx`, `tanksRepo.ts`, `package.json`, `EquipmentMapExplorer.tsx`, `TankCard.tsx`, `MapTourPanel.tsx`, `client.ts`, `isRequestEditor`, `costsRepo.ts`, `cn`, `formatShort`, `materialsRepo.ts`, `units/selectors.ts`, `equipmentRepo.ts`, `getSql`, `equipmentCostsRepo.ts`, `MapZoomPan.tsx`, `ConsolidatedGantt.tsx`, `home-selectors.ts`, `EquipmentConsolidatedGantt.tsx`, `equipmentMapCoordinatesRepo.ts`, `mapCoordinatesRepo.ts`, `date-utils.ts`, `brava/mapa/page.tsx`?**
  _High betweenness centrality (0.230) - this node is a cross-community bridge._
- **Should `useBravaData` be split into smaller, more focused modules?**
  _Cohesion score 0.05303030303030303 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `useBravaData`, `units/materials/calculations.ts`, `reports/page.tsx`, `react`, `brava/layout.tsx`, `AssetMapExplorer.tsx`, `package.json`, `EquipmentMapExplorer.tsx`, `TankCard.tsx`, `MapTourPanel.tsx`, `cn`, `formatShort`, `units/selectors.ts`, `units/types.ts`, `MapZoomPan.tsx`, `ConsolidatedGantt.tsx`, `home-selectors.ts`, `brava/types.ts`, `EquipmentConsolidatedGantt.tsx`, `status-meta.ts`, `PlanningEditor.tsx`, `EquipmentControlGrid.tsx`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.050087361677344205 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `useBravaData`, `units/materials/calculations.ts`, `reports/page.tsx`, `react`, `brava/layout.tsx`, `AssetMapExplorer.tsx`, `EquipmentMapExplorer.tsx`, `TankCard.tsx`, `MapTourPanel.tsx`, `formatShort`, `units/types.ts`, `MapZoomPan.tsx`, `ConsolidatedGantt.tsx`, `home-selectors.ts`, `brava/types.ts`, `EquipmentConsolidatedGantt.tsx`, `date-utils.ts`, `status-meta.ts`, `EquipmentMapHotspot.tsx`, `PlanningEditor.tsx`, `EquipmentControlGrid.tsx`, `CampoTankPage`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `units/materials/calculations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059781488352916926 - nodes in this community are weakly interconnected._
- **Should `reports/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.058738738738738736 - nodes in this community are weakly interconnected._