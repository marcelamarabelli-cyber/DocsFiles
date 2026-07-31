"use client";

import { useState } from "react";
import Header from "./components/Header";
type Client = {
  id: number;
  primaryName: string;
  spouseName: string;
  taxYear: string;
  filingStatus: string;
  residentState: string;
  additionalState: string;
  notes: string;
};

export default function Home() {
  const [showClientForm, setShowClientForm] = useState(false);

  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      primaryName: "Juergen Kneifel",
      spouseName: "Kathy Kneifel",
      taxYear: "2025",
      filingStatus: "Married Filing Jointly",
      residentState: "Washington",
      additionalState: "Montana",
      notes: "DocsFiles Test Client #001",
    },
  ]);

  const [primaryName, setPrimaryName] = useState("");
  const [spouseName, setSpouseName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxYear, setTaxYear] = useState("2025");
  const [filingStatus, setFilingStatus] = useState("");
  const [residentState, setResidentState] = useState("");
  const [additionalState, setAdditionalState] = useState("");
  const [notes, setNotes] = useState("");

  const buttonStyle = {
    padding: "14px 18px",
    fontSize: "17px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.14)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    boxSizing: "border-box" as const,
    marginTop: "6px",
  };

  function clearForm() {
    setPrimaryName("");
    setSpouseName("");
    setEmail("");
    setPhone("");
    setTaxYear("2025");
    setFilingStatus("");
    setResidentState("");
    setAdditionalState("");
    setNotes("");
  }

  function saveClient() {
    if (!primaryName.trim()) {
      alert("Please enter the primary client name.");
      return;
    }

    const newClient: Client = {
      id: Date.now(),
      primaryName,
      spouseName,
      taxYear,
      filingStatus,
      residentState,
      additionalState,
      notes,
    };

    setClients([newClient, ...clients]);
    clearForm();
    setShowClientForm(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        fontFamily: "Arial, sans-serif",
        background: "#f4f7fb",
      }}
    >
      <section
        style={{
          maxWidth: "950px",
          margin: "0 auto",
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <Header />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "16px",
          }}
        >
          <button
            onClick={() => setShowClientForm(true)}
            style={{
              ...buttonStyle,
              background: "#2563eb",
              color: "white",
            }}
          >
            ➕ New Client
          </button>

          <button
            onClick={() => alert("Client Login coming soon!")}
            style={{
              ...buttonStyle,
              background: "#0f766e",
              color: "white",
            }}
          >
            👤 Client Login
          </button>

          <button
            onClick={() => alert("Upload Documents coming soon!")}
            style={{
              ...buttonStyle,
              background: "#7c3aed",
              color: "white",
            }}
          >
            📤 Upload Documents
          </button>

          <button
            onClick={() => alert("Client List coming soon!")}
            style={{
              ...buttonStyle,
              background: "#475569",
              color: "white",
            }}
          >
            📂 Client List
          </button>
        </div>

        {showClientForm && (
          <div
            style={{
              marginTop: "32px",
              padding: "24px",
              background: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
            }}
          >
            <h2 style={{ marginTop: "0" }}>Create New Client</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label>Primary Client Name</label>
                <input
                  type="text"
                  value={primaryName}
                  onChange={(event) => setPrimaryName(event.target.value)}
                  placeholder="Example: Juergen Kneifel"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Spouse Name</label>
                <input
                  type="text"
                  value={spouseName}
                  onChange={(event) => setSpouseName(event.target.value)}
                  placeholder="Example: Kathy Kneifel"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="client@email.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="(000) 000-0000"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Tax Year</label>
                <input
                  type="number"
                  value={taxYear}
                  onChange={(event) => setTaxYear(event.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Filing Status</label>
                <select
                  value={filingStatus}
                  onChange={(event) => setFilingStatus(event.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select filing status</option>
                  <option>Single</option>
                  <option>Married Filing Jointly</option>
                  <option>Married Filing Separately</option>
                  <option>Head of Household</option>
                  <option>Qualifying Surviving Spouse</option>
                </select>
              </div>

              <div>
                <label>Resident State</label>
                <input
                  type="text"
                  value={residentState}
                  onChange={(event) => setResidentState(event.target.value)}
                  placeholder="Example: Montana"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Additional State</label>
                <input
                  type="text"
                  value={additionalState}
                  onChange={(event) => setAdditionalState(event.target.value)}
                  placeholder="Example: Washington"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Enter client notes here..."
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={saveClient}
                style={{
                  ...buttonStyle,
                  background: "#16a34a",
                  color: "white",
                }}
              >
                💾 Save Client
              </button>

              <button
                onClick={() => {
                  clearForm();
                  setShowClientForm(false);
                }}
                style={{
                  ...buttonStyle,
                  background: "#e2e8f0",
                  color: "#1e293b",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "32px",
            padding: "22px",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h2 style={{ marginTop: "0", fontSize: "22px" }}>
            Recent Clients
          </h2>

          {clients.map((client) => (
            <div
              key={client.id}
              style={{
                padding: "16px",
                marginTop: "12px",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
              }}
            >
              <strong>
                📁 {client.primaryName}
                {client.spouseName ? ` & ${client.spouseName}` : ""}
              </strong>

              <p style={{ margin: "8px 0 0", color: "#64748b" }}>
                Tax Year: {client.taxYear || "Not entered"}
              </p>

              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Filing Status: {client.filingStatus || "Not entered"}
              </p>

              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                States:{" "}
                {[client.residentState, client.additionalState]
                  .filter(Boolean)
                  .join(" / ") || "Not entered"}
              </p>

              {client.notes && (
                <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                  Notes: {client.notes}
                </p>
              )}
            </div>
          ))}
        </div>

        <p style={{ marginTop: "30px", color: "#777", fontSize: "17px" }}>
          Welcome, Marcela. Pixel is ready to help organize your clients.
        </p>
      </section>
    </main>
  );
}