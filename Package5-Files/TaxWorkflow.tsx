"use client";

type WorkflowStage = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

type TaxWorkflowProps = {
  currentStatus?: string;
  onStatusChange?: (status: string) => void;
  readOnly?: boolean;
};

const workflowStages: WorkflowStage[] = [
  {
    id: "New",
    label: "Client Created",
    icon: "👤",
    description: "The client envelope has been created.",
  },
  {
    id: "Waiting for Documents",
    label: "Documents Requested",
    icon: "📋",
    description: "The client has been asked to upload tax documents.",
  },
  {
    id: "Documents Received",
    label: "Documents Received",
    icon: "📥",
    description: "The requested client documents have been received.",
  },
  {
    id: "In Preparation",
    label: "Preparing Return",
    icon: "🧮",
    description: "The tax return is currently being prepared.",
  },
  {
    id: "Ready for Review",
    label: "Preparer Review",
    icon: "🔍",
    description: "The return and supporting documents are being reviewed.",
  },
  {
    id: "Ready to File",
    label: "Ready for Signature",
    icon: "✍️",
    description: "The return is ready for client signatures and approval.",
  },
  {
    id: "Filed",
    label: "E-Filed",
    icon: "📤",
    description: "The federal and state returns have been transmitted.",
  },
  {
    id: "Completed",
    label: "Completed",
    icon: "✅",
    description: "The return has been accepted and the engagement is complete.",
  },
];

function normalizeStatus(status: string) {
  const aliases: Record<string, string> = {
    "Documents Uploaded": "Documents Received",
    "Documents Requested": "Waiting for Documents",
    "In Review": "Ready for Review",
    "Client Review": "Ready to File",
    "Ready for Signature": "Ready to File",
    "E-Filed": "Filed",
    Accepted: "Completed",
  };

  return aliases[status] ?? status;
}

function getStageIndex(status: string) {
  const normalizedStatus = normalizeStatus(status);
  const matchingIndex = workflowStages.findIndex(
    (stage) => stage.id === normalizedStatus,
  );

  return matchingIndex >= 0 ? matchingIndex : 0;
}

export default function TaxWorkflow({
  currentStatus = "New",
  onStatusChange,
  readOnly = false,
}: TaxWorkflowProps) {
  const currentStageIndex = getStageIndex(currentStatus);
  const currentStage = workflowStages[currentStageIndex];

  const progress = Math.round(
    (currentStageIndex / (workflowStages.length - 1)) * 100,
  );

  return (
    <section
      style={{
        marginTop: "20px",
        padding: "22px",
        borderRadius: "22px",
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
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#4f46e5",
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            Tax Preparation Workflow
          </div>

          <h2
            style={{
              margin: "6px 0 4px",
              color: "#172033",
              fontSize: "23px",
            }}
          >
            Return Progress
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            Track every step from client intake through filing and completion.
          </p>
        </div>

        <div
          style={{
            minWidth: "145px",
            padding: "12px 15px",
            borderRadius: "15px",
            background: "#eef2ff",
            border: "1px solid #c7d2fe",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#6366f1",
              fontSize: "10px",
              fontWeight: 900,
              letterSpacing: "0.7px",
            }}
          >
            WORKFLOW PROGRESS
          </div>

          <div
            style={{
              marginTop: "3px",
              color: "#312e81",
              fontSize: "27px",
              fontWeight: 900,
            }}
          >
            {progress}%
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "20px",
          height: "9px",
          borderRadius: "999px",
          background: "#e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: "999px",
            background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
            transition: "width 250ms ease",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "22px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "11px",
        }}
      >
        {workflowStages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isUpcoming = index > currentStageIndex;

          return (
            <button
              key={stage.id}
              type="button"
              disabled={readOnly}
              onClick={() => {
                if (!readOnly && onStatusChange) {
                  onStatusChange(stage.id);
                }
              }}
              title={stage.description}
              style={{
                minHeight: "136px",
                padding: "14px",
                borderRadius: "16px",
                border: isCurrent
                  ? "2px solid #6366f1"
                  : isCompleted
                    ? "1px solid #bbf7d0"
                    : "1px solid #e2e8f0",
                background: isCurrent
                  ? "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)"
                  : isCompleted
                    ? "#f0fdf4"
                    : "#f8fafc",
                color: "#172033",
                textAlign: "left",
                cursor: readOnly ? "default" : "pointer",
                opacity: isUpcoming ? 0.72 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "39px",
                    height: "39px",
                    borderRadius: "12px",
                    background: isCurrent
                      ? "#e0e7ff"
                      : isCompleted
                        ? "#dcfce7"
                        : "#e2e8f0",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "19px",
                  }}
                >
                  {isCompleted ? "✓" : stage.icon}
                </div>

                <div
                  style={{
                    minWidth: "25px",
                    height: "25px",
                    padding: "0 7px",
                    borderRadius: "999px",
                    background: isCurrent
                      ? "#4f46e5"
                      : isCompleted
                        ? "#16a34a"
                        : "#e2e8f0",
                    color:
                      isCurrent || isCompleted ? "white" : "#64748b",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "10px",
                    fontWeight: 900,
                  }}
                >
                  {index + 1}
                </div>
              </div>

              <div
                style={{
                  marginTop: "11px",
                  color: isCurrent
                    ? "#4338ca"
                    : isCompleted
                      ? "#15803d"
                      : "#64748b",
                  fontSize: "13px",
                  fontWeight: 900,
                  lineHeight: 1.3,
                }}
              >
                {stage.label}
              </div>

              <div
                style={{
                  marginTop: "5px",
                  color: "#64748b",
                  fontSize: "10px",
                  lineHeight: 1.45,
                }}
              >
                {isCompleted
                  ? "Completed"
                  : isCurrent
                    ? "Current stage"
                    : "Upcoming"}
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "18px",
          padding: "15px",
          borderRadius: "16px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "13px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "14px",
            background: "#eef2ff",
            display: "grid",
            placeItems: "center",
            fontSize: "22px",
          }}
        >
          {currentStage.icon}
        </div>

        <div style={{ flex: "1 1 260px" }}>
          <div
            style={{
              color: "#172033",
              fontSize: "13px",
              fontWeight: 900,
            }}
          >
            Current stage: {currentStage.label}
          </div>

          <div
            style={{
              marginTop: "3px",
              color: "#64748b",
              fontSize: "12px",
              lineHeight: 1.5,
            }}
          >
            {currentStage.description}
          </div>
        </div>

        {!readOnly && (
          <div
            style={{
              padding: "7px 10px",
              borderRadius: "999px",
              background: "#ecfdf5",
              color: "#15803d",
              fontSize: "10px",
              fontWeight: 900,
            }}
          >
            Click a stage to update
          </div>
        )}
      </div>
    </section>
  );
}
