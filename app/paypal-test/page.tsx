"use client";

export default function PayPalTestPage() {
  async function testPayPal() {
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 10,
        }),
      });

      const data = await response.json();

      console.log("PAYPAL TEST RESPONSE:", data);

      if (data.approvalLink) {
        window.location.href = data.approvalLink;
        return;
      }

      alert("TEST: PayPal approval link was not found.");
    } catch (error) {
      console.error("PAYPAL TEST ERROR:", error);
      alert("TEST: PayPal request failed.");
    }
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>DocsFiles PayPal Test</h1>

      <button
        onClick={testPayPal}
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          cursor: "pointer",
        }}
      >
        Test PayPal $10
      </button>
    </main>
  );
}