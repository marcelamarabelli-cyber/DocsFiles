import type { Client, StoredDocument } from "../types/client";

const CLIENTS_KEY = "docsfiles-clients";
const DOCUMENTS_KEY = "docsfiles-documents";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadClients(fallback: Client[] = []): Client[] {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const saved = window.localStorage.getItem(CLIENTS_KEY);

    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveClients(clients: Client[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function loadDocuments(): StoredDocument[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(DOCUMENTS_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDocuments(documents: StoredDocument[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function createDocumentId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `document-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
