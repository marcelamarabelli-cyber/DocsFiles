"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import UploadZone from "../../components/UploadZone";
import ClientRequestChecklist from "../../components/ClientRequestChecklist";
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
  saveDocumentRequests,
  saveDocuments,
} from "../../lib/storage";
import { findMatchingRequest } from "../../lib/requestMatcher";
import ClientOverviewCard from "@/app/components/ClientOverviewCard";

function getClientName(client: Client) {
  if (client.clientType === "Business" && client.businessName.trim()) {
    return client.businessName;
  }

  if (client.spouseName.trim()) {
    return `${client.primaryName} & ${client.spouseName}`;
  }

  return client.primaryName;
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const clients = loadClients();
    const matchingClient =
      clients.find((currentClient) => currentClient.id === clientId) ?? null;

    setClient(matchingClient);
    setDocuments(loadDocuments());
    setDocumentRequests(loadDocumentRequests());
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
      documents.filter(
        (document) => document.clientId === clientId,
      ),
    [documents, clientId],
  );

  const totalFiles = clientDocuments.length;

  const completedFolders = documentFolders.filter((folder) => {
    const folderDocuments = clientDocuments.filter(
      (document) => document.folderId === folder.id,
    );

    return folderDocuments.length > 0;
  }).length;

  const portalBackground = {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #eff6ff 0%, #f8fafc 52%, #eef2ff 100%)",
    color: "#172033",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
                Secure Document Portal Preview
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
  completedItems={documents.filter((document) => document.reviewed).length}
  totalItems={documentFolders.length}
  status={client.status}
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
              fontSize: "12px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.9px",
              opacity: 0.85,
            }}
          >
            Welcome to your document portal
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
            Choose a folder below and upload the documents requested by
            TaxesDeal. Your tax preparer will review each file.
          </p>
        </section>

        <section
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "13px",
          }}
        >
          {[
            {
              icon: "📄",
              label: "Documents Uploaded",
              value: totalFiles,
            },
            {
              icon: "📁",
              label: "Folders Started",
              value: completedFolders,
            },
            {
              icon: "📅",
              label: "Tax Year",
              value: client.taxYear,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "17px",
                borderRadius: "16px",
                background: "white",
                border: "1px solid #dbe5f0",
                boxShadow: "0 7px 20px rgba(15,23,42,0.05)",
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
              </div>
            </div>
          ))}
        </section>

                <ClientRequestChecklist
          requests={documentRequests.filter(
            (request) => request.clientId === client.id,
          )}
          onOpenFolder={setOpenFolderId}
        />

<section
          style={{
            marginTop: "20px",
            background: "white",
            border: "1px solid #dbe5f0",
            borderRadius: "21px",
            padding: "22px",
            boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
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
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            {documentFolders.map((folder) => {
              const folderDocuments = clientDocuments.filter(
                (document) => document.folderId === folder.id,
              );

              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setOpenFolderId(folder.id)}
                  style={{
                    minHeight: "128px",
                    border: "1px solid #dbe5f0",
                    borderRadius: "15px",
                    padding: "15px",
                    background:
                      folderDocuments.length > 0 ? "#eff6ff" : "#f8fafc",
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
                          folderDocuments.length > 0
                            ? "#dbeafe"
                            : "#e2e8f0",
                        color:
                          folderDocuments.length > 0
                            ? "#1d4ed8"
                            : "#64748b",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "11px",
                        fontWeight: 900,
                      }}
                    >
                      {folderDocuments.length}
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
                </button>
              );
            })}
          </div>
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
            const clientDocuments = newDocuments.map((document) => ({
              ...document,
              uploadedBy: "Client" as const,
            }));

            setDocuments((current) => [
              ...clientDocuments,
              ...current,
            ]);

            setDocumentRequests((current) => {
              let updatedRequests = [...current];

              for (const document of clientDocuments) {
                const clientRequests = updatedRequests.filter(
                  (request) => request.clientId === client.id,
                );

                const match = findMatchingRequest(
                  document.name,
                  document.folderId,
                  clientRequests,
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
