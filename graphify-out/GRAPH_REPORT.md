# Graph Report - PlanoUP  (2026-11-17)

## Corpus Check
- 300 files · ~102,863 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 1426 nodes · 4910 edges · 50 communities (44 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `16b1a698`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useBravaData
- app/page.tsx
- units/materials/calculations.ts
- reports/page.tsx
- react
- brava/layout.tsx
- AssetMapExplorer.tsx
- tanksRepo.ts
- package.json
- EquipmentMapExplorer.tsx
- tanks.ts
- useBravaData
- next
- client.ts
- isRequestEditor
- costsRepo.ts
- units/context.tsx
- field/types.ts
- materialsRepo.ts
- app/layout.tsx
- formatShort
- compilerOptions
- equipmentRepo.ts
- lucide-react
- CheckoutLink
- equipmentCostsRepo.ts
- PageHeader
- action-plans/route.ts
- addDays
- react
- diffDays
- equipmentMapCoordinatesRepo.ts
- mapCoordinatesRepo.ts
- scurve.ts
- EquipmentArt.tsx
- Hero.tsx
- next
- inspection.ts
- brava/context.tsx
- home-selectors.ts
- FAQ.tsx
- Fotos do painel/dashboard do mapa — Tank Control
- Vídeos de manutenção — Tank Control
- next.config.mjs
- sw-campo.js
- cn
- icon.tsx
- CLAUDE.md
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 143 edges
2. `lucide-react` - 101 edges
3. `next` - 89 edges
4. `formatShort()` - 81 edges
5. `getSql()` - 76 edges
6. `isRequestEditor()` - 69 edges
7. `react` - 67 edges
8. `useBravaData()` - 65 edges
9. `ensureSchema()` - 64 edges
10. `SectionHeading()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `AssetListEntry` --references--> `TankWithDerived`  [EXTRACTED]
  src/components/brava/maps/MapAssetListPanel.tsx → src/lib/brava/types.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/materials/calculations.ts → src/lib/brava/date-utils.ts
- `computeUpcomingMilestones()` --calls--> `diffDays()`  [EXTRACTED]
  src/lib/brava/home-selectors.ts → src/lib/brava/date-utils.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/units/materials/calculations.ts → src/lib/brava/date-utils.ts
- `handleCloseWeek()` --calls--> `formatShort()`  [EXTRACTED]
  src/app/brava/reports/page.tsx → src/lib/brava/date-utils.ts

## Import Cycles
- None detected.

## Communities (50 total, 6 thin omitted)

### Community 0 - "useBravaData"
Cohesion: 0.08
Nodes (39): TAB_KEYS, TabKey, TABS, TankDetailPage(), MateriaisTab(), Field(), MaterialFormDrawer(), MaterialsAtRisk() (+31 more)

### Community 1 - "app/page.tsx"
Cohesion: 0.10
Nodes (22): Home(), applications, Applications(), audience, Audience(), after, before, Comparison() (+14 more)

### Community 2 - "units/materials/calculations.ts"
Cohesion: 0.05
Nodes (92): EquipmentDetailPage(), TAB_KEYS, TabKey, TABS, EquipmentMaterialsPage(), MaterialCriticalityBadge(), ATTACHMENT_LABELS, Grid() (+84 more)

### Community 3 - "reports/page.tsx"
Cohesion: 0.06
Nodes (55): ExecutiveReportsPage(), mostRecentMonday(), reportId(), ReportsPageContent(), handleChangeAvancos(), handleChangeCriticalPoints(), handleChangeDecisoes(), handleChangeRiscos() (+47 more)

### Community 4 - "react"
Cohesion: 0.09
Nodes (43): MAINTENANCE_STATUSES, UnidadesCustosPage(), CustosTab(), MAINTENANCE_STATUSES, CostScurveChart(), TankCostsSection(), EquipmentCostsSection(), buildCostScurve() (+35 more)

### Community 5 - "brava/layout.tsx"
Cohesion: 0.10
Nodes (28): BravaLayout(), manrope, metadata, ActionPlanBanner(), timeAgo(), DataStatusGate(), EditPasswordModal(), MobileTopBar() (+20 more)

### Community 6 - "AssetMapExplorer.tsx"
Cohesion: 0.05
Nodes (59): MapaContent(), MapaPage(), AssetMapExplorer(), jumpTo(), MAINTENANCE_STATUSES, MapAreaSelector(), AssetListEntry, MapAssetListPanel() (+51 more)

### Community 7 - "tanksRepo.ts"
Cohesion: 0.14
Nodes (27): dynamic, PATCH(), dynamic, POST(), dynamic, PATCH(), deriveActivityStatus(), deriveTankStatus() (+19 more)

### Community 8 - "package.json"
Cohesion: 0.07
Nodes (38): dependencies, framer-motion@^11.11.17, lucide-react@^0.454.0, @neondatabase/serverless@^1.1.0, next@14.2.35, react@^18.3.1, react-dom@^18.3.1, recharts@^2.15.0 (+30 more)

### Community 9 - "EquipmentMapExplorer.tsx"
Cohesion: 0.06
Nodes (60): FullscreenControlBar(), FullscreenSummary, KpiChip(), HudCorners(), LiveClock(), formatToday(), LiveDate(), MapZoomPan (+52 more)

### Community 10 - "tanks.ts"
Cohesion: 0.14
Nodes (21): ActiveParams, buildActive(), buildConcluded(), buildFromSchedule(), buildNoProject(), buildScheduled(), ConcludedParams, FromScheduleParams (+13 more)

### Community 11 - "useBravaData"
Cohesion: 0.13
Nodes (30): AttentionPanel(), KIND_META, CronogramaTab(), ConsolidatedGantt(), LegendDot(), FILTER_OPTIONS, FilterBar(), GanttChart() (+22 more)

### Community 12 - "next"
Cohesion: 0.23
Nodes (14): dynamic, POST(), dynamic, dynamic, POST(), EDIT_COOKIE_NAME, EDIT_PASSWORD_KEY, getEditPasswordHash() (+6 more)

### Community 13 - "client.ts"
Cohesion: 0.10
Nodes (29): dynamic, GET(), DELETE(), dynamic, dynamic, GET(), POST(), dynamic (+21 more)

### Community 14 - "isRequestEditor"
Cohesion: 0.25
Nodes (14): dynamic, POST(), dynamic, GET(), POST(), createEquipmentMaterial(), duplicateEquipmentMaterial(), genId() (+6 more)

### Community 15 - "costsRepo.ts"
Cohesion: 0.22
Nodes (17): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), getSql(), createCost() (+9 more)

### Community 16 - "units/context.tsx"
Cohesion: 0.08
Nodes (38): UnidadesOverviewPage(), ProgressBar(), EquipmentCard(), Stat(), EquipmentControlGrid(), EquipmentExecutiveHeader(), Field(), StatBlock() (+30 more)

### Community 17 - "field/types.ts"
Cohesion: 0.10
Nodes (29): @react-pdf/renderer@^3.4.4, @react-pdf/renderer, dynamic, GET(), POST(), dynamic, GET(), dynamic (+21 more)

### Community 18 - "materialsRepo.ts"
Cohesion: 0.16
Nodes (21): DELETE(), dynamic, PATCH(), dynamic, POST(), DELETE(), dynamic, PATCH() (+13 more)

### Community 19 - "app/layout.tsx"
Cohesion: 0.14
Nodes (16): inter, jbmono, metadata, RootLayout(), handleClick(), Footer(), MetaPixel(), trackWhatsAppSupportClick() (+8 more)

### Community 20 - "formatShort"
Cohesion: 0.20
Nodes (20): BlueprintGrid(), ExecutiveHeader(), Field(), StatBlock(), STATUS_HEADLINE, FeaturedTankCard(), Field(), BENEFITS (+12 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 22 - "equipmentRepo.ts"
Cohesion: 0.18
Nodes (14): dynamic, PATCH(), dynamic, PATCH(), dynamic, GET(), ActivityEdit, ensureSeeded() (+6 more)

### Community 23 - "lucide-react"
Cohesion: 0.20
Nodes (14): lucide-react, ConsolidadoContent(), ConsolidatedPage(), TabKey, TABS, BravaOverviewPage(), CurvaSTab(), KpiCard() (+6 more)

### Community 24 - "CheckoutLink"
Cohesion: 0.32
Nodes (10): CheckoutLink(), Props, FinalCTA(), Header(), included, Offer(), StickyMobileCTA(), getUtmParams() (+2 more)

### Community 25 - "equipmentCostsRepo.ts"
Cohesion: 0.23
Nodes (13): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), createEquipmentCost(), deleteEquipmentCost() (+5 more)

### Community 26 - "PageHeader"
Cohesion: 0.20
Nodes (11): UnidadesConsolidatedPage(), MapaContent(), UnidadesMapaPage(), parseErrorMessage(), UsuariosPage(), fetchUsers(), handleCreate(), handleSaveAllocation() (+3 more)

### Community 27 - "action-plans/route.ts"
Cohesion: 0.23
Nodes (11): dynamic, PATCH(), dynamic, GET(), POST(), ActionPlan, ActionPlanInput, createActionPlan() (+3 more)

### Community 28 - "addDays"
Cohesion: 0.22
Nodes (12): addDays(), toISO(), applyExecutionState(), buildActivitiesFromTemplate(), markFullyConcluded(), overallDeviationDays(), recalculateSchedule(), weightedProgress() (+4 more)

### Community 29 - "react"
Cohesion: 0.06
Nodes (77): react, CampoLayout(), CampoPage(), DEFAULT_HIDDEN_STATUSES, CampoTankPage(), flashSaved(), handleComplete(), handleEdit() (+69 more)

### Community 30 - "diffDays"
Cohesion: 0.29
Nodes (13): diffDays(), computeDeadlines(), buildInspectionFleet(), getDaysToInspection(), getInspectionCriticality(), getTankFamily(), overallDeviationDays(), weightedProgress() (+5 more)

### Community 31 - "equipmentMapCoordinatesRepo.ts"
Cohesion: 0.27
Nodes (9): DELETE(), dynamic, dynamic, GET(), POST(), deleteEquipmentMapCoordinate(), listEquipmentMapCoordinates(), makeId() (+1 more)

### Community 32 - "mapCoordinatesRepo.ts"
Cohesion: 0.27
Nodes (9): DELETE(), dynamic, dynamic, GET(), POST(), deleteMapCoordinate(), listMapCoordinates(), makeId() (+1 more)

### Community 33 - "scurve.ts"
Cohesion: 0.29
Nodes (10): PhysicalScurveChart(), TankScurveSection(), formatMonthYear(), parseISO(), actualProgressAt(), buildPhysicalSCurve(), formatAxisLabel(), inScope() (+2 more)

### Community 34 - "EquipmentArt.tsx"
Cohesion: 0.36
Nodes (10): AirCoolerArt(), EquipmentArt(), FlotadorArt(), FornoArt(), Frame(), MotorCompressorArt(), Props, TanqueArt() (+2 more)

### Community 35 - "Hero.tsx"
Cohesion: 0.35
Nodes (7): EquipmentCard(), EquipmentGrid(), EquipmentImage(), Hero(), stats, Equipment, equipments

### Community 36 - "next"
Cohesion: 0.10
Nodes (31): next, dynamic, POST(), dynamic, dynamic, GET(), ALLOWED_TYPES, dynamic (+23 more)

### Community 37 - "inspection.ts"
Cohesion: 0.27
Nodes (9): Group, compareInspectionPriority(), InspectionCriticalityMeta, InspectionFleetAsset, InspectionPriorityLike, InspectionSummaryCounts, sortAssetsByInspectionPriority(), InspectionCriticality (+1 more)

### Community 38 - "brava/context.tsx"
Cohesion: 0.22
Nodes (10): FamilyFilterBar(), OPTIONS, ActivityEdit, BravaContext, BravaContextValue, LoadStatus, parseErrorMessage(), FamilyView (+2 more)

### Community 39 - "home-selectors.ts"
Cohesion: 0.22
Nodes (8): INSPECTION_INVENTORY, InspectionInventoryItem, AttentionItem, AttentionKind, computeUpcomingMilestones(), DeadlineItem, DeadlineKind, FleetMilestone

### Community 40 - "FAQ.tsx"
Cohesion: 0.50
Nodes (3): FAQ(), faq, FaqItem

### Community 41 - "Fotos do painel/dashboard do mapa — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização, Formato, Fotos do painel/dashboard do mapa — Tank Control

### Community 42 - "Vídeos de manutenção — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização semanal, Formato, Vídeos de manutenção — Tank Control

### Community 50 - "cn"
Cohesion: 0.09
Nodes (33): FieldUserPublic, TagMultiSelect(), ActivitySelector(), DeadlinesPanel(), ExecutiveTimeline(), Legend(), Node(), InspectionTooltip() (+25 more)

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `useBravaData`, `units/materials/calculations.ts`, `react`, `brava/layout.tsx`, `AssetMapExplorer.tsx`, `tanksRepo.ts`, `package.json`, `EquipmentMapExplorer.tsx`, `useBravaData`, `next`, `client.ts`, `isRequestEditor`, `costsRepo.ts`, `units/context.tsx`, `field/types.ts`, `materialsRepo.ts`, `app/layout.tsx`, `formatShort`, `equipmentRepo.ts`, `lucide-react`, `equipmentCostsRepo.ts`, `PageHeader`, `action-plans/route.ts`, `react`, `equipmentMapCoordinatesRepo.ts`, `mapCoordinatesRepo.ts`, `EquipmentArt.tsx`, `cn`, `icon.tsx`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **Should `useBravaData` be split into smaller, more focused modules?**
  _Cohesion score 0.08408953418027829 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `useBravaData`, `app/page.tsx`, `units/materials/calculations.ts`, `reports/page.tsx`, `react`, `brava/layout.tsx`, `AssetMapExplorer.tsx`, `package.json`, `EquipmentMapExplorer.tsx`, `useBravaData`, `units/context.tsx`, `field/types.ts`, `app/layout.tsx`, `formatShort`, `CheckoutLink`, `PageHeader`, `react`, `Hero.tsx`, `brava/context.tsx`, `FAQ.tsx`, `cn`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10080645161290322 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `useBravaData`, `units/materials/calculations.ts`, `brava/layout.tsx`, `brava/context.tsx`, `AssetMapExplorer.tsx`, `EquipmentMapExplorer.tsx`, `useBravaData`, `units/context.tsx`, `field/types.ts`, `formatShort`, `lucide-react`, `PageHeader`, `react`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Should `units/materials/calculations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05114083398898505 - nodes in this community are weakly interconnected._
- **Should `reports/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.060764587525150904 - nodes in this community are weakly interconnected._