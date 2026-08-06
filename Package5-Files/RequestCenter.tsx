"use client";

import { useMemo, useState } from "react";
import {
  documentFolders,
  standardDocumentRequests,
  type Client,
  type DocumentRequest,
  type RequestStatus,
} from "../types/client";

type RequestCenterProps = {
  client: Client;
  requests: DocumentRequest[];
  onChange: (requests: DocumentRequest[]) => void;
  onClose: () => void;
};

const statusOptions: RequestStatus[] = [
  "Waiting",
  "Uploaded",
  "Under Review",
  "Accepted",
  "Replace Requested",
];

function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `request-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function RequestCenter({
  client,
  requests,
  onChange,
  onClose,
}: RequestCenterProps) {
  const [newTitle, setNewTitle] = useState("");

  const clientRequests = useMemo(
    () => requests.filter((request) => request.clientId === client.id),
    [requests, client.id],
  );

  function addStandardRequests() {
    const existingTitles = new Set(
      clientRequests.map((request) => request.title.toLowerCase()),
    );

    const newRequests = standardDocumentRequests
      .filter((item) => !existingTitles.has(item.title.toLowerCase()))
      .map<DocumentRequest>((item) => ({
        id: createRequestId(),
        clientId: client.id,
        title: item.title,
        category: item.category,
        requested: false,
        status: "Waiting",
        note: "",
        createdAt: new Date().toISOString(),
      }));

    onChange([...requests, ...newRequests]);
  }

  function updateRequest(
    requestId: string,
    updates: Partial<DocumentRequest>,
  ) {
    onChange(
      requests.map((request) =>
        request.id === requestId
          ? { ...request, ...updates }
          : request,
      ),
    );
  }

  function deleteRequest(requestId: string) {
    const confirmed = window.confirm("Delete this document request?");

    if (!confirmed) {
      return;
    }

    onChange(requests.filter((request) => request.id !== requestId));
  }

  function addCustomRequest() {
    const title = newTitle.trim();

    if (!title) {
      return;
    }

    const newRequest: DocumentRequest = {
      id: createRequestId(),
      clientId: client.id,
      title,
      category: "receipts",
      requested: true,
      status: "Waiting",
      note: "",
      createdAt: new Date().toISOString(),
    };

    onChange([...requests, newRequest]);
    setNewTitle("");
  }

  const requestedCount = clientRequests.filter(
    (request) => request.requested,
  ).length;

  const acceptedCount = clientRequests.filter(
    (request) => request.requested && request.status === "Accepted",
  ).length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        style={{
          width: "min(980px, 100%)",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "white",
          borderRadius: "22px",
          border: "1px solid #dbe5f0",
          boxShadow: "0 32px 90px rgba(15,23,42,0.35)",
        }}
      >
        <header
          style={{
            padding: "22px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                color: "#6366f1",
                fontSize: "12px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Client Request Center
            </div>

            <h2 style={{ margin: "6px 0 4px", fontSize: "25px" }}>
              Documents Needed from {client.primaryName}
            </h2>

            <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
              Select the documents the client must provide and track each item.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "38px",
              height: "38px",
              border: "none",
              borderRadius: "11px",
              background: "#f1f5f9",
              color: "#475569",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            ✕
          </button>
        </header>

        <div style={{ padding: "22px 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "11px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                padding: "15px",
                borderRadius: "14px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
              }}
            >
              <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 800 }}>
                REQUESTED
              </div>
              <div style={{ marginTop: "4px", fontSize: "25px", fontWeight: 900 }}>
                {requestedCount}
              </div>
            </div>

            <div
              style={{
                padding: "15px",
                borderRadius: "14px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
              }}
            >
              <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 800 }}>
                ACCEPTED
              </div>
              <div style={{ marginTop: "4px", fontSize: "25px", fontWeight: 900 }}>
                {acceptedCount}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <button
              type="button"
              onClick={addStandardRequests}
              style={{
                padding: "11px 15px",
                border: "none",
                borderRadius: "11px",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              ＋ Load Standard Tax Checklist
            </button>

            <input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Add a custom document request..."
              style={{
                flex: "1 1 260px",
                padding: "11px 13px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
              }}
            />

            <button
              type="button"
              onClick={addCustomRequest}
              style={{
                padding: "11px 15px",
                border: "none",
                borderRadius: "11px",
                background: "#172033",
                color: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Add Custom
            </button>
          </div>

          {clientRequests.length === 0 ? (
            <div
              style={{
                padding: "35px 20px",
                borderRadius: "15px",
                border: "2px dashed #cbd5e1",
                background: "#f8fafc",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <div style={{ fontSize: "34px" }}>📋</div>
              <div style={{ marginTop: "9px", fontWeight: 800 }}>
                No document requests created yet
              </div>
            </div>
          ) : (
            clientRequests.map((request) => {
              const folder = documentFolders.find(
                (item) => item.id === request.category,
              );

              return (
                <article
                  key={request.id}
                  style={{
                    padding: "15px",
                    borderRadius: "14px",
                    border: request.requested
                      ? "1px solid #93c5fd"
                      : "1px solid #e2e8f0",
                    background: request.requested ? "#eff6ff" : "#f8fafc",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto minmax(0, 1fr) auto",
                      gap: "13px",
                      alignItems: "start",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={request.requested}
                      onChange={(event) =>
                        updateRequest(request.id, {
                          requested: event.target.checked,
                        })
                      }
                      style={{
                        width: "20px",
                        height: "20px",
                        marginTop: "3px",
                        cursor: "pointer",
                      }}
                    />

                    <div>
                      <div style={{ fontWeight: 900, color: "#172033" }}>
                        {request.title}
                      </div>

                      <div
                        style={{
                          marginTop: "4px",
                          color: "#64748b",
                          fontSize: "11px",
                        }}
                      >
                        {folder?.icon} {folder?.title}
                      </div>

                      <textarea
                        value={request.note}
                        onChange={(event) =>
                          updateRequest(request.id, {
                            note: event.target.value,
                          })
                        }
                        placeholder="Optional instructions for the client..."
                        rows={2}
                        style={{
                          width: "100%",
                          marginTop: "10px",
                          padding: "9px 10px",
                          borderRadius: "9px",
                          border: "1px solid #cbd5e1",
                          resize: "vertical",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteRequest(request.id)}
                      style={{
                        width: "36px",
                        height: "36px",
                        border: "1px solid #fecdd3",
                        borderRadius: "9px",
                        background: "#fff1f2",
                        cursor: "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginTop: "12px",
                    }}
                  >
                    <select
                      value={request.category}
                      onChange={(event) =>
                        updateRequest(request.id, {
                          category: event.target.value as DocumentRequest["category"],
                        })
                      }
                      style={{
                        padding: "10px",
                        borderRadius: "9px",
                        border: "1px solid #cbd5e1",
                        background: "white",
                      }}
                    >
                      {documentFolders.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </select>

                    <select
                      value={request.status}
                      onChange={(event) =>
                        updateRequest(request.id, {
                          status: event.target.value as RequestStatus,
                        })
                      }
                      style={{
                        padding: "10px",
                        borderRadius: "9px",
                        border: "1px solid #cbd5e1",
                        background: "white",
                      }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
