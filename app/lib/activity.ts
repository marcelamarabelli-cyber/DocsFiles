export type ClientActivityType =
  | "client-created"
  | "documents-requested"
  | "document-uploaded"
  | "document-removed"
  | "status-changed"
  | "review-completed"
  | "ready-to-file"
  | "return-completed"
  | "note";

export type ClientActivity = {
  id: string;
  clientId: string;
  type: ClientActivityType;
  title: string;
  description: string;
  createdAt: string;
  icon: string;
};

type AddClientActivityInput = {
  clientId: string;
  type: ClientActivityType;
  title: string;
  description?: string;
  icon?: string;
  createdAt?: string;
};

const ACTIVITY_STORAGE_KEY = "docsfiles-client-activity";

const defaultIcons: Record<ClientActivityType, string> = {
  "client-created": "👤",
  "documents-requested": "📋",
  "document-uploaded": "📥",
  "document-removed": "🗑️",
  "status-changed": "🔄",
  "review-completed": "🔍",
  "ready-to-file": "✍️",
  "return-completed": "✅",
  note: "📝",
};

function canUseBrowserStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function createActivityId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `activity-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function readAllActivity(): ClientActivity[] {
  if (!canUseBrowserStorage()) {
    return [];
  }

  try {
    const savedActivity = window.localStorage.getItem(
      ACTIVITY_STORAGE_KEY,
    );

    if (!savedActivity) {
      return [];
    }

    const parsedActivity: unknown = JSON.parse(savedActivity);

    if (!Array.isArray(parsedActivity)) {
      return [];
    }

    return parsedActivity.filter(
      (item): item is ClientActivity =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ClientActivity).id === "string" &&
        typeof (item as ClientActivity).clientId === "string" &&
        typeof (item as ClientActivity).type === "string" &&
        typeof (item as ClientActivity).title === "string" &&
        typeof (item as ClientActivity).description === "string" &&
        typeof (item as ClientActivity).createdAt === "string" &&
        typeof (item as ClientActivity).icon === "string",
    );
  } catch (error) {
    console.error("Unable to load client activity:", error);
    return [];
  }
}

function writeAllActivity(activity: ClientActivity[]) {
  if (!canUseBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      ACTIVITY_STORAGE_KEY,
      JSON.stringify(activity),
    );
  } catch (error) {
    console.error("Unable to save client activity:", error);
  }
}

export function loadClientActivity(clientId: string) {
  return readAllActivity()
    .filter((activity) => activity.clientId === clientId)
    .sort(
      (firstActivity, secondActivity) =>
        new Date(secondActivity.createdAt).getTime() -
        new Date(firstActivity.createdAt).getTime(),
    );
}

export function addClientActivity({
  clientId,
  type,
  title,
  description = "",
  icon,
  createdAt,
}: AddClientActivityInput) {
  const activity: ClientActivity = {
    id: createActivityId(),
    clientId,
    type,
    title,
    description,
    createdAt: createdAt ?? new Date().toISOString(),
    icon: icon ?? defaultIcons[type],
  };

  const allActivity = readAllActivity();

  writeAllActivity([activity, ...allActivity]);

  return activity;
}

export function removeClientActivity(activityId: string) {
  const allActivity = readAllActivity();

  const updatedActivity = allActivity.filter(
    (activity) => activity.id !== activityId,
  );

  writeAllActivity(updatedActivity);
}

export function clearClientActivity(clientId: string) {
  const allActivity = readAllActivity();

  const remainingActivity = allActivity.filter(
    (activity) => activity.clientId !== clientId,
  );

  writeAllActivity(remainingActivity);
}

export function ensureClientCreatedActivity(
  clientId: string,
  clientName: string,
) {
  const existingActivity = loadClientActivity(clientId);

  const alreadyCreated = existingActivity.some(
    (activity) => activity.type === "client-created",
  );

  if (alreadyCreated) {
    return existingActivity;
  }

  addClientActivity({
    clientId,
    type: "client-created",
    title: "Client Portal Created",
    description: `${clientName}'s DocsFiles portal is ready.`,
  });

  return loadClientActivity(clientId);
}

export function formatActivityDate(value: string) {
  const activityDate = new Date(value);

  if (Number.isNaN(activityDate.getTime())) {
    return "Recently";
  }

  const today = new Date();

  const isToday =
    activityDate.getFullYear() === today.getFullYear() &&
    activityDate.getMonth() === today.getMonth() &&
    activityDate.getDate() === today.getDate();

  if (isToday) {
    return activityDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return activityDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year:
      activityDate.getFullYear() === today.getFullYear()
        ? undefined
        : "numeric",
  });
}