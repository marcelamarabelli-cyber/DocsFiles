"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { StoredDocument } from "../types/client";

type PixelAssistantProps = {
  mode?: "welcome" | "finder";
  clientName?: string;
  documents?: StoredDocument[];
};

type PixelMood = "hello" | "idle" | "sniffing" | "digging" | "found" | "empty" | "reward";

export default function PixelAssistant({
  mode = "welcome",
  clientName,
  documents = [],
}: PixelAssistantProps) {
  const [mood, setMood] = useState<PixelMood>(mode === "welcome" ? "hello" : "idle");
  const [query, setQuery] = useState("");
  const [settledQuery, setSettledQuery] = useState("");
  const [showTreat, setShowTreat] = useState(false);
  const [treatMessage, setTreatMessage] = useState("");
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const later = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  };

  useEffect(() => {
    if (mode !== "welcome") return;
    later(() => setMood("idle"), 4200);
    return clearTimers;
  }, [mode]);

  useEffect(() => clearTimers, []);

  const matches = useMemo(() => {
    const cleaned = settledQuery.trim().toLowerCase();
    if (!cleaned) return [];
    return documents.filter((doc) => doc.name.toLowerCase().includes(cleaned)).slice(0, 4);
  }, [documents, settledQuery]);

  const runSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const cleaned = query.trim();
    if (!cleaned || mode !== "finder") return;

    clearTimers();
    setSettledQuery("");
    setShowTreat(false);
    setTreatMessage("");
    setMood("sniffing");

    later(() => setMood("digging"), 450);
    later(() => {
      setSettledQuery(cleaned);
      const lower = cleaned.toLowerCase();
      const found = documents.some((doc) => doc.name.toLowerCase().includes(lower));

      if (!found) {
        setMood("empty");
        return;
      }

      setMood("found");
      later(() => {
        setMood("reward");
        setShowTreat(true);
        setTreatMessage("Good fetch, Pixel! Treat earned. 🦴");
      }, 700);
      later(() => {
        setShowTreat(false);
        setTreatMessage("Crunch! Good boy, Pixel. 🐾");
      }, 2500);
      later(() => setMood("found"), 3800);
    }, 1350);
  };

  const message =
    mood === "hello"
      ? "Welcome back! Pixel is on document duty. 🐾"
      : mood === "sniffing"
        ? "Sniff sniff... I know that file is around here somewhere!"
        : mood === "digging"
          ? "Digging through the folders... paws at work!"
          : mood === "reward"
            ? "I found it! Now where’s my bone? 😄"
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
        {(mood === "sniffing" || mood === "digging") && (
          <div className="pixel-paw-trail" aria-hidden="true">🐾 · 🐾 · 🐾</div>
        )}
        {mood === "digging" && <div className="pixel-dirt" aria-hidden="true">🟤 · 🟤 · 🟤</div>}
        {(mood === "found" || mood === "reward") && <div className="pixel-file-fly" aria-hidden="true">📄</div>}
        {showTreat && <div className="pixel-bone" aria-hidden="true">🦴</div>}
        <div className="pixel-tail" aria-hidden="true">〰️</div>
        <img
          src="/pixel-taxesdeal.png"
          alt="Pixel, the DocsFiles puppy wearing his TaxesDeal hat"
          className="pixel-image"
        />
        {mood === "reward" && <div className="pixel-stars" aria-hidden="true">✨ ⭐ ✨</div>}
      </div>

      <div className="pixel-panel">
        <div className="pixel-name-row">
          <strong>Pixel</strong>
          <span>DocsFiles Fetch Assistant</span>
        </div>
        <div className="pixel-bubble">{message}</div>

        {mode === "finder" && (
          <>
            <form className="pixel-search-row" onSubmit={runSearch}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try: W-2, 1099, receipt, return..."
                aria-label="Ask Pixel to find a file"
              />
              <button
                type="submit"
                className="pixel-fetch-button"
                disabled={!query.trim() || mood === "sniffing" || mood === "digging"}
              >
                {mood === "sniffing" || mood === "digging" ? "Digging..." : "Fetch"}
              </button>
              <span className="pixel-search-icon" aria-hidden="true">
                {mood === "digging" ? "⛏️" : mood === "found" || mood === "reward" ? "🦴" : "🐾"}
              </span>
            </form>

            {treatMessage && <div className="pixel-treat-message">{treatMessage}</div>}

            {(mood === "found" || mood === "reward") && matches.length > 0 && (
              <div className="pixel-results">
                {matches.map((doc) => (
                  <div key={doc.id} className="pixel-result-item">
                    <span>📄</span>
                    <span>{doc.name}</span>
                    <span className="pixel-returned-label">Fetched</span>
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
