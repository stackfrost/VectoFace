export default function ContactUs() {
  return (
    <main className="max-w-2xl mx-auto p-6 text-gray-300 font-mono text-xs space-y-4 crt-overlay min-h-[100dvh]">
      <h1 className="text-xl font-bold text-neonMint uppercase">Contact Us // Grievance Redressal</h1>
      <p className="text-gray-400">Last updated: August 2026</p>
      
      <section className="space-y-2 border-t border-surfaceBorder pt-3">
        <h2 className="text-sm font-bold text-white uppercase">Customer Support</h2>
        <p>For questions regarding your diagnostic report, payment issues, or affiliate accounts:</p>
        <p>Support Email: <code className="text-neonMint">support@vectoface.site</code></p>
        <p>Operational Hours: Mon - Fri (10:00 AM - 6:00 PM IST)</p>
      </section>

      <section className="space-y-2 border-t border-surfaceBorder pt-3">
        <h2 className="text-sm font-bold text-white uppercase">Data Protection Grievance Officer</h2>
        <p>In accordance with the Digital Personal Data Protection Act 2023:</p>
        <p>Grievance Officer: <strong className="text-white">Data Protection Desk</strong></p>
        <p>Contact Email: <code className="text-neonMint">grievance@vectoface.site</code></p>
      </section>

      <section className="space-y-2 border-t border-surfaceBorder pt-3">
        <h2 className="text-sm font-bold text-white uppercase">Corporate Location</h2>
        <p>Entity Name: <strong className="text-white">VectoFace AI</strong></p>
        <p>Location: <strong className="text-white">Mumbai, Maharashtra, India - 400001</strong></p>
      </section>
    </main>
  );
}