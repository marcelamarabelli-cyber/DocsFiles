"use client";

type ActivityItem = {
  id: number;
  icon: string;
  title: string;
  date: string;
  completed: boolean;
};

type ActivityTimelineProps = {
  items?: ActivityItem[];
};

const demoItems: ActivityItem[] = [
  {
    id: 1,
    icon: "🟢",
    title: "Client Created",
    date: "July 28, 2026",
    completed: true,
  },
  {
    id: 2,
    icon: "📋",
    title: "Client Intake Completed",
    date: "July 28, 2026",
    completed: true,
  },
  {
    id: 3,
    icon: "📥",
    title: "Documents Uploaded",
    date: "July 29, 2026",
    completed: true,
  },
  {
    id: 4,
    icon: "🧮",
    title: "Tax Return In Preparation",
    date: "Today",
    completed: true,
  },
  {
    id: 5,
    icon: "✍️",
    title: "Waiting for Client Review",
    date: "",
    completed: false,
  },
  {
    id: 6,
    icon: "📤",
    title: "Ready to E-File",
    date: "",
    completed: false,
  },
  {
    id: 7,
    icon: "✅",
    title: "IRS Accepted",
    date: "",
    completed: false,
  },
];

export default function ActivityTimeline({
  items = demoItems,
}: ActivityTimelineProps) {
  return (
    <section
      style={{
        background: "white",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          marginBottom: 24,
          fontSize: 24,
          fontWeight: 700,
          color: "#1e3a8a",
        }}
      >
        📅 Client Activity Timeline
      </h2>

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 18,
            alignItems: "center",
            opacity: item.completed ? 1 : 0.5,
          }}
        >
          <div style={{ fontSize: 26 }}>{item.icon}</div>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {item.title}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#666",
              }}
            >
              {item.date || "Pending"}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}