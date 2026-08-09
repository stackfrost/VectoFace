"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";

function PaywallContent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

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

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 7900, currency: "INR" }), 
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
              reportId: reportId 
            }),
          });

          if (verifyRes.ok) {
            router.push(`/full-report?reportId=${reportId}`);
          } else {
            alert("Payment verification failed. Contact support.");
            setIsProcessing(false);
          }
        },
        modal: { ondismiss: function () { setIsProcessing(false); } },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Payment trigger error:", error);
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
  
  // Safe default fallback for feature grades & red flags if scan is from an older schema format
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

  // Correct Percentile Display:
  // If overallScore > 55, render "Top X%", else "Bottom Y%"
  const rawPercentile = reportData.percentile || Math.round((overallScore / 100) * 100);
  const hierarchyText = overallScore >= 55 
    ? `Top ${Math.max(5, 100 - rawPercentile)}%` 
    : `Bottom ${Math.max(10, rawPercentile)}%`;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="max-w-2xl mx-auto px-6 py-10 md:py-14 space-y-6">
        
        {/* Generous Free Data Section */}
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
              <span className="text-[10px] font-mono text-emerald-400 uppercase block font-semibold">Mogging Potential</span>
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mt-1">
                {geneticPotential.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-purple-950/20 border border-purple-500/20">
            <span className="text-zinc-400">Facial Hierarchy Placement:</span>
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

          {/* ZONAL ASSESSMENT GRADES */}
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

          {/* CRITICAL WEAKNESSES DETECTED */}
          <div className="space-y-2.5 pt-4 border-t border-white/5">
            <h3 className="text-[10px] font-mono text-red-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Anatomical review
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

          {/* TEASER CRITIQUE */}
          <div className="p-4 rounded-xl bg-[#08080a]/60 border border-red-500/20 relative overflow-hidden">
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block mb-1">Structural Analysis</span>
            <p className="text-sm text-zinc-300 italic relative z-10 leading-relaxed">
              "{premium.teaserCritique || "Subject displays mandibular irregularity and soft-tissue bloat..."} <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-transparent">which disrupts structural symmetry...</span>"
            </p>
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#08080a] to-transparent z-20" />
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

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-[#08080a]/80 backdrop-blur-md">
            <div className="mb-4 space-y-1">
              <div className="inline-block px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 text-[10px] font-bold tracking-wider mb-2 animate-pulse">
                🇮🇳 INDEPENDENCE DAY FLASH SALE - 80% OFF
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg text-zinc-500 line-through decoration-red-500/70 decoration-2 font-medium">₹399</span>
                <span className="text-4xl font-bold text-white tracking-tight">₹79</span>
              </div>
            </div>
            
            <h3 className="text-xl font-medium text-white max-w-sm">
              Bridge your {pointGap}-point potential gap
            </h3>
            <p className="text-sm text-zinc-300 font-light max-w-sm mt-2 leading-relaxed">
              Unlock the full critique of your flaws, your 4-phase custom Lookmaxxing protocol, and step-by-step instructions to reach your Mogging potential.
            </p>

            <div className="mt-6 w-full max-w-sm space-y-3">
              <button
                onClick={handleRazorpayPayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 via-purple-600 to-emerald-500 hover:opacity-90 disabled:opacity-50 disabled:grayscale text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-[0.98]"
              >
                {isProcessing ? "Connecting to Gateway..." : "Unlock Master Blueprint — ₹79"}
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