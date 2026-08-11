import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { CSPostHogProvider } from "./providers";
import "./globals.css";

// 1. Load Inter for crisp small text
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// 2. Keep Geist for beautiful big titles
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VectoFace AI — Biometric Facial Diagnostic",
  description: "Instant facial structure, symmetry, and golden ratio analysis powered by neural landmark mapping.",
  openGraph: {
    title: "VectoFace AI — Biometric Facial Diagnostic",
    description: "Get an instant breakdown across 68 facial landmark coordinates and custom softmaxxing protocols.",
    url: "https://vectoface.me",
    siteName: "VectoFace AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VectoFace AI — Biometric Facial Diagnostic",
    description: "AI-powered facial structure and symmetry analysis.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 3. Inject all three font variables into the HTML
    <html lang="en" className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-[#08080a] text-zinc-100 font-sans antialiased selection:bg-purple-900/40 selection:text-emerald-300 flex flex-col min-h-screen relative overflow-x-hidden">
        <Suspense fallback={null}>
          <CSPostHogProvider>
            {/* Background Neon Ambient Glows */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] neon-glow-purple pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] neon-glow-green pointer-events-none -z-10" />

            {/* Minimal & Professional Frosted Top Ribbon */}
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#08080a]/60 backdrop-blur-xl">
              <div className="max-w-6xl mx-auto px-6 h-15 flex items-center justify-between">
                
                {/* Natural Minimal Wordmark */}
                <Link href="/" className="group flex items-center gap-1.5 transition-opacity hover:opacity-90">
                  <span className="font-semibold text-xl tracking-tight text-white">
                    VectoFace
                  </span>
                  <span className="font-medium text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
                    AI
                  </span>
                </Link>

                {/* Neon Status Badge */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-panel-purple text-xs font-mono text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#22c55e]" />
                  v2.4
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 relative z-10">{children}</main>

            {/* Razorpay Compliance Frosted Footer */}
            <footer className="border-t border-white/10 bg-[#08080a]/70 backdrop-blur-xl text-zinc-400 py-10 px-6 text-xs relative z-10">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <div className="text-zinc-200 font-medium text-sm">
                    VectoFace <span className="text-purple-400">AI</span>
                  </div>
                  <p className="text-zinc-400">AI-powered facial structure diagnostics and symmetry analysis.</p>
                </div>

                {/* Mandatory Policy Links */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-zinc-400">
                  <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link>
                  <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms & Conditions</Link>
                  <Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link>
                  <Link href="/refund-policy" className="hover:text-purple-400 transition-colors">Refund Policy</Link>
                </div>
              </div>

              <div className="max-w-6xl mx-auto pt-6 mt-6 border-t border-white/5 text-zinc-400 flex flex-col sm:flex-row justify-between gap-2">
                <span>© {new Date().getFullYear()} VectoFace AI. All rights reserved.</span>
                <span>Secured via Razorpay Payment Gateway</span>
              </div>
            </footer>
          </CSPostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}