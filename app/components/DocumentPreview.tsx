"use client";

import type { StoredDocument } from "../types/client";

type DocumentPreviewProps = {
  document: StoredDocument;
  onClose: () => void;
};

export default function DocumentPreview({
  document,
  onClose,
}: DocumentPreviewProps) {
  const isPdf =
    document.type === "application/pdf" ||
    document.name.toLowerCase().endsWith(".pdf");

  const isImage =
    document.type.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(document.name);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(15, 23, 42, 0.82)",
        backdropFilter: "blur(7px)",
        display: "grid",
        placeItems: "center",
        padding: "18px",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        style={{
          width: "min(1180px, 100%)",
          height: "min(900px, 94vh)",
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 35px 100px rgba(0,0,0,0.4)",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr)",
        }}
      >
        <header
          style={{
            padding: "15px 18px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            background: "#f8fafc",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: "#6366f1",
                fontWeight: 900,
                fontSize: "11px",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}
            >
              Document Preview
            </div>

            <div
              style={{
                marginTop: "4px",
                fontWeight: 900,
                fontSize: "16px",
                color: "#172033",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {document.name}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              flexShrink: 0,
            }}
          >
            {document.previewUrl && (
              <a
                href={document.previewUrl}
                download={document.name}
                style={{
                  padding: "9px 12px",
                  borderRadius: "10px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1d4ed8",
                  fontWeight: 800,
                  fontSize: "12px",
                  textDecoration: "none",
                }}
              >
                ⬇ Download
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "38px",
                height: "38px",
                border: "none",
                borderRadius: "10px",
                background: "#e2e8f0",
                color: "#334155",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: "17px",
              }}
            >
              ✕
            </button>
          </div>
        </header>

        <div
          style={{
            minHeight: 0,
            background: "#334155",
            display: "grid",
            placeItems: "center",
            overflow: "auto",
          }}
        >
          {!document.previewUrl ? (
            <div
              style={{
                width: "min(560px, 90%)",
                padding: "30px",
                borderRadius: "18px",
                background: "white",
                textAlign: "center",
                color: "#334155",
              }}
            >
              <div style={{ fontSize: "42px" }}>📄</div>

              <h3 style={{ margin: "12px 0 8px" }}>
                Preview is unavailable
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  lineHeight: 1.6,
                  fontSize: "14px",
                }}
              >
                This file was uploaded during an earlier browser session.
                Upload the file again while DocsFiles is running to preview it.
                Permanent previews will be available after secure cloud storage
                is connected.
              </p>
            </div>
          ) : isPdf ? (
            <iframe
              src={document.previewUrl}
              title={document.name}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                background: "white",
              }}
            />
          ) : isImage ? (
            <img
              src={document.previewUrl}
              alt={document.name}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                width: "min(560px, 90%)",
                padding: "30px",
                borderRadius: "18px",
                background: "white",
                textAlign: "center",
                color: "#334155",
              }}
            >
              <div style={{ fontSize: "42px" }}>📄</div>

              <h3 style={{ margin: "12px 0 8px" }}>
                No built-in preview for this file type
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  lineHeight: 1.6,
                  fontSize: "14px",
                }}
              >
                Download the file to open it with the appropriate application.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
