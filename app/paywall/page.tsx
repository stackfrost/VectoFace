"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";

export default function PaywallPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Ask your backend to create a Razorpay Order
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: 9900, // Amount in paise (₹99.00)
          currency: "INR" 
        }), 
      });
      
      const order = await res.json();

      if (!order || !order.id) {
        throw new Error("Failed to create order");
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Ensure this is in your .env.local
        amount: order.amount,
        currency: order.currency,
        name: "VectoFace AI",
        description: "Full Biometric Structure Report",
        order_id: order.id,
        theme: {
          color: "#a855f7", // Matches your neon purple branding
        },
        handler: async function (response: any) {
          // 3. Verify Payment on your backend
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              // reportId: "pass-your-actual-report-id-here"
            }),
          });

          if (verifyRes.ok) {
            // Redirect to the unlocked report
            router.push("/full-report?status=unlocked");
          } else {
            alert("Payment verification failed. Contact support.");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      // @ts-ignore - Razorpay is loaded via external script
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      
      rzp.open();
    } catch (error) {
      console.error("Payment trigger error:", error);
      alert("Something went wrong initiating the payment.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Load Razorpay SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-2xl mx-auto px-6 py-10 md:py-14 space-y-8">
        {/* Header Status */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <span className="text-xs font-mono text-purple-400">
              Report ID #VF-8821
            </span>
            <h1 className="text-xl font-medium text-white">
              Facial Structure Diagnostic
            </h1>
          </div>
          <div className="px-2.5 py-1 rounded-full glass-panel-purple text-[11px] font-mono text-purple-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#22c55e]" />
            Scan Complete
          </div>
        </div>

        {/* Blurred Preview Card */}
        <div className="relative p-6 rounded-2xl glass-panel overflow-hidden space-y-6">
          {/* Unlocked Summary Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#08080a]/60 border border-white/5">
              <div className="text-[11px] font-mono text-zinc-400">Symmetry Score</div>
              <div className="text-2xl font-semibold text-white mt-1">88.4 <span className="text-sm text-zinc-500 font-normal">/ 100</span></div>
            </div>
            <div className="p-4 rounded-xl bg-[#08080a]/60 border border-white/5">
              <div className="text-[11px] font-mono text-zinc-400">Facial Thirds Ratio</div>
              <div className="text-2xl font-semibold text-white mt-1">1:1.05:0.98</div>
            </div>
          </div>

          {/* Locked Detailed Section (Blurred Preview) */}
          <div className="relative pt-2 space-y-3 select-none">
            <div className="filter blur-md opacity-30 space-y-3">
              <div className="p-4 bg-[#08080a] border border-white/5 rounded-lg text-sm text-white">
                Canthal Tilt: Positive (3.2 degrees) - Ideal Range
              </div>
              <div className="p-4 bg-[#08080a] border border-white/5 rounded-lg text-sm text-white">
                Midface Compactness: Optimal Range detected.
              </div>
              <div className="p-4 bg-[#08080a] border border-white/5 rounded-lg text-sm text-white">
                Jawline Definition & Gonial Angle Analysis: 122°
              </div>
            </div>

            {/* Paywall Overlay Banner */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#08080a]/80 backdrop-blur-sm rounded-xl border border-purple-500/20">
              <div className="w-10 h-10 rounded-full glass-panel-purple flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">
                Unlock Full Biometric Report
              </h3>
              <p className="text-xs text-zinc-400 font-light max-w-sm mt-2 leading-relaxed">
                Get your comprehensive landmark coordinates, personalized grooming recommendations, and complete structural breakdown.
              </p>

              <div className="mt-6 w-full max-w-xs space-y-3">
                <button
                  onClick={handleRazorpayPayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:opacity-90 disabled:opacity-50 disabled:grayscale text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] active:scale-[0.98]"
                >
                  {isProcessing ? "Connecting to Secure Gateway..." : "Unlock Report — ₹99"}
                </button>
                <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Secured by Razorpay
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Return Link */}
        <div className="text-center">
          <Link
            href="/free-report"
            className="text-xs font-mono text-zinc-500 hover:text-purple-400 transition-colors"
          >
            ← Upload a different photo
          </Link>
        </div>
      </div>
    </>
  );
}