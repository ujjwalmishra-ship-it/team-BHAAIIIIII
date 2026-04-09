# Low-Level Design (LLD)

**Team:** team-BHAAIIIIII  
**Related PRD:** [PRD.md](./PRD.md)  
**Last updated:** April 10, 2026

---

## 1. Context

Vanik is a voice-first AI agent that sits between an MSME exporter (who calls in over a phone line) and a set of downstream services — DGFT, GST, ICEGATE, document generators, and WhatsApp. The exporter interacts only via voice; all agentic reasoning, document generation, and delivery happens invisibly in the backend. The system is stateful per shipment — each call creates a shipment session that accumulates verified data as it flows through the pipeline.

```text
[ Exporter (phone call) ]
        |
        v
[ Nurix AI Voice Platform ]
  — inbound call handling
  — STT: Hindi/Indic (built-in)
  — TTS: Hindi/Indic, <300ms latency (built-in)
  — turn-by-turn conversation orchestration
        |
        | (webhook — transcribed text in, response text out)
        v
[ Conversation Engine (FastAPI) ]
        |
        |---> [ LLM Agent: Anthropic Claude ]
        |           |
        |           |---> [ RAG: HS Code Classifier (Chroma + DGFT tariff) ]
        |           |---> [ Doc Checklist Generator ]
        |           |---> [ LC Discrepancy Checker ]
        |
        |---> [ Verification Layer ]
        |           |---> [ DGFT IEC API ]
        |           |---> [ GST Search API ]
        |
        |---> [ Document Generator ]
        |           |---> [ Shipping Bill (PDF) ]
        |           |---> [ Certificate of Origin (PDF) ]
        |           |---> [ RODTEP Calculator ]
        |
        |---> [ Delivery Layer ]
        |           |---> [ WhatsApp Business Cloud API ]
        |
        |---> [ PostgreSQL — shipment sessions, exporter profiles, doc store ]
```

---

## 2. Architecture

### 2.1 Components

| Component | Responsibility | Tech / location in repo |
|-----------|----------------|-------------------------|
| Voice Platform | Receives inbound calls; handles STT (Hindi/Indic built-in), TTS (<300ms, Hindi/Indic built-in), and turn-by-turn conversation orchestration; fires a webhook to our backend with transcribed text and receives text response to speak back | **Nurix AI** (managed platform) — no custom gateway code needed |
| Conversation Engine | Receives Nurix webhook, maintains session state, routes to sub-agents, returns text response to Nurix | FastAPI `src/core/conversation.py` |
| LLM Agent | Drives reasoning — HS classification, checklist generation, LC parsing, RODTEP calc | Anthropic Claude (claude-sonnet-4-6) `src/agents/` |
| HS Code Classifier | RAG over DGFT ITC-HS tariff schedule, returns top-2 8-digit codes with confidence | Chroma vector DB + Claude `src/agents/hs_classifier.py` |
| Doc Checklist Generator | Returns tailored document list based on HS code + destination + payment terms | Claude + rules engine `src/agents/checklist.py` |
| LC Discrepancy Checker | Parses LC PDF/image, flags discrepancies against shipment data | Claude document parsing `src/agents/lc_checker.py` |
| Verification Layer | Verifies IEC against DGFT API and GSTIN against GST portal | `src/verification/iec.py`, `src/verification/gst.py` |
| Document Generator | Produces pre-filled PDF drafts for shipping bill, CoO, RODTEP summary | PDFKit (Node.js) `src/docs/generator.js` |
| Delivery Layer | Sends bundled docs + checklist to exporter WhatsApp | WhatsApp Business Cloud API `src/delivery/whatsapp.py` |
| Shipment Tracker | Polls ICEGATE for status updates, triggers proactive alerts | `src/tracker/icegate.py` |
| PostgreSQL DB | Stores exporter profiles, shipment sessions, document store, call logs | `src/db/models.py` |
| React Dashboard | NRI/admin-facing view of shipment status, doc history, alerts | `frontend/` |

### 2.2 Boundaries

- **Owns:** Conversation state, shipment session data, generated document store, call logs
- **Calls / reads:** Nurix AI (voice platform — STT, TTS, call orchestration), Anthropic API (LLM), Chroma (vector search), DGFT IEC API, GST Search API, ICEGATE API, WhatsApp Business Cloud API
- **Does not own:** Exporter's IEC/GSTIN data (read-only from government APIs), ICEGATE shipment filing (Vanik generates drafts only — exporter or CHA submits), LC terms (exporter-provided)

---

## 3. Interfaces

### 3.1 APIs

| Method | Path | Request | Response | Errors |
|--------|------|---------|----------|--------|
| POST | `/nurix/webhook` | Nurix webhook payload (caller ID, call ID, transcribed text, conversation state) | 200 + `{response: "text for Nurix to speak"}` | 400 if missing caller ID |
| POST | `/shipment/verify` | `{iec, gstin, session_id}` | `{iec_valid, gstin_valid, exporter_name}` | 404 if IEC not found |
| POST | `/shipment/classify` | `{product_description, session_id}` | `{hs_code, hs_description, confidence, fta_benefits}` | 422 if product too ambiguous |
| POST | `/shipment/checklist` | `{hs_code, destination_country, payment_terms, session_id}` | `{required_docs: [], auto_generated: [], third_party: []}` | 400 if missing fields |
| POST | `/shipment/lc-check` | `{lc_image_base64, session_id}` | `{discrepancies: [], risk_level}` | 415 if file format unsupported |
| POST | `/docs/generate` | `{session_id, doc_types: []}` | `{doc_urls: {shipping_bill, coo, rodtep}}` | 500 if template fill fails |
| POST | `/delivery/whatsapp` | `{session_id, phone_number}` | `{message_id, status}` | 503 if WhatsApp API down |
| GET | `/tracker/status` | `?shipping_bill_no=` | `{status, last_updated, milestones: []}` | 404 if SB not found |

### 3.2 Events / queues

| Producer | Consumer | Payload summary |
|----------|----------|-----------------|
| Conversation Engine | Document Generator | `shipment_ready` event with full session data when Steps 1–3 complete |
| Document Generator | Delivery Layer | `docs_ready` event with signed S3 URLs for generated PDFs |
| Shipment Tracker (cron) | Notification Service | `status_update` event when ICEGATE milestone changes |
| Notification Service | WhatsApp Delivery | `alert_payload` with milestone name + exporter phone |

---

## 4. Data

### 4.1 Models / schema

**ExporterProfile**
```json
{
  "exporter_id": "uuid",
  "phone_number": "+91XXXXXXXXXX",
  "iec": "XXXXXXXXXX",
  "gstin": "XXXXXXXXXXXXXXXXXXX",
  "name": "string",
  "preferred_language": "hi | ta | te | gu | mr | en",
  "created_at": "timestamp"
}
```

**ShipmentSession**
```json
{
  "session_id": "uuid",
  "exporter_id": "uuid",
  "call_sid": "string",
  "status": "active | docs_generated | delivered | complete",
  "product_description": "string",
  "hs_code": "XXXXXXXX",
  "quantity": "float",
  "unit": "string",
  "destination_country": "ISO 3166-1 alpha-2",
  "incoterms": "FOB | CIF | EXW",
  "payment_terms": "TT | LC | DA | DP",
  "fta_applicable": "boolean",
  "rodtep_rate": "float",
  "doc_checklist": ["string"],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**GeneratedDocument**
```json
{
  "doc_id": "uuid",
  "session_id": "uuid",
  "doc_type": "shipping_bill | coo | rodtep_summary | lc_report",
  "s3_url": "string",
  "status": "draft | delivered",
  "created_at": "timestamp"
}
```

### 4.2 Storage

| Data | Store | Notes |
|------|-------|-------|
| Exporter profiles | PostgreSQL | Indexed on phone_number and IEC |
| Shipment sessions | PostgreSQL | One row per call, updated as pipeline progresses |
| Generated PDFs | AWS S3 (ap-south-1) | Presigned URLs with 7-day expiry sent via WhatsApp |
| DGFT tariff schedule (HS codes) | Chroma vector DB | Embedded once at startup, refreshed monthly |
| Call audio logs | S3 (encrypted) | Retained 30 days for quality review, then deleted |
| ICEGATE status cache | Redis (TTL 15 min) | Avoids hammering ICEGATE API on repeated polls |

---

## 5. Configuration & secrets

- **Env vars / config files:**
  - `NURIX_API_KEY` — Nurix AI platform API key (from Nurix dashboard → Developers tab)
  - `NURIX_AGENT_ID` — the ID of the configured Vanik agent on Nurix's platform
  - `NURIX_PHONE_NUMBER` — the Indian +91 number provisioned via Nurix dashboard
  - `ANTHROPIC_API_KEY`
  - `OPENAI_API_KEY` (fallback for edge cases only)
  - `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
  - `DATABASE_URL` (PostgreSQL connection string)
  - `REDIS_URL`
  - `S3_BUCKET_NAME`, `AWS_REGION`
  - `DGFT_API_BASE_URL`, `GST_API_BASE_URL`, `ICEGATE_API_BASE_URL`
  - `DEMO_MODE` (true/false — enables fixture responses for hackathon demo)

- **Secrets (never commit):** All secrets injected via environment variables at runtime. For the hackathon, stored in a `.env` file (gitignored). In production, injected via AWS Secrets Manager or K8s secrets.

---

## 6. Deployment & operations

- **How it runs:** Single Docker container running FastAPI on port 8000. Document generator runs as a sidecar Node.js process on port 3001. Both behind an Nginx reverse proxy.
- **Entry point:** `uvicorn src.main:app --host 0.0.0.0 --port 8000`
- **Health:** `GET /health` returns `{"status": "ok", "db": "ok", "redis": "ok"}`
- **Scaling:** Single replica for hackathon. In production, HPA on CPU > 70% — voice workloads are latency-sensitive so horizontal scale is preferred over vertical.
- **Hosting:** AWS EC2 t3.medium, Mumbai region (ap-south-1) for low-latency voice on Indian networks.

---

## 7. Failure modes & mitigations

| Failure | Impact | Mitigation |
|---------|--------|------------|
| Nurix AI platform unavailable | Calls cannot be received; STT/TTS pipeline down | Nurix is a managed platform with its own uptime SLA; for hackathon, no fallback needed — monitor Nurix status page |
| Nurix webhook delivery failure | Our FastAPI server does not receive transcribed text | Nurix retries webhook delivery automatically; ensure `/nurix/webhook` endpoint returns 200 quickly (<2s) |
| Anthropic API timeout | HS classification or checklist generation stalls | Retry with exponential backoff (3 attempts); if all fail, agent informs exporter and offers callback |
| DGFT IEC API down | Cannot verify IEC | Soft-fail with warning — session continues with unverified IEC flagged in document drafts |
| GST API down | Cannot verify GSTIN | Same soft-fail approach as IEC |
| ICEGATE API unavailable | Shipping bill draft cannot be pre-validated | Generate draft from local template without ICEGATE validation; flag as unvalidated |
| WhatsApp delivery failure | Exporter does not receive documents | Retry 3 times with 30s delay; fallback to SMS with download link if all retries fail |
| PostgreSQL down | Cannot persist session state | In-memory session cache for active calls; flush to DB on recovery |
| Exporter hangs up mid-session | Session left incomplete | Mark session as `abandoned` after 10 min inactivity; resume on next call using same IEC |
| HS code misclassification | Incorrect docs generated | Human-in-the-loop confirmation step — agent reads back top 2 codes and asks exporter to confirm before proceeding |

---

## 8. Trade-offs & deferred work

**Simplified for the hackathon:**
- ICEGATE API is mocked with pre-recorded fixture responses — live integration is built but not wired to production ICEGATE credentials
- LC discrepancy checker (Step 6) is implemented but not demoed in the core flow — it requires the exporter to send a WhatsApp image first, which adds friction to the demo
- Multi-language support is architected (language field in ExporterProfile, Nurix AI supports Indian languages natively) but only Hindi is demoed
- Redis caching layer is present in the codebase but not required for the hackathon scale
- React dashboard is a read-only MVP showing session history and doc links — no authentication beyond a simple API key

**What we would do next:**
- Live ICEGATE credentials and full shipping bill submission (not just draft generation)
- RODTEP credit tracking post-shipment — monitor scroll generation and bank credit transfer
- CHA marketplace — verified CHA profiles, warm transfer with structured briefing note
- Regional language expansion — Gujarati, Marathi, Tamil as the next three based on exporter density in those states
- ECGC insurance cross-sell integrated into the post-checklist step
- Predictive customs examination risk scoring based on HS code + destination + declared value patterns
