"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Zap, ArrowRight, ShieldAlert, Terminal } from "lucide-react";

interface GeminiReport {
  overallScore: number;
  tierLabel: string;
  canthalTilt: string;
  facialAdiposity: string;
  unlockedObservations: string[];
}

export default function FreeReport() {
  const [report, setReport] = useState<GeminiReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read Gemini analysis output saved by MobileScanner
    const savedData = localStorage.getItem("mog_report_data");
    if (savedData) {
      try {
        setReport(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse report data", e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center font-mono crt-overlay">
        <div className="text-center space-y-3">
          <Terminal className="w-8 h-8 text-neonMint animate-spin mx-auto" />
          <p className="text-xs text-neonMint uppercase tracking-widest">[ READING DIAGNOSTICS... ]</p>
        </div>
      </div>
    );
  }

  // Fallback defaults if accessed directly without scanning
  const score = report?.overallScore ?? 4.8;
  const tier = report?.tierLabel ?? "LTN / SUB-5";
  const observations = report?.unlockedObservations ?? [
    "Neutral canthal tilt creates slight tired eye appearance",
    "High facial adiposity hiding midface bone structure"
  ];

  return (
    <main className="max-w-md mx-auto min-h-[100dvh] bg-background text-white flex flex-col justify-between p-6 font-mono crt-overlay relative overflow-hidden">
      
      {/* Background Glow Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[35%] bg-neonViolet/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[120%] h-[35%] bg-neonMint/15 blur-[100px] pointer-events-none" />

      <div className="z-10 space-y-6">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-neonViolet font-bold uppercase tracking-widest">
            <Terminal className="w-3.5 h-3.5" /> GEMINI DIAGNOSTIC PREVIEW
          </div>
          <span className="text-[10px] text-gray-500 uppercase">CONFIDENTIAL // AI SCAN</span>
        </div>

        {/* Tier & Overall Rating Hero */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-panel p-6 text-center tactical-corners border-neonMint/40 relative"
        >
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
            ESTIMATED TIER CLASSIFICATION
          </div>
          
          <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neonMint via-white to-neonViolet uppercase">
            {tier}
          </h1>

          <div className="mt-3 inline-block bg-black/80 border border-neonMint/50 px-3 py-1 text-xs text-neonMint font-bold tracking-widest uppercase shadow-glow-mint">
            AESTHETIC RATING: {score} / 10
          </div>
        </motion.div>

        {/* Free Teaser Observations */}
        <div className="space-y-3">
          <div className="text-[10px] text-neonViolet font-bold uppercase tracking-widest flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> UNLOCKED INITIAL OBSERVATIONS
          </div>

          <div className="bg-surface/60 border border-surfaceBorder p-3 text-xs space-y-2">
            {observations.map((obs, idx) => (
              <p key={idx} className="text-gray-300">
                • <strong className="text-white">{obs}</strong>
              </p>
            ))}
          </div>
        </div>

        {/* Paywall Preview / Locked Content */}
        <div className="relative cyber-panel p-4 tactical-corners border-neonViolet/30 overflow-hidden">
          <div className="text-[10px] text-alertRed font-bold uppercase tracking-widest flex items-center gap-1 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> LOCKED HIGH-IMPACT METRICS
          </div>

          {/* Blurred Dummy Content */}
          <div className="filter blur-sm select-none opacity-40 space-y-2 text-xs">
            <p>• Jawline Gonial Angle & Chin Projection Ratio</p>
            <p>• Midface Ratio & FWHR (Facial Width-to-Height)</p>
            <p>• Customized Maxilla & Sodium Debloating Protocol</p>
            <p>• Haircut & Soft-Maxxing recommendations for your face shape</p>
          </div>

          {/* Overlay Lock Banner */}
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center">
            <Lock className="w-6 h-6 text-neonMint mb-1 animate-bounce" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">FULL DIAGNOSTIC & PROTOCOL LOCKED</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Unlock exact angles, softmaxxing guide & priority checklist</span>
          </div>
        </div>

      </div>

      {/* CTA Button */}
      <div className="z-10 pt-4 pb-2">
        <button
          onClick={() => {
            alert("Razorpay integration is paused. Scan functionality verified successfully!");
          }}
          className="w-full bg-neonMint text-black font-black text-base py-4 uppercase tracking-wider active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-glow-mint hover:bg-neonMint/90"
        >
          UNLOCK FULL REPORT — ₹59 <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </main>
  );
}