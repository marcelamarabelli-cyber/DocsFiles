"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import DocumentPreview from "./DocumentPreview";
import type {
  DocumentFolder,
  StoredDocument,
} from "../types/client";
import {
  createDocumentId,
  createDocumentPreviewUrl,
  deleteDocumentFile,
  downloadStoredDocument,
  formatFileSize,
  saveDocumentFile,
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

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".txt",
];

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");

  return dotIndex >= 0
    ? fileName.slice(dotIndex).toLowerCase()
    : "";
}

function isAcceptedFile(file: File) {
  return ACCEPTED_EXTENSIONS.includes(
    getFileExtension(file.name),
  );
}

function getFileIcon(document: StoredDocument) {
  const lowerName = document.name.toLowerCase();

  if (
    document.type === "application/pdf" ||
    lowerName.endsWith(".pdf")
  ) {
    return "📕";
  }

  if (
    document.type.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(document.name)
  ) {
    return "🖼️";
  }

  if (
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls") ||
    lowerName.endsWith(".csv")
  ) {
    return "📊";
  }

  if (
    lowerName.endsWith(".doc") ||
    lowerName.endsWith(".docx")
  ) {
    return "📝";
  }

  if (lowerName.endsWith(".txt")) {
    return "📃";
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
  const [isSavingFiles, setIsSavingFiles] = useState(false);
  const [savingMessage, setSavingMessage] = useState("");
  const [previewDocumentItem, setPreviewDocumentItem] =
    useState<StoredDocument | null>(null);

  useEffect(() => {
    return () => {
      if (
        previewDocumentItem?.previewUrl?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          previewDocumentItem.previewUrl,
        );
      }
    };
  }, [previewDocumentItem]);

  async function processFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);

    if (fileArray.length === 0) {
      return;
    }

    const rejectedFiles: string[] = [];
    const duplicateFiles: string[] = [];

    const acceptedFiles = fileArray.filter((file) => {
      if (!isAcceptedFile(file)) {
        rejectedFiles.push(
          `${file.name} — unsupported file type`,
        );
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push(
          `${file.name} — larger than 25 MB`,
        );
        return false;
      }

      const isDuplicate = documents.some(
        (document) =>
          document.name.toLowerCase() ===
            file.name.toLowerCase() &&
          document.size === file.size,
      );

      if (isDuplicate) {
        duplicateFiles.push(file.name);
        return false;
      }

      return true;
    });

    if (duplicateFiles.length > 0) {
      window.alert(
        `Duplicate files skipped:\n\n${duplicateFiles.join(
          "\n",
        )}`,
      );
    }

    if (rejectedFiles.length > 0) {
      window.alert(
        `These files could not be added:\n\n${rejectedFiles.join(
          "\n",
        )}`,
      );
    }

    if (acceptedFiles.length === 0) {
      return;
    }

    setIsSavingFiles(true);

    const savedDocuments: StoredDocument[] = [];
    const failedFiles: string[] = [];

    try {
      for (let index = 0; index < acceptedFiles.length; index += 1) {
        const file = acceptedFiles[index];

        setSavingMessage(
          `Saving ${index + 1} of ${
            acceptedFiles.length
          }: ${file.name}`,
        );

        const document: StoredDocument = {
          id: createDocumentId(),
          clientId,
          folderId: folder.id,
          name: file.name,
          type: file.type || "Unknown file type",
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: "Preparer",
          reviewed: false,
        };

        try {
          await saveDocumentFile(document, file);
          savedDocuments.push(document);
        } catch (error) {
          console.error(
            `Unable to save ${file.name}:`,
            error,
          );

          failedFiles.push(file.name);
        }
      }

      if (savedDocuments.length > 0) {
        onAddDocuments(savedDocuments);
      }

      if (failedFiles.length > 0) {
        window.alert(
          `These files could not be saved permanently:\n\n${failedFiles.join(
            "\n",
          )}`,
        );
      }
    } finally {
      setIsSavingFiles(false);
      setSavingMessage("");
    }
  }

  function handleFileInput(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    if (event.target.files) {
      void processFiles(event.target.files);
    }

    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 0) {
      void processFiles(event.dataTransfer.files);
    }
  }

  async function previewDocument(
    document: StoredDocument,
  ) {
    try {
      const previewUrl = await createDocumentPreviewUrl(
        document.id,
      );

      if (!previewUrl) {
        window.alert(
          "The saved file could not be found. It may have been uploaded before permanent storage was installed. Please upload it again.",
        );
        return;
      }

      setPreviewDocumentItem({
        ...document,
        previewUrl,
      });
    } catch (error) {
      console.error("Unable to preview document:", error);

      window.alert(
        "DocsFiles could not open this document preview.",
      );
    }
  }

  async function downloadDocument(
    document: StoredDocument,
  ) {
    try {
      const downloaded =
        await downloadStoredDocument(document);

      if (!downloaded) {
        window.alert(
          "The permanent file could not be found. Please upload this document again.",
        );
      }
    } catch (error) {
      console.error("Unable to download document:", error);

      window.alert(
        "DocsFiles could not download this document.",
      );
    }
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

  async function removeDocument(
    document: StoredDocument,
  ) {
    const confirmed = window.confirm(
      `Delete ${document.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDocumentFile(document.id);
      onDeleteDocument(document.id);

      if (previewDocumentItem?.id === document.id) {
        setPreviewDocumentItem(null);
      }
    } catch (error) {
      console.error("Unable to delete document:", error);

      window.alert(
        "DocsFiles could not delete this document. Please try again.",
      );
    }
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
        if (
          event.target === event.currentTarget &&
          !isSavingFiles
        ) {
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
            disabled={isSavingFiles}
            title={
              isSavingFiles
                ? "Please wait until the files finish saving"
                : "Close folder"
            }
            style={{
              width: "38px",
              height: "38px",
              border: "none",
              borderRadius: "11px",
              background: "#f1f5f9",
              color: "#475569",
              cursor: isSavingFiles
                ? "not-allowed"
                : "pointer",
              fontWeight: 800,
              opacity: isSavingFiles ? 0.55 : 1,
            }}
          >
            ✕
          </button>
        </header>

        <div style={{ padding: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <UploadStat
              icon="📁"
              label="Total files"
              value={documents.length}
            />

            <UploadStat
              icon="✅"
              label="Reviewed"
              value={
                documents.filter(
                  (document) => document.reviewed,
                ).length
              }
            />

            <UploadStat
              icon="⏳"
              label="Pending"
              value={
                documents.filter(
                  (document) => !document.reviewed,
                ).length
              }
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS.join(",")}
            onChange={handleFileInput}
            disabled={isSavingFiles}
            style={{ display: "none" }}
          />

          <div
            onDragEnter={(event) => {
              event.preventDefault();

              if (!isSavingFiles) {
                setIsDragging(true);
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();

              if (!isSavingFiles) {
                setIsDragging(true);
              }
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              if (!isSavingFiles) {
                handleDrop(event);
              }
            }}
            onClick={() => {
              if (!isSavingFiles) {
                fileInputRef.current?.click();
              }
            }}
            style={{
              border: isDragging
                ? "3px dashed #6366f1"
                : "2px dashed #94a3b8",
              background: isSavingFiles
                ? "#eef2ff"
                : isDragging
                  ? "#eef2ff"
                  : "#f8fafc",
              borderRadius: "18px",
              padding: "30px 22px",
              textAlign: "center",
              cursor: isSavingFiles
                ? "wait"
                : "pointer",
              transition: "all 160ms ease",
              opacity: isSavingFiles ? 0.85 : 1,
            }}
          >
            <div style={{ fontSize: "40px" }}>
              {isSavingFiles
                ? "💾"
                : isDragging
                  ? "📥"
                  : "📤"}
            </div>

            <h3
              style={{
                margin: "9px 0 6px",
                fontSize: "19px",
              }}
            >
              {isSavingFiles
                ? "Saving files permanently…"
                : isDragging
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
              {isSavingFiles
                ? savingMessage
                : "PDF, Word, Excel, CSV and image files up to 25 MB each are accepted."}
            </p>

            {!isSavingFiles && (
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
            )}
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
                {documents.length === 1
                  ? "file"
                  : "files"}{" "}
                in this folder
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
                const reviewed =
                  document.reviewed ?? false;

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
                          title={document.name}
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
                            📦{" "}
                            {formatFileSize(
                              document.size,
                            )}
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
                          void removeDocument(document);
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
                        borderTop:
                          "1px solid #e2e8f0",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          void previewDocument(document);
                        }}
                        style={{
                          padding: "9px 12px",
                          border:
                            "1px solid #bfdbfe",
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
                        onClick={() => {
                          void downloadDocument(document);
                        }}
                        style={{
                          padding: "9px 12px",
                          border:
                            "1px solid #cbd5e1",
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
                          border:
                            "1px solid #ddd6fe",
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
                          onUpdateDocument(
                            document.id,
                            {
                              reviewed: !reviewed,
                            },
                          )
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
              background: "#ecfdf5",
              border: "1px solid #86efac",
              color: "#166534",
              fontSize: "12px",
              lineHeight: 1.55,
            }}
          >
            <strong>
              Permanent browser storage enabled:
            </strong>{" "}
            newly uploaded files are stored on this Mac and
            remain available after refreshing or reopening
            DocsFiles. Secure online cloud storage and client
            login will be added before real client use.
          </div>
        </div>
      </section>

      {previewDocumentItem && (
        <DocumentPreview
          document={previewDocumentItem}
          onClose={() =>
            setPreviewDocumentItem(null)
          }
        />
      )}
    </div>
  );
}

function UploadStat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        background: "#f8fafc",
        padding: "14px",
        display: "flex",
        alignItems: "center",
        gap: "11px",
      }}
    >
      <div style={{ fontSize: "22px" }}>{icon}</div>

      <div>
        <div
          style={{
            fontSize: "11px",
            color: "#64748b",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: "2px",
            fontSize: "22px",
            color: "#172033",
            fontWeight: 900,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}