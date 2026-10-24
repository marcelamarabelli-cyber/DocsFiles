import { createClient } from "../utils/supabase/client";
import type { StoredDocument } from "../types/client";

const BUCKET = "client-documents";

type DocumentRow = {
  id: string;
  client_id: string;
  folder_id: string;
  name: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
  uploaded_by: string;
  reviewed: boolean;
  storage_path: string;
};

function toDocument(row: DocumentRow): StoredDocument {
  return {
    id: row.id,
    clientId: row.client_id,
    folderId: row.folder_id as StoredDocument["folderId"],
    name: row.name,
    type: row.mime_type,
    size: row.size_bytes,
    uploadedAt: row.uploaded_at,
    uploadedBy: row.uploaded_by === "Preparer" ? "Preparer" : "Client",
    reviewed: row.reviewed,
  };
}

/**
 * Cloud document operations. Requires matching RLS on public.client_documents
 * AND storage.objects before being wired into the live portal.
 * Never use service-role credentials in the browser.
 */
export async function listCloudDocuments(clientId: string): Promise<StoredDocument[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("client_documents")
    .select("id,client_id,folder_id,name,mime_type,size_bytes,uploaded_at,uploaded_by,reviewed,storage_path")
    .eq("client_id", clientId)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return (data as DocumentRow[] ?? []).map(toDocument);
}

export async function uploadCloudDocument(
  document: StoredDocument,
  file: File,
): Promise<StoredDocument> {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error("Please sign in before uploading.");
  // The server's RLS must independently enforce ownership of this clientId.
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "document";
  const path = `${encodeURIComponent(document.clientId)}/${document.id}/${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
  if (uploadError) throw uploadError;

  const row = {
    id: document.id,
    client_id: document.clientId,
    folder_id: document.folderId,
    name: document.name,
    mime_type: file.type || "application/octet-stream",
    size_bytes: file.size,
    uploaded_at: document.uploadedAt,
    uploaded_by: document.uploadedBy,
    reviewed: false,
    storage_path: path,
    created_by: auth.user.id,
  };

  const { data, error } = await supabase
    .from("client_documents")
    .insert(row)
    .select("id,client_id,folder_id,name,mime_type,size_bytes,uploaded_at,uploaded_by,reviewed,storage_path")
    .single();
  if (error) {
    // Best-effort cleanup; Storage RLS may prevent deleting the orphan.
    const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([path]);
    if (cleanupError) console.error("Cloud upload cleanup failed:", cleanupError.message);
    throw error;
  }
  return toDocument(data as DocumentRow);
}

export async function getCloudDocumentUrl(documentId: string): Promise<string> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("client_documents")
    .select("storage_path")
    .eq("id", documentId)
    .single();
  if (error || !row) throw error ?? new Error("Document not found.");
  const { data, error: urlError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(row.storage_path, 60);
  if (urlError || !data) throw urlError ?? new Error("Could not open document.");
  return data.signedUrl;
}

/**
 * Updates document metadata only. RLS must permit only the owning client or admin.
 * The storage object's original filename/path is intentionally unchanged.
 */
export async function renameCloudDocument(documentId: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 255) throw new Error("Enter a valid document name.");
  const supabase = createClient();
  const { data, error } = await supabase
    .from("client_documents")
    .update({ name: trimmed })
    .eq("id", documentId)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Document not found or access denied.");
}

/** Only authorized preparers should be able to change review status (enforce in RLS). */
export async function setCloudDocumentReviewed(documentId: string, reviewed: boolean): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("client_documents")
    .update({ reviewed })
    .eq("id", documentId)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Document not found or access denied.");
}

/** Delete a cloud file and its metadata. Requires both storage and table DELETE RLS. */
export async function deleteCloudDocument(documentId: string): Promise<void> {
  const supabase = createClient();
  const { data: row, error: lookupError } = await supabase
    .from("client_documents")
    .select("storage_path")
    .eq("id", documentId)
    .single();
  if (lookupError || !row) throw lookupError ?? new Error("Document not found or access denied.");
  const { data: removed, error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([row.storage_path]);
  if (storageError) throw storageError;
  if (!removed?.length) throw new Error("File deletion was not confirmed.");
  const { data, error } = await supabase
    .from("client_documents")
    .delete()
    .eq("id", documentId)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("File removed but metadata deletion was denied; contact the administrator.");
}

/**
 * Admin dashboard uses clients.id (UUID), while client_documents.client_id
 * stores clients.client_code (for example TD-0002).
 * Resolve the code through the clients table instead of guessing from UUID.
 * Both queries remain subject to the current user's RLS policies.
 */
export async function listCloudDocumentsForClientUuid(clientUuid: string): Promise<StoredDocument[]> {
  const supabase = createClient();
  const { data: client, error } = await supabase
    .from("clients")
    .select("client_code")
    .eq("id", clientUuid)
    .single();
  if (error || !client?.client_code) {
    throw error ?? new Error("Client code not found or access denied.");
  }
  return listCloudDocuments(client.client_code);
}
