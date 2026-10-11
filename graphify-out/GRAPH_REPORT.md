# Graph Report - Vortexa 3.0  (2026-10-11)

## Corpus Check
- 105 files · ~89,859 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .ico 1)

## Summary
- 495 nodes · 848 edges · 24 communities (20 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Control Room & Disruption UI
- Auth, Session & RBAC Middleware
- Shared Contracts & Zod Schemas
- Next.js Web Tooling
- Drizzle Database & PostGIS Schema
- Design System & Theme Tokens
- Monorepo Root Infrastructure
- Orders CRUD & Telemetry
- Database Drizzle Configuration
- TypeScript Compiler Options
- Audit Logging & Security Events
- Fleet Telemetry & Status Cards
- Driver Web Portal & Stops
- Plan Ingestion & Excel Parser
- Valhalla Routing & Distance Matrix
- FastAPI Optimizer Worker Service
- Logistics Subsystem 16
- Logistics Subsystem 17
- Logistics Subsystem 18
- Logistics Subsystem 19
- Logistics Subsystem 20
- Logistics Subsystem 21
- Logistics Subsystem 22

## God Nodes (most connected - your core abstractions)
1. `react` - 36 edges
2. `lucide-react` - 31 edges
3. `next` - 28 edges
4. `AppShell()` - 26 edges
5. `Button` - 24 edges
6. `StatusBadge()` - 18 edges
7. `compilerOptions` - 16 edges
8. `Breadcrumb()` - 13 edges
9. `DataTable()` - 13 edges
10. `Alert()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Control Room Dashboard Cockpit` ----> `Product Requirements Document (PRD)`  [EXTRACTED]
  apps/web/app/page.tsx → PRD.md
- `Excel & CSV Plan Ingestion Engine` ----> `Technical Requirements Document (TRD)`  [EXTRACTED]
  apps/web/lib/ingestion/plan-parser.ts → TRD.md
- `Valhalla Routing & Distance Matrix` ----> `Technical Requirements Document (TRD)`  [EXTRACTED]
  apps/web/lib/routing/valhalla.ts → TRD.md
- `Design System & UI Tokens` ----> `Control Room Dashboard Cockpit`  [EXTRACTED]
  Design.md → apps/web/app/page.tsx
- `Design System & UI Tokens` ----> `Driver Web Application Portal`  [EXTRACTED]
  Design.md → apps/web/app/driver/page.tsx

## Import Cycles
- None detected.

## Communities (24 total, 4 thin omitted)

### Community 0 - "Control Room & Disruption UI"
Cohesion: 0.08
Nodes (59): DisruptionsPage(), Incident, DriverStop, DriverWebPortalPage(), VehicleDetailContent(), VehicleDetailPage(), LiveMonitorPage(), OrderItem (+51 more)

### Community 1 - "Auth, Session & RBAC Middleware"
Cohesion: 0.05
Nodes (40): LoginRequestSchema, POST(), POST(), GET(), PositionUpdateSchema, UpdateOrderSchema, CreatePlanRequestSchema, demoPlans (+32 more)

### Community 2 - "Shared Contracts & Zod Schemas"
Cohesion: 0.04
Nodes (47): BrokenReasonCode, BrokenReasonCodeSchema, ComparisonClass, ComparisonClassSchema, Coordinates, CoordinatesSchema, CreateOrder, CreateOrderSchema (+39 more)

### Community 3 - "Next.js Web Tooling"
Cohesion: 0.05
Nodes (38): eslintConfig, dependencies, bcryptjs, @dispatchx/contracts, lucide-react, next, react, react-dom (+30 more)

### Community 4 - "Drizzle Database & PostGIS Schema"
Cohesion: 0.06
Nodes (31): comparisonClassEnum, customerNotifications, customers, deliveryChangeRecords, deliveryEvents, deliveryStatusEnum, fleetBriefings, generatedAudio (+23 more)

### Community 5 - "Design System & Theme Tokens"
Cohesion: 0.10
Nodes (20): inter, jetbrainsMono, metadata, RootLayout(), Header(), HeaderProps, Theme, ThemeContext (+12 more)

### Community 6 - "Monorepo Root Infrastructure"
Cohesion: 0.10
Nodes (20): description, devDependencies, prettier, typescript, vitest, engines, node, npm (+12 more)

### Community 7 - "Orders CRUD & Telemetry"
Cohesion: 0.15
Nodes (14): CreateOrderSchema, inMemoryOrders, OrderRecord, POST(), FLEET_MAX_VOLUME_M3, FLEET_MAX_WEIGHT_KG, FORMULA_INJECTION_CHARS, hasFormulaInjection() (+6 more)

### Community 8 - "Database Drizzle Configuration"
Cohesion: 0.10
Nodes (18): dependencies, drizzle-orm, postgres, devDependencies, drizzle-kit, typescript, typescript, main (+10 more)

### Community 9 - "TypeScript Compiler Options"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "Audit Logging & Security Events"
Cohesion: 0.15
Nodes (8): RecordAuditEventParams, db, sql, auditEvents, vehicles, generateUuidV7, drizzle-orm, postgres

### Community 11 - "Fleet Telemetry & Status Cards"
Cohesion: 0.19
Nodes (12): FleetOverviewPage(), FleetStatusCard(), FleetVehicle, Input, InputProps, SearchInput(), SearchInputProps, Textarea (+4 more)

### Community 12 - "Driver Web Portal & Stops"
Cohesion: 0.14
Nodes (13): dependencies, zod, devDependencies, typescript, typescript, main, name, private (+5 more)

### Community 13 - "Plan Ingestion & Excel Parser"
Cohesion: 0.18
Nodes (10): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, skipLibCheck, strict (+2 more)

### Community 14 - "Valhalla Routing & Distance Matrix"
Cohesion: 0.18
Nodes (10): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, skipLibCheck, strict (+2 more)

### Community 15 - "FastAPI Optimizer Worker Service"
Cohesion: 0.24
Nodes (5): RFC-9562, DEMO_IDS, DEMO_LOCATIONS, uuidv7(), vitest

### Community 16 - "Logistics Subsystem 16"
Cohesion: 0.29
Nodes (8): Design System & UI Tokens, Control Room Dashboard Cockpit, Driver Web Application Portal, ElevenLabs Voice AI System, Product Requirements Document (PRD), Excel & CSV Plan Ingestion Engine, Technical Requirements Document (TRD), Valhalla Routing & Distance Matrix

### Community 17 - "Logistics Subsystem 17"
Cohesion: 0.25
Nodes (5): Checkbox, CheckboxProps, RadioGroupProps, RadioOption, ToggleProps

### Community 18 - "Logistics Subsystem 18"
Cohesion: 0.38
Nodes (5): DEMO_FALLBACK_MATRIX, fetchTravelTimeMatrix(), LatLng, MatrixResponse, RouteGeometry

### Community 20 - "Logistics Subsystem 20"
Cohesion: 0.67
Nodes (3): Skeleton(), SkeletonProps, TableSkeletonRows()

## Knowledge Gaps
- **17 isolated node(s):** `@dispatchx/contracts`, `react-dom`, `@tailwindcss/turbopack`, `@types/bcryptjs`, `@types/node` (+12 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 299 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Auth, Session & RBAC Middleware` to `Control Room & Disruption UI`, `Next.js Web Tooling`, `Design System & Theme Tokens`, `Orders CRUD & Telemetry`, `Audit Logging & Security Events`, `Fleet Telemetry & Status Cards`?**
  _High betweenness centrality (0.413) - this node is a cross-community bridge._
- **What connects `@dispatchx/contracts`, `react-dom`, `@tailwindcss/turbopack` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Control Room & Disruption UI` be split into smaller, more focused modules?**
  _Cohesion score 0.08431195423065342 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `Auth, Session & RBAC Middleware` to `Shared Contracts & Zod Schemas`, `Driver Web Portal & Stops`, `Orders CRUD & Telemetry`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Should `Auth, Session & RBAC Middleware` be split into smaller, more focused modules?**
  _Cohesion score 0.051560379918588875 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `FastAPI Optimizer Worker Service` to `Auth, Session & RBAC Middleware`, `Logistics Subsystem 18`, `Monorepo Root Infrastructure`, `Orders CRUD & Telemetry`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Should `Shared Contracts & Zod Schemas` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._