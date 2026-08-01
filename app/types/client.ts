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
  | "identification"
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
  uploadedBy: "Preparer" | "Client";
  reviewed: boolean;
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
    subtitle: "Questionnaire, contact information and tax profile",
  },
  {
    id: "identification",
    icon: "🪪",
    title: "Identification",
    subtitle: "Driver licenses, Social Security cards and identification",
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

export type RequestStatus =
  | "Waiting"
  | "Uploaded"
  | "Under Review"
  | "Accepted"
  | "Replace Requested";

export type DocumentRequest = {
  id: string;
  clientId: string;
  title: string;
  category: DocumentFolderId;
  requested: boolean;
  status: RequestStatus;
  note: string;
  createdAt: string;
};

export const standardDocumentRequests: Array<{
  title: string;
  category: DocumentFolderId;
}> = [
  {
    title: "Completed Client Intake Questionnaire",
    category: "client-intake",
  },
  {
    title: "Prior-Year Tax Return",
    category: "client-intake",
  },

  {
    title: "Primary Taxpayer Driver License — Front",
    category: "identification",
  },
  {
    title: "Primary Taxpayer Driver License — Back",
    category: "identification",
  },
  {
    title: "Spouse Driver License — Front",
    category: "identification",
  },
  {
    title: "Spouse Driver License — Back",
    category: "identification",
  },
  {
    title: "Social Security Cards",
    category: "identification",
  },
  {
    title: "Passport or State Identification, if applicable",
    category: "identification",
  },
  {
    title: "ITIN Letter, if applicable",
    category: "identification",
  },

  {
    title: "W-2 Wage Statements",
    category: "income",
  },
  {
    title: "1099-INT Interest Statements",
    category: "income",
  },
  {
    title: "1099-DIV Dividend Statements",
    category: "income",
  },
  {
    title: "1099-R Retirement Statements",
    category: "income",
  },
  {
    title: "SSA-1099 Social Security Statement",
    category: "income",
  },
  {
    title: "K-1 Statements",
    category: "income",
  },
  {
    title: "Brokerage and Investment Statements",
    category: "income",
  },

  {
    title: "Mortgage Interest Form 1098",
    category: "deductions",
  },
  {
    title: "Property Tax Statements",
    category: "deductions",
  },
  {
    title: "Charitable Donation Records",
    category: "charitable-donations",
  },
  {
    title: "Medical and Dental Expenses",
    category: "medical",
  },

  {
    title: "Business Income and Expenses",
    category: "bookkeeping",
  },
  {
    title: "Business Mileage Log",
    category: "mileage",
  },
  {
    title: "Rental Income and Expenses",
    category: "rental-properties",
  },
  {
    title: "Rental Property Closing Statements",
    category: "rental-properties",
  },

  {
    title: "Bank Statements",
    category: "bank-statements",
  },
  {
    title: "Signed Consent and Authorization Forms",
    category: "e-signatures",
  },
  {
    title: "Other Supporting Documents",
    category: "receipts",
  },
];