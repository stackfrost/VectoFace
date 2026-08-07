import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 space-y-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-purple text-xs font-mono text-purple-300">
        Legal & Compliance
      </div>
      
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white">
        Refund & Cancellation Policy
      </h1>
      
      <div className="space-y-8 text-sm text-zinc-300 leading-relaxed font-light glass-panel p-8 rounded-2xl">
        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">1. Digital Goods & Delivery</h2>
          <p className="text-zinc-400">
            VectoFace AI provides instant digital biometric diagnostic reports. Due to the immediate delivery and nature of these digital goods, all sales are considered final once the report is unlocked and accessed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-purple-400">2. Eligible Refunds</h2>
          <p className="text-zinc-400">
            Refunds are strictly issued under the following conditions:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-400">
            <li>You were charged, but a technical server failure prevented your report from being generated or unlocked.</li>
            <li>Duplicate charges occurred due to a payment gateway error.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">3. Refund Processing Timeline</h2>
          <p className="text-zinc-400">
            If your refund is approved, it will be processed automatically back to your original payment method (UPI, Credit/Debit Card, Netbanking) via our payment gateway, Razorpay. Please allow <strong className="text-zinc-200">5 to 7 business days</strong> for the credited amount to reflect in your bank account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">4. Requesting a Refund</h2>
          <p className="text-zinc-400">
            To request a refund for a failed transaction, please reach out to our support team within 48 hours of the transaction via our <Link href="/contact" className="text-emerald-400 hover:underline transition-colors">Contact Page</Link>. Please include your Report ID and Razorpay Payment ID in your message.
          </p>
        </section>
      </div>
    </div>
  );
}