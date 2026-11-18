# Graph Report - PlanoUP  (2026-11-18)

## Corpus Check
- 300 files · ~103,273 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 1430 nodes · 4920 edges · 49 communities (44 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dd44bcea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useBravaData
- lucide-react
- units/materials/calculations.ts
- reports/page.tsx
- react
- react
- AssetMapExplorer.tsx
- tanksRepo.ts
- package.json
- EquipmentMapExplorer.tsx
- MapTourPanel.tsx
- useBravaData
- next
- client.ts
- isRequestEditor
- costsRepo.ts
- units/context.tsx
- field/types.ts
- materialsRepo.ts
- status-meta.ts
- formatShort
- compilerOptions
- equipmentRepo.ts
- MapZoomPan.tsx
- brava/maps/context.tsx
- equipmentCostsRepo.ts
- diffDays
- action-plans/route.ts
- brava/maps/selectors.ts
- react
- brava/context.tsx
- equipmentMapCoordinatesRepo.ts
- date-utils.ts
- mapCalloutOffsetsRepo.ts
- units/maps/types.ts
- EquipmentMapHotspot.tsx
- next
- MapHotspot
- units/maps/config.ts
- MapSummaryCard.tsx
- Fotos do painel/dashboard do mapa — Tank Control
- Vídeos de manutenção — Tank Control
- next.config.mjs
- sw-campo.js
- PlanningEditor.tsx
- next
- CLAUDE.md
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 143 edges
2. `lucide-react` - 101 edges
3. `next` - 89 edges
4. `formatShort()` - 81 edges
5. `getSql()` - 76 edges
6. `isRequestEditor()` - 69 edges
7. `react` - 68 edges
8. `useBravaData()` - 65 edges
9. `ensureSchema()` - 64 edges
10. `SectionHeading()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `Group` --references--> `InspectionFleetAsset`  [EXTRACTED]
  src/components/brava/UpcomingInspectionsTimeline.tsx → src/lib/brava/inspection.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/materials/calculations.ts → src/lib/brava/date-utils.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/units/materials/calculations.ts → src/lib/brava/date-utils.ts
- `handleCloseWeek()` --calls--> `formatShort()`  [EXTRACTED]
  src/app/brava/reports/page.tsx → src/lib/brava/date-utils.ts
- `GET()` --calls--> `todayISO()`  [EXTRACTED]
  src/app/api/field-daily-log/route.ts → src/lib/brava/date-utils.ts

## Import Cycles
- None detected.

## Communities (49 total, 5 thin omitted)

### Community 0 - "useBravaData"
Cohesion: 0.08
Nodes (50): TAB_KEYS, TabKey, TABS, TankDetailPage(), MateriaisTab(), Field(), MapAssetDrawer(), EMPTY_FORM (+42 more)

### Community 1 - "lucide-react"
Cohesion: 0.05
Nodes (69): lucide-react, inter, jbmono, metadata, RootLayout(), Home(), applications, Applications() (+61 more)

### Community 2 - "units/materials/calculations.ts"
Cohesion: 0.06
Nodes (80): EquipmentDetailPage(), TAB_KEYS, TabKey, TABS, EquipmentMaterialsPage(), MaterialCriticalityBadge(), MaterialRiskBadge(), MaterialStatusBadge() (+72 more)

### Community 3 - "reports/page.tsx"
Cohesion: 0.06
Nodes (60): dynamic, POST(), ExecutiveReportsPage(), mostRecentMonday(), reportId(), ReportsPageContent(), handleChangeAvancos(), handleChangeCriticalPoints() (+52 more)

### Community 4 - "react"
Cohesion: 0.05
Nodes (69): BravaLayout(), manrope, metadata, MAINTENANCE_STATUSES, UnidadesCustosPage(), ActionPlanBanner(), timeAgo(), CustosTab() (+61 more)

### Community 5 - "react"
Cohesion: 0.09
Nodes (31): react, CampoPage(), DEFAULT_HIDDEN_STATUSES, CampoTankPage(), flashSaved(), handleComplete(), handleEdit(), handleProgress() (+23 more)

### Community 6 - "AssetMapExplorer.tsx"
Cohesion: 0.15
Nodes (13): MapaContent(), MapaPage(), AssetMapExplorer(), MAINTENANCE_STATUSES, MapAreaSelector(), MapAssetListPanel(), MapCalibrationPanel(), MapFilterBar() (+5 more)

### Community 7 - "tanksRepo.ts"
Cohesion: 0.07
Nodes (50): dynamic, PATCH(), dynamic, POST(), dynamic, PATCH(), dynamic, GET() (+42 more)

### Community 8 - "package.json"
Cohesion: 0.06
Nodes (40): dependencies, framer-motion@^11.11.17, lucide-react@^0.454.0, @neondatabase/serverless@^1.1.0, next@14.2.35, react@^18.3.1, react-dom@^18.3.1, @react-pdf/renderer@^3.4.4 (+32 more)

### Community 9 - "EquipmentMapExplorer.tsx"
Cohesion: 0.15
Nodes (25): EquipmentMapAreaSelector(), EquipmentMapAssetListPanel(), EquipmentMapCalibrationPanel(), EquipmentMapExplorer(), jumpTo(), MAINTENANCE_STATUSES, BASE_FILTERS, EquipmentMapFilterBar() (+17 more)

### Community 10 - "MapTourPanel.tsx"
Cohesion: 0.15
Nodes (11): CarouselButton(), MapTourPanel(), MediaState, PhotoGalleryStrip(), videoSrcForTag(), getTankCronogramaLink(), TANK_CRONOGRAMA_LINKS, getTankGalleryPhotoSrcs() (+3 more)

### Community 11 - "useBravaData"
Cohesion: 0.12
Nodes (26): AttentionPanel(), KIND_META, DeadlinesPanel(), FILTER_OPTIONS, FilterBar(), GanttChart(), Legend(), InspectionSummary() (+18 more)

### Community 12 - "next"
Cohesion: 0.23
Nodes (14): dynamic, POST(), dynamic, dynamic, POST(), EDIT_COOKIE_NAME, EDIT_PASSWORD_KEY, getEditPasswordHash() (+6 more)

### Community 13 - "client.ts"
Cohesion: 0.11
Nodes (23): dynamic, GET(), DELETE(), dynamic, dynamic, GET(), POST(), dynamic (+15 more)

### Community 14 - "isRequestEditor"
Cohesion: 0.21
Nodes (17): dynamic, POST(), DELETE(), dynamic, PATCH(), dynamic, GET(), POST() (+9 more)

### Community 15 - "costsRepo.ts"
Cohesion: 0.22
Nodes (17): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), getSql(), createCost() (+9 more)

### Community 16 - "units/context.tsx"
Cohesion: 0.12
Nodes (25): EquipmentControlGrid(), EquipmentFilterBar(), FILTER_OPTIONS, ActivityStatusTag(), STATUS_OPTIONS, OPTIONS, UnitFilterBar(), ActivityEdit (+17 more)

### Community 17 - "field/types.ts"
Cohesion: 0.17
Nodes (16): dynamic, GET(), POST(), dynamic, GET(), dynamic, GET(), POST() (+8 more)

### Community 18 - "materialsRepo.ts"
Cohesion: 0.19
Nodes (16): dynamic, POST(), DELETE(), dynamic, PATCH(), dynamic, GET(), POST() (+8 more)

### Community 19 - "status-meta.ts"
Cohesion: 0.19
Nodes (13): EquipmentCard(), Stat(), EquipmentExecutiveHeader(), Field(), StatBlock(), STATUS_HEADLINE, EquipmentStatusBadge(), EquipmentListEntry (+5 more)

### Community 20 - "formatShort"
Cohesion: 0.19
Nodes (25): ExecutiveHeader(), Field(), StatBlock(), STATUS_HEADLINE, ExecutiveTimeline(), Legend(), Node(), FeaturedTankCard() (+17 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 22 - "equipmentRepo.ts"
Cohesion: 0.18
Nodes (16): dynamic, PATCH(), dynamic, PATCH(), dynamic, GET(), ActivityEdit, ensureSeeded() (+8 more)

### Community 23 - "MapZoomPan.tsx"
Cohesion: 0.14
Nodes (17): BravaOverviewPage(), BlueprintGrid(), BENEFITS, BravaWordmark(), HeroExecutive(), KpiRow(), FullscreenControlBar(), FullscreenSummary (+9 more)

### Community 24 - "brava/maps/context.tsx"
Cohesion: 0.19
Nodes (14): BASE_FILTERS, LoadStatus, MapCalloutOffsetsContext, MapCalloutOffsetsContextValue, MapCoordinatesContext, MapCoordinatesContextValue, useMapCalloutOffsetsData(), useMapCoordinatesData() (+6 more)

### Community 25 - "equipmentCostsRepo.ts"
Cohesion: 0.23
Nodes (13): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), createEquipmentCost(), deleteEquipmentCost() (+5 more)

### Community 26 - "diffDays"
Cohesion: 0.06
Nodes (55): ConsolidadoContent(), ConsolidatedPage(), TabKey, TABS, UnidadesConsolidatedPage(), MapaContent(), UnidadesMapaPage(), UnidadesOverviewPage() (+47 more)

### Community 27 - "action-plans/route.ts"
Cohesion: 0.23
Nodes (11): dynamic, PATCH(), dynamic, GET(), POST(), ActionPlan, ActionPlanInput, createActionPlan() (+3 more)

### Community 28 - "brava/maps/selectors.ts"
Cohesion: 0.22
Nodes (14): jumpTo(), ASSET_MAPS, findTankAcrossMaps(), search(), getAssetMap(), getMapByTank(), getMapSummary(), getTankCoordinates() (+6 more)

### Community 29 - "react"
Cohesion: 0.06
Nodes (67): CampoLayout(), refreshEntries(), ActionPlanTrigger(), handleSubmit(), queueOffline(), DailyLogHeaderCard(), handleSubmit(), load() (+59 more)

### Community 30 - "brava/context.tsx"
Cohesion: 0.12
Nodes (28): FamilyFilterBar(), OPTIONS, AssetListEntry, ActivityEdit, BravaContext, BravaContextValue, LoadStatus, buildInspectionFleet() (+20 more)

### Community 31 - "equipmentMapCoordinatesRepo.ts"
Cohesion: 0.27
Nodes (9): DELETE(), dynamic, dynamic, GET(), POST(), deleteEquipmentMapCoordinate(), listEquipmentMapCoordinates(), makeId() (+1 more)

### Community 32 - "date-utils.ts"
Cohesion: 0.20
Nodes (9): ATTACHMENT_LABELS, Grid(), Item(), MaterialDetailDrawer(), Section(), formatLong(), MONTHS_PT, FAMILY_LABELS (+1 more)

### Community 33 - "mapCalloutOffsetsRepo.ts"
Cohesion: 0.26
Nodes (10): DELETE(), dynamic, dynamic, GET(), POST(), backfillLegacyRefSize(), deleteMapCalloutOffset(), listMapCalloutOffsets() (+2 more)

### Community 34 - "units/maps/types.ts"
Cohesion: 0.26
Nodes (9): EquipmentMapCoordinatesContext, EquipmentMapCoordinatesContextValue, LoadStatus, MapEquipmentEntry, EquipmentMapCoordinateOverride, EquipmentMapCoordinateOverrideInput, EquipmentMapFilterOption, EquipmentMapHotspotCoordinate (+1 more)

### Community 35 - "EquipmentMapHotspot.tsx"
Cohesion: 0.26
Nodes (10): EquipmentMapHotspot(), STATUS_ACCENT_BORDER, STATUS_LINE_CLASS, toSvgGeometry(), CalloutOffset, CalloutPoint, clamp(), computeCalloutLayout() (+2 more)

### Community 36 - "next"
Cohesion: 0.12
Nodes (30): dynamic, POST(), dynamic, dynamic, GET(), dynamic, PATCH(), dynamic (+22 more)

### Community 37 - "MapHotspot"
Cohesion: 0.27
Nodes (6): MapHotspot(), toSvgGeometry(), isMapActive(), MAP_ACTIVE_STATUSES, mapStatusDotClass(), mapStatusLabel()

### Community 38 - "units/maps/config.ts"
Cohesion: 0.28
Nodes (6): EQUIPMENT_SEED, item(), slug(), U260_TAGS, U270_TAGS, EQUIPMENT_TYPE_LABELS

### Community 39 - "MapSummaryCard.tsx"
Cohesion: 0.67
Nodes (3): MapSummaryCard(), Stat(), MapSummary

### Community 41 - "Fotos do painel/dashboard do mapa — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização, Formato, Fotos do painel/dashboard do mapa — Tank Control

### Community 42 - "Vídeos de manutenção — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização semanal, Formato, Vídeos de manutenção — Tank Control

### Community 50 - "PlanningEditor.tsx"
Cohesion: 0.28
Nodes (8): ACTIVITY_STATUS_COLOR, ACTIVITY_STATUS_LABEL, ActivityStatusTag(), PlanningEditor(), flashSaved(), handleResetExecution(), STATUS_OPTIONS, ActivityStatus

### Community 56 - "next"
Cohesion: 0.15
Nodes (7): next, ALLOWED_TYPES, dynamic, POST(), contentType, size, isBlobConfigured()

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `useBravaData`, `lucide-react`, `units/materials/calculations.ts`, `reports/page.tsx`, `react`, `react`, `AssetMapExplorer.tsx`, `tanksRepo.ts`, `package.json`, `EquipmentMapExplorer.tsx`, `MapTourPanel.tsx`, `useBravaData`, `next`, `client.ts`, `isRequestEditor`, `costsRepo.ts`, `field/types.ts`, `materialsRepo.ts`, `status-meta.ts`, `formatShort`, `equipmentRepo.ts`, `MapZoomPan.tsx`, `equipmentCostsRepo.ts`, `diffDays`, `action-plans/route.ts`, `equipmentMapCoordinatesRepo.ts`, `mapCalloutOffsetsRepo.ts`, `next`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Should `useBravaData` be split into smaller, more focused modules?**
  _Cohesion score 0.07952815829528158 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `useBravaData`, `units/materials/calculations.ts`, `reports/page.tsx`, `react`, `react`, `AssetMapExplorer.tsx`, `package.json`, `EquipmentMapExplorer.tsx`, `MapTourPanel.tsx`, `useBravaData`, `units/context.tsx`, `status-meta.ts`, `formatShort`, `MapZoomPan.tsx`, `brava/maps/context.tsx`, `diffDays`, `react`, `brava/context.tsx`, `date-utils.ts`, `units/maps/types.ts`, `PlanningEditor.tsx`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.050087361677344205 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `useBravaData`, `lucide-react`, `units/materials/calculations.ts`, `reports/page.tsx`, `react`, `AssetMapExplorer.tsx`, `package.json`, `EquipmentMapExplorer.tsx`, `MapTourPanel.tsx`, `useBravaData`, `units/context.tsx`, `status-meta.ts`, `MapZoomPan.tsx`, `brava/maps/context.tsx`, `diffDays`, `react`, `brava/context.tsx`, `units/maps/types.ts`, `PlanningEditor.tsx`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Should `units/materials/calculations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05587989991659716 - nodes in this community are weakly interconnected._
- **Should `reports/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.055379746835443035 - nodes in this community are weakly interconnected._