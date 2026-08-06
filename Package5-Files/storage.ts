import type {
  Client,
  DocumentRequest,
  StoredDocument,
} from "../types/client";

const CLIENTS_KEY = "docsfiles-clients";
const DOCUMENTS_KEY = "docsfiles-documents";
const REQUESTS_KEY = "docsfiles-document-requests";

const DATABASE_NAME = "docsfiles-secure-storage";
const DATABASE_VERSION = 1;
const FILE_STORE_NAME = "document-files";

function isBrowser() {
  return typeof window !== "undefined";
}

/* =========================================================
   CLIENT STORAGE
========================================================= */

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

  try {
    window.localStorage.setItem(
      CLIENTS_KEY,
      JSON.stringify(clients),
    );
  } catch (error) {
    console.error("Unable to save clients:", error);
  }
}

/* =========================================================
   DOCUMENT METADATA STORAGE
========================================================= */

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

    if (!Array.isArray(parsed)) {
      return [];
    }

    /*
      Old browser blob URLs do not survive after Chrome closes
      or after the page reloads. Remove them when metadata loads.
      The permanent file will be restored from IndexedDB instead.
    */
    return parsed.map((document: StoredDocument) => ({
      ...document,
      previewUrl:
        typeof document.previewUrl === "string" &&
        !document.previewUrl.startsWith("blob:")
          ? document.previewUrl
          : undefined,
    }));
  } catch {
    return [];
  }
}

export function saveDocuments(documents: StoredDocument[]) {
  if (!isBrowser()) {
    return;
  }

  try {
    /*
      Never save temporary browser blob URLs in localStorage.
      They become invalid after refreshing or closing the browser.
    */
    const documentsForStorage = documents.map((document) => ({
      ...document,
      previewUrl:
        typeof document.previewUrl === "string" &&
        !document.previewUrl.startsWith("blob:")
          ? document.previewUrl
          : undefined,
    }));

    window.localStorage.setItem(
      DOCUMENTS_KEY,
      JSON.stringify(documentsForStorage),
    );
  } catch (error) {
    console.error("Unable to save document information:", error);
  }
}

/* =========================================================
   DOCUMENT REQUEST STORAGE
========================================================= */

export function loadDocumentRequests(): DocumentRequest[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(REQUESTS_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDocumentRequests(
  requests: DocumentRequest[],
) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      REQUESTS_KEY,
      JSON.stringify(requests),
    );
  } catch (error) {
    console.error("Unable to save document requests:", error);
  }
}

/* =========================================================
   PERMANENT FILE STORAGE — INDEXEDDB
========================================================= */

type StoredFileRecord = {
  documentId: string;
  clientId: string;
  folderId: string;
  name: string;
  type: string;
  size: number;
  savedAt: string;
  file: Blob;
};

function openDocumentDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser() || !window.indexedDB) {
      reject(
        new Error(
          "Permanent browser storage is not supported in this browser.",
        ),
      );
      return;
    }

    const request = window.indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION,
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(FILE_STORE_NAME)) {
        const store = database.createObjectStore(FILE_STORE_NAME, {
          keyPath: "documentId",
        });

        store.createIndex("clientId", "clientId", {
          unique: false,
        });

        store.createIndex("folderId", "folderId", {
          unique: false,
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(
        request.error ??
          new Error("Unable to open DocsFiles storage."),
      );
    };

    request.onblocked = () => {
      reject(
        new Error(
          "DocsFiles storage is temporarily blocked. Close other DocsFiles tabs and try again.",
        ),
      );
    };
  });
}

export async function saveDocumentFile(
  document: StoredDocument,
  file: File,
): Promise<void> {
  const database = await openDocumentDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(
        FILE_STORE_NAME,
        "readwrite",
      );

      const store = transaction.objectStore(FILE_STORE_NAME);

      const record: StoredFileRecord = {
        documentId: document.id,
        clientId: document.clientId,
        folderId: document.folderId,
        name: document.name,
        type: file.type || document.type,
        size: file.size,
        savedAt: new Date().toISOString(),
        file,
      };

      store.put(record);

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(
          transaction.error ??
            new Error(`Unable to save ${document.name}.`),
        );
      };

      transaction.onabort = () => {
        reject(
          transaction.error ??
            new Error(`Saving ${document.name} was cancelled.`),
        );
      };
    });
  } finally {
    database.close();
  }
}

export async function loadDocumentFile(
  documentId: string,
): Promise<Blob | null> {
  const database = await openDocumentDatabase();

  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const transaction = database.transaction(
        FILE_STORE_NAME,
        "readonly",
      );

      const store = transaction.objectStore(FILE_STORE_NAME);
      const request = store.get(documentId);

      request.onsuccess = () => {
        const record = request.result as
          | StoredFileRecord
          | undefined;

        resolve(record?.file ?? null);
      };

      request.onerror = () => {
        reject(
          request.error ??
            new Error("Unable to load the saved document."),
        );
      };
    });
  } finally {
    database.close();
  }
}

export async function createDocumentPreviewUrl(
  documentId: string,
): Promise<string | null> {
  const file = await loadDocumentFile(documentId);

  if (!file) {
    return null;
  }

  return URL.createObjectURL(file);
}

export async function downloadStoredDocument(
  document: StoredDocument,
): Promise<boolean> {
  const file = await loadDocumentFile(document.id);

  if (!file) {
    return false;
  }

  const url = URL.createObjectURL(file);
  const link = window.document.createElement("a");

  link.href = url;
  link.download = document.name;

  window.document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return true;
}

export async function deleteDocumentFile(
  documentId: string,
): Promise<void> {
  const database = await openDocumentDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(
        FILE_STORE_NAME,
        "readwrite",
      );

      const store = transaction.objectStore(FILE_STORE_NAME);

      store.delete(documentId);

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(
          transaction.error ??
            new Error("Unable to delete the stored document."),
        );
      };
    });
  } finally {
    database.close();
  }
}

export async function documentFileExists(
  documentId: string,
): Promise<boolean> {
  const file = await loadDocumentFile(documentId);
  return file !== null;
}

export async function deleteAllClientFiles(
  clientId: string,
): Promise<void> {
  const database = await openDocumentDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(
        FILE_STORE_NAME,
        "readwrite",
      );

      const store = transaction.objectStore(FILE_STORE_NAME);
      const index = store.index("clientId");
      const request = index.openCursor(
        IDBKeyRange.only(clientId),
      );

      request.onsuccess = () => {
        const cursor = request.result;

        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      request.onerror = () => {
        reject(
          request.error ??
            new Error("Unable to find the client documents."),
        );
      };

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(
          transaction.error ??
            new Error("Unable to delete the client documents."),
        );
      };
    });
  } finally {
    database.close();
  }
}

/* =========================================================
   UTILITIES
========================================================= */

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];
  const calculatedIndex = Math.floor(
    Math.log(bytes) / Math.log(1024),
  );

  const unitIndex = Math.min(
    calculatedIndex,
    units.length - 1,
  );

  const value = bytes / Math.pow(1024, unitIndex);

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${
    units[unitIndex]
  }`;
}

export function createDocumentId() {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return `document-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}