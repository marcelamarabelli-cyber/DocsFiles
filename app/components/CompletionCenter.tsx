"use client";

import { useEffect, useMemo, useState } from "react";
import { addClientActivity } from "../lib/activity";

type DeliveryMethod = "Client Portal" | "Email" | "Printed Copy" | "In Person";

type CompletionRecord = {
  deliveryMethod: DeliveryMethod;
  deliveredTo: string;
  deliveredAt: string;
  clientNotified: boolean;
  paymentSettled: boolean;
  archiveComplete: boolean;
  notes: string;
  savedAt: string;
};

type CompletionCenterProps = {
  clientId: string;
  clientName: string;
  currentStatus: string;
  onActivityLogged?: () => void;
};

const emptyRecord: CompletionRecord = {
  deliveryMethod: "Client Portal",
  deliveredTo: "",
  deliveredAt: "",
  clientNotified: false,
  paymentSettled: false,
  archiveComplete: false,
  notes: "",
  savedAt: "",
};

function storageKey(clientId: string) {
  return `docsfiles-completion-record-${clientId}`;
}

function formatSavedDate(value: string) {
  if (!value) return "Not saved yet";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CompletionCenter({
  clientId,
  clientName,
  currentStatus,
  onActivityLogged,
}: CompletionCenterProps) {
  const [record, setRecord] = useState<CompletionRecord>(emptyRecord);
  const [loaded, setLoaded] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(clientId));
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<CompletionRecord>;
        setRecord({ ...emptyRecord, ...parsed });
      } else {
        setRecord(emptyRecord);
      }
    } catch {
      setRecord(emptyRecord);
    }
    setLoaded(true);
  }, [clientId]);

  const stageIndex = useMemo(() => {
    if (currentStatus === "Completed") return 3;
    if (currentStatus === "Filed") return 2;
    if (currentStatus === "Ready to File") return 1;
    return 0;
  }, [currentStatus]);

  const handoffComplete =
    Boolean(record.deliveredAt) &&
    record.clientNotified &&
    record.paymentSettled &&
    record.archiveComplete;

  function updateRecord<K extends keyof CompletionRecord>(
    key: K,
    value: CompletionRecord[K],
  ) {
    setRecord((current) => ({ ...current, [key]: value }));
  }

  function saveRecord() {
    const nextRecord = { ...record, savedAt: new Date().toISOString() };
    setRecord(nextRecord);
    window.localStorage.setItem(storageKey(clientId), JSON.stringify(nextRecord));

    addClientActivity({
      clientId,
      type: "note",
      title: "Client Delivery Record Saved",
      description: `${clientName}'s final delivery and completion record was updated.`,
      icon: "📦",
    });
    onActivityLogged?.();

    setSavedMessage("Delivery record saved");
    window.setTimeout(() => setSavedMessage(""), 1800);
  }

  if (!loaded) return null;

  const stages = [
    { label: "Ready to File", complete: stageIndex >= 1 },
    { label: "Filed", complete: stageIndex >= 2 },
    { label: "Client Delivered", complete: Boolean(record.deliveredAt) && record.clientNotified },
    { label: "Completed", complete: stageIndex >= 3 },
  ];

  return (
    <section
      style={{
        marginTop: "20px",
        padding: "22px",
        borderRadius: "22px",
        background: "white",
        border: "1px solid #dbe5f0",
        boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#7c3aed",
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            Client Delivery & Completion
          </div>
          <h2 style={{ margin: "6px 0 4px", color: "#172033", fontSize: "23px" }}>
            Final Client Handoff Record
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px", lineHeight: 1.5 }}>
            Record how the finished return was delivered, confirm the client was notified and close out the file.
          </p>
        </div>

        <div
          style={{
            minWidth: "175px",
            padding: "12px 15px",
            borderRadius: "15px",
            background: handoffComplete ? "#f0fdf4" : "#faf5ff",
            border: handoffComplete ? "1px solid #bbf7d0" : "1px solid #ddd6fe",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 900, color: "#64748b" }}>
            HANDOFF STATUS
          </div>
          <div style={{ marginTop: "4px", fontSize: "16px", fontWeight: 900, color: "#172033" }}>
            {handoffComplete ? "Complete" : "In Progress"}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "18px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
        }}
      >
        {stages.map((stage, index) => (
          <div
            key={stage.label}
            style={{
              padding: "13px",
              borderRadius: "14px",
              border: stage.complete ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
              background: stage.complete ? "#f0fdf4" : "#f8fafc",
            }}
          >
            <div style={{ display: "flex", gap: "9px", alignItems: "center" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "12px",
                  fontWeight: 900,
                  background: stage.complete ? "#16a34a" : "#e2e8f0",
                  color: stage.complete ? "white" : "#64748b",
                }}
              >
                {stage.complete ? "✓" : index + 1}
              </div>
              <div style={{ color: "#172033", fontSize: "13px", fontWeight: 850 }}>
                {stage.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "18px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "13px",
        }}
      >
        <label style={{ color: "#334155", fontSize: "12px", fontWeight: 800 }}>
          Delivery method
          <select
            value={record.deliveryMethod}
            onChange={(event) => updateRecord("deliveryMethod", event.target.value as DeliveryMethod)}
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "10px 11px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "white",
              color: "#172033",
              boxSizing: "border-box",
            }}
          >
            <option>Client Portal</option>
            <option>Email</option>
            <option>Printed Copy</option>
            <option>In Person</option>
          </select>
        </label>

        <label style={{ color: "#334155", fontSize: "12px", fontWeight: 800 }}>
          Delivered to
          <input
            value={record.deliveredTo}
            onChange={(event) => updateRecord("deliveredTo", event.target.value)}
            placeholder="Client name or recipient"
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "10px 11px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "white",
              color: "#172033",
              boxSizing: "border-box",
            }}
          />
        </label>

        <label style={{ color: "#334155", fontSize: "12px", fontWeight: 800 }}>
          Delivery date
          <input
            type="date"
            value={record.deliveredAt}
            onChange={(event) => updateRecord("deliveredAt", event.target.value)}
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "9px 11px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "white",
              color: "#172033",
              boxSizing: "border-box",
            }}
          />
        </label>
      </div>

      <div
        style={{
          marginTop: "15px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
        }}
      >
        {[
          ["clientNotified", "Client notified", "Client knows the final return is available."],
          ["paymentSettled", "Invoice / payment settled", "Final billing status has been confirmed."],
          ["archiveComplete", "File archive complete", "Final records are organized for retention."],
        ].map(([key, label, detail]) => {
          const checked = record[key as keyof CompletionRecord] as boolean;
          return (
            <label
              key={key}
              style={{
                padding: "14px",
                borderRadius: "14px",
                border: checked ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                background: checked ? "#f0fdf4" : "#f8fafc",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                  updateRecord(key as "clientNotified" | "paymentSettled" | "archiveComplete", event.target.checked)
                }
              />
              <div>
                <div style={{ color: "#172033", fontSize: "13px", fontWeight: 850 }}>{label}</div>
                <div style={{ marginTop: "3px", color: "#64748b", fontSize: "12px", lineHeight: 1.4 }}>
                  {detail}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <label
        style={{
          display: "block",
          marginTop: "15px",
          color: "#334155",
          fontSize: "12px",
          fontWeight: 800,
        }}
      >
        Delivery / completion notes
        <textarea
          value={record.notes}
          onChange={(event) => updateRecord("notes", event.target.value)}
          placeholder="Optional notes about delivery, client notification or file closeout..."
          rows={3}
          style={{
            width: "100%",
            marginTop: "6px",
            padding: "11px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            background: "white",
            color: "#172033",
            resize: "vertical",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </label>

      <div
        style={{
          marginTop: "17px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ color: "#64748b", fontSize: "12px", fontWeight: 700 }}>
          {savedMessage || `Last saved: ${formatSavedDate(record.savedAt)}`}
        </div>
        <button
          type="button"
          onClick={saveRecord}
          style={{
            border: 0,
            borderRadius: "12px",
            padding: "11px 17px",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Save Client Handoff Record
        </button>
      </div>
    </section>
  );
}
