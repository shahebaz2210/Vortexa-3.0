<div align="center">

# ⚡ DispatchX (VORTEXA 3.0 / ReRoute)
### Autonomous, Human-in-the-Loop Dynamic Logistics Dispatch & Disruption Recovery

[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js_15_App_Router-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_Python_3.12-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![OR-Tools](https://img.shields.io/badge/Optimization-Google_OR--Tools-4285F4?logo=google)](https://developers.google.com/optimization)
[![PostGIS](https://img.shields.io/badge/Spatial_DB-PostgreSQL_16_%2B_PostGIS-336791?logo=postgresql)](https://postgis.net/)
[![ElevenLabs](https://img.shields.io/badge/Voice_AI-ElevenLabs_TTS_%2F_STT-FF5A5F)](https://elevenlabs.io/)
[![Valhalla](https://img.shields.io/badge/Routing-Valhalla_OSM-008080)](https://valhalla.github.io/valhalla/)
[![Graphify](https://img.shields.io/badge/Knowledge_Graph-Graphify-8A2BE2)](https://github.com/safishamsi/graphify)

*High-precision, resilient fleet operations control room for real-time delivery management, automated disruption rerouting, and multi-channel driver/customer communications.*

---

</div>

## 📌 Executive Summary

Modern urban logistics networks face constant disruptions: vehicle breakdowns, flash road closures, emergency priority orders, and severe traffic spikes. When an incident occurs, traditional dispatchers spend 30–60 minutes manually rescheduling drivers over phone calls, leading to broken delivery windows, SLA penalties, and frustrated customers.

**DispatchX** solves this with an intelligent, self-healing dispatch loop:
1. **Instant Incident Ingestion:** Drivers report incidents verbally or via app; **ElevenLabs** transcribes speech into structured disruption telemetry in real time.
2. **Sub-Second Dynamic Re-optimization:** The **Google OR-Tools** VRPTW (Vehicle Routing Problem with Time Windows) engine freezes completed stops, redistributes orphaned deliveries across available fleet capacity, and computes traffic-aware routes via **Valhalla**.
3. **Visual Human-in-the-Loop Approval:** Dispatchers review a side-by-side before/after route diff and impact metrics (+cost, +mileage, SLA projections) with zero risk of unvetted automated changes.
4. **Atomic Route Activation & Auto-Dispatch:** Route updates commit atomically to PostgreSQL, new manifests push to driver devices, and **ElevenLabs** synthesizes automated phone/SMS updates to affected customers with revised ETAs.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
  subgraph Field ["🚚 The Live Field"]
    Driver["Driver (Mobile App / Voice Channel)"]
    Customer["Customer (Delivery Recipient)"]
  end

  subgraph WebWorkspace ["🖥️ Dispatcher Control Room (Next.js 15 SPA)"]
    LiveMap["Interactive Fleet Map (MapLibre GL + OSM)"]
    Copilot["AI Copilot Disruption Panel"]
    DiffModal["Side-by-Side Proposal Diff & Approval"]
    ScheduleGrid["Plan Schedule & Shift Manifests"]
  end

  subgraph CoreServices ["⚡ DispatchX Backend Engine"]
    FastAPI["FastAPI REST & WebSocket Gateway"]
    JobQueue["PostgreSQL SKIP LOCKED Job Queue"]
    Solver["Google OR-Tools VRPTW Solver"]
    Routing["Valhalla Routing Engine (Matrix & Geometry)"]
    VoiceEngine["ElevenLabs Voice Hub (STT & TTS)"]
  end

  subgraph StateOfTruth ["🐘 State of Truth"]
    DB[("PostgreSQL 16 + PostGIS Spatial DB")]
  end

  Driver -- "Voice Incident (Audio)" --> FastAPI
  FastAPI -- "STT Transcription" --> VoiceEngine
  FastAPI -- "Real-time Telemetry (WS)" --> WebWorkspace
  WebWorkspace -- "Confirm Disruption & Replan" --> FastAPI
  FastAPI --> JobQueue --> Solver
  Solver --> Routing
  Solver --> DB
  Solver -- "Proposal (Diff & Impact)" --> DiffModal
  DiffModal -- "Atomic Approve & Apply" --> FastAPI
  FastAPI --> DB
  FastAPI --> VoiceEngine
  VoiceEngine -- "Dynamic Voice Update (TTS)" --> Customer
  FastAPI -- "Updated Route Manifest" --> Driver
```

---

## ⚡ Core Pillars & Key Features

### 1. 🧠 Sub-Second VRPTW Optimization
- Multi-dimensional vehicle capacity constraints (weight in kg, volume in m³).
- Hard customer delivery time windows, stop service durations, and waiting times.
- Hierarchical objective function: Tier 1 (prioritize deliveries), Tier 2 (minimize route churn), Tier 3 (minimize fuel/operating cost).
- Explainable infeasibility diagnostics with clear numeric evidence for unassigned packages.

### 2. 🛡️ Absolute Logistics Invariants & Safety
- **INV-01 (Immutability):** Completed deliveries are permanently frozen; historical proof-of-delivery events can never be altered.
- **INV-04/05 (Atomic Activation):** Proposals are strictly versioned. Applying a proposal requires a concurrency check against the latest live fleet snapshot to prevent race conditions.
- **INV-07 (No False Optimism):** Live routes and notifications only transition on authoritative server confirmation.

### 3. 🎙️ Voice-First Disruption & Communications with ElevenLabs
- **Speech-to-Text Incident Reporting:** Drivers dictate road hazards or mechanical failures hands-free; ElevenLabs transcribes and structures the incident.
- **Dynamic Customer Outreach:** ElevenLabs Text-to-Speech (TTS) automatically produces studio-quality audio alerts informing customers of revised delivery ETAs.
- **Executive Fleet Audio Briefings:** Shift supervisors receive an automated, high-fidelity spoken morning/afternoon fleet briefing ($\le$ 120 words).

### 4. 🗺️ High-Density Control Room UI
- Precision slate aesthetic tailored for high-information density.
- MapLibre GL JS vector map with real-time vehicle breadcrumbs, color-coded route lines, and traffic incidents.
- 5-KPI live performance strip: *Total Delivered, Active Fleet, On-Time SLA %, Load Utilization, Active Incidents*.
- Daily shift manifests, weekly fleet schedule matrices, and accessible audio players.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | **Next.js 15 (App Router)** | High-performance React SPA control room |
| **Language & Typing** | **TypeScript 5.x (Strict)** | End-to-end type safety |
| **Styling & Design System** | **Tailwind CSS v4** | Precision slate UI, data-dense components |
| **Icons & Typography** | **Lucide React**, Inter, JetBrains Mono | Clean iconography & tabular numeric legibility |
| **Mapping Engine** | **MapLibre GL JS**, OpenStreetMap | Vector maps, vehicle markers, dynamic route lines |
| **Optimization Backend** | **FastAPI (Python 3.12)** | Asynchronous solver microservice & job worker |
| **Constraint Solver** | **Google OR-Tools** | Vehicle Routing Problem with Time Windows (VRPTW) |
| **Spatial Database** | **PostgreSQL 16 + PostGIS** | Geospatial queries, spatial indexing, Drizzle ORM |
| **Voice & Speech AI** | **ElevenLabs (TTS & STT)** | Voice incident intake, customer audio alerts, fleet briefings |
| **Road Network Routing** | **Valhalla** | Turn-by-turn routing, distance/duration matrix |
| **Knowledge Graph** | **Graphify (AST + GraphRAG)** | Persistent architectural graph and relationship tracing |

---

## 📂 Project Organization

```
Vortexa-3.0/
├── .agents/                    # Antigravity agent workflows & graphify rules
├── apps/
│   └── web/                    # Next.js 15 Dispatcher Workspace
│       ├── app/                # App Router pages (Dashboard, Plans, Incidents, Fleet)
│       ├── components/         # Reusable UI widgets, map controls, audio player
│       └── lib/                # API client, WebSocket handlers, state stores
├── services/
│   └── optimizer/              # Python 3.12 FastAPI Solver Worker
│       ├── solver/             # OR-Tools VRPTW models, objective formulation
│       ├── routing/            # Valhalla matrix & route geometry adapter
│       └── voice/              # ElevenLabs TTS/STT integration client
├── packages/
│   ├── contracts/              # Shared Zod schemas & TypeScript/Python interfaces
│   └── database/               # PostgreSQL schema, Drizzle ORM, PostGIS migrations
├── infra/
│   └── docker/                 # Docker Compose configurations (Postgres, Valhalla, Worker)
├── Appflow.md                  # Detailed Screen & State Machine Specifications
├── Design.md                   # UI/UX Specifications, Color Tokens & Components
├── PRD.md                      # Product Requirements Document
├── TRD.md                      # Technical Architecture Document
└── TODO.md                     # 358 Atomic Implementation Tasks across 21 Phases
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+ & `npm` / `pnpm`
- **Python** 3.12+ (or `uv`)
- **Docker** & Docker Compose
- **ElevenLabs API Key** (`ELEVENLABS_API_KEY`)

### 1. Clone & Set Environment
```bash
git clone https://github.com/shahebaz2210/Vortexa-3.0.git
cd Vortexa-3.0
cp .env.example .env
```

Ensure your `.env` contains:
```env
DATABASE_URL=postgresql://dispatch:dispatch@localhost:5432/dispatchx
ELEVENLABS_API_KEY=your_elevenlabs_key_here
VALHALLA_URL=http://localhost:8002
OPTIMIZER_WORKER_URL=http://localhost:8000
```

### 2. Start Infrastructure
```bash
docker compose up -d
```
*Spins up PostgreSQL 16 with PostGIS, Valhalla routing engine, and Python optimization worker.*

### 3. Install Dependencies & Run Web App
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the DispatchX Control Room.

---

## 🗺️ Roadmap & Implementation Tracker

The project implementation is systematically tracked in [TODO.md](TODO.md) across **21 sequential phases** (358 atomic tasks):

- **Phase 1–4:** Monorepo scaffolding, Docker dev environment, PostGIS migrations, Auth, Data seeding.
- **Phase 5–6:** MapLibre integration, Valhalla matrix engine, OR-Tools VRPTW solver & worker queue.
- **Phase 7–10:** Plan view UI, Voice incident reporting (ElevenLabs), Re-optimization diffing, Atomic route activation.
- **Phase 11–14:** Control Room Dashboard, Plan Schedule matrix, ElevenLabs customer voice notifications & audio briefings.
- **Phase 15–18:** Resilient error fallbacks, WCAG 2.1 AA accessibility, OpenTelemetry observability, Security hardening.
- **Phase 19–21:** End-to-end integration tests, CI/CD pipelines, and Demo scenario readiness.

---

## 🧠 Knowledge Graph with Graphify

DispatchX utilizes **Graphify** for continuous knowledge graph generation, code dependency mapping, and architectural tracing:
- Run `/graphify .` to re-extract AST structural nodes and semantic relationships.
- Output artifacts live in `graphify-out/` (`graph.html`, `graph.json`, `GRAPH_REPORT.md`).

---

## 📄 License & Attribution

Designed and engineered for **Vortexa Logistics / DispatchX**.  
All rights reserved © 2026.
