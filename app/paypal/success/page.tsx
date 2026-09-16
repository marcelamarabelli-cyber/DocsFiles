"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PayPalSuccessPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Finishing your payment...");

  useEffect(() => {
    async function capturePayment() {
      const orderId = searchParams.get("token");

      if (!orderId) {
        setMessage("PayPal order ID was not found.");
        return;
      }

      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Payment successful! Thank you.");
      } else {
        setMessage("Payment could not be completed.");
      }
    }

    capturePayment();
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">TaxesDeal Payment</h1>
        <p className="mt-4">{message}</p>
      </div>
    </main>
  );
}