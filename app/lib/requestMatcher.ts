import type {
  DocumentFolderId,
  DocumentRequest,
  StoredDocument,
} from "../types/client";

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/1099[\s_-]?r/g, "1099r")
    .replace(/1099[\s_-]?int/g, "1099int")
    .replace(/1099[\s_-]?div/g, "1099div")
    .replace(/ssa[\s_-]?1099/g, "ssa1099")
    .replace(/w[\s_-]?2/g, "w2")
    .replace(/k[\s_-]?1/g, "k1")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const keywordGroups: Array<{
  keywords: string[];
  requestWords: string[];
}> = [
  {
    keywords: ["driver license", "drivers license", "state id", "identification"],
    requestWords: ["driver license", "state identification"],
  },
  {
    keywords: ["social security card", "ss card", "ssc"],
    requestWords: ["social security card"],
  },
  {
    keywords: ["prior year return", "previous tax return", "last year tax"],
    requestWords: ["prior year tax return"],
  },
  {
    keywords: ["w2", "wage statement"],
    requestWords: ["w2 wage statement"],
  },
  {
    keywords: ["1099int", "interest statement"],
    requestWords: ["1099int interest statement"],
  },
  {
    keywords: ["1099div", "dividend statement"],
    requestWords: ["1099div dividend statement"],
  },
  {
    keywords: ["1099r", "retirement statement", "pension"],
    requestWords: ["1099r retirement statement"],
  },
  {
    keywords: ["ssa1099", "social security statement"],
    requestWords: ["ssa1099 social security statement"],
  },
  {
    keywords: ["k1", "schedule k1"],
    requestWords: ["k1 statement"],
  },
  {
    keywords: ["brokerage", "investment statement", "fidelity", "schwab"],
    requestWords: ["brokerage and investment statement"],
  },
  {
    keywords: ["1098", "mortgage interest"],
    requestWords: ["mortgage interest form 1098"],
  },
  {
    keywords: ["property tax", "real estate tax"],
    requestWords: ["property tax statement"],
  },
  {
    keywords: ["charitable", "donation", "contribution"],
    requestWords: ["charitable donation record"],
  },
  {
    keywords: ["medical", "dental", "health expense"],
    requestWords: ["medical and dental expense"],
  },
  {
    keywords: ["mileage", "mile log", "vehicle log"],
    requestWords: ["business mileage log"],
  },
  {
    keywords: ["rental income", "rental expense", "schedule e"],
    requestWords: ["rental income and expense"],
  },
  {
    keywords: ["closing statement", "settlement statement", "hud", "alta"],
    requestWords: ["rental property closing statement"],
  },
  {
    keywords: ["bank statement", "checking statement", "savings statement"],
    requestWords: ["bank statement"],
  },
];

function keywordScore(fileName: string, requestTitle: string) {
  const normalizedFileName = normalize(fileName);
  const normalizedRequestTitle = normalize(requestTitle);

  let score = 0;

  for (const group of keywordGroups) {
    const fileMatches = group.keywords.some((keyword) =>
      normalizedFileName.includes(normalize(keyword)),
    );

    const requestMatches = group.requestWords.some((keyword) =>
      normalizedRequestTitle.includes(normalize(keyword)),
    );

    if (fileMatches && requestMatches) {
      score += 100;
    }
  }

  const fileWords = new Set(normalizedFileName.split(" ").filter(Boolean));
  const requestWords = normalizedRequestTitle.split(" ").filter(Boolean);

  for (const word of requestWords) {
    if (word.length >= 3 && fileWords.has(word)) {
      score += 5;
    }
  }

  return score;
}

export function findMatchingRequest(
  documentName: string,
  folderId: DocumentFolderId,
  requests: DocumentRequest[],
) {
  const candidates = requests
    .filter(
      (request) =>
        request.requested &&
        request.category === folderId &&
        request.status !== "Accepted",
    )
    .map((request) => ({
      request,
      score: keywordScore(documentName, request.title),
    }))
    .sort((first, second) => second.score - first.score);

  if (candidates.length === 0) {
    return null;
  }

  if (candidates[0].score > 0) {
    return candidates[0].request;
  }

  const waitingCandidates = candidates.filter(
    ({ request }) => request.status === "Waiting",
  );

  return waitingCandidates.length === 1
    ? waitingCandidates[0].request
    : null;
}

export function statusForReviewedDocument(
  document: StoredDocument,
  reviewed: boolean,
) {
  if (reviewed) {
    return "Accepted" as const;
  }

  return document.uploadedBy === "Client"
    ? ("Uploaded" as const)
    : ("Under Review" as const);

  
}


export function matchesDocumentSearch(
  document: StoredDocument,
  query: string,
) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return false;
  }

  const searchableValues = [
    document.name,
    document.folderId,
    document.type,
  ];

  const normalizedValues = searchableValues.map((value) =>
    normalize(String(value)),
  );

  if (
    normalizedValues.some((value) =>
      value.includes(normalizedQuery),
    )
  ) {
    return true;
  }

  for (const group of keywordGroups) {
    const queryMatchesGroup = group.keywords.some((keyword) =>
      normalizedQuery.includes(normalize(keyword)),
    );

    if (!queryMatchesGroup) {
      continue;
    }

    const documentMatchesGroup = group.keywords.some((keyword) =>
      normalizedValues.some((value) =>
        value.includes(normalize(keyword)),
      ),
    );

    if (documentMatchesGroup) {
      return true;
    }
  }

  return false;
}