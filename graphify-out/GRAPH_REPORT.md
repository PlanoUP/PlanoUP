# Graph Report - PlanoUP  (2026-11-16)

## Corpus Check
- 286 files · ~99,081 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 1347 nodes · 4635 edges · 59 communities (53 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `36b027df`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- brava/materials/calculations.ts
- app/page.tsx
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
- formatShort
- materialsRepo.ts
- fieldUsersRepo.ts
- MaterialDetailDrawer.tsx
- compilerOptions
- equipmentRepo.ts
- getSql
- tanks.ts
- equipmentCostsRepo.ts
- app/layout.tsx
- useBravaData
- AssetMapExplorer
- lucide-react
- MaterialFormDrawer.tsx
- equipmentMapCoordinatesRepo.ts
- mapCoordinatesRepo.ts
- diffDays
- CheckoutLink
- MapHotspot.tsx
- action-plans/route.ts
- addDays
- brava/context.tsx
- brava/maps/context.tsx
- CampoTankPage
- Fotos do painel/dashboard do mapa — Tank Control
- Vídeos de manutenção — Tank Control
- next.config.mjs
- brava/mapa/page.tsx
- useEditAuth
- campo/page.tsx
- EquipmentArt.tsx
- next
- usuarios/page.tsx
- Hero.tsx
- field-entries/route.ts
- ActionPlanBanner.tsx
- FieldEntryForm
- FAQ.tsx
- icon.tsx
- CLAUDE.md
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 143 edges
2. `lucide-react` - 99 edges
3. `next` - 87 edges
4. `formatShort()` - 77 edges
5. `getSql()` - 72 edges
6. `isRequestEditor()` - 67 edges
7. `useBravaData()` - 67 edges
8. `react` - 62 edges
9. `ensureSchema()` - 60 edges
10. `SectionHeading()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `handleCloseWeek()` --calls--> `formatShort()`  [EXTRACTED]
  src/app/brava/reports/page.tsx → src/lib/brava/date-utils.ts
- `computeUpcomingMilestones()` --calls--> `diffDays()`  [EXTRACTED]
  src/lib/brava/home-selectors.ts → src/lib/brava/date-utils.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/materials/calculations.ts → src/lib/brava/date-utils.ts
- `tier()` --indirect_call--> `todayISO()`  [INFERRED]
  src/lib/brava/units/materials/calculations.ts → src/lib/brava/date-utils.ts
- `MaterialNeedsBucket` --references--> `Material`  [EXTRACTED]
  src/lib/brava/materials/calculations.ts → src/lib/brava/materials/types.ts

## Import Cycles
- None detected.

## Communities (59 total, 6 thin omitted)

### Community 0 - "brava/materials/calculations.ts"
Cohesion: 0.12
Nodes (26): MateriaisTab(), FILTER_OPTIONS, MaterialsFilterBar(), MaterialsHomeSummary(), MiniStat(), MaterialsKpiRow(), MaterialsTable(), RowAction() (+18 more)

### Community 1 - "app/page.tsx"
Cohesion: 0.10
Nodes (22): Home(), applications, Applications(), audience, Audience(), after, before, Comparison() (+14 more)

### Community 2 - "units/materials/calculations.ts"
Cohesion: 0.06
Nodes (58): EquipmentMaterialsPage(), EquipmentMapAssetDrawer(), Field(), EMPTY_FORM, EquipmentMaterialFormDrawer(), Field(), FormState, materialToForm() (+50 more)

### Community 3 - "reports/page.tsx"
Cohesion: 0.06
Nodes (57): ExecutiveReportsPage(), mostRecentMonday(), reportId(), ReportsPageContent(), handleChangeAvancos(), handleChangeCriticalPoints(), handleChangeDecisoes(), handleChangeRiscos() (+49 more)

### Community 4 - "react"
Cohesion: 0.07
Nodes (55): ConsolidadoContent(), ConsolidatedPage(), TabKey, TABS, MAINTENANCE_STATUSES, UnidadesCustosPage(), EquipmentDetailPage(), TAB_KEYS (+47 more)

### Community 5 - "brava/layout.tsx"
Cohesion: 0.17
Nodes (19): BravaLayout(), manrope, metadata, DataStatusGate(), MobileTopBar(), Sidebar(), BravaDataProvider(), CostsDataProvider() (+11 more)

### Community 6 - "AssetMapExplorer.tsx"
Cohesion: 0.19
Nodes (13): MAINTENANCE_STATUSES, MapAreaSelector(), BASE_FILTERS, MapFilterBar(), MapHoverToolbar(), MapSummaryCard(), Stat(), ASSET_MAPS (+5 more)

### Community 7 - "tanksRepo.ts"
Cohesion: 0.13
Nodes (29): POST(), dynamic, PATCH(), dynamic, POST(), dynamic, PATCH(), dynamic (+21 more)

### Community 8 - "package.json"
Cohesion: 0.07
Nodes (38): dependencies, framer-motion@^11.11.17, lucide-react@^0.454.0, @neondatabase/serverless@^1.1.0, next@14.2.35, react@^18.3.1, react-dom@^18.3.1, recharts@^2.15.0 (+30 more)

### Community 9 - "EquipmentMapExplorer.tsx"
Cohesion: 0.06
Nodes (52): MapaContent(), UnidadesMapaPage(), FullscreenControlBar(), FullscreenSummary, KpiChip(), HudCorners(), LiveClock(), formatToday() (+44 more)

### Community 10 - "inspection.ts"
Cohesion: 0.06
Nodes (54): BravaOverviewPage(), AttentionPanel(), KIND_META, BlueprintGrid(), ExecutiveHeader(), Field(), StatBlock(), STATUS_HEADLINE (+46 more)

### Community 11 - "MapTourPanel.tsx"
Cohesion: 0.17
Nodes (9): CarouselButton(), MapTourPanel(), MediaState, PhotoGalleryStrip(), videoSrcForTag(), getTankGalleryPhotoSrcs(), getTankTourPhotoSrc(), MAX_TOUR_GALLERY_PHOTOS (+1 more)

### Community 12 - "next"
Cohesion: 0.23
Nodes (14): dynamic, POST(), dynamic, dynamic, POST(), EDIT_COOKIE_NAME, EDIT_PASSWORD_KEY, getEditPasswordHash() (+6 more)

### Community 13 - "client.ts"
Cohesion: 0.20
Nodes (15): dynamic, GET(), dynamic, POST(), dynamic, GET(), dynamic, GET() (+7 more)

### Community 14 - "isRequestEditor"
Cohesion: 0.19
Nodes (16): dynamic, POST(), DELETE(), dynamic, PATCH(), dynamic, GET(), POST() (+8 more)

### Community 15 - "costsRepo.ts"
Cohesion: 0.22
Nodes (17): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), getSql(), createCost() (+9 more)

### Community 16 - "cn"
Cohesion: 0.07
Nodes (54): UnidadesConsolidatedPage(), UnidadesOverviewPage(), FamilyFilterBar(), FILTER_OPTIONS, ProgressBar(), EquipmentCard(), Stat(), EquipmentConsolidatedGantt() (+46 more)

### Community 17 - "formatShort"
Cohesion: 0.10
Nodes (26): TAB_KEYS, TabKey, TABS, TankDetailPage(), ExecutiveTimeline(), Legend(), Node(), Field() (+18 more)

### Community 18 - "materialsRepo.ts"
Cohesion: 0.20
Nodes (19): dynamic, POST(), DELETE(), dynamic, PATCH(), dynamic, GET(), POST() (+11 more)

### Community 19 - "fieldUsersRepo.ts"
Cohesion: 0.12
Nodes (29): dynamic, POST(), dynamic, dynamic, GET(), dynamic, PATCH(), dynamic (+21 more)

### Community 20 - "MaterialDetailDrawer.tsx"
Cohesion: 0.19
Nodes (18): MaterialCriticalityBadge(), ATTACHMENT_LABELS, Grid(), Item(), MaterialDetailDrawer(), Section(), MaterialRiskBadge(), MaterialsAtRisk() (+10 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 22 - "equipmentRepo.ts"
Cohesion: 0.14
Nodes (18): dynamic, PATCH(), dynamic, PATCH(), dynamic, GET(), EQUIPMENT_SEED, item() (+10 more)

### Community 23 - "getSql"
Cohesion: 0.26
Nodes (10): DELETE(), dynamic, dynamic, GET(), POST(), backfillLegacyRefSize(), deleteMapCalloutOffset(), listMapCalloutOffsets() (+2 more)

### Community 24 - "tanks.ts"
Cohesion: 0.15
Nodes (21): ActiveParams, buildActive(), buildConcluded(), buildFromSchedule(), buildNoProject(), buildScheduled(), ConcludedParams, FromScheduleParams (+13 more)

### Community 25 - "equipmentCostsRepo.ts"
Cohesion: 0.23
Nodes (13): DELETE(), dynamic, PATCH(), dynamic, GET(), POST(), createEquipmentCost(), deleteEquipmentCost() (+5 more)

### Community 26 - "app/layout.tsx"
Cohesion: 0.14
Nodes (16): inter, jbmono, metadata, RootLayout(), handleClick(), Footer(), MetaPixel(), trackWhatsAppSupportClick() (+8 more)

### Community 27 - "useBravaData"
Cohesion: 0.18
Nodes (23): ConsolidatedGantt(), LegendDot(), DeadlinesPanel(), FilterBar(), GanttChart(), Legend(), InspectionSummary(), ProgramOverviewMini() (+15 more)

### Community 28 - "AssetMapExplorer"
Cohesion: 0.20
Nodes (15): AssetMapExplorer(), jumpTo(), MapAssetListPanel(), sortByInspectionPriority(), findTankAcrossMaps(), search(), getAssetMap(), getMapByTank() (+7 more)

### Community 29 - "lucide-react"
Cohesion: 0.21
Nodes (13): lucide-react, react, QUICK_PROGRESS_VALUES, ActivitySelector(), QUICK_PROGRESS_VALUES, FieldEntryHistory(), formatDateTime(), nowHHMM() (+5 more)

### Community 30 - "MaterialFormDrawer.tsx"
Cohesion: 0.21
Nodes (12): EMPTY_FORM, Field(), FormState, MaterialFormDrawer(), materialToForm(), LoadStatus, MaterialsContext, MaterialsContextValue (+4 more)

### Community 31 - "equipmentMapCoordinatesRepo.ts"
Cohesion: 0.27
Nodes (9): DELETE(), dynamic, dynamic, GET(), POST(), deleteEquipmentMapCoordinate(), listEquipmentMapCoordinates(), makeId() (+1 more)

### Community 32 - "mapCoordinatesRepo.ts"
Cohesion: 0.27
Nodes (9): DELETE(), dynamic, dynamic, GET(), POST(), deleteMapCoordinate(), listMapCoordinates(), makeId() (+1 more)

### Community 33 - "diffDays"
Cohesion: 0.24
Nodes (14): CurvaSTab(), PhysicalScurveChart(), diffDays(), formatMonthYear(), parseISO(), todayISO(), toISO(), actualProgressAt() (+6 more)

### Community 34 - "CheckoutLink"
Cohesion: 0.32
Nodes (10): CheckoutLink(), Props, FinalCTA(), Header(), included, Offer(), StickyMobileCTA(), getUtmParams() (+2 more)

### Community 35 - "MapHotspot.tsx"
Cohesion: 0.18
Nodes (13): MapHotspot(), toSvgGeometry(), INSPECTION_CRITICALITY_META, CalloutOffset, CalloutPoint, clamp(), computeCalloutLayout(), hashTag() (+5 more)

### Community 36 - "action-plans/route.ts"
Cohesion: 0.23
Nodes (11): dynamic, PATCH(), dynamic, GET(), POST(), ActionPlan, ActionPlanInput, createActionPlan() (+3 more)

### Community 37 - "addDays"
Cohesion: 0.16
Nodes (15): addDays(), applyExecutionState(), buildActivitiesFromTemplate(), markFullyConcluded(), overallDeviationDays(), recalculateSchedule(), weightedProgress(), deriveEquipment() (+7 more)

### Community 38 - "brava/context.tsx"
Cohesion: 0.17
Nodes (13): OPTIONS, ACTIVITY_STATUS_COLOR, ACTIVITY_STATUS_LABEL, STATUS_OPTIONS, ActivityEdit, BravaContext, BravaContextValue, LoadStatus (+5 more)

### Community 39 - "brava/maps/context.tsx"
Cohesion: 0.18
Nodes (12): MapCalibrationPanel(), LoadStatus, MapCalloutOffsetsContext, MapCalloutOffsetsContextValue, MapCoordinatesContext, MapCoordinatesContextValue, useMapCalloutOffsetsData(), useMapCoordinatesData() (+4 more)

### Community 40 - "CampoTankPage"
Cohesion: 0.36
Nodes (9): CampoTankPage(), flashSaved(), handleComplete(), handleEdit(), handleProgress(), handleStart(), ActionPlanTrigger(), handleSubmit() (+1 more)

### Community 41 - "Fotos do painel/dashboard do mapa — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização, Formato, Fotos do painel/dashboard do mapa — Tank Control

### Community 42 - "Vídeos de manutenção — Tank Control"
Cohesion: 0.50
Nodes (3): Atualização semanal, Formato, Vídeos de manutenção — Tank Control

### Community 46 - "useEditAuth"
Cohesion: 0.21
Nodes (8): EditPasswordModal(), TANQUES_NAV_ITEMS, UNIDADES_NAV_ITEMS, TANQUES_NAV_ITEMS, UNIDADES_NAV_ITEMS, EditAuthContext, EditAuthContextValue, useEditAuth()

### Community 47 - "campo/page.tsx"
Cohesion: 0.29
Nodes (8): CampoPage(), DEFAULT_HIDDEN_STATUSES, FieldLoginCard(), StatusBadge(), FieldAuthContext, FieldAuthContextValue, FieldUserPublic, useFieldAuth()

### Community 48 - "EquipmentArt.tsx"
Cohesion: 0.36
Nodes (10): AirCoolerArt(), EquipmentArt(), FlotadorArt(), FornoArt(), Frame(), MotorCompressorArt(), Props, TanqueArt() (+2 more)

### Community 49 - "next"
Cohesion: 0.22
Nodes (5): next, ALLOWED_TYPES, dynamic, POST(), isBlobConfigured()

### Community 50 - "usuarios/page.tsx"
Cohesion: 0.29
Nodes (8): FieldUserPublic, parseErrorMessage(), TagMultiSelect(), UsuariosPage(), fetchUsers(), handleCreate(), handleSaveAllocation(), handleToggleActive()

### Community 51 - "Hero.tsx"
Cohesion: 0.35
Nodes (7): EquipmentCard(), EquipmentGrid(), EquipmentImage(), Hero(), stats, Equipment, equipments

### Community 52 - "field-entries/route.ts"
Cohesion: 0.29
Nodes (7): dynamic, GET(), createFieldEntry(), genId(), listFieldEntries(), BENIGN_RACE_CODES, TABLES

### Community 53 - "ActionPlanBanner.tsx"
Cohesion: 0.36
Nodes (5): ActionPlanBanner(), timeAgo(), Listener, listeners, subscribeActionPlansChanged()

### Community 54 - "FieldEntryForm"
Cohesion: 0.40
Nodes (4): FieldEntryForm(), handleSubmit(), uploadPhotos(), parseErrorMessage()

### Community 55 - "FAQ.tsx"
Cohesion: 0.50
Nodes (3): FAQ(), faq, FaqItem

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `brava/materials/calculations.ts`, `units/materials/calculations.ts`, `react`, `brava/layout.tsx`, `AssetMapExplorer.tsx`, `tanksRepo.ts`, `package.json`, `EquipmentMapExplorer.tsx`, `inspection.ts`, `MapTourPanel.tsx`, `next`, `client.ts`, `isRequestEditor`, `costsRepo.ts`, `cn`, `formatShort`, `materialsRepo.ts`, `fieldUsersRepo.ts`, `MaterialDetailDrawer.tsx`, `equipmentRepo.ts`, `getSql`, `equipmentCostsRepo.ts`, `app/layout.tsx`, `useBravaData`, `lucide-react`, `equipmentMapCoordinatesRepo.ts`, `mapCoordinatesRepo.ts`, `action-plans/route.ts`, `brava/mapa/page.tsx`, `useEditAuth`, `campo/page.tsx`, `EquipmentArt.tsx`, `field-entries/route.ts`, `icon.tsx`?**
  _High betweenness centrality (0.251) - this node is a cross-community bridge._
- **Should `brava/materials/calculations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12012012012012012 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `brava/materials/calculations.ts`, `app/page.tsx`, `units/materials/calculations.ts`, `reports/page.tsx`, `react`, `brava/layout.tsx`, `AssetMapExplorer.tsx`, `package.json`, `EquipmentMapExplorer.tsx`, `inspection.ts`, `MapTourPanel.tsx`, `cn`, `formatShort`, `MaterialDetailDrawer.tsx`, `app/layout.tsx`, `useBravaData`, `MaterialFormDrawer.tsx`, `diffDays`, `CheckoutLink`, `brava/context.tsx`, `brava/maps/context.tsx`, `useEditAuth`, `campo/page.tsx`, `usuarios/page.tsx`, `Hero.tsx`, `ActionPlanBanner.tsx`, `FAQ.tsx`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10080645161290322 - nodes in this community are weakly interconnected._
- **Why does `react` connect `lucide-react` to `brava/materials/calculations.ts`, `units/materials/calculations.ts`, `reports/page.tsx`, `react`, `AssetMapExplorer.tsx`, `package.json`, `EquipmentMapExplorer.tsx`, `MapTourPanel.tsx`, `cn`, `formatShort`, `app/layout.tsx`, `useBravaData`, `MaterialFormDrawer.tsx`, `diffDays`, `CheckoutLink`, `MapHotspot.tsx`, `brava/context.tsx`, `brava/maps/context.tsx`, `brava/mapa/page.tsx`, `useEditAuth`, `campo/page.tsx`, `EquipmentArt.tsx`, `usuarios/page.tsx`, `ActionPlanBanner.tsx`, `FAQ.tsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `units/materials/calculations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06424050632911392 - nodes in this community are weakly interconnected._
- **Should `reports/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.058738738738738736 - nodes in this community are weakly interconnected._