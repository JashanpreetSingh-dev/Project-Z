# Akseli – Voice Receptionist MVP (Auto Shops)

## 1. Purpose of This Document

This document initializes the repository and acts as the **single source of truth** for the MVP. It defines the product scope, technical philosophy, and execution constraints so development stays focused, scalable, and market-aligned.

This is **not** a pitch deck and **not** a marketing document.

---

## 2. Problem Statement

Independent auto repair shops:

* Miss incoming phone calls during busy hours
* Receive repetitive calls asking for vehicle/service status
* Rely on human receptionists or outdated IVRs
* Lose revenue and customer trust due to missed or delayed responses

Existing solutions either:

* Are manual (humans)
* Are menu-based IVRs
* Use generic AI that is unreliable, hallucination-prone, or opaque

---

## 3. Product Definition

**What we are building:**
Akseli, a **voice-based AI receptionist** for auto repair shops, that answers phone calls and provides accurate responses by **searching structured shop data**, with full business control and privacy-first design.

**What we are NOT building:**

* A free-form conversational chatbot
* A call center replacement platform
* A diagnostic or pricing engine
* A generic AI agent builder

---

## 4. Core Value Proposition

> "Answer every call instantly and accurately, without guessing, using your actual shop data."

Key principles:

* Deterministic (tool-based, not chat-based)
* Privacy-first (no recordings or transcripts stored)
* Owner-controlled (permissions, fallbacks, visibility)
* Built for real phone calls (PSTN)

---

## 5. MVP Scope (Strict)

### Supported Caller Intents (MVP)

* Check vehicle / service status
* Ask for business hours or location
* Ask what services are offered
* Request transfer to a human

### Explicitly Out of Scope (MVP)

* Appointment booking
* Diagnostics or repair advice
* Detailed pricing or estimates
* Payments or billing questions
* Multi-language support

---

## 6. Voice Experience Goals

Target experience:

* Similar feel to ChatGPT / Gemini voice (fast, polite, interruptible)
* Sub-1 second response latency after user finishes speaking
* Streaming ASR and streaming TTS
* Barge-in supported (caller can interrupt AI)

Voice behavior rules:

* Short, direct responses
* Never guess answers
* Ask for clarification if confidence is low
* Transfer to human when unsure

---

## 7. Architectural Philosophy

### Core Design

* Each call is an isolated session
* No shared state across calls
* Fully async, event-driven

### MCP-Style Tool Orchestration

The LLM is used **only** for:

* Intent classification
* Slot / parameter extraction

The LLM is **never** allowed to:

* Invent answers
* Decide business truth
* Access databases directly

All business truth comes from **tools** (lookups).

---

## 8. Data & Privacy Model

### What We Do NOT Store

* Raw call audio
* Full transcripts
* Verbatim caller speech

### What We DO Store

* Structured call summary
* Intent(s) detected
* Tool(s) called
* Result(s) returned
* Confidence score
* Duration and outcome

### Example Call Summary (Conceptual)

* Intent: CHECK_STATUS
* Record accessed: Work Order #5482
* Result: READY
* Confidence: 0.92
* Fallback used: No

---

## 9. Integration Strategy

### MVP Integration Method

* CSV-based upload of work orders
* Manual or scheduled refresh
* No dependency on vendor APIs

### Future Integrations (Post-MVP)

* Tekmetric
* Shop-Ware

Integrations are **read-only**.

---

## 10. Scalability Target

MVP must support:

* Up to **20 concurrent calls**
* Independent call state per session
* Graceful degradation on failures

No hard dependency on a single ASR, TTS, or LLM vendor.

---

## 11. Cost & Guardrails

Design constraints:

* ~ $0.03 per call-minute all-in
* Max call duration limits
* Silence detection and timeout handling
* Intent loop prevention

---

## 12. Dashboard Requirements (MVP)

Business owner must be able to:

* View call summaries
* See detected intent and outcome
* See confidence and fallback usage
* Edit business info (hours, services)
* Control what the AI is allowed to answer

No prompt editing.
No AI training UI.

---

## 13. Non-Goals

We explicitly avoid:

* Over-automation
* Black-box AI behavior
* Feature creep
* Premature generalization to other industries

---

## 14. Success Criteria for MVP

The MVP is successful if:

* A real auto shop uses it in production
* Calls are answered accurately
* Owners trust the summaries
* At least one shop is willing to pay

---

## 15. Guiding Principle (Final)

> "If the system is not confident, it should gracefully step aside."

Accuracy, trust, and reliability always beat novelty.

---

**This document should be read before writing any code.**
