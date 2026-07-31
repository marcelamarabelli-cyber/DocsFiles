"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import type {
  DocumentFolder,
  StoredDocument,
} from "../types/client";
import {
  createDocumentId,
  formatFileSize,
} from "../lib/storage";

type UploadZoneProps = {
  clientId: string;
  folder: DocumentFolder;
  documents: StoredDocument[];
  onAddDocuments: (documents: StoredDocument[]) => void;
  onUpdateDocument: (
    documentId: string,
    updates: Partial<StoredDocument>,
  ) => void;
  onDeleteDocument: (documentId: string) => void;
  onClose: () => void;
};

function getFileIcon(document: StoredDocument) {
  const lowerName = document.name.toLowerCase();

  if (document.type === "application/pdf" || lowerName.endsWith(".pdf")) {
    return "📕";
  }

  if (document.type.startsWith("image/")) {
    return "🖼️";
  }

  if (
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls") ||
    lowerName.endsWith(".csv")
  ) {
    return "📊";
  }

  if (lowerName.endsWith(".doc") || lowerName.endsWith(".docx")) {
    return "📝";
  }

  if (lowerName.endsWith(".zip")) {
    return "🗜️";
  }

  return "📄";
}

export default function UploadZone({
  clientId,
  folder,
  documents,
  onAddDocuments,
  onUpdateDocument,
  onDeleteDocument,
  onClose,
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function processFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);

    if (fileArray.length === 0) {
      return;
    }

    const newDocuments: StoredDocument[] = fileArray.map((file) => ({
      id: createDocumentId(),
      clientId,
      folderId: folder.id,
      name: file.name,
      type: file.type || "Unknown file type",
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Preparer",
      reviewed: false,
      previewUrl:
        file.type.startsWith("image/") ||
        file.type === "application/pdf"
          ? URL.createObjectURL(file)
          : undefined,
    }));

    onAddDocuments(newDocuments);
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      processFiles(event.target.files);
    }

    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 0) {
      processFiles(event.dataTransfer.files);
    }
  }

  function previewDocument(document: StoredDocument) {
    if (document.previewUrl) {
      window.open(
        document.previewUrl,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    window.alert(
      "This document was saved during an earlier browser session. Permanent preview and download will work after secure cloud storage is connected.",
    );
  }

  function downloadDocument(document: StoredDocument) {
    if (!document.previewUrl) {
      window.alert(
        "Permanent downloads will work after secure cloud storage is connected.",
      );
      return;
    }

    const link = window.document.createElement("a");
    link.href = document.previewUrl;
    link.download = document.name;
    link.click();
  }

  function renameDocument(document: StoredDocument) {
    const newName = window.prompt(
      "Enter the new document name:",
      document.name,
    );

    if (!newName || !newName.trim()) {
      return;
    }

    onUpdateDocument(document.id, {
      name: newName.trim(),
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(15, 23, 42, 0.68)",
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
          boxShadow:
            "0 32px 90px rgba(15, 23, 42, 0.34)",
        }}
      >
        <header
          style={{
            padding: "22px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "15px",
                background: "#eff6ff",
                display: "grid",
                placeItems: "center",
                fontSize: "27px",
              }}
            >
              {folder.icon}
            </div>

            <div>
              <div
                style={{
                  color: "#6366f1",
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Document Folder
              </div>

              <h2
                style={{
                  margin: "5px 0 3px",
                  fontSize: "24px",
                }}
              >
                {folder.title}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                {folder.subtitle}
              </p>
            </div>
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
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </header>

        <div style={{ padding: "24px" }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp,.heic,.txt"
            onChange={handleFileInput}
            style={{ display: "none" }}
          />

          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: isDragging
                ? "3px dashed #6366f1"
                : "2px dashed #94a3b8",
              background: isDragging
                ? "#eef2ff"
                : "#f8fafc",
              borderRadius: "18px",
              padding: "30px 22px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 160ms ease",
            }}
          >
            <div style={{ fontSize: "40px" }}>
              {isDragging ? "📥" : "📤"}
            </div>

            <h3
              style={{
                margin: "9px 0 6px",
                fontSize: "19px",
              }}
            >
              {isDragging
                ? "Drop the files here"
                : "Drag files here or click to upload"}
            </h3>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              PDF, Word, Excel, CSV and image files are accepted.
            </p>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{
                marginTop: "15px",
                padding: "11px 17px",
                border: "none",
                borderRadius: "11px",
                background:
                  "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Choose Files
            </button>
          </div>

          <div
            style={{
              marginTop: "23px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                }}
              >
                Uploaded Files
              </h3>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                {documents.length}{" "}
                {documents.length === 1 ? "file" : "files"} in
                this folder
              </p>
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            {documents.length === 0 ? (
              <div
                style={{
                  padding: "30px 18px",
                  borderRadius: "15px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div style={{ fontSize: "31px" }}>📭</div>

                <div
                  style={{
                    marginTop: "8px",
                    fontWeight: 700,
                  }}
                >
                  No documents uploaded yet
                </div>
              </div>
            ) : (
              documents.map((document) => {
                const reviewed = document.reviewed ?? false;
                const uploadedBy =
                  document.uploadedBy ?? "Preparer";

                return (
                  <article
                    key={document.id}
                    style={{
                      border: reviewed
                        ? "2px solid #86efac"
                        : "1px solid #dbe5f0",
                      borderRadius: "16px",
                      padding: "16px",
                      marginBottom: "12px",
                      background: reviewed
                        ? "#f0fdf4"
                        : "white",
                      boxShadow:
                        "0 6px 18px rgba(15,23,42,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "auto minmax(0, 1fr) auto",
                        gap: "14px",
                        alignItems: "start",
                      }}
                    >
                      <div
                        style={{
                          width: "54px",
                          height: "54px",
                          borderRadius: "14px",
                          background: "#eff6ff",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "27px",
                        }}
                      >
                        {getFileIcon(document)}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
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

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "7px",
                            marginTop: "9px",
                          }}
                        >
                          <span
                            style={{
                              padding: "5px 8px",
                              borderRadius: "999px",
                              background: "#f1f5f9",
                              color: "#475569",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            📦 {formatFileSize(document.size)}
                          </span>

                          <span
                            style={{
                              padding: "5px 8px",
                              borderRadius: "999px",
                              background: "#f1f5f9",
                              color: "#475569",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            👤 Uploaded by {uploadedBy}
                          </span>

                          <span
                            style={{
                              padding: "5px 8px",
                              borderRadius: "999px",
                              background: reviewed
                                ? "#dcfce7"
                                : "#fef3c7",
                              color: reviewed
                                ? "#166534"
                                : "#92400e",
                              fontSize: "11px",
                              fontWeight: 800,
                            }}
                          >
                            {reviewed
                              ? "✅ Reviewed"
                              : "⏳ Needs Review"}
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: "9px",
                            fontSize: "11px",
                            color: "#64748b",
                          }}
                        >
                          Uploaded{" "}
                          {new Date(
                            document.uploadedAt,
                          ).toLocaleString()}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Delete ${document.name}?`,
                          );

                          if (confirmed) {
                            onDeleteDocument(document.id);
                          }
                        }}
                        title="Delete document"
                        style={{
                          width: "38px",
                          height: "38px",
                          border: "1px solid #fecdd3",
                          borderRadius: "10px",
                          background: "#fff1f2",
                          color: "#be123c",
                          cursor: "pointer",
                        }}
                      >
                        🗑️
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginTop: "15px",
                        paddingTop: "13px",
                        borderTop: "1px solid #e2e8f0",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          previewDocument(document)
                        }
                        style={{
                          padding: "9px 12px",
                          border: "1px solid #bfdbfe",
                          borderRadius: "9px",
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          cursor: "pointer",
                          fontWeight: 800,
                          fontSize: "12px",
                        }}
                      >
                        👁 Preview
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          downloadDocument(document)
                        }
                        style={{
                          padding: "9px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "9px",
                          background: "#f8fafc",
                          color: "#334155",
                          cursor: "pointer",
                          fontWeight: 800,
                          fontSize: "12px",
                        }}
                      >
                        ⬇ Download
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          renameDocument(document)
                        }
                        style={{
                          padding: "9px 12px",
                          border: "1px solid #ddd6fe",
                          borderRadius: "9px",
                          background: "#f5f3ff",
                          color: "#6d28d9",
                          cursor: "pointer",
                          fontWeight: 800,
                          fontSize: "12px",
                        }}
                      >
                        ✏ Rename
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateDocument(document.id, {
                            reviewed: !reviewed,
                          })
                        }
                        style={{
                          padding: "9px 12px",
                          border: reviewed
                            ? "1px solid #86efac"
                            : "1px solid #fde68a",
                          borderRadius: "9px",
                          background: reviewed
                            ? "#dcfce7"
                            : "#fffbeb",
                          color: reviewed
                            ? "#166534"
                            : "#92400e",
                          cursor: "pointer",
                          fontWeight: 800,
                          fontSize: "12px",
                        }}
                      >
                        {reviewed
                          ? "↩ Mark Unreviewed"
                          : "⭐ Mark Reviewed"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div
            style={{
              marginTop: "18px",
              padding: "13px 15px",
              borderRadius: "13px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#92400e",
              fontSize: "12px",
              lineHeight: 1.55,
            }}
          >
            <strong>Development version:</strong> document
            information is saved in this browser. Permanent file
            previews and downloads across sessions will be added
            when secure cloud storage is connected.
          </div>
        </div>
      </section>
    </div>
  );
}
