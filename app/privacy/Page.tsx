export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto p-6 text-gray-300 font-mono text-xs space-y-4 crt-overlay min-h-[100dvh]">
      <h1 className="text-xl font-bold text-neonMint uppercase">Privacy Policy // VectoFace AI</h1>
      <p className="text-gray-400">Last updated: August 2026</p>

      <section className="space-y-2 border-t border-surfaceBorder pt-3">
        <h2 className="text-sm font-bold text-white uppercase">1. Image Data Processing & Cloud Transmission</h2>
        <p>
          When you submit a photo, your image is securely transmitted via 256-bit SSL encryption to our AI engine endpoints for real-time inference.
        </p>
        <p>
          <strong>Ephemeral Memory Processing:</strong> Images are processed transiently in volatile RAM strictly for computing facial metrics (symmetry, adiposity, and structural ratios). <strong>VectoFace AI does not retain, store on disk, or sell uploaded selfie images.</strong>
        </p>
      </section>

      <section className="space-y-2 border-t border-surfaceBorder pt-3">
        <h2 className="text-sm font-bold text-white uppercase">2. Age Requirement & Consent</h2>
        <p>
          Our services are intended strictly for users who are 18 years of age or older. By uploading a photo, you explicitly confirm that you meet this age requirement and consent to real-time metric analysis.
        </p>
      </section>

      <section className="space-y-2 border-t border-surfaceBorder pt-3">
        <h2 className="text-sm font-bold text-white uppercase">3. Third-Party AI Subprocessors</h2>
        <p>
          Image evaluations are performed using Google Gemini Vision API infrastructure. Data transmitted is used strictly for generating your requested report and is governed by strict enterprise privacy standards preventing model training on user inputs.
        </p>
      </section>

      <section className="space-y-2 border-t border-surfaceBorder pt-3">
        <h2 className="text-sm font-bold text-white uppercase">4. Contact & Support</h2>
        <p>
          For privacy inquiries or data rights requests, contact our Data Protection Desk at <code className="text-neonMint">grievance@vectoface.site</code>.
        </p>
      </section>
    </main>
  );
}