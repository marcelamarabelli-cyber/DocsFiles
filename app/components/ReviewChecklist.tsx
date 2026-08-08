"use client";

import { useEffect, useMemo, useState } from "react";

type ReviewState = {
  taxpayerInfo: boolean;
  incomeReconciled: boolean;
  deductionsReviewed: boolean;
  creditsReviewed: boolean;
  paymentsReviewed: boolean;
  stateReturnReviewed: boolean;
  diagnosticsCleared: boolean;
  clientQuestionsResolved: boolean;
  reviewerNote: string;
  updatedAt: string;
};

const emptyState: ReviewState = {
  taxpayerInfo: false,
  incomeReconciled: false,
  deductionsReviewed: false,
  creditsReviewed: false,
  paymentsReviewed: false,
  stateReturnReviewed: false,
  diagnosticsCleared: false,
  clientQuestionsResolved: false,
  reviewerNote: "",
  updatedAt: "",
};

const checks: Array<{ key: keyof ReviewState; label: string; detail: string }> = [
  { key: "taxpayerInfo", label: "Taxpayer information verified", detail: "Names, SSN/ITIN, address, filing status and dependents reviewed." },
  { key: "incomeReconciled", label: "Income reconciled", detail: "W-2, 1099, K-1 and other income items accounted for." },
  { key: "deductionsReviewed", label: "Deductions reviewed", detail: "Adjustments, itemized deductions and business/rental expenses checked." },
  { key: "creditsReviewed", label: "Credits reviewed", detail: "Applicable tax credits and eligibility requirements checked." },
  { key: "paymentsReviewed", label: "Payments & estimates verified", detail: "Withholding, estimates, extension payments and carryforwards confirmed." },
  { key: "stateReturnReviewed", label: "State return reviewed", detail: "Residency, allocation and state-specific entries checked." },
  { key: "diagnosticsCleared", label: "Software diagnostics cleared", detail: "Critical diagnostics and preparer review messages resolved." },
  { key: "clientQuestionsResolved", label: "Client questions resolved", detail: "Open questions and follow-up items have an answer or disposition." },
];

function storageKey(clientId: string) {
  return `docsfiles-return-review-${clientId}`;
}

export default function ReviewChecklist({ clientId }: { clientId: string }) {
  const [review, setReview] = useState<ReviewState>(emptyState);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(clientId));
      setReview(raw ? { ...emptyState, ...(JSON.parse(raw) as Partial<ReviewState>) } : emptyState);
    } catch {
      setReview(emptyState);
    }
    setLoaded(true);
  }, [clientId]);

  const completed = useMemo(
    () => checks.filter((item) => Boolean(review[item.key])).length,
    [review],
  );
  const percent = Math.round((completed / checks.length) * 100);

  function toggle(key: keyof ReviewState) {
    setReview((current) => ({ ...current, [key]: !current[key] }));
  }

  function save() {
    const next = { ...review, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(storageKey(clientId), JSON.stringify(next));
    setReview(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  if (!loaded) return null;

  return (
    <section style={{ marginTop: 20, padding: 22, borderRadius: 22, background: "white", border: "1px solid #dbe5f0", boxShadow: "0 10px 28px rgba(15,23,42,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#2563eb", fontSize: 12, fontWeight: 900, letterSpacing: ".8px", textTransform: "uppercase" }}>Quality Control</div>
          <h2 style={{ margin: "6px 0 4px", color: "#172033", fontSize: 23 }}>Return Review Checklist</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>A private preparer checklist before moving the engagement to Ready to File.</p>
        </div>
        <div style={{ minWidth: 150, textAlign: "right" }}>
          <div style={{ color: "#172033", fontWeight: 900, fontSize: 22 }}>{completed}/{checks.length}</div>
          <div style={{ color: percent === 100 ? "#15803d" : "#64748b", fontSize: 12, fontWeight: 800 }}>{percent === 100 ? "✓ Review complete" : `${percent}% complete`}</div>
        </div>
      </div>

      <div style={{ marginTop: 16, height: 9, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
        <div style={{ width: `${percent}%`, height: "100%", background: percent === 100 ? "#16a34a" : "#2563eb", transition: "width .2s ease" }} />
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10 }}>
        {checks.map((item) => {
          const checked = Boolean(review[item.key]);
          return (
            <button key={item.key} type="button" onClick={() => toggle(item.key)} style={{ textAlign: "left", display: "flex", gap: 11, padding: 13, borderRadius: 14, border: checked ? "1px solid #86efac" : "1px solid #dbe5f0", background: checked ? "#f0fdf4" : "#fff", cursor: "pointer" }}>
              <span style={{ width: 22, height: 22, flex: "0 0 22px", borderRadius: 7, display: "grid", placeItems: "center", background: checked ? "#16a34a" : "#e2e8f0", color: "white", fontWeight: 900 }}>{checked ? "✓" : ""}</span>
              <span><span style={{ display: "block", color: "#1e293b", fontSize: 13, fontWeight: 850 }}>{item.label}</span><span style={{ display: "block", marginTop: 3, color: "#64748b", fontSize: 11, lineHeight: 1.4 }}>{item.detail}</span></span>
            </button>
          );
        })}
      </div>

      <label style={{ display: "block", marginTop: 16, color: "#334155", fontSize: 12, fontWeight: 850 }}>
        Review Note
        <textarea rows={3} value={review.reviewerNote} onChange={(e) => setReview({ ...review, reviewerNote: e.target.value })} placeholder="Optional final review note..." style={{ width: "100%", boxSizing: "border-box", marginTop: 7, padding: "11px 12px", borderRadius: 12, border: "1px solid #cbd5e1", background: "white", color: "#172033", font: "inherit", resize: "vertical" }} />
      </label>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ color: "#64748b", fontSize: 12 }}>{review.updatedAt ? `Last saved ${new Date(review.updatedAt).toLocaleString()}` : "Not saved yet"}</div>
        <button type="button" onClick={save} style={{ border: 0, borderRadius: 12, padding: "11px 17px", background: saved ? "#15803d" : "#2563eb", color: "white", fontWeight: 850, cursor: "pointer" }}>{saved ? "✓ Review Saved" : "Save Review Checklist"}</button>
      </div>
    </section>
  );
}
