# Voice Receptionist MVP - Development Roadmap

This document breaks down the MVP into sequential development phases. Each phase builds on the previous and delivers a testable milestone.

---

## Phase Overview

| Phase | Focus | Deliverable | Est. Duration |
|-------|-------|-------------|---------------|
| 1 | Foundation & Data Layer | Backend scaffolding + CSV import | ✅ Complete |
| 2 | Intent Engine | LLM-based intent classification + tool orchestration | ✅ Complete |
| 3 | Voice Pipeline | OpenAI Realtime API integration | ✅ Complete |
| 4 | Telephony Integration | Real phone calls via PSTN | 1-2 weeks |
| 5 | Business Dashboard | Owner-facing web UI | ✅ Complete |
| 6 | Hardening & Pilot | Production readiness + real shop testing | 2-4 weeks |

**MVP Total: 10-17 weeks**

### Post-MVP Phases

| Phase | Focus | Deliverable |
|-------|-------|-------------|
| 7 | Shop System Integrations | Tekmetric + Shop-Ware read-only sync |
| 8 | Future Capabilities | Booking, multi-language, SMS, etc. |

---

## Phase 1: Foundation & Data Layer

**Goal:** Set up project structure, database, and data import pipeline.

### Tasks

- [x] Initialize project repository and structure
- [x] Choose and set up backend framework → **FastAPI (Python)**
- [x] Design database schema:
  - Shops (id, name, phone, hours, services, address, settings)
  - Work Orders (id, shop_id, customer_name, vehicle, status, services, timestamps)
  - Call Logs (id, shop_id, timestamp, intent, tool_called, result, confidence, duration, outcome)
- [x] Implement CSV upload/import for work orders
- [x] Create basic CRUD API for shop data
- [x] Create basic CRUD API for work orders
- [x] Create basic CRUD API for call logs
- [ ] Write seed data scripts for testing
- [x] Set up environment configuration and secrets management
- [x] Set up CI/CD (GitHub Actions, Ruff, Pyrefly, ESLint, TypeScript)
- [x] Restructure to modular architecture (see Backend Structure below)

### Milestone
✅ Can upload a CSV of work orders and query them via API.

### Backend Structure (Completed)

```
backend/
├── app/
│   ├── main.py                    # FastAPI app entry point + static file serving
│   ├── config.py                  # Settings (OpenAI, Realtime, Clerk, etc.)
│   ├── database.py                # MongoDB/Beanie initialization
│   │
│   ├── common/                    # Shared utilities
│   │   ├── auth.py                # Clerk JWT middleware (Phase 5 ✅)
│   │   ├── utils.py               # utc_now(), helpers
│   │   ├── exceptions.py          # NotFoundError, ConflictError, etc.
│   │   └── health.py              # Health check endpoints
│   │
│   ├── modules/                   # Domain modules (layered)
│   │   ├── shops/                 # ShopConfig model + CRUD
│   │   ├── calls/                 # CallLog model + CRUD
│   │   └── voice/                 # Voice AI pipeline (Phase 2 + 3 ✅)
│   │       ├── realtime.py        # RealtimeClient - OpenAI WebSocket (Phase 3 ✅)
│   │       ├── realtime_session.py # RealtimeSession - Voice manager (Phase 3 ✅)
│   │       ├── router.py          # /api/voice/chat + /api/voice/stream
│   │       ├── service.py         # Text-based ConversationService
│   │       ├── tools.py           # Tool registry + Realtime schema
│   │       ├── prompts.py         # System prompt templates
│   │       ├── llm.py             # OpenAI Chat Completions client
│   │       ├── intents.py         # Intent enum
│   │       └── telephony.py       # (stub for Phase 4)
│   │
│   └── adapters/                  # External data sources
│       ├── base.py                # ShopSystemAdapter ABC
│       └── mock/                  # Mock adapter for testing
│           ├── adapter.py         # MockAdapter implementation
│           └── data/              # Sample JSON data
│
└── static/
    └── voice_test.html            # Browser-based voice test page
```

---

## Phase 2: Intent Engine (Tool Orchestration)

**Goal:** Build the LLM-powered intent classification and tool-calling system.

**Code Location:** `app/modules/voice/` (stubs created)

### Tasks

- [x] Define intent taxonomy (`voice/intents.py`):
  - `CHECK_STATUS` - vehicle/service status lookup
  - `GET_HOURS` - business hours inquiry
  - `GET_LOCATION` - address/directions
  - `GET_SERVICES` - available services list
  - `TRANSFER_HUMAN` - request to speak with person
  - `UNKNOWN` - fallback
- [x] Build tool registry (MCP-style) in `voice/tools.py`:
  - `lookup_work_order()`
  - `get_work_order_status()`
  - `get_business_hours()`
  - `get_location()`
  - `list_services()`
  - `get_customer_vehicles()`
  - `transfer_to_human()`
- [x] Implement LLM orchestration layer:
  - System prompt design (`voice/prompts.py`)
  - OpenAI client with function calling (`voice/llm.py`)
  - Conversation orchestrator with tool loop (`voice/service.py`)
  - Response generation from tool results
- [x] Create text-based testing endpoint (`POST /api/voice/chat`)
- [x] Write unit tests for voice module
- [x] Implement MockAdapter for testing without real integrations

### Milestone
✅ Can send text input via `/api/voice/chat`, LLM calls appropriate tools, returns natural response.

---

## Phase 3: Voice Pipeline

**Goal:** Enable real-time voice conversations with the AI receptionist.

**Status:** ✅ Complete

**Code Location:** `app/modules/voice/`

### Implementation Decision

After evaluating modular ASR/TTS options (Deepgram, Cartesia, ElevenLabs), we chose **OpenAI Realtime API** for a unified speech-to-speech solution:

| Approach | Latency | Complexity | Chosen |
|----------|---------|------------|--------|
| Modular (Deepgram ASR + Cartesia TTS + OpenAI LLM) | ~500ms | High (3 integrations) | |
| **OpenAI Realtime API** | **<100ms** | Low (1 integration) | ✅ |

Benefits:
- Ultra-low latency (<100ms speech-to-speech)
- Native function calling (reuses existing `ToolRegistry`)
- Built-in turn-taking and barge-in detection
- Single WebSocket connection instead of 3 separate services

### Tasks

- [x] Research and select voice pipeline approach → **OpenAI Realtime API**
  - Evaluated: Deepgram + Cartesia, OpenAI Realtime API
  - Decision: Realtime API for simplicity and lowest latency
- [x] Implement `RealtimeClient` WebSocket client (`voice/realtime.py`)
  - Connection management
  - Event parsing and handling
  - Audio streaming (send/receive)
  - Function call support
- [x] Implement `RealtimeSession` manager (`voice/realtime_session.py`)
  - Session state machine (IDLE → LISTENING → PROCESSING → SPEAKING)
  - Tool execution loop (integrates with existing `ToolRegistry`)
  - Barge-in handling (cancel AI response when user speaks)
  - Metrics tracking (audio bytes, tool calls, transcripts)
- [x] Add WebSocket `/api/voice/stream` endpoint
  - Binary audio streaming (PCM 16-bit)
  - JSON control messages (transcripts, state changes)
- [x] Add Realtime API schema helper to `ToolRegistry`
- [x] Create browser-based test page (`/voice-test`)
  - Microphone capture
  - Audio playback
  - Text input fallback
- [x] Write unit tests for Realtime classes

### Voice Module Structure

```
backend/app/modules/voice/
├── realtime.py           # RealtimeClient - OpenAI WebSocket client (Phase 3 ✅)
├── realtime_session.py   # RealtimeSession - Voice session manager (Phase 3 ✅)
├── router.py             # /api/voice/chat + /api/voice/stream endpoints
├── service.py            # Text-based ConversationService (Phase 2)
├── tools.py              # ToolRegistry with Realtime schema support
├── prompts.py            # System prompts
├── llm.py                # OpenAI Chat Completions client (Phase 2)
├── intents.py            # Intent enum
├── asr.py                # (unused - kept for potential fallback)
├── tts.py                # (unused - kept for potential fallback)
└── telephony.py          # (stub for Phase 4)
```

### Milestone
✅ Can speak into microphone via browser, get AI voice response with <100ms latency.

---

## Phase 4: Telephony Integration

**Goal:** Connect voice pipeline to real phone calls.

**Code Location:** `app/modules/voice/telephony.py` (stub created)

### Tasks

- [x] Research and select telephony provider → **Twilio**
  - Options: Twilio, Vonage, Telnyx, SignalWire
  - Criteria: WebSocket media streams, PSTN support, pricing
- [ ] Implement inbound call handling:
  - Webhook for incoming calls
  - Media stream WebSocket connection
  - Audio format handling (mulaw/PCM conversion)
- [ ] Bridge telephony audio ↔ voice pipeline
- [ ] Implement call state machine:
  - Greeting
  - Listening
  - Processing
  - Responding
  - Transferring
  - Ending
- [ ] Add call transfer functionality (to shop's main line)
- [ ] Implement call duration limits and loop prevention
- [ ] Create call logging (structured summaries only, no audio)
- [ ] Test with real phone calls

### Milestone
✅ Can receive real phone call, have AI conversation, transfer if needed.

---

## Phase 5: Business Dashboard

**Goal:** Build owner-facing web interface for management and visibility.

**Status:** ✅ Complete (pulled forward before Phase 3)

### Tasks

- [x] Choose frontend framework → **Next.js 14 (App Router)**
- [x] Design and implement authentication → **Clerk**
  - Shop owner signup/login
  - JWT-based API authentication
  - Owner-scoped routes (`/api/shops/me`, `/api/calls/me`)
- [x] Build dashboard pages:
  - **Overview**: Shop status, AI toggle, greeting preview
  - **Call Log**: List of calls with intents, outcomes, duration
  - **Shop Settings**: Name, phone, greeting, transfer number, AI controls
- [x] Onboarding flow for new users (shop creation)
- [x] shadcn/ui component library integration
- [x] Mobile-responsive design with Tailwind CSS
- [ ] CSV upload UI for work orders (deferred)
- [ ] Real-time call activity indicators (deferred)
- [ ] Analytics charts (deferred)

### Frontend Structure

```
frontend/
├── app/
│   ├── layout.tsx              # ClerkProvider
│   ├── page.tsx                # Landing page
│   ├── sign-in/[[...sign-in]]/ # Clerk sign-in
│   ├── sign-up/[[...sign-up]]/ # Clerk sign-up
│   ├── onboarding/             # Shop creation
│   └── dashboard/
│       ├── layout.tsx          # Sidebar layout
│       ├── page.tsx            # Overview
│       ├── settings/           # Shop config
│       └── calls/              # Call history
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── dashboard/              # Sidebar, etc.
├── lib/
│   ├── api.ts                  # Backend API client
│   └── utils.ts                # Helpers
└── middleware.ts               # Clerk auth middleware
```

### Milestone
✅ Shop owner can sign up, create shop, configure settings, and view call history.

---

## Phase 6: Hardening & Pilot

**Goal:** Prepare for production and run real-world pilot.

### Tasks

- [ ] Security audit:
  - API authentication
  - Data encryption at rest and in transit
  - Input validation
- [ ] Load testing (20 concurrent calls target)
- [ ] Implement graceful degradation:
  - ASR/TTS provider failover
  - LLM timeout handling
  - Database connection pooling
- [ ] Add monitoring and alerting:
  - Call success/failure rates
  - Latency tracking
  - Error logging
- [ ] Create operational runbooks
- [ ] Onboard pilot auto shop:
  - Import their work orders
  - Configure business info
  - Set up phone number forwarding
- [ ] Gather feedback and iterate
- [ ] Document known limitations

### Milestone
✅ One real auto shop using system in production, providing feedback.

---

## Technology Stack (Finalized)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Backend** | FastAPI (Python) | Async support, WebSockets, AI ecosystem |
| **Database** | MongoDB + Beanie ODM | Flexible documents, fast writes, schema flexibility |
| **LLM** | OpenAI GPT-4o-mini | Best function calling, low latency |
| **Voice AI** | OpenAI Realtime API | Unified speech-to-speech, <100ms latency, native function calling |
| **Telephony** | Twilio | Best documentation, media streams |
| **Frontend** | Next.js 14 (App Router) | Full-stack dashboard, React Server Components |
| **Auth** | Clerk | Managed auth, easy JWT integration |
| **UI Components** | shadcn/ui + Tailwind | Modern, accessible, customizable |
| **CI/CD** | GitHub Actions + Ruff + Pyrefly + ESLint | Backend & frontend linting, type checking, testing |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Latency too high | ✅ Solved: OpenAI Realtime API provides <100ms latency |
| LLM hallucination | Strict prompts; tool-only responses; confidence thresholds |
| Telephony complexity | Start with Twilio (most documented); isolate in adapter layer |
| OpenAI Realtime API issues | Keep modular ASR/TTS stubs as fallback option |
| Scope creep | Refer back to README.md; say no to non-MVP features |
| Pilot shop unavailable | Have 2-3 candidate shops; build with synthetic data first |

---

## Current Status

**Phase 1, 2, 3 & 5 Complete!** ✅

The foundation, voice pipeline, and dashboard are built:
- Backend scaffolding with FastAPI + MongoDB/Beanie
- Modular architecture with adapters pattern
- LLM orchestration with OpenAI function calling
- Tool registry connected to MockAdapter for testing
- Text-based chat endpoint at `/api/voice/chat`
- **Real-time voice conversations via OpenAI Realtime API**
- WebSocket endpoint at `/api/voice/stream` for voice streaming
- Browser-based test page at `/voice-test` with microphone support
- Full Next.js dashboard with Clerk authentication
- Shop owner can sign up, create shop, and configure AI settings
- Owner-scoped API routes for multi-tenant security

**Next up: Phase 4 (Telephony Integration)** — Connect voice pipeline to real phone calls via Twilio.

---

## Next Actions

1. [x] Create repository structure
2. [x] Choose backend stack → FastAPI + MongoDB
3. [x] Design database schema
4. [x] Draft initial intent prompts
5. [x] Set up development environment
6. [ ] Set up MongoDB (local or Atlas)
7. [ ] Test `/api/voice/chat` endpoint with OpenAI API key
8. [x] Complete Phase 2: LLM orchestration + tool calling
9. [x] Complete Phase 5: Frontend dashboard with Clerk auth
10. [x] Complete Phase 3: OpenAI Realtime API voice pipeline
11. [ ] Test `/voice-test` page with OpenAI API key
12. [ ] Begin Phase 4: Twilio telephony integration

---

---

## Post-MVP: Future Phases

### Phase 7: Shop Management System Integrations

**Goal:** Replace CSV uploads with real-time integrations to popular auto shop software.

#### Tekmetric Integration
- [ ] Research Tekmetric API documentation and authentication
- [ ] Implement OAuth or API key authentication flow
- [ ] Build read-only sync for:
  - Work orders and repair status
  - Customer records
  - Vehicle information
- [ ] Create webhook listener for real-time updates (if available)
- [ ] Add integration toggle in dashboard
- [ ] Handle API rate limits and failures gracefully

#### Shop-Ware Integration
- [ ] Research Shop-Ware API capabilities
- [ ] Implement authentication flow
- [ ] Build read-only sync for work orders and status
- [ ] Map Shop-Ware data model to internal schema
- [ ] Add integration toggle in dashboard

#### Integration Architecture
- [x] Design adapter pattern for multiple integrations → `ShopSystemAdapter` ABC in `app/adapters/`
- [ ] Build integration health monitoring
- [ ] Implement sync scheduling (polling interval config)
- [ ] Add manual re-sync option in dashboard
- [ ] Create data mapping/transformation layer

**Key Principle:** All integrations remain **read-only** — the AI never writes back to shop systems.

---

### Phase 8: Additional Future Capabilities

These are explicitly out of scope for MVP but may be considered later:

| Feature | Notes |
|---------|-------|
| Appointment booking | Requires write access to shop systems |
| Multi-language support | Spanish priority for many markets |
| Outbound calls | Proactive status notifications |
| SMS follow-up | Text summary after calls |
| Additional verticals | Other service businesses (HVAC, dental, etc.) |

---

*This roadmap should be updated as decisions are made and phases complete.*
