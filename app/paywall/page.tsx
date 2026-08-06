"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Lock, ArrowRight, Zap, Terminal } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Paywall() {
  const [refCode, setRefCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRef = localStorage.getItem("mog_ref_code");
      if (storedRef) {
        setRefCode(storedRef);
      }
    }

    // Load Razorpay Checkout Script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Request Order ID from backend (server-enforced price)
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refCode }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert("Failed to initialize checkout. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MogCheck AI",
        description: "Full Diagnostic Aesthetic Report",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment on backend
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              refCode,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            window.location.href = "/full-report";
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {},
        theme: {
          color: "#00FF87",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const isDiscounted = Boolean(refCode);
  const displayPrice = isDiscounted ? "?59" : "?149";

  return (
    <main className="max-w-md mx-auto min-h-[100dvh] bg-background text-white flex flex-col justify-between p-6 font-mono crt-overlay relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[35%] bg-neonMint/20 blur-[100px] pointer-events-none" />

      <div className="z-10 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-neonMint font-bold uppercase tracking-widest">
            <Terminal className="w-3.5 h-3.5" /> CHECKOUT CONFIRMATION
          </div>
          <span className="text-[10px] text-gray-500 uppercase">256-BIT ENCRYPTED</span>
        </div>

        {/* Pricing Box */}
        <div className="cyber-panel p-6 text-center tactical-corners border-neonMint relative">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            UNLOCK FULL DIAGNOSTIC & SOFT-MAXXING GUIDE
          </span>

          <div className="mt-3 flex items-center justify-center gap-3">
            {isDiscounted && (
              <span className="text-xl text-gray-500 line-through font-bold">?149</span>
            )}
            <span className="text-5xl font-black text-neonMint tracking-tight">
              {displayPrice}
            </span>
          </div>

          {refCode && (
            <div className="mt-3 inline-block bg-neonViolet/20 border border-neonViolet px-3 py-1 text-[10px] text-neonViolet font-bold uppercase tracking-widest">
              PROMO APPLIED: {refCode} (SAVE ?90)
            </div>
          )}
        </div>

        {/* Features Checklist */}
        <div className="space-y-3 bg-surface/60 border border-surfaceBorder p-4 text-xs">
          <div className="text-[10px] text-neonMint font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> WHAT YOU UNLOCK
          </div>
          <p className="text-gray-300">ï¿½ Exact Eye Canthal Tilt & Periororbital Assessment</p>
          <p className="text-gray-300">ï¿½ Jawline Gonial Angle & Chin Projection Ratio</p>
          <p className="text-gray-300">ï¿½ 72-Hour Facial Debloating & Sodium Flush Protocol</p>
          <p className="text-gray-300">ï¿½ Custom Haircut & Grooming Guide for your Face Shape</p>
        </div>

      </div>

      {/* Unlock Button */}
      <div className="z-10 pt-4 pb-2">
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-neonMint text-black font-black text-base py-4 uppercase tracking-wider active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-glow-mint hover:bg-neonMint/90 disabled:opacity-50"
        >
          {loading ? "INITIALIZING..." : `PAY ${displayPrice} & UNLOCK`} <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 uppercase mt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-neonMint" /> Instant Unlocking // Razorpay Secured
        </div>
      </div>

    </main>
  );
}
