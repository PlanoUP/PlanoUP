# Graph Report - relaxed-bardeen-opdjf2  (2026-11-11)

## Corpus Check
- 261 files · ~121,587 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 1493 nodes · 4643 edges · 65 communities (56 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `88e7dbe7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- requireSupabase
- cameraGoals.ts
- tour.ts
- team/index.ts
- PropertySearch.tsx
- Platform.tsx
- PropertyEditor.tsx
- Legalize One
- track
- Results.tsx
- LeadDetail.tsx
- package.json
- supabase.ts
- mapProperty.ts
- Property3DViewer.tsx
- PropertyDetails.tsx
- BrokerProfile.tsx
- lazyPages.ts
- eventSink.ts
- rls.test.mjs
- legalize-one/package.json
- Button.tsx
- page.tsx
- Property3DExperience.tsx
- useTenant
- propertyService.ts
- cn
- ref_react
- TenantSettingsPage.tsx
- compilerOptions
- CheckoutLink
- LeadList.tsx
- usePageTitle
- DashboardLayout.tsx
- Home.tsx
- ref_lucide_react
- compilerOptions
- Experience3D.tsx
- react-router
- workspace.ts
- compilerOptions
- context.ts
- SmartImage
- TwoFactorSection
- WhatsAppSupport.tsx
- vercel.json
- layout.tsx
- lib/analytics.ts
- main.tsx
- EquipmentArt.tsx
- dependencies
- scripts
- export-catalog.ts
- Materials.tsx
- vite.config.ts
- .oxlintrc.json
- FAQ.tsx
- vite-env.d.ts
- legalize-one/tsconfig.json
- next.config.mjs
- tailwind.config.ts
- share-meta.d.ts
- paths.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 143 edges
2. `requireSupabase()` - 67 edges
3. `track()` - 59 edges
4. `usePageTitle()` - 51 edges
5. `useAsyncData()` - 50 edges
6. `react-router` - 46 edges
7. `Button()` - 38 edges
8. `useWorkspace()` - 35 edges
9. `SmartImage()` - 34 edges
10. `useTenant()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `Dois modos (`src/types/tour.ts`)` --references--> `TourRendererProps`  [INFERRED]
  legalize-one/README.md → legalize-one/src/components/tour/renderers/types.ts
- `Funcionalidades disponíveis` --references--> `track()`  [INFERRED]
  legalize-one/README.md → legalize-one/src/lib/analytics.ts
- `Pontos de integração` --references--> `track()`  [INFERRED]
  legalize-one/README.md → legalize-one/src/lib/analytics.ts
- `7.3 Planos e entitlements` --references--> `limitOf()`  [INFERRED]
  legalize-one/SAAS_AUDIT.md → legalize-one/src/lib/entitlements.ts
- `5. Riscos durante a transformação` --references--> `Model3DConfig`  [INFERRED]
  legalize-one/SAAS_AUDIT.md → legalize-one/src/types/model3d.ts

## Import Cycles
- None detected.

## Communities (65 total, 9 thin omitted)

### Community 0 - "requireSupabase"
Cohesion: 0.06
Nodes (91): ACCEPTED, Client, ClientDocument, ClientEvent, ClientInput, ClientStage, createClient(), daysSince() (+83 more)

### Community 1 - "cameraGoals.ts"
Cohesion: 0.06
Nodes (59): @react-three/drei@^10.7.9, @react-three/fiber@^9.8.1, boxCorners(), CameraGoal, DEFAULT_PRESENTATION, directionFrom(), FOV, frameBox() (+51 more)

### Community 2 - "tour.ts"
Cohesion: 0.06
Nodes (49): Coast(), Facade(), Gourmet(), Kitchen(), Living(), Palm(), Pendant(), Plant() (+41 more)

### Community 3 - "team/index.ts"
Cohesion: 0.05
Nodes (21): now, S, User, buildLeadEmail(), CHANNELS, esc(), LeadForNotice, phoneDisplay() (+13 more)

### Community 4 - "PropertySearch.tsx"
Cohesion: 0.09
Nodes (45): ChipGroup(), ChipGroupProps, FiltersSheet(), FiltersSheetProps, purposes, PropertySearch(), handleSubmit(), submit() (+37 more)

### Community 5 - "Platform.tsx"
Cohesion: 0.11
Nodes (41): Button(), Credential, CredentialCard(), addDomain(), createTenant(), fail(), listPlans(), listTenants() (+33 more)

### Community 6 - "PropertyEditor.tsx"
Cohesion: 0.09
Nodes (45): input(), BrokerOption, createProperty(), deleteProperty(), EMPTY_PROPERTY, fail(), getProperty(), INPUT_COLUMNS (+37 more)

### Community 7 - "Legalize One"
Cohesion: 0.05
Nodes (42): Arquitetura do 3D (resumo), Configurar / trocar o modelo de um imóvel, Deploy na Vercel, Dois modos (`src/types/tour.ts`), Estrutura, Eventos, Funcionalidades disponíveis, Imagens (+34 more)

### Community 8 - "track"
Cohesion: 0.10
Nodes (32): Frontend (`src/`), FinalCTA(), perks, ContactRequest(), openSheet(), submit(), ContactRequestProps, formatPhone() (+24 more)

### Community 9 - "Results.tsx"
Cohesion: 0.10
Nodes (34): clamp01(), CONVERSION_LABELS, CONVERSION_RULE, ConversionLevel, ConversionPotential, conversionPotential(), PropertyMetrics, asDate() (+26 more)

### Community 10 - "LeadDetail.tsx"
Cohesion: 0.14
Nodes (31): addNote(), createLead(), dateFormat, deleteLead(), deleteNote(), fail(), formatWhen(), getLead() (+23 more)

### Community 11 - "package.json"
Cohesion: 0.08
Nodes (33): dependencies, framer-motion@^11.11.17, lucide-react@^0.454.0, next@14.2.35, react@^18.3.1, react-dom@^18.3.1, devDependencies, autoprefixer@^10.4.20 (+25 more)

### Community 12 - "supabase.ts"
Cohesion: 0.16
Nodes (22): ACCENT_COLORS, brokerSlugFromPath(), brokerTenant(), firstName(), BrokerProfile, integrations, getSupabase(), DEFAULT_PRIMARY (+14 more)

### Community 13 - "mapProperty.ts"
Cohesion: 0.10
Nodes (25): vitest@^5.0.3, PropertyCardProps, TourCtaCardProps, TourEntryProps, setCatalogSnapshot(), snapshot, FALLBACK_BY_TYPE, KNOWN_TYPES (+17 more)

### Community 14 - "Property3DViewer.tsx"
Cohesion: 0.10
Nodes (22): loadModel(), LoadOptions, LoadProgress, LoadStage, nextPaint(), disposeModel(), PreparedModel, prepareModel() (+14 more)

### Community 15 - "PropertyDetails.tsx"
Cohesion: 0.18
Nodes (22): FavoriteButton(), PropertyCard(), PropertyGallery(), PropertySpecs(), Specs, Badge(), BadgeProps, Tone (+14 more)

### Community 16 - "BrokerProfile.tsx"
Cohesion: 0.14
Nodes (23): listTestimonials(), InstagramIcon(), copyLink(), shareLink(), whatsappShareHref(), BrokerAccent, BrokerTestimonial, shareProfile() (+15 more)

### Community 17 - "lazyPages.ts"
Cohesion: 0.14
Nodes (25): Account, ApprovedReport, AuthRoot, BrokerLayout, BrokerProfile, ClientDetail, ClientEditor, ClientList (+17 more)

### Community 18 - "eventSink.ts"
Cohesion: 0.13
Nodes (22): storedEventTypes, captureAttribution(), externalReferrer(), getAttribution(), getSessionId(), parseUtm(), randomId(), storage() (+14 more)

### Community 19 - "rls.test.mjs"
Cohesion: 0.12
Nodes (12): brokerShareMeta(), clip(), injectMeta(), money(), rasterImage(), TYPE, handler(), loadIndex() (+4 more)

### Community 20 - "legalize-one/package.json"
Cohesion: 0.11
Nodes (23): devDependencies, @electric-sql/pglite@^0.5.8, oxlint@^1.81.0, tailwindcss@^4.3.3, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, @types/three@^0.186.0 (+15 more)

### Community 21 - "Button.tsx"
Cohesion: 0.13
Nodes (20): BaseProps, ButtonLink(), classes(), Size, sizes, Variant, variants, listLeads() (+12 more)

### Community 22 - "page.tsx"
Cohesion: 0.14
Nodes (18): Home(), applications, Applications(), audience, Audience(), Comparison(), CourseBonus(), FAQ() (+10 more)

### Community 23 - "Property3DExperience.tsx"
Cohesion: 0.19
Nodes (17): 6. Reutilização (preservado), Property3DEntry(), Property3DEntryProps, Property3DExperience(), start(), Property3DViewer, mb(), Property3DLoader() (+9 more)

### Community 24 - "useTenant"
Cohesion: 0.19
Nodes (16): columns, Footer(), YEAR, Header(), isActive(), Logo(), LogoProps, mainNav (+8 more)

### Community 25 - "propertyService.ts"
Cohesion: 0.22
Nodes (17): properties, isBackendEnabled(), catalog(), getLocalCatalog(), getPropertyBySlug(), getTourById(), listFeaturedProperties(), listProperties() (+9 more)

### Community 26 - "cn"
Cohesion: 0.20
Nodes (11): BrokerAvatar(), BrokerContactCard(), FeaturedProperties(), PropertyCardSkeleton(), PropertyGalleryProps, kindLabel, SectionHeading(), SectionHeadingProps (+3 more)

### Community 27 - "ref_react"
Cohesion: 0.17
Nodes (16): BottomSheetProps, ModalOptions, useModal(), useSuppressStickyCta(), emit(), isTopOverlay(), listeners, pushOverlay() (+8 more)

### Community 28 - "TenantSettingsPage.tsx"
Cohesion: 0.18
Nodes (14): Field(), inputClass, Section(), Msg, AsyncState, Resolved, Account(), digits() (+6 more)

### Community 29 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 30 - "CheckoutLink"
Cohesion: 0.21
Nodes (15): next, CheckoutLink(), EquipmentCard(), EquipmentGrid(), EquipmentImage(), Props, FinalCTA(), Header() (+7 more)

### Community 31 - "LeadList.tsx"
Cohesion: 0.22
Nodes (17): cell(), CsvColumn, downloadCsv(), toCsv(), today(), sourceLabel(), exportCsv(), Filter (+9 more)

### Community 32 - "usePageTitle"
Cohesion: 0.24
Nodes (18): listBrokers(), listProperties(), useWorkspace(), useAsyncData(), usePageTitle(), ApprovedReport(), date(), PeriodKey (+10 more)

### Community 33 - "DashboardLayout.tsx"
Cohesion: 0.23
Nodes (13): useAuth(), RequireAuth(), ImpulsigoLogo(), PlatformMark(), countNewLeads(), visibleNav(), Login(), MfaStep() (+5 more)

### Community 34 - "Home.tsx"
Cohesion: 0.19
Nodes (13): Benefits(), DocumentationSection(), Hero(), heroImage, IconCircle(), IconCircleProps, benefits, documentationChecklist (+5 more)

### Community 35 - "ref_lucide_react"
Cohesion: 0.18
Nodes (9): Props, after, before, lessons, included, after, before, stack (+1 more)

### Community 36 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 37 - "Experience3D.tsx"
Cohesion: 0.24
Nodes (12): Experience3D(), AUTO_START_3D, AutoStart3DState, Property3DShowcase(), Property3DShowcaseProps, ImmersiveTourProps, ImmersiveTour, ImmersiveTourLoader() (+4 more)

### Community 38 - "react-router"
Cohesion: 0.28
Nodes (12): defaultActions(), icons, MobileStickyCTA(), useKeyboardOpen(), PageViewTracker(), PreviewBanner(), ScrollManager(), SiteLayout() (+4 more)

### Community 39 - "workspace.ts"
Cohesion: 0.21
Nodes (13): NAV, NavItem, Workspace, WorkspaceContext, WorkspaceState, readStored(), TenantRow, WorkspaceProvider() (+5 more)

### Community 40 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 41 - "context.ts"
Cohesion: 0.26
Nodes (12): AuthProvider(), loadUser(), SIGNED_OUT, Snapshot, AuthContext, AuthState, friendlyAuthError(), friendlyPasswordError() (+4 more)

### Community 42 - "SmartImage"
Cohesion: 0.30
Nodes (9): SceneThumbnails(), TourCtaCard(), TourEntry(), SmartImage(), Status, buildSrcSet(), ImageOptions, resizeImage() (+1 more)

### Community 43 - "TwoFactorSection"
Cohesion: 0.28
Nodes (12): @supabase/supabase-js@^2.117.2, Enrollment, friendlyMfaError(), removeFactor(), startEnrollment(), verifiedFactors(), verifyTotp(), TwoFactorSection() (+4 more)

### Community 44 - "WhatsAppSupport.tsx"
Cohesion: 0.27
Nodes (9): handleClick(), trackWhatsAppSupportClick(), WhatsAppSupport(), analytics, getUtmParams(), isGoogleAnalyticsEnabled(), isMetaPixelEnabled(), trackEvent() (+1 more)

### Community 45 - "vercel.json"
Cohesion: 0.17
Nodes (11): includeFiles, buildCommand, crons, framework, functions, api/share.js, headers, installCommand (+3 more)

### Community 46 - "layout.tsx"
Cohesion: 0.23
Nodes (7): inter, jbmono, metadata, RootLayout(), MetaPixel(), site, whatsapp

### Community 47 - "lib/analytics.ts"
Cohesion: 0.22
Nodes (8): listeners, subscribe(), useFavorites(), write(), AnalyticsEvent, EventPayload, metaStandardEvents, Window

### Community 48 - "main.tsx"
Cohesion: 0.22
Nodes (6): @fontsource-variable/inter@^5.3.0, @fontsource-variable/inter-tight@^5.3.0, App(), router, @fontsource-variable/inter, @fontsource-variable/inter-tight

### Community 49 - "EquipmentArt.tsx"
Cohesion: 0.47
Nodes (9): AirCoolerArt(), EquipmentArt(), FlotadorArt(), FornoArt(), Frame(), MotorCompressorArt(), Props, TanqueArt() (+1 more)

### Community 50 - "dependencies"
Cohesion: 0.22
Nodes (9): dependencies, lucide-react@^1.49.0, react@^19.2.8, react-dom@^19.2.8, react-router@^8.4.0, three@^0.186.1, lucide-react, react (+1 more)

### Community 51 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, catalog:export, dev, lint, preview, test, test:db (+1 more)

### Community 52 - "export-catalog.ts"
Cohesion: 0.31
Nodes (5): mediaRows, propertyRows, uuidFrom(), DEFAULT_TOUR_ID, tours

### Community 53 - "Materials.tsx"
Cohesion: 0.36
Nodes (5): Material, materialMessage(), MATERIALS, MaterialCard(), Materials()

### Community 54 - "vite.config.ts"
Cohesion: 0.25
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.3.0, @vitejs/plugin-react@^6.1.1, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 55 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `mapProperty.ts` to `requireSupabase`, `team/index.ts`, `Platform.tsx`, `Results.tsx`, `supabase.ts`, `eventSink.ts`, `rls.test.mjs`, `legalize-one/package.json`, `Button.tsx`, `propertyService.ts`, `LeadList.tsx`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `track()` (e.g. with `Funcionalidades disponíveis` and `Pontos de integração`) actually correct?**
  _`track()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `requireSupabase` be split into smaller, more focused modules?**
  _Cohesion score 0.05841584158415842 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `requireSupabase`, `cameraGoals.ts`, `tour.ts`, `PropertySearch.tsx`, `Platform.tsx`, `PropertyEditor.tsx`, `track`, `Results.tsx`, `LeadDetail.tsx`, `Property3DViewer.tsx`, `PropertyDetails.tsx`, `BrokerProfile.tsx`, `Button.tsx`, `Property3DExperience.tsx`, `useTenant`, `ref_react`, `TenantSettingsPage.tsx`, `LeadList.tsx`, `usePageTitle`, `DashboardLayout.tsx`, `Home.tsx`, `Experience3D.tsx`, `react-router`, `SmartImage`, `TwoFactorSection`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Should `cameraGoals.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05970149253731343 - nodes in this community are weakly interconnected._
- **Why does `react-router` connect `react-router` to `requireSupabase`, `PropertySearch.tsx`, `Platform.tsx`, `PropertyEditor.tsx`, `track`, `Results.tsx`, `LeadDetail.tsx`, `PropertyDetails.tsx`, `lazyPages.ts`, `legalize-one/package.json`, `Button.tsx`, `Property3DExperience.tsx`, `useTenant`, `cn`, `TenantSettingsPage.tsx`, `LeadList.tsx`, `usePageTitle`, `DashboardLayout.tsx`, `Home.tsx`, `Experience3D.tsx`, `context.ts`, `main.tsx`, `dependencies`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `tour.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06398730830248546 - nodes in this community are weakly interconnected._