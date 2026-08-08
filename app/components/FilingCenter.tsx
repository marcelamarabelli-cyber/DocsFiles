"use client";

import { useEffect, useMemo, useState } from "react";
import type { StoredDocument } from "../types/client";

type FilingRecord = {
  federalConfirmation: string;
  stateConfirmation: string;
  clientCopyDelivered: boolean;
  filedAt: string;
  completedAt: string;
};

type FilingCenterProps = {
  clientId: string;
  clientName: string;
  currentStatus: string;
  documents: StoredDocument[];
  onStatusChange: (status: "Filed" | "Completed") => void;
};

const emptyRecord: FilingRecord = {
  federalConfirmation: "",
  stateConfirmation: "",
  clientCopyDelivered: false,
  filedAt: "",
  completedAt: "",
};

function storageKey(clientId: string) {
  return `docsfiles-filing-record-${clientId}`;
}

function formatSavedDate(value: string) {
  if (!value) {
    return "Not recorded yet";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function FilingCenter({
  clientId,
  clientName,
  currentStatus,
  documents,
  onStatusChange,
}: FilingCenterProps) {
  const [record, setRecord] = useState<FilingRecord>(emptyRecord);
  const [loaded, setLoaded] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(clientId));

      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FilingRecord>;
        setRecord({ ...emptyRecord, ...parsed });
      } else {
        setRecord(emptyRecord);
      }
    } catch {
      setRecord(emptyRecord);
    }

    setLoaded(true);
  }, [clientId]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    window.localStorage.setItem(storageKey(clientId), JSON.stringify(record));
  }, [clientId, loaded, record]);

  const signatureFiles = useMemo(
    () => documents.filter((document) => document.folderId === "e-signatures"),
    [documents],
  );
  const finalReturnFiles = useMemo(
    () => documents.filter((document) => document.folderId === "final-return"),
    [documents],
  );
  const paymentFiles = useMemo(
    () => documents.filter((document) => document.folderId === "invoices-payments"),
    [documents],
  );

  const readyStageReached = ["Ready to File", "Filed", "Completed"].includes(
    currentStatus,
  );
  const filingRequirements = [
    {
      label: "Ready-to-File stage reached",
      detail: readyStageReached
        ? `Current workflow status: ${currentStatus}.`
        : "Complete the Pre-Filing Center first.",
      complete: readyStageReached,
    },
    {
      label: "Signed authorization on file",
      detail:
        signatureFiles.length > 0
          ? `${signatureFiles.length} e-signature document${signatureFiles.length === 1 ? "" : "s"} saved.`
          : "Add the signed e-file authorization before transmitting.",
      complete: signatureFiles.length > 0,
    },
    {
      label: "Final return copy saved",
      detail:
        finalReturnFiles.length > 0
          ? `${finalReturnFiles.length} final return file${finalReturnFiles.length === 1 ? "" : "s"} saved.`
          : "Save the completed federal/state return before transmitting.",
      complete: finalReturnFiles.length > 0,
    },
    {
      label: "Invoice / payment record on file",
      detail:
        paymentFiles.length > 0
          ? `${paymentFiles.length} invoice or payment record${paymentFiles.length === 1 ? "" : "s"} saved.`
          : "Add the invoice, receipt or payment record before closing the engagement.",
      complete: paymentFiles.length > 0,
    },
  ];

  const filingReady = filingRequirements.every((item) => item.complete);
  const alreadyFiled = ["Filed", "Completed"].includes(currentStatus);
  const alreadyCompleted = currentStatus === "Completed";

  function updateRecord<K extends keyof FilingRecord>(
    key: K,
    value: FilingRecord[K],
  ) {
    setRecord((current) => ({ ...current, [key]: value }));
  }

  function showSavedMessage(message: string) {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(""), 1800);
  }

  function markFiled() {
    const filedAt = record.filedAt || new Date().toISOString();
    setRecord((current) => ({ ...current, filedAt }));
    onStatusChange("Filed");
    showSavedMessage("Return marked Filed");
  }

  function markCompleted() {
    const completedAt = record.completedAt || new Date().toISOString();
    setRecord((current) => ({ ...current, completedAt }));
    onStatusChange("Completed");
    showSavedMessage("Engagement marked Completed");
  }

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
              color: "#0369a1",
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            Filing & Delivery Center
          </div>
          <h2 style={{ margin: "6px 0 4px", color: "#172033", fontSize: "23px" }}>
            Finish {clientName}&apos;s Return
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px", lineHeight: 1.5 }}>
            Confirm filing prerequisites, record transmission details and close the engagement.
          </p>
        </div>

        <div
          style={{
            minWidth: "160px",
            padding: "12px 15px",
            borderRadius: "15px",
            background: alreadyCompleted ? "#f0fdf4" : alreadyFiled ? "#eff6ff" : "#f8fafc",
            border: alreadyCompleted
              ? "1px solid #bbf7d0"
              : alreadyFiled
                ? "1px solid #bfdbfe"
                : "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 900, color: "#64748b" }}>CURRENT STAGE</div>
          <div style={{ marginTop: "4px", fontSize: "16px", fontWeight: 900, color: "#172033" }}>
            {currentStatus}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "18px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
        }}
      >
        {filingRequirements.map((item) => (
          <div
            key={item.label}
            style={{
              padding: "14px",
              borderRadius: "15px",
              border: item.complete ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
              background: item.complete ? "#f0fdf4" : "#f8fafc",
            }}
          >
            <div style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "18px" }}>{item.complete ? "✅" : "○"}</span>
              <div>
                <div style={{ color: "#172033", fontWeight: 850, fontSize: "13px" }}>{item.label}</div>
                <div style={{ marginTop: "4px", color: "#64748b", fontSize: "12px", lineHeight: 1.45 }}>
                  {item.detail}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "18px",
          padding: "17px",
          borderRadius: "17px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "13px",
        }}
      >
        <label style={{ color: "#334155", fontSize: "12px", fontWeight: 800 }}>
          Federal filing confirmation
          <input
            value={record.federalConfirmation}
            onChange={(event) => updateRecord("federalConfirmation", event.target.value)}
            placeholder="Example: IRS submission / acceptance ID"
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
          State filing confirmation
          <input
            value={record.stateConfirmation}
            onChange={(event) => updateRecord("stateConfirmation", event.target.value)}
            placeholder="Optional state submission / acceptance ID"
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
      </div>

      <div
        style={{
          marginTop: "13px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "10px",
        }}
      >
        <div style={{ padding: "13px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 850 }}>FILED DATE</div>
          <div style={{ marginTop: "4px", color: "#172033", fontSize: "13px", fontWeight: 800 }}>
            {formatSavedDate(record.filedAt)}
          </div>
        </div>
        <div style={{ padding: "13px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 850 }}>COMPLETED DATE</div>
          <div style={{ marginTop: "4px", color: "#172033", fontSize: "13px", fontWeight: 800 }}>
            {formatSavedDate(record.completedAt)}
          </div>
        </div>
      </div>

      <label
        style={{
          marginTop: "15px",
          padding: "14px",
          borderRadius: "14px",
          background: record.clientCopyDelivered ? "#f0fdf4" : "#fff7ed",
          border: record.clientCopyDelivered ? "1px solid #bbf7d0" : "1px solid #fed7aa",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={record.clientCopyDelivered}
          onChange={(event) => updateRecord("clientCopyDelivered", event.target.checked)}
        />
        <div>
          <div style={{ color: "#172033", fontSize: "13px", fontWeight: 850 }}>
            Final client copy delivered / available to client
          </div>
          <div style={{ marginTop: "2px", color: "#64748b", fontSize: "12px" }}>
            Use this final confirmation before marking the engagement Completed.
          </div>
        </div>
      </label>

      <div
        style={{
          marginTop: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ color: filingReady ? "#15803d" : "#64748b", fontSize: "13px", fontWeight: 750 }}>
          {savedMessage ||
            (filingReady
              ? "Filing prerequisites are complete."
              : "Complete the remaining filing prerequisites before transmitting the return.")}
        </div>

        <div style={{ display: "flex", gap: "9px", flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={!filingReady || alreadyFiled}
            onClick={markFiled}
            style={{
              border: 0,
              borderRadius: "12px",
              padding: "11px 16px",
              background: !filingReady || alreadyFiled ? "#cbd5e1" : "#2563eb",
              color: "white",
              fontWeight: 850,
              cursor: !filingReady || alreadyFiled ? "not-allowed" : "pointer",
            }}
          >
            {alreadyFiled ? "Filed Stage Reached" : "Mark Filed"}
          </button>

          <button
            type="button"
            disabled={!alreadyFiled || !record.clientCopyDelivered || alreadyCompleted}
            onClick={markCompleted}
            style={{
              border: 0,
              borderRadius: "12px",
              padding: "11px 16px",
              background:
                !alreadyFiled || !record.clientCopyDelivered || alreadyCompleted
                  ? "#cbd5e1"
                  : "#16a34a",
              color: "white",
              fontWeight: 850,
              cursor:
                !alreadyFiled || !record.clientCopyDelivered || alreadyCompleted
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {alreadyCompleted ? "Engagement Completed" : "Mark Completed"}
          </button>
        </div>
      </div>
    </section>
  );
}
