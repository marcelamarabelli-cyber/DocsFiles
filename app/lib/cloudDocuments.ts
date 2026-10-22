import { createClient } from "../utils/supabase/client";
import type { StoredDocument } from "../types/client";

const BUCKET = "client-documents";

export async function listCloudDocuments(clientId: string): Promise<StoredDocument[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("client_documents")
    .select("id,client_id,folder_id,name,mime_type,size_bytes,uploaded_at,uploaded_by,reviewed")
    .eq("client_id", clientId).order("uploaded_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id, clientId: row.client_id, folderId: row.folder_id,
    name: row.name, type: row.mime_type, size: Number(row.size_bytes),
    uploadedAt: row.uploaded_at, uploadedBy: row.uploaded_by,
    reviewed: row.reviewed,
  } as StoredDocument));
}

export async function uploadCloudDocument(document: StoredDocument, file: File): Promise<void> {
  const supabase = createClient();
  const path = `${document.clientId}/${document.id}/${encodeURIComponent(file.name)}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream", upsert: false,
  });
  if (uploadError) throw uploadError;
  const { error: recordError } = await supabase.from("client_documents").insert({
    id: document.id, client_id: document.clientId, folder_id: document.folderId,
    name: document.name, mime_type: file.type || "application/octet-stream",
    size_bytes: file.size, uploaded_at: document.uploadedAt,
    uploaded_by: document.uploadedBy, reviewed: Boolean(document.reviewed), storage_path: path,
  });
  if (recordError) throw new Error(`File uploaded but its index failed: ${recordError.message}`);
}

export async function downloadCloudBlob(documentId: string): Promise<Blob | null> {
  const supabase = createClient();
  const { data: row, error } = await supabase.from("client_documents")
    .select("storage_path").eq("id", documentId).maybeSingle();
  if (error) throw error;
  if (!row) return null;
  const { data, error: downloadError } = await supabase.storage.from(BUCKET).download(row.storage_path);
  if (downloadError) throw downloadError;
  return data;
}

export async function updateCloudDocument(documentId: string, updates: Partial<StoredDocument>): Promise<void> {
  const changes: Record<string, unknown> = {};
  if (updates.name !== undefined) changes.name = updates.name;
  if (updates.reviewed !== undefined) changes.reviewed = updates.reviewed;
  if (!Object.keys(changes).length) return;
  const { error } = await createClient().from("client_documents").update(changes).eq("id", documentId);
  if (error) throw error;
}
