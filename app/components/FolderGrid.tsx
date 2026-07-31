"use client";

import type {
  DocumentFolder,
  DocumentFolderId,
  StoredDocument,
} from "../types/client";

type FolderGridProps = {
  folders: DocumentFolder[];
  documents: StoredDocument[];
  clientId: string;
  onOpenFolder: (folderId: DocumentFolderId) => void;
};

export default function FolderGrid({
  folders,
  documents,
  clientId,
  onOpenFolder,
}: FolderGridProps) {
  return (
    <div
      style={{
        marginTop: "17px",
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "10px",
      }}
    >
      {folders.map((folder) => {
        const fileCount = documents.filter(
          (document) =>
            document.clientId === clientId &&
            document.folderId === folder.id,
        ).length;

        return (
          <button
            key={folder.id}
            type="button"
            onClick={() => onOpenFolder(folder.id)}
            style={{
              position: "relative",
              border: "1px solid #dbe5f0",
              borderRadius: "14px",
              padding: "14px",
              background: "#f8fafc",
              cursor: "pointer",
              textAlign: "left",
              color: "#172033",
              minHeight: "118px",
              transition: "transform 140ms ease, box-shadow 140ms ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "translateY(-2px)";
              event.currentTarget.style.boxShadow =
                "0 9px 20px rgba(15,23,42,0.08)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "translateY(0)";
              event.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <div style={{ fontSize: "23px" }}>{folder.icon}</div>

              <span
                style={{
                  minWidth: "26px",
                  height: "26px",
                  padding: "0 7px",
                  borderRadius: "999px",
                  background: fileCount > 0 ? "#dbeafe" : "#e2e8f0",
                  color: fileCount > 0 ? "#1d4ed8" : "#64748b",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "11px",
                  fontWeight: 900,
                }}
              >
                {fileCount}
              </span>
            </div>

            <div
              style={{
                fontWeight: 850,
                fontSize: "12px",
                marginTop: "8px",
              }}
            >
              {folder.title}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "10px",
                marginTop: "4px",
                lineHeight: 1.4,
              }}
            >
              {folder.subtitle}
            </div>
          </button>
        );
      })}
    </div>
  );
}
