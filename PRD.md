# PRD: Vanik — The MSME Export Documentation Agent

> *"Global trade runs on paperwork, phone calls, and people who know the rules."*

---

## 1. Problem Statement

### The Exporter's Reality

Every time a small Indian manufacturer ships goods abroad, they face the same exhausting gauntlet: classify the product under the correct HS code, prepare a commercial invoice, packing list, shipping bill, certificate of origin, and potentially a letter of credit — each with its own format, its own authority, and its own consequences for error. Miss a field on the shipping bill and the consignment sits at the port. Use the wrong HS code and the buyer pays the wrong import duty — sometimes enough to kill the deal entirely. Get a discrepancy in the LC and the bank refuses to release payment.

Most MSME exporters don't have in-house compliance teams. They rely on a Customs House Agent (CHA) or freight forwarder — a human middleman who has learned the system through years of experience and charges handsomely for the privilege. The exporter calls, explains the shipment, waits, calls again, pays, and hopes the documents are right.

This is not an edge case. This is the daily reality for hundreds of thousands of Indian exporters.

---

## 2. Market Context & Opportunity

### India's Export Landscape

India's merchandise exports stood at **$437 billion in FY2024**, with the government targeting **$2 trillion by 2030**. The backbone of this ambition is not large conglomerates — it is the MSME sector, which accounts for **45% of India's total exports** and employs over 110 million people.

There are approximately **1.5 million MSME exporters** registered with DGFT. Of these, the vast majority — estimates suggest over **80%** — have fewer than 50 employees and no dedicated export documentation or compliance staff.

### The Middleman Economy

Every one of these exporters relies on some form of human intermediary for documentation:

- **Customs House Agents (CHAs)**: Licensed by CBIC, there are approximately **12,000 licensed CHAs** in India. They typically charge **1–3% of shipment FOB value** for end-to-end documentation handling.
- **Freight Forwarders**: Often bundle documentation with logistics, charging a flat fee of **₹8,000–₹25,000 per shipment** depending on complexity.
- **Export Management Companies**: Handle the entire process for smaller exporters, taking **5–10% of export value**.

For an MSME exporter shipping goods worth ₹10 lakh per consignment, CHA charges alone can run ₹10,000–₹30,000. Multiply this across 2–4 shipments per month and the annual outflow purely on documentation intermediaries is **₹2.4 lakh–₹14.4 lakh per exporter**.

### The Total Addressable Market

| Segment | Estimate |
|---|---|
| Active MSME exporters in India | ~750,000 |
| Average CHA/documentation spend per exporter per year | ₹3–8 lakh |
| Total market for export documentation services | **₹22,500–60,000 crore (~$3–7 billion)** |
| Serviceable market (digitally reachable, regular shippers) | ~150,000 exporters |
| SOM at ₹12,000/exporter/year (₹1,000/month) | **₹180 crore (~$22 million)** |

Even a conservative 1% capture of the serviceable market represents a **₹1.8 crore ARR** business — and the unit economics are dramatically better than any human staffing model.

### Why Now

Three forces are converging to make this the right moment:

1. **ICEGATE digitisation**: India's customs portal has been modernised significantly. The shipping bill filing, duty drawback tracking, and LEO (Let Export Order) status are now API-accessible, making agentic automation possible in ways that weren't feasible even three years ago.

2. **Voice AI maturity for Indian languages**: Models like Sarvam AI's Bulbul and Azure Neural Voice now handle Hindi, Tamil, Telugu, Gujarati, and Marathi with production-grade accuracy. The exporter in Surat who thinks in Gujarati can now be served in Gujarati — without an English-literate intermediary.

3. **DGFT's push for self-service**: DGFT has been actively simplifying the RODTEP, MEIS successor schemes, and the DPIIT-MSME portal. The intent is self-service; the gap is a usable interface for non-expert users.

### The Pain Is Quantifiable

- **23% of LC presentations** globally contain discrepancies that delay or prevent payment (ICC Banking Commission)
- **Export documentation errors** are the #1 cause of cargo delays at Indian ports per FIEO surveys
- **Average time spent** by an MSME exporter on documentation per shipment: **6–12 hours**
- **Average CHA response time** when an exporter calls with a query: **4–24 hours**
- **RODTEP/duty drawback claims** worth an estimated **₹4,000+ crore go unclaimed annually** because exporters don't know they're eligible or find the process too complex

---

## 3. Product Vision

**Vanik** is a voice-first AI agent that guides MSME exporters through the entire export documentation workflow — from shipment intake over a phone call, to pre-filled document drafts delivered on WhatsApp. It speaks the exporter's language, knows the rules, and costs a fraction of what a CHA charges.

The product has three layers working in concert:

- **Voice AI layer**: Inbound and outbound phone calls in Hindi and regional languages — the primary interface for the exporter
- **Agentic reasoning layer**: HS code classification, document checklist generation, LC discrepancy checking, eligibility verification — the intelligence layer
- **Document generation & delivery layer**: Pre-filled shipping bills, certificates of origin, RODTEP applications — the output layer

---

## 4. Target User

**Primary user — the MSME exporter**

Rajan runs a leather goods unit in Agra with 22 employees. He exports to buyers in Germany, the UAE, and the US — roughly 3 shipments per month. He speaks Hindi and some English. He has a smartphone, uses WhatsApp constantly, and calls his CHA at least twice per shipment. He finds the documentation process stressful, opaque, and expensive. He has no idea he's eligible for RODTEP benefits on his product category.

**Secondary user — the NRI family member / business owner abroad**

Priya is Rajan's buyer's sourcing agent in Dubai. She's seen Rajan lose deals because shipments were delayed by documentation errors. She wants her Indian suppliers to be more reliable and self-sufficient.

**Tertiary user — export facilitation bodies**

FIEO, Export Promotion Councils, and District Industries Centres who want to empower their MSME members with better tools.

---

## 5. Full Agent Workflow — All 12 Steps

The workflow spans four phases — Voice Intake (Steps 1–3), Agentic Reasoning (Steps 4–6), Document Generation (Steps 7–9), and Notification & Handoff (Steps 10–12) — converging at shipment clearance and RODTEP credit. Step 6 (LC discrepancy check) is conditional and skipped for non-LC payment terms (TT, DA, DP).

**Workflow overview:**

| Phase | Steps | What happens |
|---|---|---|
| Voice intake | 1–3 | Exporter calls in, shipment details captured, IEC + GSTIN verified |
| Agentic reasoning | 4–6 | HS code classified, doc checklist generated, LC checked if applicable |
| Document generation | 7–9 | Shipping bill drafted, CoO prepared, RODTEP eligibility calculated |
| Notification & handoff | 10–12 | Docs delivered on WhatsApp, CHA handoff if needed, shipment tracked on ICEGATE |

**Full workflow diagram:**

![Vanik Workflow](workflow.svg)

### Phase 1: Voice Intake

**Step 1 — Inbound call from exporter**

The exporter calls a dedicated Vanik number. The agent answers in Hindi (default) and greets them by name if they're a returning user. For new callers, it asks for their IEC number to pull their profile. The conversation is natural and unhurried — not an IVR tree.

*Technical implementation*: Exotel SIP trunk → real-time STT (Sarvam AI Saarika for Hindi/regional, Whisper for English fallback) → LLM conversation layer → TTS response (Sarvam AI Bulbul)

**Step 2 — Product and shipment capture**

The agent asks the exporter to describe what they're shipping, how much, where it's going, and on what payment and shipping terms. It extracts: product description, quantity, unit, destination country, incoterms (FOB/CIF/EXW), and payment method (TT/LC/DA/DP). It reads back the captured details in the exporter's language and asks for confirmation before proceeding.

*Key design decision*: The agent is designed to handle vague inputs gracefully. "Main kapda bhej raha hoon" (I'm sending cloth) triggers a follow-up clarification loop to determine fabric type, composition, and HSN chapter before proceeding.

**Step 3 — IEC and GSTIN verification**

The agent verifies the exporter's Import Export Code against DGFT's public IEC database API and their GSTIN against the GST portal. It flags any mismatches (expired IEC, GST return filing lapses that could affect LUT validity) before proceeding. This is not KYC in the financial sense — it's eligibility verification to ensure the shipment can legally proceed.

*APIs used*: DGFT IEC verification endpoint, GST Search API (public)

---

### Phase 2: Agentic Reasoning

**Step 4 — HS Code classification**

This is the most consequential step in the workflow. The agent classifies the product under the correct 8-digit HS code (ITC-HS code) using a RAG layer built on the DGFT Customs Tariff Schedule.

The classification prompt is structured to work through the tariff schedule systematically: Section → Chapter → Heading → Subheading → 8-digit code. For ambiguous products, the agent asks targeted clarification questions (e.g., for textiles: "Is the fabric woven or knitted?", "What is the primary fibre composition?"). It presents the top 2 candidate codes with a confidence indication and asks the exporter to confirm.

Critically, the agent also uses the HS code to identify: applicable export restrictions or licences (SCOMET items), preferential duty rates under FTAs (SAFTA, India-UAE CEPA, India-Japan CEPA), and RODTEP rate applicability for the product.

*Technical implementation*: Anthropic Claude for reasoning over DGFT tariff schedule embedded in vector DB (Chroma/Pinecone). Fallback to human review flag for edge cases.

**Step 5 — Document checklist generation**

Based on the destination country, product category, HS code, and payment terms, the agent generates a tailored checklist of required documents. This is not a generic list — it's specific to the shipment.

Example: A shipment of Basmati rice to Saudi Arabia on LC terms requires: Commercial Invoice (3 originals), Packing List, Bill of Lading, Certificate of Origin (Arab-India Chamber), Phytosanitary Certificate (APEDA), Quality Certificate, LC compliance check, and Halal Certificate.

The agent reads the checklist to the exporter, notes which documents Vanik will generate automatically and which the exporter needs to procure from third parties, and gives estimated timelines for the third-party ones.

**Step 6 — Letter of Credit discrepancy check**

If the shipment is on LC terms, the agent asks the exporter to share the LC via WhatsApp (photo or PDF). It then parses the LC terms and cross-checks them against the proposed shipment details, flagging the most common discrepancy categories:

- Description of goods mismatch between LC and commercial invoice
- Port of loading/discharge not matching
- Latest shipment date conflicts with vessel booking
- Partial shipment or transshipment clauses
- Presentation period for documents

It returns a structured discrepancy report to the exporter on WhatsApp before the shipment proceeds, allowing corrections while there's still time.

*Technical implementation*: Claude document parsing on the LC image/PDF, structured output against a discrepancy rule taxonomy.

---

### Phase 3: Document Generation

**Step 7 — Auto-fill shipping bill**

Using the captured shipment data and the verified HS code, the agent pre-fills the ICEGATE shipping bill draft (SB format). It populates: IEC, GSTIN, exporter name and address, consignee details, port of loading, country of destination, item description, HS code, quantity, unit, FOB value in INR and foreign currency, and declared customs value.

The draft is sent to the exporter's WhatsApp as a PDF. It is clearly marked "DRAFT — verify before submission" and includes a field-by-field review checklist.

*Technical implementation*: Template-fill approach using the official ICEGATE SB XML schema, converted to a JSON-driven PDF generator (PDFKit or WeasyPrint).

**Step 8 — Certificate of Origin**

The agent generates a Certificate of Origin draft appropriate for the destination country and applicable trade agreement. For SAARC countries it uses the SAFTA CoO format. For ASEAN it uses the AIFTA format. For UAE shipments post-CEPA it uses the India-UAE CEPA preferential CoO format. For all others it defaults to the standard non-preferential CoO.

The CoO draft is generated with all fields pre-filled from the shipment data. The exporter is reminded that the final CoO must be attested by their regional Export Promotion Council or Chamber of Commerce — Vanik's draft is the starting point, not the final document.

**Step 9 — RODTEP and duty drawback eligibility and application assist**

This step is the most underutilised in the current market. Most small exporters either don't know about RODTEP or find the claim process too complex. The agent:

1. Checks the RODTEP schedule for the confirmed HS code and calculates the applicable rate (as a % of FOB value)
2. Tells the exporter how much they can claim on this shipment ("Aapko is shipment pe ₹8,400 ka RODTEP credit milega")
3. Walks them through how the claim is routed through ICEGATE after the shipping bill is filed
4. For duty drawback (AIR scheme), checks eligibility and the applicable rate separately
5. Reminds them of the timeline for credit transfer to their nominated bank account

*Data source*: RODTEP rate schedule (public CBIC notification), Duty Drawback AIR schedule.

---

### Phase 4: Notification and Handoff

**Step 10 — WhatsApp document delivery**

All generated documents — shipping bill draft, CoO draft, doc checklist, LC discrepancy report, RODTEP calculation — are bundled and sent to the exporter's WhatsApp number as a single structured message. The bundle includes:

- PDF attachments for each draft document
- A plain-language summary of what to do next for each document
- Contact information for the relevant authority (EPC, APEDA, Chamber of Commerce, bank trade desk)
- A checklist they can tick off as they complete each step

The WhatsApp message is sent in the exporter's preferred language.

**Step 11 — CHA and bank handoff (warm transfer)**

For exporters who need human assistance beyond what Vanik handles — complex LC negotiations, SCOMET licence applications, multi-country consolidated shipments — the agent offers a warm transfer option. It maintains a panel of verified CHAs and trade finance desks categorised by specialisation and geography.

The handoff includes a structured briefing note sent to the CHA/bank desk with all captured shipment data, so the exporter doesn't have to repeat themselves. The CHA is billed by Vanik at a negotiated rate; the exporter pays less than they would going directly.

**Step 12 — Shipment status tracker and proactive alerts**

After the shipping bill is filed on ICEGATE, the agent monitors status using the ICEGATE tracking API and sends proactive WhatsApp alerts at key milestones:

- Shipping bill noted (SB noted by Customs)
- Examination order (if goods are called for examination)
- LEO granted (Let Export Order — the goods can now be loaded)
- EGM filed (Export General Manifest — vessel has departed)
- RODTEP credit scroll generation
- Duty drawback credit transfer

For any negative event (examination order, short-landing certificate, customs query), the agent calls the exporter immediately and walks them through the next step.

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Voice infrastructure | Exotel (India) / Twilio (international) |
| Speech-to-text | Sarvam AI Saarika (Hindi/Indic), OpenAI Whisper (English fallback) |
| Text-to-speech | Sarvam AI Bulbul (Hindi/Indic), Azure Neural Voice |
| LLM / reasoning | Anthropic Claude (primary), GPT-4o (fallback) |
| HS code classification | Claude + RAG on DGFT ITC-HS schedule (Chroma vector DB) |
| Document generation | PDFKit (Node.js) / WeasyPrint (Python) with ICEGATE-format templates |
| WhatsApp delivery | WhatsApp Business Cloud API (Meta) |
| ICEGATE integration | ICEGATE public APIs + scraping fallback |
| DGFT/GST verification | DGFT IEC API, GST Search API |
| Backend | FastAPI (Python) |
| Database | PostgreSQL (exporter profiles, shipment history, document store) |
| Frontend dashboard | React + TailwindCSS |
| Hosting | AWS Mumbai region (ap-south-1) for low latency on Indian voice calls |

---

## 7. Hackathon Demo Scope

For the 24–48 hour hackathon, the demo focuses on **Steps 1–7** — the core voice-to-document arc that tells the complete story.

**Demo flow (under 5 minutes end-to-end):**

1. Exporter calls the Vanik number
2. Agent greets in Hindi, captures shipment details (Basmati rice, 500kg, FOB, Bangladesh)
3. Agent verifies IEC (mocked), classifies HS code as 1006.30, mentions SAFTA preferential duty benefit
4. Agent generates doc checklist (7 documents for this shipment)
5. Agent sends pre-filled shipping bill draft + checklist to WhatsApp
6. Judge sees the WhatsApp message arrive in real time with the PDF attached

**What is mocked for the hackathon:**
- ICEGATE API responses (pre-recorded fixtures)
- IEC/GSTIN verification (returns a canned valid response)
- RODTEP rate lookup (hardcoded for the demo HS code)

**What is fully live:**
- Voice call (real Exotel/Twilio number)
- STT/TTS pipeline
- LLM reasoning and HS code classification
- PDF document generation
- WhatsApp delivery

---

## 10. Why Vanik Wins

The middleman in Indian export trade is not going away because exporters are lazy — they're there because the system is genuinely complex and the cost of getting it wrong is real. Vanik doesn't try to eliminate complexity. It absorbs it.

A CHA takes your call, understands your shipment, applies their knowledge, and delivers documents. Vanik does exactly the same thing — at 2am, in Gujarati, for ₹1,000 instead of ₹15,000, and with a paper trail of every decision it made.

The opportunity is not a feature. It is an entire professional services category, ripe for voice AI to walk in and claim.
