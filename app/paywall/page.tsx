"use client";

import Link from "next/link";

export default function PaywallPage() {
  const handleRazorpayPayment = () => {
    // Replace with your Razorpay payment modal invocation
    alert("Triggering Razorpay Checkout Modal...");
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 md:py-14 space-y-8">
      {/* Header Status */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <span className="text-xs font-mono text-purple-400">
            Report ID #VF-8821
          </span>
          <h1 className="text-xl font-medium text-zinc-100">
            Facial Structure Diagnostic
          </h1>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
          Status: Ready
        </div>
      </div>

      {/* Blurred Preview Card */}
      <div className="relative p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-md overflow-hidden space-y-6">
        {/* Unlocked Summary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="text-[11px] font-mono text-zinc-400">Symmetry Score</div>
            <div className="text-2xl font-semibold text-zinc-100 mt-1">88.4 / 100</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="text-[11px] font-mono text-zinc-400">Facial Thirds Ratio</div>
            <div className="text-2xl font-semibold text-zinc-100 mt-1">1 : 1.05 : 0.98</div>
          </div>
        </div>

        {/* Locked Detailed Section (Blurred Preview) */}
        <div className="relative pt-2 space-y-3 select-none">
          <div className="filter blur-md opacity-40 space-y-3">
            <div className="p-3 bg-zinc-950 rounded-lg">
              Canthal Tilt: Positive (3.2 degrees)
            </div>
            <div className="p-3 bg-zinc-950 rounded-lg">
              Midface Compactness: Optimal Range
            </div>
            <div className="p-3 bg-zinc-950 rounded-lg">
              Jawline Definition & Gonial Angle Analysis
            </div>
          </div>

          {/* Paywall Overlay Banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/80 backdrop-blur-sm rounded-xl border border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
              <svg
                className="w-4 h-4 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-zinc-100">
              Unlock Full Biometric Report
            </h3>
            <p className="text-xs text-zinc-400 font-light max-w-sm mt-1">
              Includes comprehensive landmark coordinates, personalized grooming recommendations, and structural breakdown.
            </p>

            <div className="mt-5 w-full max-w-xs space-y-2">
              <button
                onClick={handleRazorpayPayment}
                className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-all shadow-sm active:scale-95"
              >
                Unlock Report — ₹99
              </button>
              <div className="text-[10px] font-mono text-zinc-400">
                One-time payment • Secure Razorpay Checkout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Link */}
      <div className="text-center">
        <Link
          href="/free-report"
          className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          ← Upload a different photo
        </Link>
      </div>
    </div>
  );
}