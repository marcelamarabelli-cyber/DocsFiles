export default function PayPalCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Payment Canceled</h1>
        <p className="mt-4">
          Your PayPal payment was not completed. You can return to DocsFiles and try again.
        </p>
      </div>
    </main>
  );
}