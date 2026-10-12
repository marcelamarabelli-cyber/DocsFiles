
"use client";

import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";

type Message = {
  id: string;
  client_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

export default function ClientMessages({
  clientId,
}: {
  clientId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      setError("");

      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (!active) return;

      if (authError || !auth.user) {
        setError("Please sign in to view messages.");
        setLoading(false);
        return;
      }

      setUserId(auth.user.id);

      const { data, error: readError } = await supabase
        .from("client_messages")
        .select("id,client_id,sender_id,message,created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });

      if (!active) return;

      if (readError) {
        setError("Unable to load messages.");
      } else {
        setMessages(data ?? []);
      }
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [clientId]);

  async function sendMessage() {
    if (!userId || !draft.trim() || sending) return;

    setSending(true);
    setError("");

    const supabase = createClient();

    const { data, error: sendError } = await supabase
      .from("client_messages")
      .insert({
        client_id: clientId,
        sender_id: userId,
        message: draft.trim(),
      })
      .select("id,client_id,sender_id,message,created_at")
      .single();

    if (sendError) {
      setError("Message could not be sent.");
    } else {
      setMessages((previous) => [...previous, data]);
      setDraft("");
    }

    setSending(false);
  }

  return (
    <section>
      <h2>Messages</h2>
      <p>Secure conversation with your tax preparer.</p>

      {loading && <p>Loading messages...</p>}
      {error && <p role="alert">{error}</p>}

      <div aria-live="polite">
        {messages.map((item) => (
          <div key={item.id} style={{ marginBottom: 12 }}>
            <strong>
              {item.sender_id === userId ? "You" : "Tax Preparer"}
            </strong>
            <p>{item.message}</p>
            <small>
              {new Date(item.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>

      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Write a message..."
        aria-label="Write a message"
        rows={3}
        style={{ width: "100%" }}
      />

      <button
        type="button"
        onClick={sendMessage}
        disabled={!userId || !draft.trim() || sending}
      >
        {sending ? "Sending..." : "Send Message"}
      </button>
    </section>
  );
}