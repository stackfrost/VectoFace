import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 space-y-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-purple text-xs font-mono text-purple-300">
        Legal & Compliance
      </div>
      
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white">
        Privacy Policy
      </h1>
      
      <div className="space-y-8 text-sm text-zinc-300 leading-relaxed font-light glass-panel p-8 rounded-2xl">
        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">1. Introduction</h2>
          <p className="text-zinc-400">
            Welcome to VectoFace AI. We prioritize your privacy and are committed to protecting your personal information while providing advanced facial structural analytics.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-purple-400">2. Image Processing & Biometric Data</h2>
          <p className="text-zinc-400">
            When you upload a photo for analysis, the image is processed ephemerally on secure servers to map 68 facial landmarks and calculate geometric ratios. 
            <strong className="text-zinc-200"> Images are deleted immediately after your diagnostic report is generated. We do not store your photos, nor do we extract, store, sell, or share biometric identification data.</strong>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">3. Payment Information</h2>
          <p className="text-zinc-400">
            All payments are securely processed through Razorpay. VectoFace AI does not store your credit card details, UPI IDs, or banking information on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">4. Cookies & Tracking</h2>
          <p className="text-zinc-400">
            We use strictly necessary cookies to manage your unlocked reports and maintain secure sessions. We do not use intrusive third-party tracking cookies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">5. Contact Us</h2>
          <p className="text-zinc-400">
            For any privacy-related inquiries, please visit our <Link href="/contact" className="text-purple-400 hover:underline">Contact Page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}