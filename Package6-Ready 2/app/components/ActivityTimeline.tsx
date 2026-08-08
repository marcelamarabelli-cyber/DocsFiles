"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatActivityDate,
  loadClientActivity,
  type ClientActivity,
} from "../lib/activity";

type ActivityTimelineProps = {
  clientId?: string;
  clientName?: string;
  refreshKey?: number;
  maxItems?: number;
};

const demoItems: ClientActivity[] = [
  {
    id: "demo-1",
    clientId: "demo-client",
    type: "client-created",
    title: "Client Portal Created",
    description: "The DocsFiles client portal is ready.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    icon: "👤",
  },
  {
    id: "demo-2",
    clientId: "demo-client",
    type: "documents-requested",
    title: "Documents Requested",
    description:
      "The client has been asked to upload the requested tax documents.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    icon: "📋",
  },
  {
    id: "demo-3",
    clientId: "demo-client",
    type: "document-uploaded",
    title: "Documents Uploaded",
    description: "New documents were added to the client portal.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    icon: "📥",
  },
  {
    id: "demo-4",
    clientId: "demo-client",
    type: "status-changed",
    title: "Tax Return in Preparation",
    description: "The tax return is currently being prepared.",
    createdAt: new Date().toISOString(),
    icon: "🧮",
  },
];

function getActivityColors(type: ClientActivity["type"]) {
  switch (type) {
    case "client-created":
      return {
        background: "#eef2ff",
        border: "#c7d2fe",
        iconBackground: "#4f46e5",
      };

    case "documents-requested":
      return {
        background: "#fff7ed",
        border: "#fed7aa",
        iconBackground: "#ea580c",
      };

    case "document-uploaded":
      return {
        background: "#ecfdf5",
        border: "#a7f3d0",
        iconBackground: "#059669",
      };

    case "document-removed":
      return {
        background: "#fef2f2",
        border: "#fecaca",
        iconBackground: "#dc2626",
      };

    case "status-changed":
      return {
        background: "#eff6ff",
        border: "#bfdbfe",
        iconBackground: "#2563eb",
      };

    case "review-completed":
      return {
        background: "#faf5ff",
        border: "#e9d5ff",
        iconBackground: "#9333ea",
      };

    case "ready-to-file":
      return {
        background: "#fdf4ff",
        border: "#f5d0fe",
        iconBackground: "#c026d3",
      };

    case "return-completed":
      return {
        background: "#f0fdf4",
        border: "#bbf7d0",
        iconBackground: "#16a34a",
      };

    case "note":
      return {
        background: "#fffbeb",
        border: "#fde68a",
        iconBackground: "#d97706",
      };

    default:
      return {
        background: "#f8fafc",
        border: "#e2e8f0",
        iconBackground: "#64748b",
      };
  }
}

export default function ActivityTimeline({
  clientId,
  clientName,
  refreshKey = 0,
  maxItems = 8,
}: ActivityTimelineProps) {
  const [savedActivities, setSavedActivities] = useState<ClientActivity[]>([]);

  useEffect(() => {
    if (!clientId) {
      setSavedActivities([]);
      return;
    }

    setSavedActivities(loadClientActivity(clientId));
  }, [clientId, refreshKey]);

  const activities = useMemo(() => {
    const sourceItems =
      clientId && savedActivities.length > 0
        ? savedActivities
        : demoItems;

    return sourceItems.slice(0, maxItems);
  }, [clientId, maxItems, savedActivities]);

  const isShowingDemo =
    !clientId || (clientId && savedActivities.length === 0);

  return (
    <section
      style={{
        background: "white",
        borderRadius: "22px",
        padding: "24px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "18px",
          marginBottom: "22px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                color: "white",
                fontSize: "21px",
                boxShadow: "0 10px 24px rgba(79, 70, 229, 0.25)",
              }}
            >
              🕒
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "22px",
                  lineHeight: 1.2,
                }}
              >
                Activity Timeline
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                {clientName
                  ? `Recent activity for ${clientName}`
                  : "Recent client portal activity"}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            background: isShowingDemo ? "#f8fafc" : "#ecfdf5",
            border: isShowingDemo
              ? "1px solid #e2e8f0"
              : "1px solid #a7f3d0",
            color: isShowingDemo ? "#64748b" : "#047857",
            fontWeight: 800,
            fontSize: "12px",
          }}
        >
          {isShowingDemo ? "Preview Activity" : "Live Activity"}
        </div>
      </div>

      {activities.length === 0 ? (
        <div
          style={{
            padding: "32px 20px",
            borderRadius: "18px",
            border: "2px dashed #cbd5e1",
            background: "#f8fafc",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "34px",
              marginBottom: "10px",
            }}
          >
            🐶
          </div>

          <h3
            style={{
              margin: "0 0 7px",
              color: "#0f172a",
              fontSize: "17px",
            }}
          >
            Pixel is waiting for activity
          </h3>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Uploads, requests, status changes and preparer notes will appear
            here.
          </p>
        </div>
      ) : (
        <div
          style={{
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "23px",
              top: "22px",
              bottom: "22px",
              width: "2px",
              background:
                "linear-gradient(180deg, #93c5fd 0%, #c4b5fd 55%, #e2e8f0 100%)",
            }}
          />

          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            {activities.map((activity) => {
              const colors = getActivityColors(activity.type);

              return (
                <article
                  key={activity.id}
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "48px minmax(0, 1fr)",
                    gap: "14px",
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      width: "46px",
                      height: "46px",
                      borderRadius: "15px",
                      display: "grid",
                      placeItems: "center",
                      background: colors.iconBackground,
                      color: "white",
                      fontSize: "20px",
                      border: "4px solid white",
                      boxShadow: "0 8px 18px rgba(15, 23, 42, 0.14)",
                    }}
                  >
                    {activity.icon}
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                      padding: "15px 16px",
                      borderRadius: "17px",
                      background: colors.background,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "14px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                          flex: "1 1 250px",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            color: "#0f172a",
                            fontSize: "15px",
                            lineHeight: 1.35,
                          }}
                        >
                          {activity.title}
                        </h3>

                        {activity.description ? (
                          <p
                            style={{
                              margin: "6px 0 0",
                              color: "#475569",
                              fontSize: "13px",
                              lineHeight: 1.55,
                            }}
                          >
                            {activity.description}
                          </p>
                        ) : null}
                      </div>

                      <time
                        dateTime={activity.createdAt}
                        style={{
                          flexShrink: 0,
                          padding: "5px 9px",
                          borderRadius: "999px",
                          background: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          color: "#64748b",
                          fontSize: "11px",
                          fontWeight: 800,
                        }}
                      >
                        {formatActivityDate(activity.createdAt)}
                      </time>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          Showing {activities.length} recent{" "}
          {activities.length === 1 ? "event" : "events"}
        </span>

        <span
          style={{
            color: "#7c3aed",
            fontSize: "12px",
            fontWeight: 800,
          }}
        >
          DocsFiles keeps the history organized ✨
        </span>
      </div>
    </section>
  );
}