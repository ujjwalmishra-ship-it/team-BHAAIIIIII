import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ══════════════════════════════════════════════════════════════
//  DEMO DATA
// ══════════════════════════════════════════════════════════════

const DEMO_EXPORTERS = [
  { exporter_id: "exp-001", name: "Rajan Leather Exports", phone: "+919876543210", iec: "0510012345", gstin: "09AABCU9603R1ZM", language: "hi", city: "Agra", shipments: 3, created_at: "2026-03-15T10:00:00Z" },
  { exporter_id: "exp-002", name: "Surat Silk Mills Pvt Ltd", phone: "+919123456789", iec: "0812034567", gstin: "24AADCS1234F1ZP", language: "gu", city: "Surat", shipments: 5, created_at: "2026-02-20T08:00:00Z" },
  { exporter_id: "exp-003", name: "Kanpur Spices Trading Co", phone: "+919555123456", iec: "0611045678", gstin: "09AABCK5678L1ZQ", language: "hi", city: "Kanpur", shipments: 2, created_at: "2026-04-01T12:00:00Z" },
  { exporter_id: "exp-004", name: "Chennai Pharma Solutions", phone: "+919444567890", iec: "0413056789", gstin: "33AADCC9012N1ZR", language: "ta", city: "Chennai", shipments: 7, created_at: "2026-01-10T09:00:00Z" },
  { exporter_id: "exp-005", name: "Jaipur Gems & Jewellery", phone: "+919333678901", iec: "0814067890", gstin: "08AABCJ3456P1ZS", language: "hi", city: "Jaipur", shipments: 1, created_at: "2026-04-05T14:00:00Z" },
];

const DEMO_SESSIONS = [
  {
    session_id: "ses-001", exporter_id: "exp-001", exporter_name: "Rajan Leather Exports", status: "COMPLETE",
    product_description: "Basmati Rice (1121 variety)", hs_code: "1006.30", hs_description: "Semi-milled or wholly milled rice",
    quantity: 500, unit: "kg", destination_country: "BD", incoterms: "FOB", payment_terms: "TT",
    hs_confidence: 0.94, fta_applicable: true, fta_benefits: ["SAFTA: 0% duty"], rodtep_rate: 1.8,
    doc_checklist: [
      { doc_name: "Shipping Bill", source: "vanik", auto_generated: true, status: "generated" },
      { doc_name: "Certificate of Origin (SAFTA)", source: "vanik", auto_generated: true, status: "generated" },
      { doc_name: "RODTEP Summary", source: "vanik", auto_generated: true, status: "generated" },
      { doc_name: "Commercial Invoice", source: "exporter", auto_generated: false, status: "pending" },
      { doc_name: "Packing List", source: "exporter", auto_generated: false, status: "pending" },
      { doc_name: "Bill of Lading", source: "shipping line", auto_generated: false, status: "pending" },
      { doc_name: "Phytosanitary Certificate", source: "APEDA", auto_generated: false, status: "pending" },
    ],
    doc_urls: { shipping_bill: "#sb-001", coo: "#coo-001", rodtep: "#rodtep-001" },
    tracker: {
      shipping_bill_no: "SB/2026/MUM/003421",
      milestones: [
        { name: "Shipping Bill Filed", status: "done", date: "2026-04-08T10:00:00Z" },
        { name: "SB Noted by Customs", status: "done", date: "2026-04-08T14:30:00Z" },
        { name: "Examination Order", status: "skipped", date: null },
        { name: "LEO Granted", status: "done", date: "2026-04-09T09:00:00Z" },
        { name: "EGM Filed", status: "current", date: null },
        { name: "RODTEP Credit Scroll", status: "upcoming", date: null },
        { name: "Duty Drawback Credit", status: "upcoming", date: null },
      ]
    },
    created_at: "2026-04-08T08:30:00Z", updated_at: "2026-04-09T09:00:00Z",
  },
  {
    session_id: "ses-002", exporter_id: "exp-002", exporter_name: "Surat Silk Mills Pvt Ltd", status: "DOC_GENERATION",
    product_description: "Silk Sarees (Banarasi)", hs_code: "5007.20", hs_description: "Woven fabrics of silk",
    quantity: 120, unit: "pcs", destination_country: "AE", incoterms: "CIF", payment_terms: "LC",
    hs_confidence: 0.88, fta_applicable: true, fta_benefits: ["India-UAE CEPA: reduced duty"], rodtep_rate: 4.3,
    doc_checklist: [
      { doc_name: "Shipping Bill", source: "vanik", auto_generated: true, status: "generating" },
      { doc_name: "Certificate of Origin (CEPA)", source: "vanik", auto_generated: true, status: "generating" },
      { doc_name: "RODTEP Summary", source: "vanik", auto_generated: true, status: "generating" },
      { doc_name: "Commercial Invoice", source: "exporter", auto_generated: false, status: "pending" },
      { doc_name: "Packing List", source: "exporter", auto_generated: false, status: "pending" },
      { doc_name: "Bill of Lading", source: "shipping line", auto_generated: false, status: "pending" },
      { doc_name: "LC Compliance Check", source: "bank", auto_generated: false, status: "pending" },
    ],
    doc_urls: null, tracker: null,
    created_at: "2026-04-09T16:00:00Z", updated_at: "2026-04-09T17:30:00Z",
  },
  {
    session_id: "ses-003", exporter_id: "exp-004", exporter_name: "Chennai Pharma Solutions", status: "DELIVERY",
    product_description: "Paracetamol Tablets IP 500mg", hs_code: "3004.90", hs_description: "Medicaments, in measured doses",
    quantity: 50000, unit: "strips", destination_country: "KE", incoterms: "FOB", payment_terms: "TT",
    hs_confidence: 0.96, fta_applicable: false, fta_benefits: [], rodtep_rate: 1.2,
    doc_checklist: [
      { doc_name: "Shipping Bill", source: "vanik", auto_generated: true, status: "generated" },
      { doc_name: "Certificate of Origin", source: "vanik", auto_generated: true, status: "generated" },
      { doc_name: "RODTEP Summary", source: "vanik", auto_generated: true, status: "generated" },
      { doc_name: "Drug Export NOC", source: "CDSCO", auto_generated: false, status: "pending" },
      { doc_name: "CoA (Certificate of Analysis)", source: "exporter", auto_generated: false, status: "ready" },
      { doc_name: "WHO GMP Certificate", source: "CDSCO", auto_generated: false, status: "ready" },
    ],
    doc_urls: { shipping_bill: "#sb-003", coo: "#coo-003", rodtep: "#rodtep-003" },
    tracker: null,
    created_at: "2026-04-10T06:00:00Z", updated_at: "2026-04-10T08:00:00Z",
  },
  {
    session_id: "ses-004", exporter_id: "exp-003", exporter_name: "Kanpur Spices Trading Co", status: "HS_CLASSIFICATION",
    product_description: "Turmeric Powder (Haldi)", hs_code: null, hs_description: null,
    quantity: 2000, unit: "kg", destination_country: "US", incoterms: "FOB", payment_terms: "TT",
    hs_confidence: null, fta_applicable: null, fta_benefits: [], rodtep_rate: null,
    doc_checklist: null, doc_urls: null, tracker: null,
    created_at: "2026-04-10T09:00:00Z", updated_at: "2026-04-10T09:15:00Z",
  },
  {
    session_id: "ses-005", exporter_id: "exp-001", exporter_name: "Rajan Leather Exports", status: "COMPLETE",
    product_description: "Finished Leather (Buffalo)", hs_code: "4104.41", hs_description: "Full grains, unsplit, in the dry state",
    quantity: 800, unit: "sq ft", destination_country: "DE", incoterms: "FOB", payment_terms: "LC",
    hs_confidence: 0.91, fta_applicable: false, fta_benefits: [], rodtep_rate: 2.5,
    doc_checklist: [
      { doc_name: "Shipping Bill", source: "vanik", auto_generated: true, status: "generated" },
      { doc_name: "Certificate of Origin", source: "vanik", auto_generated: true, status: "generated" },
      { doc_name: "RODTEP Summary", source: "vanik", auto_generated: true, status: "generated" },
      { doc_name: "Commercial Invoice", source: "exporter", auto_generated: false, status: "ready" },
      { doc_name: "Packing List", source: "exporter", auto_generated: false, status: "ready" },
      { doc_name: "Bill of Lading", source: "shipping line", auto_generated: false, status: "ready" },
      { doc_name: "LC Compliance Check", source: "bank", auto_generated: false, status: "done" },
    ],
    doc_urls: { shipping_bill: "#sb-005", coo: "#coo-005", rodtep: "#rodtep-005" },
    tracker: {
      shipping_bill_no: "SB/2026/MUM/003398",
      milestones: [
        { name: "Shipping Bill Filed", status: "done", date: "2026-04-05T11:00:00Z" },
        { name: "SB Noted by Customs", status: "done", date: "2026-04-05T15:00:00Z" },
        { name: "Examination Order", status: "done", date: "2026-04-06T08:00:00Z" },
        { name: "LEO Granted", status: "done", date: "2026-04-06T16:00:00Z" },
        { name: "EGM Filed", status: "done", date: "2026-04-07T10:00:00Z" },
        { name: "RODTEP Credit Scroll", status: "done", date: "2026-04-09T12:00:00Z" },
        { name: "Duty Drawback Credit", status: "current", date: null },
      ]
    },
    created_at: "2026-04-04T14:00:00Z", updated_at: "2026-04-09T12:00:00Z",
  },
];

const DEMO_DOCUMENTS = [
  { doc_id: "doc-001", session_id: "ses-001", doc_type: "shipping_bill", filename: "SB_Draft_ses-001.pdf", status: "delivered", created_at: "2026-04-08T09:30:00Z", size_kb: 142 },
  { doc_id: "doc-002", session_id: "ses-001", doc_type: "coo", filename: "CoO_SAFTA_ses-001.pdf", status: "delivered", created_at: "2026-04-08T09:31:00Z", size_kb: 98 },
  { doc_id: "doc-003", session_id: "ses-001", doc_type: "rodtep_summary", filename: "RODTEP_ses-001.pdf", status: "delivered", created_at: "2026-04-08T09:31:00Z", size_kb: 67 },
  { doc_id: "doc-004", session_id: "ses-003", doc_type: "shipping_bill", filename: "SB_Draft_ses-003.pdf", status: "generated", created_at: "2026-04-10T07:45:00Z", size_kb: 155 },
  { doc_id: "doc-005", session_id: "ses-003", doc_type: "coo", filename: "CoO_Standard_ses-003.pdf", status: "generated", created_at: "2026-04-10T07:46:00Z", size_kb: 91 },
  { doc_id: "doc-006", session_id: "ses-005", doc_type: "shipping_bill", filename: "SB_Draft_ses-005.pdf", status: "delivered", created_at: "2026-04-04T15:20:00Z", size_kb: 138 },
  { doc_id: "doc-007", session_id: "ses-005", doc_type: "coo", filename: "CoO_Standard_ses-005.pdf", status: "delivered", created_at: "2026-04-04T15:21:00Z", size_kb: 94 },
  { doc_id: "doc-008", session_id: "ses-005", doc_type: "rodtep_summary", filename: "RODTEP_ses-005.pdf", status: "delivered", created_at: "2026-04-04T15:21:00Z", size_kb: 62 },
];

const COUNTRY_FLAGS = { BD: "🇧🇩", AE: "🇦🇪", KE: "🇰🇪", US: "🇺🇸", DE: "🇩🇪", SA: "🇸🇦", GB: "🇬🇧", JP: "🇯🇵", SG: "🇸🇬" };
const COUNTRY_NAMES = { BD: "Bangladesh", AE: "UAE", KE: "Kenya", US: "United States", DE: "Germany", SA: "Saudi Arabia" };

const STATES_ORDER = [
  "GREETING", "IEC_CAPTURE", "PRODUCT_CAPTURE", "VERIFICATION",
  "HS_CLASSIFICATION", "CHECKLIST", "DOC_GENERATION", "DELIVERY", "COMPLETE"
];

const STATE_META = {
  GREETING: { color: "#6b7280", label: "Greeting" },
  IEC_CAPTURE: { color: "#f5c542", label: "IEC Capture" },
  PRODUCT_CAPTURE: { color: "#f5c542", label: "Product Capture" },
  VERIFICATION: { color: "#3b82f6", label: "Verification" },
  HS_CLASSIFICATION: { color: "#8b5cf6", label: "HS Classification" },
  CHECKLIST: { color: "#f97316", label: "Checklist" },
  DOC_GENERATION: { color: "#ec4899", label: "Doc Generation" },
  DELIVERY: { color: "#06b6d4", label: "Delivery" },
  COMPLETE: { color: "#34d399", label: "Complete" },
};

// ══════════════════════════════════════════════════════════════
//  DEMO CHAT ENGINE
// ══════════════════════════════════════════════════════════════

const chatSessions = {};

function chatProcess(sid, msg) {
  if (!sid || !chatSessions[sid]) {
    sid = "chat-" + Date.now().toString(36);
    chatSessions[sid] = {
      session_id: sid, status: "GREETING", iec: null, gstin: null, exporter_name: null,
      product_description: null, quantity: null, unit: null, destination_country: null,
      incoterms: null, payment_terms: null, hs_code: null, hs_description: null,
      hs_confidence: null, fta_applicable: null, fta_benefits: null, rodtep_rate: null,
      doc_checklist: null, doc_urls: null, iec_verified: null, gstin_verified: null,
      history: [], created_at: new Date().toISOString(),
    };
  }
  const s = chatSessions[sid];
  if (msg) s.history.push({ role: "user", content: msg });
  let r = "";
  const m = (msg || "").toLowerCase();

  if (s.status === "GREETING") {
    r = "नमस्ते! मैं वाणिक हूँ — आपका export documentation assistant। कृपया अपना IEC number बताइए।";
    s.status = "IEC_CAPTURE";
  } else if (s.status === "IEC_CAPTURE") {
    const match = (msg || "").match(/\d{10}/);
    if (match) { s.iec = match[0]; s.gstin = "07" + match[0] + "1Z5"; s.status = "PRODUCT_CAPTURE"; r = `IEC ${s.iec} मिल गया। आप क्या भेज रहे हैं, कितना, कहाँ, और किस terms पर?`; }
    else r = "कृपया 10-digit IEC number बताइए।";
  } else if (s.status === "PRODUCT_CAPTURE") {
    if (m.includes("rice") || m.includes("chawal") || m.includes("basmati")) {
      Object.assign(s, { product_description: "Basmati Rice", quantity: 500, unit: "kg", destination_country: m.includes("bangladesh") || m.includes("bd") ? "BD" : "SA", incoterms: m.includes("cif") ? "CIF" : "FOB", payment_terms: m.includes("lc") ? "LC" : "TT", status: "VERIFICATION" });
      r = `500 kg Basmati Rice → ${s.destination_country}, ${s.incoterms}, ${s.payment_terms}. Verify कर रहा हूँ...`;
    } else if (m.includes("leather") || m.includes("chamda")) {
      Object.assign(s, { product_description: "Finished Leather", quantity: 200, unit: "sq ft", destination_country: "DE", incoterms: "FOB", payment_terms: "TT", status: "VERIFICATION" });
      r = `200 sq ft Finished Leather → DE, FOB, TT. Verify कर रहा हूँ...`;
    } else r = "कृपया बताइए — product, quantity, destination country, और payment terms।";
  } else if (s.status === "VERIFICATION") {
    Object.assign(s, { iec_verified: true, gstin_verified: true, exporter_name: "Rajan Leather Exports, Agra", status: "HS_CLASSIFICATION" });
    r = `✅ IEC verified — ${s.exporter_name}। HS code: ${s.product_description === "Basmati Rice" ? "1006.30 — Semi-milled rice" : "4104.41 — Finished leather"} (92% confidence)। सही है? (हाँ/नहीं)`;
    Object.assign(s, { hs_code: s.product_description === "Basmati Rice" ? "1006.30" : "4104.41", hs_confidence: 0.92, fta_applicable: s.destination_country === "BD", fta_benefits: s.destination_country === "BD" ? ["SAFTA: 0% duty"] : [], status: "CHECKLIST" });
  } else if (s.status === "CHECKLIST") {
    if (m.includes("haan") || m.includes("yes") || m.includes("sahi") || m.includes("ha")) {
      s.doc_checklist = [
        { doc_name: "Shipping Bill", source: "vanik", auto_generated: true },
        { doc_name: "Certificate of Origin", source: "vanik", auto_generated: true },
        { doc_name: "RODTEP Summary", source: "vanik", auto_generated: true },
        { doc_name: "Commercial Invoice", source: "exporter", auto_generated: false },
        { doc_name: "Packing List", source: "exporter", auto_generated: false },
        { doc_name: "Bill of Lading", source: "shipping line", auto_generated: false },
        { doc_name: "Phytosanitary Certificate", source: "APEDA", auto_generated: false },
      ];
      r = `📋 7 documents required:\n${s.doc_checklist.map((d,i) => `${d.auto_generated ? "✅" : "📎"} ${d.doc_name}`).join("\n")}\n\n3 auto-generate करूँगा। Proceed? (हाँ)`;
      s.status = "DOC_GENERATION";
    } else r = "HS code confirm कीजिए — हाँ/नहीं?";
  } else if (s.status === "DOC_GENERATION") {
    if (m.includes("haan") || m.includes("yes") || m.includes("ha")) {
      s.rodtep_rate = 1.8;
      s.doc_urls = { shipping_bill: "#sb", coo: "#coo", rodtep: "#rodtep" };
      r = `✅ Documents ready!\n📄 Shipping Bill (Draft)\n📄 Certificate of Origin\n📄 RODTEP: ₹${Math.round(s.quantity * 85 * s.rodtep_rate / 100).toLocaleString()} credit\n\nWhatsApp पर भेज रहा हूँ...`;
      s.status = "DELIVERY";
    } else r = "Documents generate करूँ?";
  } else if (s.status === "DELIVERY") {
    s.status = "COMPLETE";
    r = "✅ सभी documents WhatsApp पर भेज दिए गए हैं! Vanik use करने के लिए धन्यवाद 🙏";
  } else {
    r = "Session complete। नई shipment के लिए new session शुरू करें।";
  }

  s.history.push({ role: "assistant", content: r });
  return { session_id: sid, response: r, state: s.status, session_data: { ...s } };
}

// ══════════════════════════════════════════════════════════════
//  SHARED UI COMPONENTS
// ══════════════════════════════════════════════════════════════

const F = "'JetBrains Mono', monospace";
const C = { bg: "#0a0a14", surface: "#0e0e1a", card: "#12121e", border: "#1a1a2e", gold: "#f5c542", goldDark: "#e8a317", text: "#e0e0e8", muted: "#6b7280", dim: "#4b5563", faint: "#2a2a3e" };

function Badge({ children, color = C.gold, small }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: small ? "2px 7px" : "3px 10px", borderRadius: 4, fontSize: small ? 10 : 11, fontWeight: 700, letterSpacing: "0.06em", fontFamily: F, color, background: color + "15", border: `1px solid ${color}30` }}>{children}</span>;
}

function StateBadge({ state }) {
  const m = STATE_META[state] || STATE_META.GREETING;
  return <Badge color={m.color}><span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, boxShadow: state === "COMPLETE" ? `0 0 6px ${m.color}` : "none" }} />{state}</Badge>;
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", border: "none", borderRadius: 6, cursor: "pointer", background: active ? C.gold + "12" : "transparent", color: active ? C.gold : C.muted, fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: "inherit", textAlign: "left", transition: "all 0.12s" }}>
      <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{icon}</span>{label}
    </button>
  );
}

function Metric({ label, value, sub, accent }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, padding: "18px 20px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent || C.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function PipelineDots({ state }) {
  const idx = STATES_ORDER.indexOf(state);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {STATES_ORDER.map((st, i) => {
        const done = i < idx; const active = i === idx; const col = STATE_META[st].color;
        return (
          <div key={st} style={{ display: "flex", alignItems: "center" }}>
            <div title={st} style={{ width: active ? 12 : 8, height: active ? 12 : 8, borderRadius: "50%", background: done ? col : active ? col : C.faint, border: `2px solid ${done || active ? col : "#3a3a4e"}`, transition: "all 0.3s", boxShadow: active ? `0 0 10px ${col}55` : "none" }} />
            {i < STATES_ORDER.length - 1 && <div style={{ width: 14, height: 2, background: done ? col : C.faint }} />}
          </div>
        );
      })}
    </div>
  );
}

function Timestamp({ date, short }) {
  if (!date) return <span style={{ color: C.dim }}>—</span>;
  const d = new Date(date);
  return <span style={{ color: C.muted, fontSize: 12, fontFamily: F }}>{short ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>;
}

// ══════════════════════════════════════════════════════════════
//  PAGES
// ══════════════════════════════════════════════════════════════

// ─── DASHBOARD ───
function DashboardPage({ sessions, onNav }) {
  const complete = sessions.filter(s => s.status === "COMPLETE").length;
  const active = sessions.filter(s => s.status !== "COMPLETE").length;
  const totalRodtep = sessions.filter(s => s.rodtep_rate && s.quantity).reduce((acc, s) => acc + (s.quantity * 85 * (s.rodtep_rate || 0) / 100), 0);
  const countryData = Object.entries(sessions.reduce((acc, s) => { if (s.destination_country) { acc[s.destination_country] = (acc[s.destination_country] || 0) + 1; } return acc; }, {})).map(([c, v]) => ({ name: (COUNTRY_FLAGS[c] || "") + " " + (COUNTRY_NAMES[c] || c), value: v }));
  const statusData = Object.entries(sessions.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {})).map(([k, v]) => ({ name: k, value: v, color: STATE_META[k]?.color || C.muted }));
  const pieColors = ["#f5c542", "#3b82f6", "#34d399", "#8b5cf6", "#f97316", "#ec4899", "#06b6d4"];

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Dashboard</h1>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Vanik Export Documentation Agent — overview</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <Metric label="TOTAL SESSIONS" value={sessions.length} sub="All time" />
        <Metric label="ACTIVE" value={active} sub="In pipeline" accent="#f5c542" />
        <Metric label="COMPLETED" value={complete} sub="Docs delivered" accent="#34d399" />
        <Metric label="RODTEP SAVED" value={`₹${Math.round(totalRodtep).toLocaleString()}`} sub="Total credit identified" accent="#06b6d4" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div style={{ background: C.card, borderRadius: 10, padding: 20, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F, marginBottom: 16 }}>SHIPMENTS BY DESTINATION</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={countryData} margin={{ left: -20 }}>
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12 }} />
              <Bar dataKey="value" fill={C.gold} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: C.card, borderRadius: 10, padding: 20, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F, marginBottom: 16 }}>PIPELINE STATUS</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3} stroke="none">
                {statusData.map((e, i) => <Cell key={i} fill={e.color || pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, justifyContent: "center" }}>
            {statusData.map(d => <span key={d.name} style={{ fontSize: 10, color: d.color, fontFamily: F }}>{d.name}: {d.value}</span>)}
          </div>
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: 10, padding: 20, border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F }}>RECENT SESSIONS</div>
          <button onClick={() => onNav("sessions")} style={{ background: "none", border: "none", color: C.gold, fontSize: 12, cursor: "pointer", fontFamily: F }}>View all →</button>
        </div>
        {sessions.slice(0, 4).map(s => (
          <div key={s.session_id} onClick={() => onNav("detail", s.session_id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}>
            <div style={{ fontSize: 20 }}>{COUNTRY_FLAGS[s.destination_country] || "📦"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.product_description || "New session"}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{s.exporter_name} · {s.hs_code || "classifying..."}</div>
            </div>
            <PipelineDots state={s.status} />
            <StateBadge state={s.status} />
            <Timestamp date={s.updated_at} short />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SESSIONS LIST ───
function SessionsPage({ sessions, onNav }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? sessions : filter === "active" ? sessions.filter(s => s.status !== "COMPLETE") : sessions.filter(s => s.status === "COMPLETE");
  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Shipment Sessions</h1>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>{sessions.length} total sessions</p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["all", "All"], ["active", "Active"], ["complete", "Complete"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ padding: "6px 14px", borderRadius: 4, border: "none", fontSize: 12, fontWeight: 600, fontFamily: F, cursor: "pointer", background: filter === k ? C.gold : "transparent", color: filter === k ? C.bg : C.muted }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
        {filtered.map(s => (
          <div key={s.session_id} onClick={() => onNav("detail", s.session_id)} style={{ background: C.card, borderRadius: 10, padding: 20, cursor: "pointer", border: `1px solid ${C.border}`, transition: "border-color 0.12s" }} onMouseEnter={e => e.currentTarget.style.borderColor = C.gold + "44"} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: C.dim, fontFamily: F }}>{s.session_id}</span>
              <StateBadge state={s.status} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{s.product_description || "New Session"}</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>{s.exporter_name}</div>
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: C.muted, marginBottom: 10 }}>
              {s.destination_country && <span>{COUNTRY_FLAGS[s.destination_country]} {COUNTRY_NAMES[s.destination_country] || s.destination_country}</span>}
              {s.hs_code && <span style={{ fontFamily: F }}>HS {s.hs_code}</span>}
              {s.quantity && <span>{s.quantity} {s.unit}</span>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <PipelineDots state={s.status} />
              <Timestamp date={s.updated_at} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SHIPMENT DETAIL ───
function DetailPage({ session, documents, onNav }) {
  if (!session) return <div style={{ padding: 32, color: C.muted }}>Session not found.</div>;
  const s = session;
  const docs = documents.filter(d => d.session_id === s.session_id);

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }}>
      <button onClick={() => onNav("sessions")} style={{ background: "none", border: "none", color: C.gold, fontSize: 12, cursor: "pointer", fontFamily: F, marginBottom: 16 }}>← Back to Sessions</button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{s.product_description || "New Session"}</h1>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>{s.exporter_name} · {s.session_id}</p>
        </div>
        <StateBadge state={s.status} />
      </div>

      <PipelineDots state={s.status} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, margin: "24px 0" }}>
        <div style={{ background: C.card, borderRadius: 10, padding: 18, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F, marginBottom: 12 }}>EXPORTER</div>
          {[["IEC", s.iec || "—"], ["GSTIN", s.gstin || "—"], ["Name", s.exporter_name || "—"], ["Verified", s.iec_verified ? "✅ Yes" : "⏳ Pending"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.muted }}>{l}</span><span style={{ color: C.text, fontFamily: F, fontSize: 12 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: C.card, borderRadius: 10, padding: 18, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F, marginBottom: 12 }}>SHIPMENT</div>
          {[["Product", s.product_description || "—"], ["Quantity", s.quantity ? `${s.quantity} ${s.unit}` : "—"], ["Destination", s.destination_country ? `${COUNTRY_FLAGS[s.destination_country] || ""} ${COUNTRY_NAMES[s.destination_country] || s.destination_country}` : "—"], ["Incoterms", s.incoterms || "—"], ["Payment", s.payment_terms || "—"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.muted }}>{l}</span><span>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: C.card, borderRadius: 10, padding: 18, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F, marginBottom: 12 }}>CLASSIFICATION</div>
          {[["HS Code", s.hs_code ? <span style={{ color: C.gold, fontFamily: F, fontWeight: 700 }}>{s.hs_code}</span> : "—"], ["Description", s.hs_description || "—"], ["Confidence", s.hs_confidence ? `${(s.hs_confidence * 100).toFixed(0)}%` : "—"], ["FTA", s.fta_applicable != null ? (s.fta_applicable ? "✅ " + (s.fta_benefits?.[0] || "Yes") : "No") : "—"], ["RODTEP", s.rodtep_rate ? `${s.rodtep_rate}% → ₹${Math.round((s.quantity || 0) * 85 * s.rodtep_rate / 100).toLocaleString()}` : "—"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, borderBottom: `1px solid ${C.border}`, alignItems: "flex-start" }}>
              <span style={{ color: C.muted, flexShrink: 0 }}>{l}</span><span style={{ textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Doc Checklist */}
      {s.doc_checklist && (
        <div style={{ background: C.card, borderRadius: 10, padding: 20, border: `1px solid ${C.border}`, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F, marginBottom: 14 }}>DOCUMENT CHECKLIST — {s.doc_checklist.length} ITEMS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {s.doc_checklist.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 6, background: C.surface, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 16 }}>{d.auto_generated ? (d.status === "generated" || d.status === "done" ? "✅" : "⏳") : d.status === "ready" || d.status === "done" ? "✅" : "📎"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.doc_name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{d.source}</div>
                </div>
                <Badge color={d.auto_generated ? "#34d399" : "#f5c542"} small>{d.auto_generated ? "AUTO" : "MANUAL"}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Docs */}
      {docs.length > 0 && (
        <div style={{ background: C.card, borderRadius: 10, padding: 20, border: `1px solid ${C.border}`, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F, marginBottom: 14 }}>GENERATED DOCUMENTS</div>
          {docs.map(d => (
            <div key={d.doc_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 22 }}>📄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.filename}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{d.doc_type.replace(/_/g, " ")} · {d.size_kb} KB</div>
              </div>
              <Badge color={d.status === "delivered" ? "#34d399" : "#3b82f6"} small>{d.status.toUpperCase()}</Badge>
              <Timestamp date={d.created_at} />
            </div>
          ))}
        </div>
      )}

      {/* Tracker */}
      {s.tracker && (
        <div style={{ background: C.card, borderRadius: 10, padding: 20, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F }}>ICEGATE SHIPMENT TRACKER</div>
            <span style={{ fontFamily: F, fontSize: 12, color: C.gold }}>{s.tracker.shipping_bill_no}</span>
          </div>
          <div style={{ position: "relative", paddingLeft: 24 }}>
            {s.tracker.milestones.map((m, i) => {
              const col = m.status === "done" ? "#34d399" : m.status === "current" ? C.gold : m.status === "skipped" ? C.dim : C.faint;
              return (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 10, position: "relative" }}>
                  {i < s.tracker.milestones.length - 1 && <div style={{ position: "absolute", left: -18, top: 16, width: 2, height: "calc(100% + 2px)", background: m.status === "done" ? "#34d399" : C.faint }} />}
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: col, border: `2px solid ${col}`, flexShrink: 0, marginTop: 3, position: "relative", left: -24, zIndex: 1, boxShadow: m.status === "current" ? `0 0 10px ${col}55` : "none" }} />
                  <div style={{ flex: 1, marginLeft: -16 }}>
                    <div style={{ fontSize: 13, fontWeight: m.status === "current" ? 700 : 500, color: m.status === "skipped" ? C.dim : C.text, textDecoration: m.status === "skipped" ? "line-through" : "none" }}>{m.name}</div>
                    <Timestamp date={m.date} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DOCUMENTS PAGE ───
function DocumentsPage({ documents, sessions }) {
  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Documents</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>{documents.length} documents generated</p>
      <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 1fr 100px", padding: "10px 20px", borderBottom: `1px solid ${C.border}`, fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F }}>
          <span>FILENAME</span><span>TYPE</span><span>SESSION</span><span>SIZE</span><span>DATE</span><span>STATUS</span>
        </div>
        {documents.map(d => {
          const ses = sessions.find(s => s.session_id === d.session_id);
          return (
            <div key={d.doc_id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 1fr 100px", padding: "12px 20px", borderBottom: `1px solid ${C.border}`, fontSize: 13, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>📄</span>{d.filename}</span>
              <span style={{ fontFamily: F, fontSize: 11, color: C.muted }}>{d.doc_type.replace(/_/g, " ")}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{ses?.product_description?.slice(0, 20) || d.session_id}</span>
              <span style={{ fontFamily: F, fontSize: 11, color: C.muted }}>{d.size_kb} KB</span>
              <Timestamp date={d.created_at} />
              <Badge color={d.status === "delivered" ? "#34d399" : "#3b82f6"} small>{d.status.toUpperCase()}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── EXPORTERS PAGE ───
function ExportersPage({ exporters, onNav }) {
  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Exporters</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>{exporters.length} registered exporters</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {exporters.map(e => (
          <div key={e.exporter_id} style={{ background: C.card, borderRadius: 10, padding: 20, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{e.name}</div>
              <Badge color="#3b82f6" small>{e.language.toUpperCase()}</Badge>
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>📍 {e.city} · 📞 {e.phone}</div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.dim, fontFamily: F }}>
              <span>IEC: {e.iec}</span>
              <span>Shipments: {e.shipments}</span>
            </div>
            <div style={{ fontSize: 10, color: C.dim, fontFamily: F, marginTop: 8 }}>Joined: {new Date(e.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHAT AGENT PAGE ───
function ChatPage() {
  const [sid, setSid] = useState(null);
  const [sData, setSData] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  const inpRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const start = useCallback(() => {
    setMsgs([]); setSData(null); setBusy(true);
    setTimeout(() => {
      const res = chatProcess(null, "");
      setSid(res.session_id); setSData(res.session_data);
      setMsgs([{ role: "assistant", content: res.response }]);
      setBusy(false);
    }, 400);
  }, []);

  useEffect(() => { start(); }, [start]);

  const send = () => {
    const m = inp.trim(); if (!m || busy) return;
    setInp(""); setMsgs(p => [...p, { role: "user", content: m }]); setBusy(true);
    setTimeout(() => {
      const res = chatProcess(sid, m);
      setSid(res.session_id); setSData(res.session_data);
      setMsgs(p => [...p, { role: "assistant", content: res.response }]);
      setBusy(false);
      setTimeout(() => inpRef.current?.focus(), 50);
    }, 300 + Math.random() * 500);
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: `1px solid ${C.border}` }}>
        <div style={{ padding: "8px 20px", borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <PipelineDots state={sData?.status || "GREETING"} />
          <StateBadge state={sData?.status || "GREETING"} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", padding: "3px 0" }}>
              <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? `linear-gradient(135deg, ${C.gold}, ${C.goldDark})` : C.card, color: m.role === "user" ? C.bg : C.text, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap", fontWeight: m.role === "user" ? 500 : 400, boxShadow: m.role === "user" ? `0 2px 8px ${C.gold}22` : `0 2px 8px #00000030` }}>
                {m.content}
              </div>
            </div>
          ))}
          {busy && <div style={{ display: "flex", gap: 5, padding: 10 }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, animation: `pulse 1.2s ${i*0.15}s infinite ease-in-out` }} />)}</div>}
          <div ref={endRef} />
        </div>
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, background: C.surface, display: "flex", gap: 10 }}>
          <textarea ref={inpRef} value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Type as the exporter (Hindi or English)..." rows={1} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.5, maxHeight: 80 }} />
          <button onClick={send} disabled={busy || !inp.trim()} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: busy || !inp.trim() ? C.faint : `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: busy || !inp.trim() ? C.dim : C.bg, fontSize: 13, fontWeight: 700, cursor: busy || !inp.trim() ? "default" : "pointer", fontFamily: F }}>SEND</button>
          <button onClick={start} style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 15, cursor: "pointer" }} title="New session">↻</button>
        </div>
      </div>
      {/* Inspector */}
      <div style={{ width: 350, overflowY: "auto", background: C.surface, padding: "14px 18px", flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.1em", fontFamily: F, paddingBottom: 10, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
          <span>SESSION INSPECTOR</span>
          <span style={{ color: C.faint, fontSize: 9 }}>{sid}</span>
        </div>
        {sData && (
          <div style={{ fontSize: 12, marginTop: 10 }}>
            {[
              ["— EXPORTER —", null],
              ["IEC", sData.iec], ["GSTIN", sData.gstin], ["Name", sData.exporter_name], ["Verified", sData.iec_verified != null ? (sData.iec_verified ? "✅" : "❌") : null],
              ["— SHIPMENT —", null],
              ["Product", sData.product_description], ["Qty", sData.quantity ? `${sData.quantity} ${sData.unit}` : null], ["Dest", sData.destination_country], ["Terms", sData.incoterms], ["Payment", sData.payment_terms],
              ["— CLASSIFICATION —", null],
              ["HS Code", sData.hs_code], ["Confidence", sData.hs_confidence ? `${(sData.hs_confidence*100).toFixed(0)}%` : null], ["FTA", sData.fta_applicable != null ? (sData.fta_applicable ? "Yes" : "No") : null], ["RODTEP", sData.rodtep_rate ? `${sData.rodtep_rate}%` : null],
            ].filter(([,v]) => v !== null && v !== undefined).map(([l, v], i) => (
              v === null ? <div key={i} style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: "0.08em", fontFamily: F, margin: "10px 0 4px" }}>{l}</div> :
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.muted, fontFamily: F, fontSize: 11 }}>{l}</span>
                <span style={{ color: l === "HS Code" || l === "IEC" ? C.gold : C.text, fontFamily: F, fontSize: 11 }}>{v}</span>
              </div>
            ))}
            {sData.doc_checklist && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: "0.08em", fontFamily: F, marginBottom: 6 }}>— CHECKLIST —</div>
                {sData.doc_checklist.map((d, i) => <div key={i} style={{ fontSize: 11, color: C.muted, padding: "3px 0" }}>{d.auto_generated ? "✅" : "📎"} {d.doc_name}</div>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TRACKER PAGE ───
function TrackerPage({ sessions }) {
  const tracked = sessions.filter(s => s.tracker);
  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Shipment Tracker</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>ICEGATE status monitoring · {tracked.length} tracked shipments</p>
      {tracked.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.dim }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚢</div>
          <div>No shipments being tracked yet.</div>
        </div>
      ) : tracked.map(s => (
        <div key={s.session_id} style={{ background: C.card, borderRadius: 10, padding: 20, border: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{s.product_description}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{s.exporter_name} → {COUNTRY_FLAGS[s.destination_country]} {COUNTRY_NAMES[s.destination_country] || s.destination_country}</div>
            </div>
            <span style={{ fontFamily: F, fontSize: 13, color: C.gold, background: C.gold + "15", padding: "4px 10px", borderRadius: 4 }}>{s.tracker.shipping_bill_no}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {s.tracker.milestones.map((m, i) => {
              const col = m.status === "done" ? "#34d399" : m.status === "current" ? C.gold : m.status === "skipped" ? C.dim : C.faint;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, background: col + "15", border: `1px solid ${col}30` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, boxShadow: m.status === "current" ? `0 0 8px ${col}` : "none" }} />
                  <span style={{ fontSize: 12, color: m.status === "skipped" ? C.dim : C.text, textDecoration: m.status === "skipped" ? "line-through" : "none" }}>{m.name}</span>
                  {m.date && <span style={{ fontSize: 10, color: C.muted, fontFamily: F }}>{new Date(m.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  APP SHELL
// ══════════════════════════════════════════════════════════════

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [detailId, setDetailId] = useState(null);

  const nav = useCallback((p, id) => { setPage(p); if (id) setDetailId(id); }, []);
  const detailSession = useMemo(() => DEMO_SESSIONS.find(s => s.session_id === detailId), [detailId]);

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh", background: C.bg, color: C.text, fontFamily: "'Satoshi', 'Segoe UI', sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: C.bg, fontFamily: F }}>V</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em" }}>VANIK</div>
            <div style={{ fontSize: 9, color: C.dim, fontFamily: F, letterSpacing: "0.08em" }}>EXPORT AGENT</div>
          </div>
        </div>
        <div style={{ padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <SidebarItem icon="📊" label="Dashboard" active={page === "dashboard"} onClick={() => nav("dashboard")} />
          <SidebarItem icon="💬" label="Chat Agent" active={page === "chat"} onClick={() => nav("chat")} />
          <SidebarItem icon="📦" label="Sessions" active={page === "sessions" || page === "detail"} onClick={() => nav("sessions")} />
          <SidebarItem icon="📄" label="Documents" active={page === "documents"} onClick={() => nav("documents")} />
          <SidebarItem icon="🚢" label="Tracker" active={page === "tracker"} onClick={() => nav("tracker")} />
          <SidebarItem icon="👥" label="Exporters" active={page === "exporters"} onClick={() => nav("exporters")} />
        </div>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.dim, fontFamily: F }}>
          team-BHAAIIIIII · v0.1
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {page === "dashboard" && <DashboardPage sessions={DEMO_SESSIONS} onNav={nav} />}
        {page === "chat" && <ChatPage />}
        {page === "sessions" && <SessionsPage sessions={DEMO_SESSIONS} onNav={nav} />}
        {page === "detail" && <DetailPage session={detailSession} documents={DEMO_DOCUMENTS} onNav={nav} />}
        {page === "documents" && <DocumentsPage documents={DEMO_DOCUMENTS} sessions={DEMO_SESSIONS} />}
        {page === "tracker" && <TrackerPage sessions={DEMO_SESSIONS} />}
        {page === "exporters" && <ExportersPage exporters={DEMO_EXPORTERS} onNav={nav} />}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400;500;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 3px; }
        textarea::placeholder { color: #4b5563; }
        @keyframes pulse { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1.1)} }
      `}</style>
    </div>
  );
}
