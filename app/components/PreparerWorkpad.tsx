"use client";

import { useEffect, useState } from "react";

type Workpad = {
  preparerNotes: string;
  followUp: string;
  reviewItems: string;
  priority: "Normal" | "Follow Up" | "Urgent";
  updatedAt: string;
};

const emptyWorkpad: Workpad = {
  preparerNotes: "",
  followUp: "",
  reviewItems: "",
  priority: "Normal",
  updatedAt: "",
};

function key(clientId: string) {
  return `docsfiles-preparer-workpad-${clientId}`;
}

export default function PreparerWorkpad({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [workpad, setWorkpad] = useState<Workpad>(emptyWorkpad);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key(clientId));
      setWorkpad(stored ? { ...emptyWorkpad, ...(JSON.parse(stored) as Partial<Workpad>) } : emptyWorkpad);
    } catch {
      setWorkpad(emptyWorkpad);
    }
    setLoaded(true);
  }, [clientId]);

  function saveWorkpad() {
    const next = { ...workpad, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(key(clientId), JSON.stringify(next));
    setWorkpad(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    marginTop: "7px",
    padding: "11px 12px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#172033",
    font: "inherit",
    resize: "vertical" as const,
  };

  if (!loaded) return null;

  return (
    <section style={{ marginTop: 20, padding: 22, borderRadius: 22, background: "white", border: "1px solid #dbe5f0", boxShadow: "0 10px 28px rgba(15,23,42,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#7c3aed", fontSize: 12, fontWeight: 900, letterSpacing: ".8px", textTransform: "uppercase" }}>Tax Preparation Workspace</div>
          <h2 style={{ margin: "6px 0 4px", color: "#172033", fontSize: 23 }}>Preparer Workpad</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>Private working notes for {clientName}. These notes stay in this browser.</p>
        </div>
        <label style={{ color: "#475569", fontSize: 12, fontWeight: 800 }}>
          Priority
          <select value={workpad.priority} onChange={(e) => setWorkpad({ ...workpad, priority: e.target.value as Workpad["priority"] })} style={{ ...fieldStyle, width: 150, padding: "9px 10px" }}>
            <option>Normal</option><option>Follow Up</option><option>Urgent</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 13 }}>
        <label style={{ color: "#334155", fontSize: 12, fontWeight: 850 }}>
          Tax Preparer Notes
          <textarea rows={6} value={workpad.preparerNotes} onChange={(e) => setWorkpad({ ...workpad, preparerNotes: e.target.value })} placeholder="Tax positions, calculations, elections, residency notes, items discussed with client..." style={fieldStyle} />
        </label>
        <label style={{ color: "#334155", fontSize: 12, fontWeight: 850 }}>
          Client Follow-Up
          <textarea rows={6} value={workpad.followUp} onChange={(e) => setWorkpad({ ...workpad, followUp: e.target.value })} placeholder="Questions to ask, missing explanations, calls or emails needed..." style={fieldStyle} />
        </label>
        <label style={{ color: "#334155", fontSize: 12, fontWeight: 850 }}>
          Final Review Items
          <textarea rows={6} value={workpad.reviewItems} onChange={(e) => setWorkpad({ ...workpad, reviewItems: e.target.value })} placeholder="Items to verify before Ready to File..." style={fieldStyle} />
        </label>
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ color: "#64748b", fontSize: 12 }}>
          {workpad.updatedAt ? `Last saved ${new Date(workpad.updatedAt).toLocaleString()}` : "Not saved yet"}
        </div>
        <button type="button" onClick={saveWorkpad} style={{ border: 0, borderRadius: 12, padding: "11px 17px", background: saved ? "#15803d" : "#7c3aed", color: "white", fontWeight: 850, cursor: "pointer" }}>
          {saved ? "✓ Workpad Saved" : "Save Preparer Workpad"}
        </button>
      </div>
    </section>
  );
}
