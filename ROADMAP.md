# Voice Receptionist MVP - Development Roadmap

This document breaks down the MVP into sequential development phases. Each phase builds on the previous and delivers a testable milestone.

---

## Phase Overview

| Phase | Focus | Deliverable | Est. Duration |
|-------|-------|-------------|---------------|
| 1 | Foundation & Data Layer | Backend scaffolding + CSV import | 1-2 weeks |
| 2 | Intent Engine | LLM-based intent classification + tool orchestration | 2-3 weeks |
| 3 | Voice Pipeline | ASR + TTS integration (local testing) | 2-3 weeks |
| 4 | Telephony Integration | Real phone calls via PSTN | 1-2 weeks |
| 5 | Business Dashboard | Owner-facing web UI | 2-3 weeks |
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

- [ ] Initialize project repository and structure
- [ ] Choose and set up backend framework (e.g., FastAPI, Node.js)
- [ ] Design database schema:
  - Shops (id, name, phone, hours, services, address)
  - Work Orders (id, shop_id, customer_name, vehicle, status, last_updated)
  - Call Logs (id, shop_id, timestamp, intent, tool_called, result, confidence, duration, outcome)
- [ ] Implement CSV upload/import for work orders
- [ ] Create basic CRUD API for shop data
- [ ] Write seed data scripts for testing
- [ ] Set up environment configuration and secrets management

### Milestone
✅ Can upload a CSV of work orders and query them via API.

---

## Phase 2: Intent Engine (Tool Orchestration)

**Goal:** Build the LLM-powered intent classification and tool-calling system.

### Tasks

- [ ] Define intent taxonomy:
  - `CHECK_STATUS` - vehicle/service status lookup
  - `GET_HOURS` - business hours inquiry
  - `GET_LOCATION` - address/directions
  - `GET_SERVICES` - available services list
  - `TRANSFER_HUMAN` - request to speak with person
  - `UNKNOWN` - fallback
- [ ] Design slot extraction schema per intent:
  - CHECK_STATUS → {customer_name?, vehicle_make?, vehicle_model?, license_plate?, work_order_id?}
- [ ] Build tool registry (MCP-style):
  - `lookup_work_order()`
  - `get_business_hours()`
  - `get_shop_location()`
  - `get_services_list()`
- [ ] Implement LLM orchestration layer:
  - System prompt design (strict, deterministic)
  - Intent classification prompt
  - Slot extraction prompt
  - Response generation from tool results
- [ ] Add confidence scoring and fallback logic
- [ ] Create text-based testing harness (CLI or API)
- [ ] Write unit tests for each intent path

### Milestone
✅ Can send text input, get classified intent, call appropriate tool, return structured response.

---

## Phase 3: Voice Pipeline

**Goal:** Integrate speech-to-text and text-to-speech for voice interactions.

### Tasks

- [ ] Research and select ASR provider(s):
  - Options: Deepgram, AssemblyAI, Whisper, Google STT
  - Criteria: streaming support, latency, cost, accuracy
- [ ] Research and select TTS provider(s):
  - Options: ElevenLabs, PlayHT, Google TTS, Azure TTS
  - Criteria: streaming support, latency, natural voice quality
- [ ] Implement streaming ASR integration
- [ ] Implement streaming TTS integration
- [ ] Build voice session manager:
  - Handle turn-taking
  - Implement barge-in detection
  - Add silence detection and timeouts
- [ ] Measure and optimize end-to-end latency (target: <1s)
- [ ] Create local testing mode (microphone input → speaker output)
- [ ] Handle edge cases:
  - Background noise
  - Incomplete utterances
  - Very long pauses

### Milestone
✅ Can speak into microphone, get AI voice response locally with <1s latency.

---

## Phase 4: Telephony Integration

**Goal:** Connect voice pipeline to real phone calls.

### Tasks

- [ ] Research and select telephony provider:
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

### Tasks

- [ ] Choose frontend framework (e.g., Next.js, React)
- [ ] Design and implement authentication:
  - Shop owner login
  - Multi-shop support (future-ready)
- [ ] Build dashboard pages:
  - **Overview**: Call volume, success rate, common intents
  - **Call Log**: List of calls with summaries, intents, outcomes
  - **Call Detail**: Individual call breakdown
  - **Shop Settings**: Hours, services, address, phone
  - **AI Controls**: Toggle what AI can/cannot answer
- [ ] Implement CSV upload UI for work orders
- [ ] Add real-time call activity indicators (optional)
- [ ] Mobile-responsive design
- [ ] Basic analytics charts

### Milestone
✅ Shop owner can log in, view calls, edit business info, upload work orders.

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
| **ASR** | Deepgram | Fastest streaming, phone-optimized |
| **TTS** | Deepgram Aura / ElevenLabs | Low latency streaming |
| **Telephony** | Twilio | Best documentation, media streams |
| **Frontend** | Next.js | Full-stack dashboard |
| **CI/CD** | GitHub Actions + Ruff + Pyrefly | Linting, type checking, testing |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Latency too high | Test providers early; have fallback options |
| LLM hallucination | Strict prompts; tool-only responses; confidence thresholds |
| Telephony complexity | Start with Twilio (most documented); isolate in adapter layer |
| Scope creep | Refer back to README.md; say no to non-MVP features |
| Pilot shop unavailable | Have 2-3 candidate shops; build with synthetic data first |

---

## Recommended Starting Point

**Start with Phase 1 + Phase 2 in parallel tracks:**

1. **Track A (Data):** Set up repo, database, CSV import
2. **Track B (Intent):** Prototype intent classification with hardcoded test data

This lets you validate the core AI logic early while building the data foundation.

---

## Next Actions

1. [ ] Create repository structure
2. [ ] Choose backend stack
3. [ ] Design database schema
4. [ ] Draft initial intent prompts
5. [ ] Set up development environment

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
- [ ] Design adapter pattern for multiple integrations
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
