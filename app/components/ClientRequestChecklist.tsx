"use client";

import {
  documentFolders,
  type DocumentFolderId,
  type DocumentRequest,
} from "../types/client";

type ClientRequestChecklistProps = {
  requests: DocumentRequest[];
  onOpenFolder: (folderId: DocumentFolderId) => void;
};

function getStatusStyle(status: DocumentRequest["status"]) {
  switch (status) {
    case "Accepted":
      return {
        background: "#dcfce7",
        color: "#166534",
        border: "#86efac",
        icon: "✅",
      };

    case "Uploaded":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "#93c5fd",
        icon: "📤",
      };

    case "Under Review":
      return {
        background: "#f3e8ff",
        color: "#7e22ce",
        border: "#d8b4fe",
        icon: "👀",
      };

    case "Replace Requested":
      return {
        background: "#ffe4e6",
        color: "#be123c",
        border: "#fda4af",
        icon: "🔁",
      };

    default:
      return {
        background: "#fef3c7",
        color: "#92400e",
        border: "#fcd34d",
        icon: "⏳",
      };
  }
}

export default function ClientRequestChecklist({
  requests,
  onOpenFolder,
}: ClientRequestChecklistProps) {
  const requestedItems = requests.filter((request) => request.requested);

  const acceptedCount = requestedItems.filter(
    (request) => request.status === "Accepted",
  ).length;

  const uploadedCount = requestedItems.filter(
    (request) =>
      request.status === "Uploaded" ||
      request.status === "Under Review" ||
      request.status === "Accepted",
  ).length;

  const progress =
    requestedItems.length === 0
      ? 0
      : Math.round((acceptedCount / requestedItems.length) * 100);

  if (requestedItems.length === 0) {
    return (
      <section
        style={{
          marginTop: "20px",
          padding: "22px",
          borderRadius: "20px",
          background: "white",
          border: "1px solid #dbe5f0",
          boxShadow: "0 9px 25px rgba(15,23,42,0.05)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "34px" }}>📋</div>

        <h2 style={{ margin: "10px 0 6px", fontSize: "20px" }}>
          No documents have been specifically requested
        </h2>

        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "13px",
            lineHeight: 1.55,
          }}
        >
          You may still upload documents using the folders below.
        </p>
      </section>
    );
  }

  return (
    <section
      style={{
        marginTop: "20px",
        padding: "22px",
        borderRadius: "21px",
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
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#6366f1",
              fontSize: "11px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            TaxesDeal Document Checklist
          </div>

          <h2 style={{ margin: "5px 0 4px", fontSize: "22px" }}>
            Documents Requested from You
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Upload each requested item and follow any instructions from your
            tax preparer.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "9px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "8px 11px",
              borderRadius: "999px",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: "11px",
              fontWeight: 900,
            }}
          >
            📤 {uploadedCount} Uploaded
          </span>

          <span
            style={{
              padding: "8px 11px",
              borderRadius: "999px",
              background: "#dcfce7",
              color: "#166534",
              fontSize: "11px",
              fontWeight: 900,
            }}
          >
            ✅ {acceptedCount} Accepted
          </span>
        </div>
      </div>

      <div style={{ marginTop: "17px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "6px",
            fontSize: "11px",
            fontWeight: 800,
            color: "#64748b",
          }}
        >
          <span>Checklist progress</span>
          <span>
            {acceptedCount} of {requestedItems.length} accepted · {progress}%
          </span>
        </div>

        <div
          style={{
            height: "9px",
            borderRadius: "999px",
            overflow: "hidden",
            background: "#e2e8f0",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: "999px",
              background:
                progress === 100
                  ? "#22c55e"
                  : "linear-gradient(90deg, #2563eb, #7c3aed)",
              transition: "width 220ms ease",
            }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "18px",
          display: "grid",
          gap: "11px",
        }}
      >
        {requestedItems.map((request) => {
          const folder = documentFolders.find(
            (item) => item.id === request.category,
          );

          const statusStyle = getStatusStyle(request.status);

          return (
            <article
              key={request.id}
              style={{
                padding: "15px",
                borderRadius: "15px",
                border: `1px solid ${statusStyle.border}`,
                background:
                  request.status === "Accepted" ? "#f0fdf4" : "#f8fafc",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr) auto",
                  gap: "13px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "12px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "23px",
                  }}
                >
                  {folder?.icon ?? "📄"}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: "14px",
                      color: "#172033",
                    }}
                  >
                    {request.title}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#64748b",
                    }}
                  >
                    Upload to: {folder?.title ?? "Documents"}
                  </div>

                  {request.note && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "8px 10px",
                        borderRadius: "9px",
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        color: "#9a3412",
                        fontSize: "11px",
                        lineHeight: 1.45,
                      }}
                    >
                      <strong>Instructions:</strong> {request.note}
                    </div>
                  )}
                </div>

                <span
                  style={{
                    padding: "6px 9px",
                    borderRadius: "999px",
                    background: statusStyle.background,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.border}`,
                    fontSize: "10px",
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  {statusStyle.icon} {request.status}
                </span>
              </div>

              {request.status !== "Accepted" && (
                <button
                  type="button"
                  onClick={() => onOpenFolder(request.category)}
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    borderRadius: "10px",
                    background:
                      request.status === "Replace Requested"
                        ? "#be123c"
                        : "linear-gradient(135deg, #2563eb, #7c3aed)",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 900,
                    fontSize: "12px",
                  }}
                >
                  {request.status === "Replace Requested"
                    ? "🔁 Upload Replacement"
                    : "📤 Upload Here"}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
