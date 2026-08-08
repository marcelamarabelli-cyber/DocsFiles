"use client";

import type { DocumentRequest, StoredDocument } from "../types/client";

type PreFilingCenterProps = {
  documents: StoredDocument[];
  requests: DocumentRequest[];
  currentStatus: string;
  onReadyToFile: () => void;
};

export default function PreFilingCenter({
  documents,
  requests,
  currentStatus,
  onReadyToFile,
}: PreFilingCenterProps) {
  const requested = requests.filter((request) => request.requested);
  const missingRequests = requested.filter(
    (request) =>
      request.status === "Waiting" || request.status === "Replace Requested",
  );
  const unresolvedReviews = requested.filter(
    (request) => request.status === "Uploaded" || request.status === "Under Review",
  );
  const unreviewedDocuments = documents.filter((document) => !document.reviewed);
  const identificationDocuments = documents.filter(
    (document) => document.folderId === "identification",
  );
  const signatureDocuments = documents.filter(
    (document) => document.folderId === "e-signatures",
  );
  const finalReturnDocuments = documents.filter(
    (document) => document.folderId === "final-return",
  );

  const checks = [
    {
      label: "Requested documents received",
      detail:
        missingRequests.length === 0
          ? "No requested items are still waiting."
          : `${missingRequests.length} requested item${missingRequests.length === 1 ? " is" : "s are"} still missing.`,
      complete: missingRequests.length === 0,
    },
    {
      label: "Document review complete",
      detail:
        unreviewedDocuments.length === 0 && unresolvedReviews.length === 0
          ? "Uploaded documents have been reviewed."
          : `${unreviewedDocuments.length + unresolvedReviews.length} review item${unreviewedDocuments.length + unresolvedReviews.length === 1 ? " remains" : "s remain"}.`,
      complete: unreviewedDocuments.length === 0 && unresolvedReviews.length === 0,
    },
    {
      label: "Identification on file",
      detail:
        identificationDocuments.length > 0
          ? `${identificationDocuments.length} identification file${identificationDocuments.length === 1 ? " is" : "s are"} saved.`
          : "Add the client's required identification.",
      complete: identificationDocuments.length > 0,
    },
    {
      label: "E-signature documents on file",
      detail:
        signatureDocuments.length > 0
          ? `${signatureDocuments.length} signature document${signatureDocuments.length === 1 ? " is" : "s are"} saved.`
          : "Add the applicable authorization and signature forms.",
      complete: signatureDocuments.length > 0,
    },
    {
      label: "Final return saved",
      detail:
        finalReturnDocuments.length > 0
          ? `${finalReturnDocuments.length} final return file${finalReturnDocuments.length === 1 ? " is" : "s are"} saved.`
          : "Save the completed federal/state return before filing.",
      complete: finalReturnDocuments.length > 0,
    },
  ];

  const completedChecks = checks.filter((check) => check.complete).length;
  const allReady = completedChecks === checks.length;
  const alreadyReady = ["Ready to File", "Filed", "Completed"].includes(currentStatus);

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
      <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#4f46e5", fontSize: "12px", fontWeight: 900, letterSpacing: "0.8px", textTransform: "uppercase" }}>
            Pre-Filing Control Center
          </div>
          <h2 style={{ margin: "6px 0 4px", color: "#172033", fontSize: "23px" }}>Ready-to-File Check</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px", lineHeight: 1.5 }}>
            One last checkpoint before the return moves to filing.
          </p>
        </div>
        <div style={{ padding: "11px 15px", borderRadius: "15px", background: allReady ? "#f0fdf4" : "#fff7ed", border: allReady ? "1px solid #bbf7d0" : "1px solid #fed7aa", minWidth: "150px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: 900, color: allReady ? "#15803d" : "#c2410c" }}>CHECKLIST</div>
          <div style={{ marginTop: "3px", fontSize: "25px", fontWeight: 900, color: "#172033" }}>{completedChecks}/{checks.length}</div>
        </div>
      </div>

      <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
        {checks.map((check) => (
          <div key={check.label} style={{ padding: "14px", borderRadius: "15px", border: check.complete ? "1px solid #bbf7d0" : "1px solid #e2e8f0", background: check.complete ? "#f0fdf4" : "#f8fafc" }}>
            <div style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "18px" }}>{check.complete ? "✅" : "○"}</span>
              <div>
                <div style={{ color: "#172033", fontWeight: 850, fontSize: "13px" }}>{check.label}</div>
                <div style={{ marginTop: "4px", color: "#64748b", fontSize: "12px", lineHeight: 1.45 }}>{check.detail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ color: allReady ? "#15803d" : "#64748b", fontSize: "13px", fontWeight: 750 }}>
          {allReady ? "All pre-filing checks are complete." : "Complete the remaining checks before marking this return Ready to File."}
        </div>
        <button
          type="button"
          disabled={!allReady || alreadyReady}
          onClick={onReadyToFile}
          style={{
            border: 0,
            borderRadius: "12px",
            padding: "11px 16px",
            background: !allReady || alreadyReady ? "#cbd5e1" : "#4f46e5",
            color: "white",
            fontWeight: 850,
            cursor: !allReady || alreadyReady ? "not-allowed" : "pointer",
          }}
        >
          {alreadyReady ? "Ready-to-File Stage Reached" : "Mark Ready to File"}
        </button>
      </div>
    </section>
  );
}
