export type ClientType = "Individual" | "Business";

export type ClientStatus =
  | "New"
  | "Waiting for Documents"
  | "Documents Received"
  | "In Preparation"
  | "Ready for Review"
  | "Ready to File"
  | "Completed";

export type DocumentFolderId =
  | "client-intake"
  | "income"
  | "deductions"
  | "expenses"
  | "mileage"
  | "rental-properties"
  | "bookkeeping"
  | "medical"
  | "charitable-donations"
  | "receipts"
  | "bank-statements"
  | "e-signatures"
  | "final-return"
  | "invoices-payments"
  | "messages";

export type DocumentFolder = {
  id: DocumentFolderId;
  icon: string;
  title: string;
  subtitle: string;
};

export type StoredDocument = {
  id: string;
  clientId: string;
  folderId: DocumentFolderId;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  previewUrl?: string;
};

export type Client = {
  id: string;
  primaryName: string;
  spouseName: string;
  businessName: string;
  email: string;
  phone: string;
  clientType: ClientType;
  taxYear: string;
  status: ClientStatus;
  notes: string;
  createdAt: string;
};

export type ClientForm = {
  primaryName: string;
  spouseName: string;
  businessName: string;
  email: string;
  phone: string;
  clientType: ClientType;
  taxYear: string;
  status: ClientStatus;
  notes: string;
};

export const statusOptions: ClientStatus[] = [
  "New",
  "Waiting for Documents",
  "Documents Received",
  "In Preparation",
  "Ready for Review",
  "Ready to File",
  "Completed",
];

export const documentFolders: DocumentFolder[] = [
  {
    id: "client-intake",
    icon: "📥",
    title: "Client Intake",
    subtitle: "Questionnaire, identification and profile",
  },
  {
    id: "income",
    icon: "💼",
    title: "Income",
    subtitle: "W-2, 1099, K-1, SSA and retirement",
  },
  {
    id: "deductions",
    icon: "🏠",
    title: "Deductions",
    subtitle: "Mortgage, taxes, education and donations",
  },
  {
    id: "expenses",
    icon: "🧾",
    title: "Expenses",
    subtitle: "Business and rental expenses",
  },
  {
    id: "mileage",
    icon: "🚗",
    title: "Mileage",
    subtitle: "Business vehicle records and logs",
  },
  {
    id: "rental-properties",
    icon: "🏢",
    title: "Rental Properties",
    subtitle: "Income, expenses and property documents",
  },
  {
    id: "bookkeeping",
    icon: "📊",
    title: "Bookkeeping",
    subtitle: "Profit and loss, balance sheet and ledgers",
  },
  {
    id: "medical",
    icon: "🩺",
    title: "Medical",
    subtitle: "Medical, dental and insurance records",
  },
  {
    id: "charitable-donations",
    icon: "❤️",
    title: "Charitable Donations",
    subtitle: "Cash and non-cash contribution records",
  },
  {
    id: "receipts",
    icon: "🧾",
    title: "Receipts",
    subtitle: "Supporting receipts and proof of payment",
  },
  {
    id: "bank-statements",
    icon: "🏦",
    title: "Bank Statements",
    subtitle: "Bank and credit-card statements",
  },
  {
    id: "e-signatures",
    icon: "✍️",
    title: "E-Signatures",
    subtitle: "Consent, engagement and authorization forms",
  },
  {
    id: "final-return",
    icon: "📬",
    title: "Final Return",
    subtitle: "Completed federal and state returns",
  },
  {
    id: "invoices-payments",
    icon: "💳",
    title: "Invoices & Payments",
    subtitle: "Invoices, payment records and receipts",
  },
  {
    id: "messages",
    icon: "💬",
    title: "Messages",
    subtitle: "Client questions, notes and correspondence",
  },
];
