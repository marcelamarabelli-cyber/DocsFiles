"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import UploadZone from "../../components/UploadZone";
import ClientRequestChecklist from "../../components/ClientRequestChecklist";
import ClientOverviewCard from "@/app/components/ClientOverviewCard";
import TaxWorkflow from "../../components/TaxWorkflow";
import ActivityTimeline from "../../components/ActivityTimeline";
import PreFilingCenter from "../../components/PrefilingCenter";
import FilingCenter from "../../components/FilingCenter";
import PreparerWorkpad from "../../components/PreparerWorkpad";
import ReviewChecklist from "../../components/ReviewChecklist";
import CompletionCenter from "../../components/CompletionCenter";
import PixelAssistant from "../../components/PixelAssistant";
import {
  documentFolders,
  type Client,
  type DocumentFolderId,
  type DocumentRequest,
  type StoredDocument,
} from "../../types/client";
import {
  loadClients,
  loadDocumentRequests,
  loadDocuments,
  saveClients,
  saveDocumentRequests,
  saveDocuments,
} from "../../lib/storage";
import { findMatchingRequest } from "../../lib/requestMatcher";
import { addClientActivity } from "../../lib/activity";

type DocumentWithDate = StoredDocument & {
  uploadedAt?: string;
  createdAt?: string;
};

function getClientName(client: Client) {
  if (client.clientType === "Business" && client.businessName.trim()) {
    return client.businessName;
  }

  if (client.spouseName.trim()) {
    return `${client.primaryName} & ${client.spouseName}`;
  }

  return client.primaryName;
}

function getDocumentDate(document: StoredDocument) {
  const datedDocument = document as DocumentWithDate;
  return datedDocument.uploadedAt ?? datedDocument.createdAt ?? "";
}

function formatDocumentDate(value: string) {
  if (!value) {
    return "Recently added";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently added";
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default function ClientPortalPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = params.clientId;

  const [client, setClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [documentRequests, setDocumentRequests] =
    useState<DocumentRequest[]>([]);
  const [openFolderId, setOpenFolderId] =
    useState<DocumentFolderId | null>(null);
  const [accountantNotes, setAccountantNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);

  useEffect(() => {
    const clients = loadClients();
    const matchingClient =
      clients.find((currentClient) => currentClient.id === clientId) ?? null;

    setClient(matchingClient);
    setDocuments(loadDocuments());
    setDocumentRequests(loadDocumentRequests());

    const savedNotes = window.localStorage.getItem(
      `docsfiles-accountant-notes-${clientId}`,
    );

    setAccountantNotes(savedNotes ?? "");
    setLoaded(true);
  }, [clientId]);

  useEffect(() => {
    if (loaded) {
      saveDocuments(documents);
    }
  }, [documents, loaded]);

  useEffect(() => {
    if (loaded) {
      saveDocumentRequests(documentRequests);
    }
  }, [documentRequests, loaded]);

  const clientDocuments = useMemo(
    () =>
      documents.filter((document) => document.clientId === clientId),
    [documents, clientId],
  );

  const clientRequests = useMemo(
    () =>
      documentRequests.filter((request) => request.clientId === clientId),
    [documentRequests, clientId],
  );

  const folderHealth = useMemo(
    () =>
      documentFolders.map((folder) => {
        const folderDocuments = clientDocuments.filter(
          (document) => document.folderId === folder.id,
        );

        return {
          id: folder.id,
          title: folder.title,
          subtitle: folder.subtitle,
          icon: folder.icon,
          documentCount: folderDocuments.length,
          reviewedCount: folderDocuments.filter(
            (document) => document.reviewed,
          ).length,
        };
      }),
    [clientDocuments],
  );

  const totalFiles = clientDocuments.length;
  const reviewedDocuments = clientDocuments.filter(
    (document) => document.reviewed,
  ).length;
  const foldersStarted = folderHealth.filter(
    (folder) => folder.documentCount > 0,
  ).length;
  const requestedItems = clientRequests.filter(
    (request) => request.requested,
  ).length;
  const completedRequests = clientRequests.filter(
    (request) =>
      request.requested &&
      (request.status === "Uploaded" || request.status === "Accepted"),
  ).length;
  const missingItems = clientRequests.filter(
    (request) =>
      request.requested &&
      (request.status === "Waiting" ||
        request.status === "Replace Requested"),
  ).length;

  const reviewPercent =
    totalFiles > 0 ? clampPercent((reviewedDocuments / totalFiles) * 100) : 0;
  const requestPercent =
    requestedItems > 0
      ? clampPercent((completedRequests / requestedItems) * 100)
      : totalFiles > 0
        ? 100
        : 0;
  const folderPercent = clampPercent(
    (foldersStarted / Math.max(documentFolders.length, 1)) * 100,
  );
  const overallProgress = clampPercent(
    reviewPercent * 0.45 + requestPercent * 0.4 + folderPercent * 0.15,
  );

  const recentDocuments = useMemo(
    () =>
      [...clientDocuments]
        .sort((left, right) => {
          const rightTime = new Date(getDocumentDate(right)).getTime() || 0;
          const leftTime = new Date(getDocumentDate(left)).getTime() || 0;
          return rightTime - leftTime;
        })
        .slice(0, 5),
    [clientDocuments],
  );

  const activityItems = useMemo(() => {
    const uploadActivity = recentDocuments.map((document) => ({
      id: `upload-${document.id}`,
      icon: document.reviewed ? "✅" : "📄",
      title: document.reviewed
        ? `${document.name} was reviewed`
        : `${document.name} was uploaded`,
      detail:
        documentFolders.find((folder) => folder.id === document.folderId)
          ?.title ?? "Document folder",
      date: formatDocumentDate(getDocumentDate(document)),
    }));

    const requestActivity = clientRequests
      .filter((request) => request.requested)
      .slice(0, 3)
      .map((request) => ({
        id: `request-${request.id}`,
        icon:
          request.status === "Uploaded" || request.status === "Accepted"
            ? "🟢"
            : request.status === "Replace Requested"
              ? "🔁"
              : "🟡",
        title: request.title,
        detail: `Request status: ${request.status}`,
        date: "Current request",
      }));

    return [...uploadActivity, ...requestActivity].slice(0, 7);
  }, [clientRequests, recentDocuments]);

  function saveNotes() {
    window.localStorage.setItem(
      `docsfiles-accountant-notes-${clientId}`,
      accountantNotes,
    );
    setNotesSaved(true);
    window.setTimeout(() => setNotesSaved(false), 1800);
  }

  const portalBackground = {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #eff6ff 0%, #f8fafc 52%, #eef2ff 100%)",
    color: "#172033",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const cardStyle = {
    background: "white",
    border: "1px solid #dbe5f0",
    borderRadius: "20px",
    boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
  };

  if (!loaded) {
    return (
      <main
        style={{
          ...portalBackground,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ fontWeight: 800 }}>Loading your DocsFiles portal…</div>
      </main>
    );
  }

  if (!client) {
    return (
      <main
        style={{
          ...portalBackground,
          display: "grid",
          placeItems: "center",
          padding: "24px",
        }}
      >
        <section
          style={{
            width: "min(560px, 100%)",
            padding: "32px",
            borderRadius: "20px",
            background: "white",
            border: "1px solid #dbe5f0",
            boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "43px" }}>📭</div>
          <h1 style={{ margin: "12px 0 8px" }}>
            Client portal not found
          </h1>
          <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>
            This local portal link does not match a client saved in this
            browser.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main style={portalBackground}>
      <header
        style={{
          background: "rgba(255,255,255,0.96)",
          borderBottom: "1px solid #dbe5f0",
          boxShadow: "0 4px 18px rgba(15,23,42,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                display: "grid",
                placeItems: "center",
                fontSize: "24px",
                boxShadow: "0 8px 20px rgba(37,99,235,0.23)",
              }}
            >
              📂
            </div>

            <div>
              <div style={{ fontSize: "22px", fontWeight: 900 }}>
                DocsFiles
              </div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Smart Client Workspace
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              background: "#eef2ff",
              color: "#4338ca",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            TaxesDeal · Tax Year {client.taxYear}
          </div>
        </div>
      </header>

      <ClientOverviewCard
        clientName={getClientName(client)}
        taxYear={Number(client.taxYear)}
        filingStatus="Married Filing Jointly"
        email={client.email}
        phone={client.phone}
        completedItems={reviewedDocuments}
        totalItems={Math.max(totalFiles, 1)}
        status={client.status}
      />

      <PixelAssistant
        mode="finder"
        clientName={getClientName(client)}
        documents={clientDocuments}
      />

      <TaxWorkflow
        currentStatus={client.status}
        onStatusChange={(status) => {
          const nextClient = { ...client, status: status as Client["status"] };
          const nextClients = loadClients().map((savedClient) =>
            savedClient.id === client.id ? nextClient : savedClient,
          );
          saveClients(nextClients);
          setClient(nextClient);
        }}
      />

      <PreparerWorkpad
        clientId={client.id}
        clientName={getClientName(client)}
      />

      <ReviewChecklist clientId={client.id} />

      <PreFilingCenter
        documents={clientDocuments}
        requests={clientRequests}
        currentStatus={client.status}
        onReadyToFile={() => {
          const nextClient = { ...client, status: "Ready to File" as const };
          const nextClients = loadClients().map((savedClient) =>
            savedClient.id === client.id ? nextClient : savedClient,
          );
          saveClients(nextClients);
          setClient(nextClient);
        }}
      />

      <FilingCenter
        clientId={client.id}
        clientName={getClientName(client)}
        currentStatus={client.status}
        documents={clientDocuments}
        onStatusChange={(status) => {
          const nextClient = { ...client, status };
          const nextClients = loadClients().map((savedClient) =>
            savedClient.id === client.id ? nextClient : savedClient,
          );
          saveClients(nextClients);
          setClient(nextClient);

          addClientActivity({
            clientId: client.id,
            type: status === "Completed" ? "return-completed" : "status-changed",
            title: status === "Completed" ? "Tax Engagement Completed" : "Tax Return Filed",
            description:
              status === "Completed"
                ? `${getClientName(client)}'s return workflow was marked complete.`
                : `${getClientName(client)}'s return was marked filed.`,
            icon: status === "Completed" ? "✅" : "📤",
          });
          setActivityRefreshKey((current) => current + 1);
        }}
      />

      <CompletionCenter
        clientId={client.id}
        clientName={getClientName(client)}
        currentStatus={client.status}
        onActivityLogged={() =>
          setActivityRefreshKey((current) => current + 1)
        }
      />

      <ActivityTimeline
        clientId={client.id}
        clientName={getClientName(client)}
        refreshKey={activityRefreshKey}
      />

      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "28px 24px 60px",
        }}
      >
        <section
          style={{
            padding: "27px",
            borderRadius: "22px",
            color: "white",
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.97), rgba(124,58,237,0.94))",
            boxShadow: "0 18px 42px rgba(37,99,235,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "22px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 520px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.9px",
                  opacity: 0.85,
                }}
              >
                Smart client workspace
              </div>

              <h1
                style={{
                  margin: "8px 0",
                  fontSize: "31px",
                  lineHeight: 1.15,
                }}
              >
                Hello, {getClientName(client)}
              </h1>

              <p
                style={{
                  margin: 0,
                  maxWidth: "720px",
                  color: "rgba(255,255,255,0.88)",
                  lineHeight: 1.6,
                }}
              >
                Upload requested tax documents, follow review progress and keep
                every file organized in one secure workspace.
              </p>
            </div>

            <div
              style={{
                minWidth: "220px",
                padding: "18px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 800, opacity: 0.85 }}>
                OVERALL PROGRESS
              </div>
              <div style={{ fontSize: "34px", fontWeight: 900 }}>
                {overallProgress}%
              </div>
              <div
                style={{
                  height: "9px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.2)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${overallProgress}%`,
                    height: "100%",
                    borderRadius: "999px",
                    background: "white",
                    transition: "width 250ms ease",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
            gap: "13px",
          }}
        >
          {[
            {
              icon: "📄",
              label: "Documents",
              value: totalFiles,
              note: `${reviewedDocuments} reviewed`,
            },
            {
              icon: "📁",
              label: "Folders Started",
              value: foldersStarted,
              note: `${documentFolders.length} total folders`,
            },
            {
              icon: "📋",
              label: "Requests Complete",
              value: `${completedRequests}/${requestedItems}`,
              note: `${requestPercent}% complete`,
            },
            {
              icon: missingItems > 0 ? "⚠️" : "✅",
              label: "Missing Items",
              value: missingItems,
              note: missingItems > 0 ? "Needs attention" : "Nothing outstanding",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                ...cardStyle,
                padding: "17px",
                display: "flex",
                alignItems: "center",
                gap: "13px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "13px",
                  background: "#eff6ff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "21px",
                }}
              >
                {item.icon}
              </div>

              <div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: "23px", fontWeight: 900 }}>
                  {item.value}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                  {item.note}
                </div>
              </div>
            </div>
          ))}
        </section>

        {missingItems > 0 && (
          <section
            style={{
              marginTop: "20px",
              padding: "17px 19px",
              borderRadius: "18px",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontWeight: 900, color: "#9a3412" }}>
                ⚠️ {missingItems} requested item
                {missingItems === 1 ? "" : "s"} still need attention
              </div>
              <div
                style={{
                  marginTop: "3px",
                  color: "#c2410c",
                  fontSize: "13px",
                }}
              >
                Open the request checklist below to see what is waiting or must
                be replaced.
              </div>
            </div>
          </section>
        )}

        <ClientRequestChecklist
          requests={clientRequests}
          onOpenFolder={setOpenFolderId}
        />

        <section
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.35fr) minmax(290px, 0.65fr)",
            gap: "18px",
          }}
        >
          <div style={{ ...cardStyle, padding: "22px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "21px" }}>Recent Uploads</h2>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                The newest documents saved in this client envelope.
              </p>
            </div>

            <div
              style={{
                marginTop: "16px",
                display: "grid",
                gap: "10px",
              }}
            >
              {recentDocuments.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    borderRadius: "15px",
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  No documents have been uploaded yet.
                </div>
              ) : (
                recentDocuments.map((document) => {
                  const folder = documentFolders.find(
                    (currentFolder) => currentFolder.id === document.folderId,
                  );

                  return (
                    <button
                      key={document.id}
                      type="button"
                      onClick={() => setOpenFolderId(document.folderId)}
                      style={{
                        width: "100%",
                        padding: "13px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        textAlign: "left",
                        cursor: "pointer",
                        color: "#172033",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "39px",
                            height: "39px",
                            borderRadius: "12px",
                            background: document.reviewed ? "#dcfce7" : "#dbeafe",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          {document.reviewed ? "✅" : "📄"}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 850,
                              fontSize: "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {document.name}
                          </div>
                          <div
                            style={{
                              marginTop: "2px",
                              color: "#64748b",
                              fontSize: "11px",
                            }}
                          >
                            {folder?.title ?? "Document folder"} ·{" "}
                            {formatDocumentDate(getDocumentDate(document))}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: document.reviewed ? "#15803d" : "#1d4ed8",
                        }}
                      >
                        {document.reviewed ? "Reviewed" : "Open"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <aside style={{ ...cardStyle, padding: "22px" }}>
            <h2 style={{ margin: 0, fontSize: "21px" }}>Activity Timeline</h2>
            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              A quick history of this envelope.
            </p>

            <div
              style={{
                marginTop: "17px",
                display: "grid",
                gap: "15px",
              }}
            >
              {activityItems.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: "13px" }}>
                  Activity will appear after documents or requests are added.
                </div>
              ) : (
                activityItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "30px 1fr",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "10px",
                        background: "#eef2ff",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "14px",
                      }}
                    >
                      {item.icon}
                    </div>

                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 850 }}>
                        {item.title}
                      </div>
                      <div
                        style={{
                          marginTop: "2px",
                          color: "#64748b",
                          fontSize: "11px",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.detail}
                      </div>
                      <div
                        style={{
                          marginTop: "3px",
                          color: "#94a3b8",
                          fontSize: "10px",
                        }}
                      >
                        {item.date}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>

        <section
          style={{
            ...cardStyle,
            marginTop: "20px",
            padding: "22px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "22px" }}>
              Upload Your Tax Documents
            </h2>
            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Select the category that best matches your document.
            </p>
          </div>

          <div
            style={{
              marginTop: "18px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            {folderHealth.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => setOpenFolderId(folder.id)}
                style={{
                  minHeight: "145px",
                  border:
                    folder.documentCount > 0
                      ? "1px solid #93c5fd"
                      : "1px solid #dbe5f0",
                  borderRadius: "15px",
                  padding: "15px",
                  background:
                    folder.documentCount > 0 ? "#eff6ff" : "#f8fafc",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "#172033",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "25px" }}>{folder.icon}</span>

                  <span
                    style={{
                      minWidth: "28px",
                      height: "28px",
                      padding: "0 7px",
                      borderRadius: "999px",
                      background:
                        folder.documentCount > 0 ? "#dbeafe" : "#e2e8f0",
                      color:
                        folder.documentCount > 0 ? "#1d4ed8" : "#64748b",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "11px",
                      fontWeight: 900,
                    }}
                  >
                    {folder.documentCount}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    fontWeight: 900,
                    fontSize: "14px",
                  }}
                >
                  {folder.title}
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    color: "#64748b",
                    fontSize: "11px",
                    lineHeight: 1.45,
                  }}
                >
                  {folder.subtitle}
                </div>

                {folder.documentCount > 0 && (
                  <div
                    style={{
                      marginTop: "11px",
                      height: "6px",
                      borderRadius: "999px",
                      background: "#dbeafe",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${clampPercent(
                          (folder.reviewedCount /
                            Math.max(folder.documentCount, 1)) *
                            100,
                        )}%`,
                        height: "100%",
                        background: "#2563eb",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section
          style={{
            ...cardStyle,
            marginTop: "20px",
            padding: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "21px" }}>Accountant Notes</h2>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Local working notes for this client envelope.
              </p>
            </div>

            <button
              type="button"
              onClick={saveNotes}
              style={{
                border: 0,
                borderRadius: "12px",
                padding: "10px 15px",
                background: notesSaved ? "#16a34a" : "#172033",
                color: "white",
                fontWeight: 850,
                cursor: "pointer",
              }}
            >
              {notesSaved ? "Saved ✓" : "Save Notes"}
            </button>
          </div>

          <textarea
            value={accountantNotes}
            onChange={(event) => setAccountantNotes(event.target.value)}
            placeholder="Example: Waiting for corrected 1099, verify rental property taxes, confirm signature forms..."
            style={{
              width: "100%",
              minHeight: "130px",
              marginTop: "15px",
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid #cbd5e1",
              resize: "vertical",
              font: "inherit",
              lineHeight: 1.55,
              color: "#172033",
              background: "#f8fafc",
              boxSizing: "border-box",
            }}
          />
        </section>

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
          <strong>Local portal preview:</strong> this page currently uses data
          stored in this browser. Public secure links, client login, permanent
          cloud storage and encryption will be added before real client use.
        </div>
      </div>

      {openFolderId && (
        <UploadZone
          clientId={client.id}
          folder={
            documentFolders.find((folder) => folder.id === openFolderId)!
          }
          documents={documents.filter(
            (document) =>
              document.clientId === client.id &&
              document.folderId === openFolderId,
          )}
          onAddDocuments={(newDocuments) => {
            const uploadedDocuments = newDocuments.map((document) => ({
              ...document,
              uploadedBy: "Client" as const,
            }));

            setDocuments((current) => [
              ...uploadedDocuments,
              ...current,
            ]);

            setDocumentRequests((current) => {
              let updatedRequests = [...current];

              for (const document of uploadedDocuments) {
                const matchingClientRequests = updatedRequests.filter(
                  (request) => request.clientId === client.id,
                );

                const match = findMatchingRequest(
                  document.name,
                  document.folderId,
                  matchingClientRequests,
                );

                if (match) {
                  updatedRequests = updatedRequests.map((request) =>
                    request.id === match.id
                      ? { ...request, status: "Uploaded" }
                      : request,
                  );
                }
              }

              return updatedRequests;
            });
          }}
          onUpdateDocument={(documentId, updates) =>
            setDocuments((current) =>
              current.map((document) =>
                document.id === documentId
                  ? { ...document, ...updates }
                  : document,
              ),
            )
          }
          onDeleteDocument={(documentId) =>
            setDocuments((current) =>
              current.filter((document) => document.id !== documentId),
            )
          }
          onClose={() => setOpenFolderId(null)}
        />
      )}
    </main>
  );
}
