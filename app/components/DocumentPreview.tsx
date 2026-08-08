/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import type { StoredDocument } from "../types/client";

type DocumentPreviewProps = {
  document: StoredDocument;
  onClose: () => void;
};

export default function DocumentPreview({
  document,
  onClose,
}: DocumentPreviewProps) {
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lowerName = document.name.toLowerCase();

  const isPdf =
    document.type === "application/pdf" || lowerName.endsWith(".pdf");

  const isImage =
    document.type.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(document.name);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }

      if (!isImage) {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        setImageZoom((current) => Math.min(current + 0.25, 4));
      }

      if (event.key === "-") {
        setImageZoom((current) => Math.max(current - 0.25, 0.25));
      }

      if (event.key.toLowerCase() === "r") {
        setImageRotation((current) => (current + 90) % 360);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImage, onClose]);

  function zoomIn() {
    setImageZoom((current) => Math.min(current + 0.25, 4));
  }

  function zoomOut() {
    setImageZoom((current) => Math.max(current - 0.25, 0.25));
  }

  function rotateLeft() {
    setImageRotation((current) => (current - 90 + 360) % 360);
  }

  function rotateRight() {
    setImageRotation((current) => (current + 90) % 360);
  }

  function resetImage() {
    setImageZoom(1);
    setImageRotation(0);
  }

  function openInNewTab() {
    if (!document.previewUrl) {
      window.alert(
        "This document does not currently have an available preview link.",
      );
      return;
    }

    window.open(document.previewUrl, "_blank", "noopener,noreferrer");
  }

  function downloadDocument() {
    if (!document.previewUrl) {
      window.alert(
        "This document cannot be downloaded until secure cloud storage is connected.",
      );
      return;
    }

    const link = window.document.createElement("a");
    link.href = document.previewUrl;
    link.download = document.name;
    link.click();
  }

  const viewerWidth = isFullscreen ? "100%" : "min(1180px, 100%)";
  const viewerHeight = isFullscreen ? "100vh" : "min(900px, 94vh)";
  const viewerRadius = isFullscreen ? "0" : "20px";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(15, 23, 42, 0.86)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        padding: isFullscreen ? 0 : "18px",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isFullscreen) {
          onClose();
        }
      }}
    >
      <section
        style={{
          width: viewerWidth,
          height: viewerHeight,
          background: "white",
          borderRadius: viewerRadius,
          overflow: "hidden",
          boxShadow: isFullscreen
            ? "none"
            : "0 35px 100px rgba(0,0,0,0.42)",
          display: "grid",
          gridTemplateRows: "auto auto minmax(0, 1fr)",
        }}
      >
        <header
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            background: "#f8fafc",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: "#6366f1",
                fontWeight: 900,
                fontSize: "11px",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}
            >
              {isPdf
                ? "PDF Preview"
                : isImage
                  ? "Image Preview"
                  : "Document Preview"}
            </div>

            <div
              style={{
                marginTop: "4px",
                fontWeight: 900,
                fontSize: "16px",
                color: "#172033",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "700px",
              }}
              title={document.name}
            >
              {document.name}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {document.previewUrl && (
              <>
                <ToolbarButton
                  label="↗ Open"
                  title="Open in a new browser tab"
                  onClick={openInNewTab}
                />

                <ToolbarButton
                  label="⬇ Download"
                  title="Download document"
                  onClick={downloadDocument}
                />

                <ToolbarButton
                  label={isFullscreen ? "↙ Exit Full Screen" : "⛶ Full Screen"}
                  title="Toggle full-screen viewer"
                  onClick={() => setIsFullscreen((current) => !current)}
                />
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              title="Close preview"
              style={{
                width: "39px",
                height: "39px",
                border: "none",
                borderRadius: "10px",
                background: "#e2e8f0",
                color: "#334155",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: "17px",
              }}
            >
              ✕
            </button>
          </div>
        </header>

        <div
          style={{
            minHeight: "52px",
            padding: "8px 14px",
            borderBottom: "1px solid #cbd5e1",
            background: "#eef2f7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              color: "#475569",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {isPdf && "Use the PDF controls inside the viewer to zoom or print."}

            {isImage &&
              "Use the controls below or press +, −, or R on your keyboard."}

            {!isPdf &&
              !isImage &&
              "This file type may need to be downloaded and opened separately."}
          </div>

          {isImage && document.previewUrl && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                flexWrap: "wrap",
              }}
            >
              <ToolbarButton
                label="−"
                title="Zoom out"
                onClick={zoomOut}
                compact
              />

              <div
                style={{
                  minWidth: "70px",
                  padding: "8px 10px",
                  borderRadius: "9px",
                  background: "white",
                  border: "1px solid #cbd5e1",
                  color: "#334155",
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: 900,
                }}
              >
                {Math.round(imageZoom * 100)}%
              </div>

              <ToolbarButton
                label="+"
                title="Zoom in"
                onClick={zoomIn}
                compact
              />

              <ToolbarButton
                label="↶"
                title="Rotate left"
                onClick={rotateLeft}
                compact
              />

              <ToolbarButton
                label="↷"
                title="Rotate right"
                onClick={rotateRight}
                compact
              />

              <ToolbarButton
                label="Reset"
                title="Reset zoom and rotation"
                onClick={resetImage}
              />
            </div>
          )}
        </div>

        <div
          style={{
            minHeight: 0,
            background: "#334155",
            display: "grid",
            placeItems: "center",
            overflow: "auto",
            position: "relative",
          }}
        >
          {!document.previewUrl ? (
            <PreviewMessage
              icon="📄"
              title="Preview is unavailable"
              message="This file may have been uploaded during an earlier browser session. Upload it again while DocsFiles is running to preview it. Permanent previews will become available after secure cloud storage is connected."
            />
          ) : isPdf ? (
            <iframe
              src={document.previewUrl}
              title={document.name}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                background: "white",
              }}
            />
          ) : isImage ? (
            <div
              style={{
                minWidth: "100%",
                minHeight: "100%",
                padding: "28px",
                display: "grid",
                placeItems: "center",
              }}
            >
              <img
                src={document.previewUrl}
                alt={document.name}
                draggable={false}
                style={{
                  maxWidth: imageZoom <= 1 ? "100%" : "none",
                  maxHeight: imageZoom <= 1 ? "100%" : "none",
                  width: imageZoom > 1 ? `${imageZoom * 100}%` : "auto",
                  height: "auto",
                  objectFit: "contain",
                  transform: `rotate(${imageRotation}deg)`,
                  transformOrigin: "center",
                  transition: "transform 180ms ease, width 180ms ease",
                  borderRadius: "8px",
                  boxShadow: "0 18px 50px rgba(0,0,0,0.3)",
                  userSelect: "none",
                }}
              />
            </div>
          ) : (
            <PreviewMessage
              icon="📄"
              title="No built-in preview for this file type"
              message="Download this document and open it with the appropriate application on your computer."
            />
          )}
        </div>
      </section>
    </div>
  );
}

function ToolbarButton({
  label,
  title,
  onClick,
  compact = false,
}: {
  label: string;
  title: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        minWidth: compact ? "38px" : undefined,
        height: "38px",
        padding: compact ? "0 10px" : "0 12px",
        borderRadius: "10px",
        background: "white",
        border: "1px solid #cbd5e1",
        color: "#334155",
        cursor: "pointer",
        fontWeight: 800,
        fontSize: "12px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function PreviewMessage({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) {
  return (
    <div
      style={{
        width: "min(560px, 90%)",
        padding: "32px",
        borderRadius: "18px",
        background: "white",
        textAlign: "center",
        color: "#334155",
        boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ fontSize: "44px" }}>{icon}</div>

      <h3 style={{ margin: "12px 0 8px" }}>{title}</h3>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          lineHeight: 1.65,
          fontSize: "14px",
        }}
      >
        {message}
      </p>
    </div>
  );
}