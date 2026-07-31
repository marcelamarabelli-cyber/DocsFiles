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
        gap: "11px",
      }}
    >
      {folders.map((folder) => {
        const folderDocuments = documents.filter(
          (document) =>
            document.clientId === clientId &&
            document.folderId === folder.id,
        );

        const fileCount = folderDocuments.length;

        const reviewedCount = folderDocuments.filter(
          (document) => document.reviewed === true,
        ).length;

        const needsReviewCount = fileCount - reviewedCount;

        const progress =
          fileCount === 0
            ? 0
            : Math.round((reviewedCount / fileCount) * 100);

        const status =
          fileCount === 0
            ? "Empty"
            : needsReviewCount === 0
              ? "Complete"
              : "Needs Review";

        const statusStyles =
          status === "Complete"
            ? {
                background: "#dcfce7",
                color: "#166534",
                border: "#86efac",
              }
            : status === "Needs Review"
              ? {
                  background: "#fef3c7",
                  color: "#92400e",
                  border: "#fcd34d",
                }
              : {
                  background: "#f1f5f9",
                  color: "#64748b",
                  border: "#cbd5e1",
                };

        return (
          <button
            key={folder.id}
            type="button"
            onClick={() => onOpenFolder(folder.id)}
            style={{
              position: "relative",
              border:
                status === "Complete"
                  ? "1px solid #86efac"
                  : status === "Needs Review"
                    ? "1px solid #fde68a"
                    : "1px solid #dbe5f0",
              borderRadius: "15px",
              padding: "14px",
              background:
                status === "Complete"
                  ? "#f0fdf4"
                  : status === "Needs Review"
                    ? "#fffbeb"
                    : "#f8fafc",
              cursor: "pointer",
              textAlign: "left",
              color: "#172033",
              minHeight: "170px",
              transition:
                "transform 140ms ease, box-shadow 140ms ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform =
                "translateY(-2px)";
              event.currentTarget.style.boxShadow =
                "0 10px 22px rgba(15,23,42,0.09)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform =
                "translateY(0)";
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
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.82)",
                  border: "1px solid rgba(203,213,225,0.75)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "23px",
                }}
              >
                {folder.icon}
              </div>

              <span
                style={{
                  padding: "5px 8px",
                  borderRadius: "999px",
                  background: statusStyles.background,
                  color: statusStyles.color,
                  border: `1px solid ${statusStyles.border}`,
                  fontSize: "10px",
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                }}
              >
                {status === "Complete"
                  ? "✅ Complete"
                  : status === "Needs Review"
                    ? "⏳ Needs Review"
                    : "📭 Empty"}
              </span>
            </div>

            <div
              style={{
                fontWeight: 900,
                fontSize: "13px",
                marginTop: "10px",
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
                minHeight: "28px",
              }}
            >
              {folder.subtitle}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "5px",
                marginTop: "11px",
              }}
            >
              <div
                style={{
                  padding: "7px 4px",
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 900,
                  }}
                >
                  {fileCount}
                </div>

                <div
                  style={{
                    marginTop: "2px",
                    fontSize: "8px",
                    color: "#64748b",
                    fontWeight: 700,
                  }}
                >
                  FILES
                </div>
              </div>

              <div
                style={{
                  padding: "7px 4px",
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 900,
                    color: "#166534",
                  }}
                >
                  {reviewedCount}
                </div>

                <div
                  style={{
                    marginTop: "2px",
                    fontSize: "8px",
                    color: "#64748b",
                    fontWeight: 700,
                  }}
                >
                  REVIEWED
                </div>
              </div>

              <div
                style={{
                  padding: "7px 4px",
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 900,
                    color:
                      needsReviewCount > 0
                        ? "#92400e"
                        : "#64748b",
                  }}
                >
                  {needsReviewCount}
                </div>

                <div
                  style={{
                    marginTop: "2px",
                    fontSize: "8px",
                    color: "#64748b",
                    fontWeight: 700,
                  }}
                >
                  PENDING
                </div>
              </div>
            </div>

            <div style={{ marginTop: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "8px",
                  marginBottom: "5px",
                  fontSize: "9px",
                  color: "#64748b",
                  fontWeight: 800,
                }}
              >
                <span>Review progress</span>
                <span>{progress}%</span>
              </div>

              <div
                style={{
                  height: "7px",
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
                        : progress > 0
                          ? "#f59e0b"
                          : "#cbd5e1",
                    transition: "width 220ms ease",
                  }}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
