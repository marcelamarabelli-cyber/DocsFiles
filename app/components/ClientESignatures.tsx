"use client";

import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";
import { PDFDocument, StandardFonts } from "pdf-lib";
type SignatureStatus = "pending" | "signed";

type SignatureDocument = {
  id: string;
  name: string;
  description: string;
  status: SignatureStatus;
  pdfUrl?: string;
signedAt?: string;
};

export default function ClientESignatures({
  clientId,
}: {
  clientId: string;
}) {
  const supabase = createClient();
    const [selectedDocument, setSelectedDocument] =
  useState<SignatureDocument | null>(null);
  const [signerName, setSignerName] = useState("");
  const [documents, setDocuments] = useState<SignatureDocument[]>([
    {
      id: "8821",
name: "Form 8821 — Tax Information Authorization",
description: "Authorize access to your specified IRS tax information.",
pdfUrl: "/forms/f8821.pdf",
status: "pending",

    },
    {
      id: "8879",
name: "Form 8879 — IRS e-file Signature Authorization",
description: "Review and sign your IRS e-file authorization.",
pdfUrl: "/forms/f8879 (1).pdf",
      status: "pending",
    },
  ]);
  useEffect(() => {
  async function loadSignatures() {
    const { data, error } = await supabase
      .from("client_esignatures")
      .select("document_id,signed_at")
      .eq("client_id", clientId);

    if (error) {
      console.error("Could not load signatures:", error.message);
      return;
    }

    setDocuments((current) =>
      current.map((doc) => {
        const saved = data?.find((item) => item.document_id === doc.id);

        return saved
          ? {
              ...doc,
              status: "signed",
              signedAt: new Date(saved.signed_at).toLocaleString(),
            }
          : doc;
      })
    );
  }

  loadSignatures();
}, [clientId]);

  return (
    <section id="client-esignatures"
      style={{
        background: "white",
        borderRadius: 18,
        padding: 24,
        border: "1px solid #e5e7eb",
        marginTop: 24,
      }}
    >
      <h2 style={{ marginTop: 0 }}>✍️ Documents to Sign</h2>

      <p style={{ color: "#6b7280" }}>
        Review your documents and complete any required signatures.
      </p>

      <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
        {documents.map((document) => (
          <div
            key={document.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 18,
            }}
          >
            <strong>{document.name}</strong>

            <p style={{ color: "#6b7280", marginBottom: 12 }}>
              {document.description}
            </p>

            {document.status === "signed" ? (
  <div style={{ fontWeight: 700, color: "#15803d" }}>
    ✅ Signed
    {document.signedAt && (
      <div style={{ fontSize: 13, fontWeight: 400, marginTop: 4 }}>
        {document.signedAt}
      </div>
    )}
  </div>
) : (
  <button
    type="button"
    onClick={() => {
  

  setSelectedDocument(document);
}}
    style={{
      border: 0,
      borderRadius: 10,
      padding: "10px 16px",
      cursor: "pointer",
      fontWeight: 700,
    }}
  >
    Review & Sign
  </button>
)}
          </div>
        ))}
      </div>
      {selectedDocument && (
  <div
    style={{
      marginTop: 24,
      padding: 20,
      border: "1px solid #d1d5db",
      borderRadius: 14,
      background: "#f9fafb",
    }}
  >
    <h3 style={{ marginTop: 0 }}>
      {selectedDocument.name}
    </h3>

    <p style={{ color: "#6b7280" }}>
      Please review this document before signing.
    </p>
{selectedDocument.pdfUrl && (
  <iframe
    src={selectedDocument.pdfUrl}
    title={selectedDocument.name}
    style={{
      width: "100%",
      height: "700px",
      border: "1px solid #d1d5db",
      borderRadius: 10,
      marginBottom: 16,
      background: "white",
    }}
  />
)}
    <input
  type="text"
  value={signerName}
onChange={(e) => setSignerName(e.target.value)}
  placeholder="Type your full legal name"
  style={{
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 16,
  }}
/>


<button
  type="button"
 onClick={async () => {
  if (!signerName.trim()) {
    alert("Please type your full legal name before signing.");
    return;
  }

  const signedAt = new Date().toLocaleString();
  const { error } = await supabase
  .from("client_esignatures")
  .upsert(
    {
      client_id: clientId,
      document_id: selectedDocument.id,
      document_name: selectedDocument.name,
      signer_name: signerName.trim(),
      status: "signed",
      signed_at: new Date().toISOString(),
    },
    {
      onConflict: "auth_user_id,client_id,document_id",
    }
  );

if (error) {
  alert(`Could not save signature: ${error.message}`);
  return;
}
const sourcePdfBytes = await fetch(selectedDocument.pdfUrl!).then((res) =>
  res.arrayBuffer()
);
const pdfDoc = await PDFDocument.load(sourcePdfBytes);
const form = pdfDoc.getForm();
if (selectedDocument.id === "8821") {
  form.getTextField("topmostSubform[0].Page1[0].f1_32[0]").setText(signerName.trim());
  form.getTextField("topmostSubform[0].Page1[0].f1_33[0]").setText(signedAt);
}
if (selectedDocument.id === "8879") {
  const page = pdfDoc.getPages()[0];
  const signatureDate = new Date().toLocaleDateString();

  page.drawText(signerName.trim(), {
    x: 115,
    y: 309,
    size: 10,
  });

  page.drawText(signatureDate, {
    x: 462,
    y: 309,
    size: 10,
  });
}

const pdfBytes = await pdfDoc.save();

const pdfPath = `${clientId}/${selectedDocument.id}-${Date.now()}.pdf`;

const { error: uploadError } = await supabase.storage
  .from("signed-documents")
  .upload(pdfPath, pdfBytes, {
    contentType: "application/pdf",
    upsert: false,
  });

if (uploadError) {
  alert(`Signature saved, but PDF could not be uploaded: ${uploadError.message}`);
  return;
}

const { error: pathError } = await supabase
  .from("client_esignatures")
  .update({ pdf_path: pdfPath })
  .eq("client_id", clientId)
  .eq("document_id", selectedDocument.id);

if (pathError) {
  alert(`PDF uploaded, but file path could not be saved: ${pathError.message}`);
  return;
}
  setDocuments((current) =>
    current.map((doc) =>
      doc.id === selectedDocument.id
        ? { ...doc, status: "signed", signedAt }
        : doc
    )
  );

  setSelectedDocument(null);
  setSignerName("");
}}
  style={{
    border: 0,
    borderRadius: 10,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
    marginRight: 10,
  }}
>
  Sign Document
</button>


    <button
      type="button"
      onClick={() => setSelectedDocument(null)}
      style={{
        border: 0,
        borderRadius: 10,
        padding: "10px 16px",
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
    
      Close
    </button>
  </div>
)}
    </section>
  );
}