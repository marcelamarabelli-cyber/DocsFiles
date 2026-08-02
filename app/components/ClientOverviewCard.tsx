"use client";

type FolderHealthItem = {
  id: string;
  title: string;
  icon: string;
  documentCount: number;
  reviewedCount: number;
};

type ClientOverviewCardProps = {
  clientName: string;
  taxYear: number;
  filingStatus: string;
  email?: string;
  phone?: string;
  completedItems: number;
  totalItems: number;
  status?: string;

  totalDocuments?: number;
  reviewedDocuments?: number;
  missingItems?: number;
  foldersStarted?: number;
  totalFolders?: number;
  folderHealth?: FolderHealthItem[];
};

export default function ClientOverviewCard({
  clientName,
  taxYear,
  filingStatus,
  email,
  phone,
  completedItems,
  totalItems,
  status = "In Progress",
  totalDocuments,
  reviewedDocuments,
  missingItems = 0,
  foldersStarted,
  totalFolders,
  folderHealth = [],
}: ClientOverviewCardProps) {
  const safeTotalItems = Math.max(totalItems, 1);

  const progress = Math.min(
    100,
    Math.max(
      0,
      Math.round((completedItems / safeTotalItems) * 100),
    ),
  );

  const documentTotal =
    totalDocuments ?? Math.max(totalItems, 0);

  const reviewedTotal =
    reviewedDocuments ?? Math.max(completedItems, 0);

  const folderTotal =
    totalFolders ?? Math.max(totalItems, 0);

  const startedFolders =
    foldersStarted ??
    Math.min(Math.max(completedItems, 0), folderTotal);

  const pendingReview = Math.max(
    documentTotal - reviewedTotal,
    0,
  );

  const isComplete =
    progress === 100 &&
    missingItems === 0 &&
    pendingReview === 0;

  const statusTheme = getStatusTheme(
    isComplete ? "Ready to File" : status,
  );

  const pixelMessage = getPixelMessage({
    progress,
    missingItems,
    pendingReview,
    documentTotal,
    isComplete,
  });

  return (
    <section
      style={{
        width: "min(1180px, calc(100% - 48px))",
        margin: "24px auto",
        background: "#ffffff",
        border: "1px solid #dbe5f2",
        borderRadius: "24px",
        boxShadow: "0 16px 48px rgba(28, 55, 90, 0.11)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, #3157e8 0%, #6749ee 55%, #8b4fea 100%)",
          color: "#ffffff",
          padding: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "22px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "17px",
              alignItems: "center",
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                flexShrink: 0,
                borderRadius: "20px",
                background: "rgba(255,255,255,0.18)",
                display: "grid",
                placeItems: "center",
                fontSize: "32px",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "0 9px 25px rgba(20,25,80,0.18)",
              }}
            >
              👤
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.82,
                  marginBottom: "5px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Client Command Center
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(25px, 4vw, 32px)",
                  lineHeight: 1.15,
                  overflowWrap: "anywhere",
                }}
              >
                {clientName}
              </h1>

              <div
                style={{
                  marginTop: "9px",
                  display: "flex",
                  gap: "9px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <span>Tax Year {taxYear}</span>
                <span>•</span>
                <span>{filingStatus}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "9px",
            }}
          >
            <div
              style={{
                padding: "10px 15px",
                borderRadius: "999px",
                background: statusTheme.background,
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#ffffff",
                fontWeight: 850,
                fontSize: "13px",
                whiteSpace: "nowrap",
              }}
            >
              {statusTheme.icon}{" "}
              {isComplete ? "Ready to File" : status}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.78)",
                fontWeight: 700,
              }}
            >
              TaxesDeal · DocsFiles 2026
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "26px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "13px",
          }}
        >
          <MetricCard
            icon="📄"
            label="Documents"
            value={String(documentTotal)}
            detail="Uploaded"
            tone="blue"
          />

          <MetricCard
            icon="✅"
            label="Reviewed"
            value={String(reviewedTotal)}
            detail={
              pendingReview === 0
                ? "All reviewed"
                : `${pendingReview} pending`
            }
            tone={pendingReview === 0 ? "green" : "amber"}
          />

          <MetricCard
            icon="📁"
            label="Folders Started"
            value={`${startedFolders}/${folderTotal}`}
            detail={
              folderTotal > 0
                ? `${Math.round(
                    (startedFolders /
                      Math.max(folderTotal, 1)) *
                      100,
                  )}% started`
                : "No folders"
            }
            tone="purple"
          />

          <MetricCard
            icon={missingItems > 0 ? "⚠️" : "🎉"}
            label="Missing Items"
            value={String(missingItems)}
            detail={
              missingItems > 0
                ? "Still requested"
                : "Nothing missing"
            }
            tone={missingItems > 0 ? "red" : "green"}
          />
        </div>

        <div
          style={{
            marginTop: "18px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "15px",
          }}
        >
          <section
            style={{
              border: "1px solid #e1e8f2",
              borderRadius: "18px",
              padding: "18px",
              background: "#fbfcff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "14px",
                marginBottom: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 900,
                    color: "#17233a",
                  }}
                >
                  Preparation Progress
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#72809a",
                    marginTop: "3px",
                    lineHeight: 1.45,
                  }}
                >
                  Based on completed review items
                </div>
              </div>

              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 950,
                  color: isComplete ? "#15803d" : "#4f46e5",
                }}
              >
                {progress}%
              </div>
            </div>

            <div
              style={{
                height: "15px",
                borderRadius: "999px",
                background: "#e9eef7",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background: isComplete
                    ? "linear-gradient(90deg, #22c55e, #16a34a)"
                    : "linear-gradient(90deg, #3157e8, #7c3aed)",
                  transition: "width 300ms ease",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "12px",
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                color: "#64748b",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <span>
                {completedItems} of {totalItems} complete
              </span>

              <span>
                {isComplete
                  ? "Ready for final filing"
                  : "Work in progress"}
              </span>
            </div>
          </section>

          <section
            style={{
              border: "1px solid #d8e4ff",
              borderRadius: "18px",
              padding: "18px",
              background:
                "linear-gradient(135deg, #eff6ff, #f5f3ff)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "13px",
              }}
            >
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  flexShrink: 0,
                  borderRadius: "17px",
                  background: "#ffffff",
                  border: "1px solid #dbeafe",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "29px",
                  boxShadow:
                    "0 7px 18px rgba(49,87,232,0.12)",
                }}
              >
                🐶
              </div>

              <div>
                <div
                  style={{
                    color: "#4338ca",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Pixel’s Client Report
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    color: "#17233a",
                    fontWeight: 850,
                    fontSize: "15px",
                    lineHeight: 1.5,
                  }}
                >
                  {pixelMessage}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  Director of Document Retrieval
                </div>
              </div>
            </div>
          </section>
        </div>

        <div
          style={{
            marginTop: "18px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "13px",
          }}
        >
          <ContactCard
            icon="📧"
            label="Email"
            value={email?.trim() || "No email entered"}
          />

          <ContactCard
            icon="📞"
            label="Phone"
            value={phone?.trim() || "No phone entered"}
          />

          <ContactCard
            icon="🗓️"
            label="Tax Year"
            value={String(taxYear)}
          />

          <ContactCard
            icon="🧾"
            label="Filing Status"
            value={filingStatus}
          />
        </div>

        {folderHealth.length > 0 && (
          <section
            style={{
              marginTop: "19px",
              borderTop: "1px solid #e5edf7",
              paddingTop: "19px",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: 900,
                color: "#17233a",
              }}
            >
              Folder Health
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                color: "#72809a",
              }}
            >
              A quick view of document activity by category
            </div>

            <div
              style={{
                marginTop: "13px",
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: "10px",
              }}
            >
              {folderHealth.map((folder) => (
                <FolderHealthCard
                  key={folder.id}
                  folder={folder}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "green" | "amber" | "purple" | "red";
}) {
  const tones = {
    blue: {
      background: "#eff6ff",
      border: "#bfdbfe",
      color: "#1d4ed8",
    },
    green: {
      background: "#ecfdf5",
      border: "#a7f3d0",
      color: "#15803d",
    },
    amber: {
      background: "#fffbeb",
      border: "#fde68a",
      color: "#a16207",
    },
    purple: {
      background: "#f5f3ff",
      border: "#ddd6fe",
      color: "#6d28d9",
    },
    red: {
      background: "#fff1f2",
      border: "#fecdd3",
      color: "#be123c",
    },
  };

  const selectedTone = tones[tone];

  return (
    <div
      style={{
        border: `1px solid ${selectedTone.border}`,
        borderRadius: "17px",
        padding: "15px",
        background: selectedTone.background,
        minHeight: "112px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div
          style={{
            color: selectedTone.color,
            fontSize: "11px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </div>

        <span style={{ fontSize: "20px" }}>{icon}</span>
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "27px",
          fontWeight: 950,
          color: "#17233a",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "3px",
          color: selectedTone.color,
          fontSize: "11px",
          fontWeight: 800,
        }}
      >
        {detail}
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#f7f9fd",
        border: "1px solid #e1e8f2",
        borderRadius: "16px",
        padding: "15px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        minHeight: "72px",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          flexShrink: 0,
          borderRadius: "13px",
          background: "#e8efff",
          display: "grid",
          placeItems: "center",
          fontSize: "20px",
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "11px",
            color: "#7a879d",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: "4px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#17233a",
            fontWeight: 800,
            fontSize: "13px",
            overflowWrap: "anywhere",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function FolderHealthCard({
  folder,
}: {
  folder: FolderHealthItem;
}) {
  const hasDocuments = folder.documentCount > 0;

  const allReviewed =
    hasDocuments &&
    folder.reviewedCount === folder.documentCount;

  const status = allReviewed
    ? {
        label: "Complete",
        icon: "🟢",
        background: "#f0fdf4",
        border: "#bbf7d0",
        color: "#166534",
      }
    : hasDocuments
      ? {
          label: "Needs Review",
          icon: "🟡",
          background: "#fffbeb",
          border: "#fde68a",
          color: "#92400e",
        }
      : {
          label: "Not Started",
          icon: "⚪",
          background: "#f8fafc",
          border: "#e2e8f0",
          color: "#64748b",
        };

  return (
    <div
      style={{
        padding: "13px",
        borderRadius: "14px",
        border: `1px solid ${status.border}`,
        background: status.background,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "9px",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "22px" }}>{folder.icon}</span>

        <span
          style={{
            color: status.color,
            fontSize: "10px",
            fontWeight: 900,
          }}
        >
          {status.icon} {status.label}
        </span>
      </div>

      <div
        style={{
          marginTop: "9px",
          fontSize: "13px",
          fontWeight: 900,
          color: "#17233a",
        }}
      >
        {folder.title}
      </div>

      <div
        style={{
          marginTop: "4px",
          color: "#64748b",
          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        {folder.documentCount} uploaded ·{" "}
        {folder.reviewedCount} reviewed
      </div>
    </div>
  );
}

function getStatusTheme(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus.includes("complete") ||
    normalizedStatus.includes("ready to file")
  ) {
    return {
      icon: "✅",
      background: "rgba(34,197,94,0.25)",
    };
  }

  if (
    normalizedStatus.includes("review") ||
    normalizedStatus.includes("preparation")
  ) {
    return {
      icon: "👀",
      background: "rgba(14,165,233,0.25)",
    };
  }

  if (
    normalizedStatus.includes("waiting") ||
    normalizedStatus.includes("document")
  ) {
    return {
      icon: "⏳",
      background: "rgba(245,158,11,0.27)",
    };
  }

  return {
    icon: "📌",
    background: "rgba(255,255,255,0.18)",
  };
}

function getPixelMessage({
  progress,
  missingItems,
  pendingReview,
  documentTotal,
  isComplete,
}: {
  progress: number;
  missingItems: number;
  pendingReview: number;
  documentTotal: number;
  isComplete: boolean;
}) {
  if (isComplete) {
    return "Everything looks complete and reviewed. This client is ready for the final filing steps!";
  }

  if (missingItems > 0) {
    return `${missingItems} requested ${
      missingItems === 1 ? "item is" : "items are"
    } still missing. I’ll keep watching the folders.`;
  }

  if (pendingReview > 0) {
    return `${pendingReview} uploaded ${
      pendingReview === 1 ? "document needs" : "documents need"
    } your review.`;
  }

  if (documentTotal === 0) {
    return "No documents have been uploaded yet. I’m ready to fetch them when they arrive!";
  }

  if (progress >= 75) {
    return "This client is making excellent progress. We’re getting close to the finish line!";
  }

  return "The client workspace is active. I’ll help keep the documents organized and easy to find.";
}