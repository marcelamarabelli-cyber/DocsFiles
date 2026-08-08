"use client";

import { useEffect, useMemo, useState } from "react";
import type { StoredDocument } from "../types/client";

type PixelAssistantProps = {
  mode?: "welcome" | "finder";
  clientName?: string;
  documents?: StoredDocument[];
};

type PixelMood = "hello" | "idle" | "digging" | "found" | "empty";

export default function PixelAssistant({
  mode = "welcome",
  clientName,
  documents = [],
}: PixelAssistantProps) {
  const [mood, setMood] = useState<PixelMood>(mode === "welcome" ? "hello" : "idle");
  const [query, setQuery] = useState("");
  const [settledQuery, setSettledQuery] = useState("");
  const [showTreat, setShowTreat] = useState(false);

  useEffect(() => {
    if (mode !== "welcome") return;
    const timer = window.setTimeout(() => setMood("idle"), 4200);
    return () => window.clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    if (mode !== "finder") return;
    const cleaned = query.trim();
    if (!cleaned) {
      setMood("idle");
      setSettledQuery("");
      setShowTreat(false);
      return;
    }

    setMood("digging");
    setShowTreat(false);
    const timer = window.setTimeout(() => {
      setSettledQuery(cleaned);
      const lower = cleaned.toLowerCase();
      const found = documents.some((doc) => doc.name.toLowerCase().includes(lower));
      setMood(found ? "found" : "empty");
      if (found) {
        setShowTreat(true);
        window.setTimeout(() => setShowTreat(false), 2200);
      }
    }, 850);
    return () => window.clearTimeout(timer);
  }, [query, documents, mode]);

  const matches = useMemo(() => {
    const cleaned = settledQuery.trim().toLowerCase();
    if (!cleaned) return [];
    return documents.filter((doc) => doc.name.toLowerCase().includes(cleaned)).slice(0, 4);
  }, [documents, settledQuery]);

  const message =
    mood === "hello"
      ? "Welcome back! Pixel is on document duty. 🐾"
      : mood === "digging"
        ? "Digging through the files... snuffle snuffle!"
        : mood === "found"
          ? `Found it! ${matches.length === 1 ? "One file" : `${matches.length} files`} came back with me.`
          : mood === "empty"
            ? "Hmm... nothing buried under that name yet. Try another word!"
            : mode === "finder"
              ? `Tell me what file to fetch${clientName ? ` for ${clientName}` : ""}.`
              : "I’m ready whenever you are. 🐶";

  return (
    <section className={`pixel-assistant pixel-${mood}`} aria-live="polite">
      <div className="pixel-scene">
        {mood === "digging" && <div className="pixel-dirt">🟤 · 🟤 · 🟤</div>}
        {mood === "found" && <div className="pixel-file-fly">📄</div>}
        {showTreat && <div className="pixel-bone">🦴</div>}
        <div className="pixel-tail" aria-hidden="true">〰️</div>
        <img
          src="/pixel-taxesdeal.png"
          alt="Pixel, the DocsFiles puppy wearing his TaxesDeal hat"
          className="pixel-image"
        />
      </div>

      <div className="pixel-panel">
        <div className="pixel-name-row">
          <strong>Pixel</strong>
          <span>DocsFiles Fetch Assistant</span>
        </div>
        <div className="pixel-bubble">{message}</div>

        {mode === "finder" && (
          <>
            <div className="pixel-search-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try: W-2, 1099, receipt, return..."
                aria-label="Ask Pixel to find a file"
              />
              <span className="pixel-search-icon">{mood === "digging" ? "⛏️" : "🦴"}</span>
            </div>

            {mood === "found" && matches.length > 0 && (
              <div className="pixel-results">
                {matches.map((doc) => (
                  <div key={doc.id} className="pixel-result-item">
                    <span>📄</span>
                    <span>{doc.name}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
