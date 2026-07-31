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
  onDeleteDocument: (documentId: string) => void;
  onClose: () => void;
};

export default function UploadZone({
  clientId,
  folder,
  documents,
  onAddDocuments,
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
      previewUrl:
        file.type.startsWith("image/") || file.type === "application/pdf"
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

  function openDocument(document: StoredDocument) {
    if (document.previewUrl) {
      window.open(document.previewUrl, "_blank", "noopener,noreferrer");
      return;
    }

    window.alert(
      "This file is listed in DocsFiles, but its full preview will be available after cloud storage is connected.",
    );
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
          width: "min(920px, 100%)",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "white",
          borderRadius: "22px",
          border: "1px solid #dbe5f0",
          boxShadow: "0 32px 90px rgba(15, 23, 42, 0.34)",
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
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
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

              <h2 style={{ margin: "5px 0 3px", fontSize: "24px" }}>
                {folder.title}
              </h2>

              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
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
              background: isDragging ? "#eef2ff" : "#f8fafc",
              borderRadius: "18px",
              padding: "34px 22px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 160ms ease",
            }}
          >
            <div style={{ fontSize: "42px" }}>
              {isDragging ? "📥" : "📤"}
            </div>

            <h3 style={{ margin: "10px 0 6px", fontSize: "19px" }}>
              {isDragging
                ? "Drop the files here"
                : "Drag files here or click to upload"}
            </h3>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "13px",
                lineHeight: 1.55,
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
                marginTop: "16px",
                padding: "11px 17px",
                border: "none",
                borderRadius: "11px",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
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
              <h3 style={{ margin: 0, fontSize: "18px" }}>Uploaded Files</h3>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                {documents.length} {documents.length === 1 ? "file" : "files"} in
                this folder
              </p>
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            {documents.length === 0 ? (
              <div
                style={{
                  padding: "28px 18px",
                  borderRadius: "15px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div style={{ fontSize: "31px" }}>📭</div>

                <div style={{ marginTop: "8px", fontWeight: 700 }}>
                  No documents uploaded yet
                </div>
              </div>
            ) : (
              documents.map((document) => (
                <div
                  key={document.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto minmax(0, 1fr) auto",
                    gap: "13px",
                    alignItems: "center",
                    padding: "13px 14px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "13px",
                    marginBottom: "9px",
                    background: "white",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "11px",
                      background: "#eff6ff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "21px",
                    }}
                  >
                    {document.type === "application/pdf"
                      ? "📕"
                      : document.type.startsWith("image/")
                        ? "🖼️"
                        : document.name.endsWith(".xlsx") ||
                            document.name.endsWith(".xls") ||
                            document.name.endsWith(".csv")
                          ? "📊"
                          : "📄"}
                  </div>

                  <button
                    type="button"
                    onClick={() => openDocument(document)}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
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
                        marginTop: "4px",
                        fontSize: "11px",
                        color: "#64748b",
                      }}
                    >
                      {formatFileSize(document.size)} · Uploaded{" "}
                      {new Date(document.uploadedAt).toLocaleString()}
                    </div>
                  </button>

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
                    title="Delete file"
                    style={{
                      width: "36px",
                      height: "36px",
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
              ))
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
            <strong>Current development version:</strong> file names and
            information are saved in this browser. Cloud file storage and
            permanent document downloads will be connected in a future build.
          </div>
        </div>
      </section>
    </div>
  );
}
