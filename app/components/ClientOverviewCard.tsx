"use client";

type ClientOverviewCardProps = {
  clientName: string;
  taxYear: number;
  filingStatus: string;
  email?: string;
  phone?: string;
  completedItems: number;
  totalItems: number;
  status?: string;
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
}: ClientOverviewCardProps) {
  const safeTotal = totalItems > 0 ? totalItems : 1;

  const progress = Math.min(
    100,
    Math.round((completedItems / safeTotal) * 100),
  );

  const isComplete = progress === 100;

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #dbe5f2",
        borderRadius: "22px",
        boxShadow: "0 14px 40px rgba(28, 55, 90, 0.10)",
        overflow: "hidden",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, #3157e8 0%, #6749ee 55%, #8b4fea 100%)",
          color: "#ffffff",
          padding: "26px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.18)",
                display: "grid",
                placeItems: "center",
                fontSize: "30px",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              👤
            </div>

            <div>
              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.82,
                  marginBottom: "5px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Client Envelope
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                  lineHeight: 1.2,
                }}
              >
                {clientName}
              </h1>

              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  fontSize: "14px",
                  opacity: 0.92,
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
              padding: "10px 15px",
              borderRadius: "999px",
              background: isComplete
                ? "rgba(34, 197, 94, 0.22)"
                : "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.28)",
              fontWeight: 800,
              fontSize: "14px",
            }}
          >
            {isComplete ? "✅ Ready to File" : `📌 ${status}`}
          </div>
        </div>
      </div>

      <div style={{ padding: "26px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <InfoBox
            icon="📧"
            label="Email"
            value={email?.trim() || "No email entered"}
          />

          <InfoBox
            icon="📞"
            label="Phone"
            value={phone?.trim() || "No phone entered"}
          />

          <InfoBox
            icon="📁"
            label="Documents Complete"
            value={`${completedItems} of ${totalItems}`}
          />

          <InfoBox
            icon="🗓️"
            label="Tax Year"
            value={String(taxYear)}
          />
        </div>

        <div
          style={{
            borderTop: "1px solid #e5edf7",
            paddingTop: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#17233a",
                }}
              >
                Tax Preparation Progress
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#72809a",
                  marginTop: "3px",
                }}
              >
                Completed document categories and review items
              </div>
            </div>

            <div
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: isComplete ? "#15803d" : "#4f46e5",
              }}
            >
              {progress}%
            </div>
          </div>

          <div
            style={{
              height: "14px",
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
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type InfoBoxProps = {
  icon: string;
  label: string;
  value: string;
};

function InfoBox({ icon, label, value }: InfoBoxProps) {
  return (
    <div
      style={{
        background: "#f7f9fd",
        border: "1px solid #e1e8f2",
        borderRadius: "16px",
        padding: "16px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        minHeight: "74px",
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
            fontSize: "12px",
            color: "#7a879d",
            fontWeight: 800,
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
            fontWeight: 750,
            fontSize: "14px",
            overflowWrap: "anywhere",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}