"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

function PaywallContent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Coupon state
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");
  
  // Initialize PostHog
  const posthog = usePostHog();

  // Dynamic pricing
  const basePricePaise = 7900; // ₹79 base price in paise
  const finalPricePaise = appliedCoupon ? appliedCoupon.finalAmount : basePricePaise;
  const finalPriceRupees = (finalPricePaise / 100).toFixed(0);

  // Fetch Report Data
  useEffect(() => {
    if (!reportId) {
      setIsLoading(false);
      return;
    }

    fetch(`/api/report?id=${reportId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.report) setReportData(data.report);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [reportId]);

  // Track: Paywall successfully viewed
  useEffect(() => {
    if (reportData && reportId) {
      posthog.capture("paywall_viewed", { 
        reportId: reportId,
        score: reportData.overallScore
      });
    }
  }, [reportData, reportId, posthog]);

  // Validation function
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsVerifyingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, baseAmount: basePricePaise }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponError("");
        
        // Track: Coupon Successfully Applied
        posthog.capture("coupon_applied", { 
          code: couponCode, 
          discount: data.discountPct 
        });
      } else {
        setCouponError(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
        
        // Track: Coupon Failed/Rejected
        posthog.capture("coupon_rejected", { 
          code: couponCode, 
          reason: data.error || "Invalid coupon code" 
        });
      }
    } catch (err) {
      setCouponError("Failed to validate coupon");
      posthog.capture("coupon_rejected", { code: couponCode, reason: "Network Error" });
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    
    // Track: User initiated checkout
    posthog.capture("checkout_started", { 
      reportId,
      final_price_paise: finalPricePaise,
      coupon_applied: appliedCoupon?.code || null
    });

    try {
      const affiliateRef = typeof window !== "undefined" ? localStorage.getItem("affiliate_ref") : null;

      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: finalPricePaise,
          currency: "INR",
          couponCode: appliedCoupon?.code || null,
          refCode: appliedCoupon?.affiliateRef || affiliateRef || null
        }), 
      });
      
      const order = await res.json();
      if (!order || !order.id) throw new Error("Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "VectoFace AI",
        description: "Softmaxxing Master Blueprint",
        order_id: order.id,
        theme: { color: "#a855f7" },
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              reportId: reportId,
              couponCode: appliedCoupon?.code || null,
              refCode: appliedCoupon?.affiliateRef || affiliateRef || null
            }),
          });

          if (verifyRes.ok) {
            // Success is tracked passively via the pageview on /full-report, 
            // but you could add a 'checkout_success' event here if you prefer.
            router.push(`/full-report?reportId=${reportId}`);
          } else {
            posthog.capture("checkout_failed", { reason: "Verification Failed" });
            alert("Payment verification failed. Contact support.");
            setIsProcessing(false);
          }
        },
        modal: { 
          ondismiss: function () { 
            posthog.capture("checkout_failed", { reason: "User Closed Modal" });
            setIsProcessing(false); 
          } 
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        posthog.capture("checkout_failed", { reason: response.error.description });
        alert(`Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Payment trigger error:", error);
      posthog.capture("checkout_failed", { reason: error instanceof Error ? error.message : "API Error" });
      alert("Something went wrong initiating payment.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <span className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-sm font-mono text-zinc-400">Computing structural geometry...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-6">
        <p className="text-zinc-300">No report found. Please upload a photo first.</p>
        <Link href="/free-report" className="text-purple-400 hover:underline">← Go back</Link>
      </div>
    );
  }

  const premium = reportData.premiumData || {};
  
  const featureGrades = premium.featureGrades || { jawline: "C-", eyes: "D+", midface: "C", skin: "D" };
  const redFlags = Array.isArray(premium.redFlags) && premium.redFlags.length > 0 
    ? premium.redFlags 
    : [
        "Buccal soft-tissue accumulation masking jawline definition",
        "Sub-optimal periorbital tilt disrupting eye-area symmetry",
        "Midface volume retention affecting overall facial thirds balance"
      ];

  const overallScore = Number(reportData.overallScore) || 50;
  const geneticPotential = Number(reportData.geneticPotential) || (overallScore + 20.0);
  const pointGap = (geneticPotential - overallScore).toFixed(1);

  const rawPercentile = reportData.percentile || Math.round((overallScore / 100) * 100);
  const hierarchyText = overallScore >= 55 
    ? `Top ${Math.max(5, 100 - rawPercentile)}%` 
    : `Bottom ${Math.max(10, rawPercentile)}%`;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="max-w-2xl mx-auto px-6 py-10 md:py-14 space-y-6">
        
        {/* Diagnostic Preview Section */}
        <div className="p-6 rounded-2xl glass-panel border-t-2 border-t-emerald-500/50 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Base Diagnostics</h2>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Scan #{reportData.id.slice(-6).toUpperCase()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Current Score</span>
              <div className="text-4xl md:text-5xl font-bold text-white mt-1">
                {overallScore}<span className="text-sm text-zinc-500 font-light">/100</span>
              </div>
            </div>
            <div className="border-l border-white/10 pl-4">
              <span className="text-[10px] font-mono text-emerald-400 uppercase block font-semibold">Genetic Potential</span>
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mt-1">
                {geneticPotential.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-purple-950/20 border border-purple-500/20">
            <span className="text-zinc-400">Male Facial Hierarchy Placement:</span>
            <span className="font-mono font-bold text-purple-300">
              {hierarchyText}
            </span>
          </div>

          {/* Angles Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <span className="text-[10px] text-zinc-400 block">Symmetry</span>
              <span className="text-sm font-mono text-white font-semibold">{reportData.symmetryScore}%</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <span className="text-[10px] text-zinc-400 block">Gonial Angle</span>
              <span className="text-sm font-mono text-white font-semibold">{premium.gonialAngle || 118.5}°</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <span className="text-[10px] text-zinc-400 block">Canthal Tilt</span>
              <span className="text-sm font-mono text-white font-semibold">
                {Number(premium.canthalTilt) > 0 ? '+' : ''}{premium.canthalTilt || 1.2}°
              </span>
            </div>
          </div>

          {/* Zonal Grades */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">Zonal Assessment Grades</h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(featureGrades).map(([zone, grade]) => {
                const safeGrade = String(grade || "C");
                const isBad = ['D', 'F'].some(bad => safeGrade.includes(bad));
                const isMid = safeGrade.includes('C');
                const colorClass = isBad ? 'text-red-400' : isMid ? 'text-yellow-400' : 'text-emerald-400';
                
                return (
                  <div key={zone} className="p-2.5 rounded-lg bg-[#08080a]/60 border border-white/5 text-center">
                    <span className="text-[9px] text-zinc-500 uppercase block font-mono">{zone}</span>
                    <span className={`text-base font-bold ${colorClass}`}>
                      {safeGrade}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Weaknesses */}
          <div className="space-y-2.5 pt-4 border-t border-white/5">
            <h3 className="text-[10px] font-mono text-red-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Critical Anatomical Bottlenecks
            </h3>
            <div className="space-y-2">
              {redFlags.map((flag: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-red-950/10 border border-red-500/10">
                  <span className="text-red-500 text-xs mt-0.5">⚠️</span>
                  <span className="text-xs text-zinc-300 font-light leading-relaxed">{flag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teaser Flaw Analysis */}
          <div className="p-4 rounded-xl bg-[#08080a]/60 border border-red-500/20 relative overflow-hidden">
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block mb-1">Structural Flaw Analysis</span>
            <p className="text-sm text-zinc-300 italic relative z-10 leading-relaxed">
              "{premium.teaserCritique || "Subject displays mandibular irregularity and soft-tissue bloat..."} <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-transparent">which disrupts structural symmetry...</span>"
            </p>
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#08080a] to-transparent z-20" />
          </div>

          {/* INSTAGRAM GROWTH BANNER */}
          <div className="pt-4 mt-4 border-t border-white/5 text-center">
            <a
              href="https://instagram.com/vectoface.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-xs font-mono text-purple-300 transition-all group"
            >
              <span>📸</span>
              <span>DM <strong className="text-white group-hover:underline">@vectoface.ai</strong> on IG to unlock your discount</span>
            </a>
          </div>
        </div>

        {/* The Solution Paywall */}
        <div className="relative rounded-2xl glass-panel-purple overflow-hidden border-t-2 border-t-purple-500/50">
          <div className="p-6 space-y-4 filter blur-[6px] opacity-40 select-none">
            <h2 className="text-xs font-mono text-purple-400 uppercase tracking-widest">4-Phase Softmaxxing Blueprint</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5"><span className="text-xs font-semibold text-white">Phase 1: Craniofacial Debloating Protocol</span></div>
              <div className="p-3 rounded-xl bg-white/5"><span className="text-xs font-semibold text-white">Phase 2: Ocular Area & Periorbital Optimization</span></div>
              <div className="p-3 rounded-xl bg-white/5"><span className="text-xs font-semibold text-white">Phase 3: Masseter Hypertrophy & Stubble Line Contour</span></div>
              <div className="p-3 rounded-xl bg-white/5"><span className="text-xs font-semibold text-white">Phase 4: Dermatological Stratum Resurfacing</span></div>
            </div>
          </div>

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-[#08080a]/85 backdrop-blur-md">
            <div className="mb-3 space-y-1">
              <div className="inline-block px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 text-[10px] font-bold tracking-wider mb-2 animate-pulse">
                🇮🇳 INDEPENDENCE DAY FLASH SALE - 80% OFF
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg text-zinc-500 line-through decoration-red-500/70 decoration-2 font-medium">₹399</span>
                <span className="text-4xl font-bold text-white tracking-tight">₹{finalPriceRupees}</span>
              </div>
            </div>
            
            <h3 className="text-lg md:text-xl font-medium text-white max-w-sm mb-4">
              Bridge your {pointGap}-point potential gap
            </h3>

            {/* CLEAN EXPANDABLE COUPON SECTION */}
            <div className="w-full max-w-sm mb-4">
              {!showCouponInput && !appliedCoupon ? (
                <button 
                  onClick={() => setShowCouponInput(true)}
                  className="text-[11px] font-mono text-zinc-500 hover:text-purple-400 transition-colors w-full text-center py-2"
                >
                  + Have a promo code?
                </button>
              ) : (
                <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isVerifyingCoupon || !couponCode.trim()}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/50 text-purple-300 font-mono text-xs font-semibold disabled:opacity-50 transition-all"
                    >
                      {isVerifyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] font-mono text-red-400 text-left">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 text-left">
                      ✓ Code {appliedCoupon.code} applied! ({appliedCoupon.discountPct}% OFF)
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="w-full max-w-sm space-y-3">
              <button
                onClick={handleRazorpayPayment}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-purple-600 to-emerald-500 hover:opacity-90 disabled:opacity-50 disabled:grayscale text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-[0.98]"
              >
                {isProcessing ? "Connecting to Gateway..." : `Unlock Master Blueprint — ₹${finalPriceRupees}`}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link href="/free-report" className="text-xs font-mono text-zinc-500 hover:text-purple-400 transition-colors">
            ← Upload a different photo
          </Link>
        </div>
      </div>
    </>
  );
}

export default function PaywallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <span className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    }>
      <PaywallContent />
    </Suspense>
  );
}