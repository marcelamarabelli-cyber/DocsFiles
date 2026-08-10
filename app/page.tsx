"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import FolderGrid from "./components/FolderGrid";
import UploadZone from "./components/UploadZone";
import RequestCenter from "./components/RequestCenter";
import PixelAssistant from "./components/PixelAssistant";
import {
  documentFolders,
  type Client,
  type ClientForm,
  type ClientStatus,
  type ClientType,
  type DocumentFolderId,
  type DocumentRequest,
  type StoredDocument,
} from "./types/client";
import {
  loadDocumentRequests,
  loadDocuments,
  saveDocumentRequests,
  saveDocuments,
} from "./lib/storage";
import {
  findMatchingRequest,
  statusForReviewedDocument,
} from "./lib/requestMatcher";

const currentTaxYear = String(new Date().getFullYear() - 1);

const emptyForm: ClientForm = {
  primaryName: "",
  spouseName: "",
  businessName: "",
  email: "",
  phone: "",
  clientType: "Individual",
  taxYear: currentTaxYear,
  status: "New",
  notes: "",
};

const sampleClients: Client[] = [
  {
    id: "TD-0001",
    primaryName: "Raquel Linderman",
    spouseName: "",
    businessName: "",
    email: "RAQUEL.LINDERMAN@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0002",
    primaryName: "Joseph Schmitt",
    spouseName: "",
    businessName: "",
    email: "JSCHMITT73@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0003",
    primaryName: "George Schmitt",
    spouseName: "",
    businessName: "",
    email: "MARCELA.MARABELLI@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0004",
    primaryName: "Ralph Gentile",
    spouseName: "",
    businessName: "",
    email: "RTGENTILE@YAHOO.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0005",
    primaryName: "John Cunat",
    spouseName: "",
    businessName: "",
    email: "CUNAT1951@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0006",
    primaryName: "Karen Stabnau",
    spouseName: "",
    businessName: "",
    email: "KRSS42@ICLOUD.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0007",
    primaryName: "Linda Clair",
    spouseName: "",
    businessName: "",
    email: "LINDACLAIR2004@YAHOO.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0008",
    primaryName: "Lisa Cunat",
    spouseName: "",
    businessName: "",
    email: "CUNAT1951@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0009",
    primaryName: "Julia Hunter",
    spouseName: "",
    businessName: "",
    email: "JULIA@CROSSPOINT.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0010",
    primaryName: "Schuyler DeYoung",
    spouseName: "",
    businessName: "",
    email: "NICKDEYOUNGNUMBERONE@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0011",
    primaryName: "Mary DeYoung",
    spouseName: "",
    businessName: "",
    email: "NICKDEYOUNGNUMBERONE@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0012",
    primaryName: "Michael Kaufman",
    spouseName: "",
    businessName: "",
    email: "MIKE52KAUFMAN@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0013",
    primaryName: "Valerie Wagner-Deneault",
    spouseName: "",
    businessName: "",
    email: "VDENEAULT@HOTMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0014",
    primaryName: "Nicholas DeYoung",
    spouseName: "",
    businessName: "",
    email: "NICKDEYOUNGNUMBERONE@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0015",
    primaryName: "Reno Wofford",
    spouseName: "",
    businessName: "",
    email: "SOLOJUGGERNAUT@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0016",
    primaryName: "Clint Hilliard",
    spouseName: "",
    businessName: "",
    email: "CEHILLIARD85@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0017",
    primaryName: "Trevor Miller",
    spouseName: "",
    businessName: "",
    email: "MILLERT3@HOTMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0018",
    primaryName: "Peggy Metivier",
    spouseName: "",
    businessName: "",
    email: "MSPEGERSON@YAHOO.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0019",
    primaryName: "Brian Parks",
    spouseName: "",
    businessName: "",
    email: "THUNDERROK@YAHOO.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0020",
    primaryName: "Tristan DeYoung",
    spouseName: "",
    businessName: "",
    email: "NICKDEYOUNGNUMBERONE@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0021",
    primaryName: "Juergen Kneifel",
    spouseName: "Kathy Kneifel",
    businessName: "",
    email: "JKNEIFEL@EVERETTCC.EDU",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "Completed",
    notes: "Married filing jointly. Washington and Montana mixed-residency client.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0022",
    primaryName: "Catherine Dempsey",
    spouseName: "",
    businessName: "",
    email: "TAXESDEAL@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TD-0023",
    primaryName: "Elise Linderman",
    spouseName: "",
    businessName: "",
    email: "ELISE.LINDERMAN@GMAIL.COM",
    phone: "",
    clientType: "Individual",
    taxYear: currentTaxYear,
    status: "New",
    notes: "",
    createdAt: new Date().toISOString(),
  },
];

const statusOptions: ClientStatus[] = [
  "New",
  "Waiting for Documents",
  "Documents Received",
  "In Preparation",
  "Ready for Review",
  "Ready to File",
  "Completed",
];



function getDisplayName(client: Client) {
  if (client.clientType === "Business" && client.businessName.trim()) {
    return client.businessName;
  }

  if (client.spouseName.trim()) {
    return `${client.primaryName} & ${client.spouseName}`;
  }

  return client.primaryName;
}

function statusColor(status: ClientStatus) {
  switch (status) {
    case "Completed":
      return {
        background: "#dcfce7",
        color: "#166534",
        border: "#86efac",
      };

    case "Ready to File":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "#93c5fd",
      };

    case "Ready for Review":
      return {
        background: "#f3e8ff",
        color: "#7e22ce",
        border: "#d8b4fe",
      };

    case "In Preparation":
      return {
        background: "#ffedd5",
        color: "#c2410c",
        border: "#fdba74",
      };

    case "Documents Received":
      return {
        background: "#cffafe",
        color: "#0e7490",
        border: "#67e8f9",
      };

    case "Waiting for Documents":
      return {
        background: "#fef3c7",
        color: "#92400e",
        border: "#fcd34d",
      };

    default:
      return {
        background: "#f1f5f9",
        color: "#475569",
        border: "#cbd5e1",
      };
  }
}

export default function Home() {
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showNewClient, setShowNewClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [openFolderId, setOpenFolderId] =
    useState<DocumentFolderId | null>(null);
  const [documentRequests, setDocumentRequests] =
    useState<DocumentRequest[]>([]);
  const [showRequestCenter, setShowRequestCenter] = useState(false);

  useEffect(() => {
    const savedClients = window.localStorage.getItem("docsfiles-clients");

    if (savedClients) {
      try {
        const parsedClients = JSON.parse(savedClients) as Client[];

        if (Array.isArray(parsedClients) && parsedClients.length > 0) {
          setClients(parsedClients);
        }
      } catch {
        console.warn("DocsFiles could not read previously saved clients.");
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("docsfiles-clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    setDocuments(loadDocuments());
    setDocumentRequests(loadDocumentRequests());
  }, []);

  useEffect(() => {
    saveDocumentRequests(documentRequests);
  }, [documentRequests]);

  useEffect(() => {
    saveDocuments(documents);
  }, [documents]);

  const filteredClients = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return clients.filter((client) => {
      const searchableText = [
        client.primaryName,
        client.spouseName,
        client.businessName,
        client.email,
        client.phone,
        client.taxYear,
        client.status,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchText.length === 0 || searchableText.includes(searchText);

      const matchesStatus =
        statusFilter === "All" || client.status === statusFilter;

      const matchesType =
        typeFilter === "All" || client.clientType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [clients, search, statusFilter, typeFilter]);

  const completedCount = clients.filter(
    (client) => client.status === "Completed",
  ).length;

  const activeCount = clients.filter(
    (client) => client.status !== "Completed",
  ).length;

  const waitingCount = clients.filter(
    (client) => client.status === "Waiting for Documents",
  ).length;

  function updateForm<K extends keyof ClientForm>(
    field: K,
    value: ClientForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function createClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const primaryName = form.primaryName.trim();
    const businessName = form.businessName.trim();

    if (form.clientType === "Individual" && !primaryName) {
      setMessage("Please enter the primary taxpayer's name.");
      return;
    }

    if (form.clientType === "Business" && !businessName) {
      setMessage("Please enter the business name.");
      return;
    }

    const newClient: Client = {
      id: crypto.randomUUID(),
      primaryName,
      spouseName: form.spouseName.trim(),
      businessName,
      email: form.email.trim(),
      phone: form.phone.trim(),
      clientType: form.clientType,
      taxYear: form.taxYear,
      status: form.status,
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setClients((current) => [newClient, ...current]);
    setForm(emptyForm);
    setMessage("");
    setShowNewClient(false);
    setSelectedClient(newClient);
  }

  function deleteClient(client: Client) {
    const confirmed = window.confirm(
      `Delete ${getDisplayName(client)} from DocsFiles?`,
    );

    if (!confirmed) {
      return;
    }

    setClients((current) =>
      current.filter((currentClient) => currentClient.id !== client.id),
    );

    if (selectedClient?.id === client.id) {
      setSelectedClient(null);
    }
  }

  function changeClientStatus(clientId: string, status: ClientStatus) {
    setClients((current) =>
      current.map((client) =>
        client.id === clientId ? { ...client, status } : client,
      ),
    );

    setSelectedClient((current) =>
      current?.id === clientId ? { ...current, status } : current,
    );
  }

  const pageBackground = {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8fbff 0%, #eef6ff 45%, #f8fafc 100%)",
    color: "#172033",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const buttonBase = {
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 13px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#172033",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 700,
  };

  return (
    <main style={pageBackground}>
      <header
        style={{
          background: "rgba(255,255,255,0.96)",
          borderBottom: "1px solid #dbe5f0",
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: "1450px",
            margin: "0 auto",
            padding: "16px 26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "15px",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                display: "grid",
                placeItems: "center",
                fontSize: "25px",
                boxShadow: "0 8px 22px rgba(37, 99, 235, 0.24)",
              }}
            >
              📂
            </div>

            <div>
<div
  style={{
    width: "170px",
    maxWidth: "100%",
  }}
>
  <img
    src="/docsfiles-logo.png"
    alt="DocsFiles"
    style={{
      display: "block",
      width: "100%",
      height: "auto",
    }}
  />
</div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                TaxesDeal Client Document Organizer
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              style={{
                ...buttonBase,
                padding: "11px 15px",
                background: "#eef2ff",
                color: "#4338ca",
              }}
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setTypeFilter("All");
                setSelectedClient(null);
              }}
            >
              🏠 Dashboard
            </button>

            <button
              type="button"
              style={{
                ...buttonBase,
                padding: "12px 18px",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "white",
                boxShadow: "0 8px 18px rgba(37, 99, 235, 0.22)",
              }}
              onClick={() => {
                setMessage("");
                setShowNewClient(true);
              }}
            >
              ＋ New Client
            </button>
          </div>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1450px",
          margin: "0 auto",
          padding: "28px 26px 60px",
        }}
      >
        <section
          style={{
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.97), rgba(124,58,237,0.94))",
            color: "white",
            padding: "28px",
            borderRadius: "22px",
            boxShadow: "0 18px 42px rgba(37, 99, 235, 0.18)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
                opacity: 0.85,
              }}
            >
              Welcome back, Marcela
            </div>

            <h1
              style={{
                margin: "8px 0 8px",
                fontSize: "32px",
                lineHeight: 1.1,
              }}
            >
              Your client files, organized in one place.
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: "720px",
                color: "rgba(255,255,255,0.88)",
                lineHeight: 1.6,
              }}
            >
              Create client envelopes, track tax preparation progress and keep
              every document category together.
            </p>
          </div>

          <div
            style={{
              padding: "15px 18px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.24)",
              minWidth: "190px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                opacity: 0.8,
              }}
            >
              CURRENT TAX YEAR
            </div>

            <div style={{ fontSize: "30px", fontWeight: 900 }}>
              {currentTaxYear}
            </div>
          </div>
        </section>

        <PixelAssistant mode="welcome" />

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "15px",
            marginTop: "22px",
          }}
        >
          {[
            {
              icon: "👥",
              label: "Total Clients",
              value: clients.length,
              note: "Saved in DocsFiles",
            },
            {
              icon: "📁",
              label: "Active Files",
              value: activeCount,
              note: "Still in progress",
            },
            {
              icon: "⏳",
              label: "Waiting",
              value: waitingCount,
              note: "Documents needed",
            },
            {
              icon: "✅",
              label: "Completed",
              value: completedCount,
              note: "Returns finished",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "19px",
                borderRadius: "17px",
                background: "rgba(255,255,255,0.95)",
                border: "1px solid #dbe5f0",
                boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background: "#eff6ff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "22px",
                }}
              >
                {item.icon}
              </div>

              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#64748b",
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    fontSize: "25px",
                    fontWeight: 900,
                    marginTop: "1px",
                  }}
                >
                  {item.value}
                </div>

                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  {item.note}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            marginTop: "22px",
            display: "grid",
            gridTemplateColumns: selectedClient
              ? "minmax(0, 1.15fr) minmax(350px, 0.85fr)"
              : "1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.97)",
              border: "1px solid #dbe5f0",
              borderRadius: "20px",
              padding: "21px",
              boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "14px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "21px",
                  }}
                >
                  Client Dashboard
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Search, filter and open a client envelope.
                </p>
              </div>

              <button
                type="button"
                style={{
                  ...buttonBase,
                  padding: "10px 14px",
                  background: "#172033",
                  color: "white",
                }}
                onClick={() => {
                  setMessage("");
                  setShowNewClient(true);
                }}
              >
                ＋ Add Client
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(220px, 1fr) minmax(165px, 0.35fr) minmax(145px, 0.3fr)",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="🔍 Search name, email, phone or tax year..."
                style={inputStyle}
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={inputStyle}
              >
                <option value="All">All statuses</option>

                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                style={inputStyle}
              >
                <option value="All">All client types</option>
                <option value="Individual">Individual</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div style={{ marginTop: "18px" }}>
              {filteredClients.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "42px 20px",
                    border: "2px dashed #cbd5e1",
                    borderRadius: "16px",
                    background: "#f8fafc",
                  }}
                >
                  <div style={{ fontSize: "34px" }}>📭</div>

                  <h3 style={{ margin: "10px 0 5px" }}>
                    No matching clients found
                  </h3>

                  <p style={{ margin: 0, color: "#64748b" }}>
                    Change your filters or create a new client.
                  </p>
                </div>
              ) : (
                filteredClients.map((client) => {
                  const colors = statusColor(client.status);
                  const selected = selectedClient?.id === client.id;

                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => setSelectedClient(client)}
                      style={{
                        width: "100%",
                        border: selected
                          ? "2px solid #6366f1"
                          : "1px solid #dbe5f0",
                        background: selected ? "#f5f3ff" : "white",
                        borderRadius: "15px",
                        padding: "16px",
                        marginBottom: "11px",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "#172033",
                        boxShadow: selected
                          ? "0 8px 20px rgba(99,102,241,0.12)"
                          : "0 4px 12px rgba(15,23,42,0.03)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "14px",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "13px",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "46px",
                              height: "46px",
                              borderRadius: "14px",
                              background:
                                client.clientType === "Business"
                                  ? "#f3e8ff"
                                  : "#dbeafe",
                              display: "grid",
                              placeItems: "center",
                              fontSize: "22px",
                            }}
                          >
                            {client.clientType === "Business" ? "🏢" : "👤"}
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: 900,
                                fontSize: "16px",
                              }}
                            >
                              {getDisplayName(client)}
                            </div>

                            <div
                              style={{
                                marginTop: "4px",
                                color: "#64748b",
                                fontSize: "12px",
                              }}
                            >
                              {client.clientType} · Tax Year {client.taxYear}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            background: colors.background,
                            color: colors.color,
                            border: `1px solid ${colors.border}`,
                            padding: "6px 9px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          {client.status}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          marginTop: "13px",
                          color: "#64748b",
                          fontSize: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>📧 {client.email || "No email entered"}</span>
                        <span>📞 {client.phone || "No phone entered"}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {selectedClient && (
            <aside
              style={{
                background: "rgba(255,255,255,0.98)",
                border: "1px solid #dbe5f0",
                borderRadius: "20px",
                padding: "21px",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.07)",
                position: "sticky",
                top: "104px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#6366f1",
                      fontWeight: 800,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.7px",
                    }}
                  >
                    Client Envelope
                  </div>

                  <h2 style={{ margin: "6px 0 3px", fontSize: "22px" }}>
                    {getDisplayName(selectedClient)}
                  </h2>

                  <div style={{ color: "#64748b", fontSize: "13px" }}>
                    {selectedClient.clientType} · Tax Year{" "}
                    {selectedClient.taxYear}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  style={{
                    ...buttonBase,
                    width: "34px",
                    height: "34px",
                    background: "#f1f5f9",
                    color: "#475569",
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginTop: "17px" }}>
                <label style={labelStyle}>Preparation status</label>

                <select
                  value={selectedClient.status}
                  onChange={(event) =>
                    changeClientStatus(
                      selectedClient.id,
                      event.target.value as ClientStatus,
                    )
                  }
                  style={inputStyle}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <FolderGrid
                folders={documentFolders}
                documents={documents}
                clientId={selectedClient.id}
                onOpenFolder={setOpenFolderId}
              />

              <div
                style={{
                  marginTop: "17px",
                  padding: "13px",
                  borderRadius: "13px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "12px",
                    marginBottom: "6px",
                  }}
                >
                  📝 Client Notes
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedClient.notes || "No notes have been entered."}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: "10px",
                  marginTop: "17px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowRequestCenter(true)}
                  style={{
                    ...buttonBase,
                    padding: "12px",
                    background: "#172033",
                    color: "white",
                  }}
                >
                  📋 Request Documents
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const portalUrl = `${window.location.origin}/portal/${selectedClient.id}`;
                    window.open(portalUrl, "_blank", "noopener,noreferrer");
                  }}
                  style={{
                    ...buttonBase,
                    padding: "12px",
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    color: "white",
                  }}
                >
                  🔗 📂 Open Client Portal
                </button>

                <button
                  type="button"
                  onClick={() => deleteClient(selectedClient)}
                  style={{
                    ...buttonBase,
                    padding: "12px 14px",
                    background: "#fff1f2",
                    color: "#be123c",
                    border: "1px solid #fecdd3",
                  }}
                  title="Delete client"
                >
                  🗑️
                </button>
              </div>
            </aside>
          )}
        </section>
      </div>

      {showNewClient && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.62)",
            display: "grid",
            placeItems: "center",
            padding: "20px",
            zIndex: 100,
            backdropFilter: "blur(5px)",
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowNewClient(false);
              setMessage("");
            }
          }}
        >
          <form
            onSubmit={createClient}
            style={{
              width: "min(760px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: "22px",
              boxShadow: "0 30px 80px rgba(15, 23, 42, 0.32)",
              border: "1px solid #dbe5f0",
            }}
          >
            <div
              style={{
                padding: "22px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "14px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#6366f1",
                    fontWeight: 800,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  New DocsFiles Envelope
                </div>

                <h2 style={{ margin: "6px 0 4px", fontSize: "25px" }}>
                  Create a New Client
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Enter the basic information. Document folders will be created
                  automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowNewClient(false);
                  setMessage("");
                }}
                style={{
                  ...buttonBase,
                  width: "38px",
                  height: "38px",
                  background: "#f1f5f9",
                  color: "#475569",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "23px 24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <div>
                  <label style={labelStyle}>Client type</label>

                  <select
                    value={form.clientType}
                    onChange={(event) =>
                      updateForm(
                        "clientType",
                        event.target.value as ClientType,
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="Individual">Individual / Family</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Tax year</label>

                  <select
                    value={form.taxYear}
                    onChange={(event) =>
                      updateForm("taxYear", event.target.value)
                    }
                    style={inputStyle}
                  >
                    {Array.from({ length: 7 }, (_, index) =>
                      String(Number(currentTaxYear) - index),
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {form.clientType === "Individual" ? (
                  <>
                    <div>
                      <label style={labelStyle}>
                        Primary taxpayer name *
                      </label>

                      <input
                        value={form.primaryName}
                        onChange={(event) =>
                          updateForm("primaryName", event.target.value)
                        }
                        placeholder="Example: Juergen Kneifel"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Spouse name</label>

                      <input
                        value={form.spouseName}
                        onChange={(event) =>
                          updateForm("spouseName", event.target.value)
                        }
                        placeholder="Example: Kathy Kneifel"
                        style={inputStyle}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Business name *</label>

                      <input
                        value={form.businessName}
                        onChange={(event) =>
                          updateForm("businessName", event.target.value)
                        }
                        placeholder="Example: TaxesDeal LLC"
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>
                        Primary contact person
                      </label>

                      <input
                        value={form.primaryName}
                        onChange={(event) =>
                          updateForm("primaryName", event.target.value)
                        }
                        placeholder="Owner or contact name"
                        style={inputStyle}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label style={labelStyle}>Email address</label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm("email", event.target.value)
                    }
                    placeholder="client@email.com"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone number</label>

                  <input
                    value={form.phone}
                    onChange={(event) =>
                      updateForm("phone", event.target.value)
                    }
                    placeholder="(406) 555-1234"
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Starting status</label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value as ClientStatus,
                      )
                    }
                    style={inputStyle}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Client notes</label>

                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      updateForm("notes", event.target.value)
                    }
                    placeholder="Residency details, special tax issues, missing documents or reminders..."
                    rows={4}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              {message && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "11px 13px",
                    background: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: "10px",
                    color: "#be123c",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {message}
                </div>
              )}
            </div>

            <div
              style={{
                padding: "17px 24px",
                borderTop: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                borderRadius: "0 0 22px 22px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowNewClient(false);
                  setMessage("");
                }}
                style={{
                  ...buttonBase,
                  padding: "12px 17px",
                  background: "#e2e8f0",
                  color: "#334155",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  ...buttonBase,
                  padding: "12px 19px",
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  color: "white",
                  boxShadow: "0 8px 18px rgba(37, 99, 235, 0.22)",
                }}
              >
                📁 Create Client Envelope
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedClient && showRequestCenter && (
        <RequestCenter
          client={selectedClient}
          requests={documentRequests}
          onChange={setDocumentRequests}
          onClose={() => setShowRequestCenter(false)}
        />
      )}

      {selectedClient && openFolderId && (
        <UploadZone
          clientId={selectedClient.id}
          folder={
            documentFolders.find((folder) => folder.id === openFolderId)!
          }
          documents={documents.filter(
            (document) =>
              document.clientId === selectedClient.id &&
              document.folderId === openFolderId,
          )}
          onAddDocuments={(newDocuments) =>
            setDocuments((current) => [...newDocuments, ...current])
          }
          onUpdateDocument={(documentId, updates) => {
            const existingDocument = documents.find(
              (document) => document.id === documentId,
            );

            setDocuments((current) =>
              current.map((document) =>
                document.id === documentId
                  ? { ...document, ...updates }
                  : document,
              ),
            );

            if (
              existingDocument &&
              typeof updates.reviewed === "boolean"
            ) {
              setDocumentRequests((current) => {
                const matchingRequest = findMatchingRequest(
                  existingDocument.name,
                  existingDocument.folderId,
                  current.filter(
                    (request) =>
                      request.clientId === existingDocument.clientId,
                  ),
                );

                if (!matchingRequest) {
                  return current;
                }

                const nextStatus = statusForReviewedDocument(
                  existingDocument,
updates.reviewed ?? false,
                );

                return current.map((request) =>
                  request.id === matchingRequest.id
                    ? { ...request, status: nextStatus }
                    : request,
                );
              });
            }
          }}
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