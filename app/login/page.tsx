"use client";
import { createClient } from "../utils/supabase/client";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
const searchParams = useSearchParams();
const redirectTo = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!email.trim() || !password.trim()) {
    setMessage("Please enter your email and password.");
    return;
  }

  setMessage("Signing you in...");

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  if (!data.user) {
    setMessage("Unable to sign in.");
    return;
  }

  setMessage("Sign in successful.");

  router.push(redirectTo);
  router.refresh();
}

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eef5ff 0%, #f7f5ff 50%, #eef9ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "470px",
          background: "#ffffff",
          borderRadius: "28px",
          padding: "42px",
          boxShadow: "0 20px 60px rgba(30, 64, 175, 0.15)",
          border: "1px solid #dbeafe",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "74px",
              height: "74px",
              borderRadius: "22px",
              margin: "0 auto 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "38px",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)",
            }}
          >
            📁
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "34px",
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            Docs<span style={{ color: "#168eea" }}>Files</span>
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            TaxesDeal Client Portal
          </p>
        </div>

        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "16px",
            padding: "14px 16px",
            marginBottom: "24px",
            color: "#1e3a8a",
            fontSize: "14px",
            lineHeight: 1.5,
          }}
        >
          🔐 Sign in to securely access your tax documents.
        </div>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontWeight: 800,
              color: "#334155",
              marginBottom: "8px",
            }}
          >
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "15px 16px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              fontSize: "16px",
              marginBottom: "20px",
              outline: "none",
            }}
          />

          <label
            style={{
              display: "block",
              fontWeight: 800,
              color: "#334155",
              marginBottom: "8px",
            }}
          >
            Password
          </label>

          <div style={{ position: "relative", marginBottom: "14px" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "15px 55px 15px 16px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                fontSize: "16px",
                outline: "none",
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                border: 0,
                background: "transparent",
                cursor: "pointer",
                fontSize: "20px",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div style={{ textAlign: "right", marginBottom: "24px" }}>
            <button
              type="button"
              onClick={() =>
                setMessage(
                  "Password reset will be connected to secure authentication."
                )
              }
              style={{
                border: 0,
                background: "transparent",
                color: "#2563eb",
                fontWeight: 800,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              border: 0,
              borderRadius: "14px",
              padding: "16px",
              background: "linear-gradient(135deg, #2563eb, #6d4aff)",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)",
            }}
          >
            🔐 Sign In
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "13px",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            marginTop: "30px",
            paddingTop: "22px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#64748b",
              fontSize: "13px",
              lineHeight: 1.6,
              margin: "0 0 15px",
            }}
          >
            Your documents are private. Never share your password with anyone.
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              border: 0,
              background: "transparent",
              color: "#475569",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ← Back to DocsFiles
          </button>
        </div>
      </div>
    </main>
  );
}