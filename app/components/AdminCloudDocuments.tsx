"use client";

import { useCallback, useEffect, useState } from "react";
import type { StoredDocument } from "../types/client";
import { getCloudDocumentUrl, listCloudDocuments } from "../lib/cloudDocuments";

type Props = {
  /** Client code (TD-0002), NOT clients.id UUID. */
  clientCode: string;
};

/**
 * Read-only administrator mirror for one client's cloud documents.
 * Requires existing Supabase RLS admin authorization.
 * Do not expose this component to client routes.
 */
export default function AdminCloudDocuments({ clientCode }: Props) {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!clientCode) {
      setDocuments([]);
      setError("Missing client code.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setDocuments(await listCloudDocuments(clientCode));
    } catch (err) {
      console.error("Admin document mirror failed:", err);
      setDocuments([]);
      setError("Documents could not be loaded. Check access permissions.");
    } finally {
      setLoading(false);
    }
  }, [clientCode]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function openDocument(document: StoredDocument) {
    try {
      const url = await getCloudDocumentUrl(document.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Admin preview failed:", err);
      setError("Unable to open document. Check access permissions.");
    }
  }

  return (
    <section aria-label="Cloud documents">
      <h3>Cloud documents ({documents.length})</h3>
      <button type="button" onClick={() => void refresh()} disabled={loading}>
        {loading ? "Loading..." : "Refresh documents"}
      </button>
      {error && <p role="alert">{error}</p>}
      {!loading && !error && documents.length === 0 && <p>No cloud documents found.</p>}
      <ul>
        {documents.map((document) => (
          <li key={document.id}>
            <button type="button" onClick={() => void openDocument(document)}>
              {document.name}
            </button>
            {" — "}{document.folderId}{" — "}
            {document.reviewed ? "Reviewed" : "Not reviewed"}
          </li>
        ))}
      </ul>
    </section>
  );
}
