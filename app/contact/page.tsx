export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 space-y-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-purple text-xs font-mono text-purple-300">
        Support
      </div>
      
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white">
        Contact Us
      </h1>
      
      <div className="space-y-8 text-sm text-zinc-300 leading-relaxed font-light glass-panel p-8 rounded-2xl">
        <section className="space-y-4">
          <p className="text-zinc-400">
            We are here to help. If you experienced a technical issue, have questions about your biometric report, or need assistance with a payment, please reach out to our support team.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-5 rounded-xl glass-panel-purple space-y-2">
              <div className="text-xs font-mono text-purple-400 uppercase tracking-wider">Email Support</div>
              <a href="mailto:support@vectoface.vercel.app" className="block text-lg font-medium text-white hover:text-emerald-400 transition-colors">
                support@vectoface.com
              </a>
              <p className="text-xs text-zinc-500">We typically respond within 24-48 hours.</p>
            </div>

            <div className="p-5 rounded-xl glass-panel space-y-2">
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Business Details</div>
              <div className="text-base font-medium text-white">VectoFace AI</div>
              <p className="text-xs text-zinc-500">Operating digitally across India.</p>
            </div>
          </div>
        </section>

        <section className="space-y-2 pt-4 border-t border-white/5">
          <h2 className="text-lg font-medium text-white">Payment Issues?</h2>
          <p className="text-zinc-400">
            If you were charged but did not receive access to your report, please email us immediately with your <strong>Razorpay Payment ID</strong> (starts with `pay_`) and the email address used during checkout.
          </p>
        </section>
      </div>
    </div>
  );
}