"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Terminal, Flame, CheckCircle2, ArrowLeft, RefreshCw, Download } from "lucide-react";

interface GeminiReport {
  overallScore: number;
  tierLabel: string;
  canthalTilt: string;
  facialAdiposity: string;
  jawlineScore: string;
  comparisonSummary?: string;
  unlockedObservations: string[];
  lockedMetrics: string[];
}

export default function FullReport() {
  const [report, setReport] = useState<GeminiReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          <p className="text-xs text-neonMint uppercase tracking-widest">[ DECRYPTING FULL REPORT... ]</p>
        </div>
      </div>
    );
  }

  const score = report?.overallScore ?? 4.8;
  const tier = report?.tierLabel ?? "LTN / SUB-5";

  return (
    <main className="max-w-md mx-auto min-h-[100dvh] bg-background text-white flex flex-col justify-between p-6 font-mono crt-overlay relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[35%] bg-neonMint/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[120%] h-[35%] bg-neonViolet/20 blur-[100px] pointer-events-none" />

      <div className="z-10 space-y-6">
        
        {/* Header Badge & PDF Download Button */}
        <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-neonMint font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> UNLOCKED FULL DIAGNOSTIC
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 bg-surface border border-neonMint/40 text-neonMint text-[10px] px-2.5 py-1 uppercase tracking-wider hover:bg-neonMint hover:text-black transition-colors"
          >
            <Download className="w-3 h-3" /> SAVE PDF
          </button>
        </div>

        {/* Progression / Comparison Alert (Shows if repeat scan) */}
        {report?.comparisonSummary && (
          <div className="cyber-panel p-3 tactical-corners border-neonMint/60 bg-neonMint/10 text-xs">
            <div className="text-[10px] text-neonMint font-bold uppercase tracking-widest flex items-center gap-1 mb-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} /> RE-EVALUATION DELTA
            </div>
            <p className="text-gray-200 text-[11px] font-semibold">
              {report.comparisonSummary}
            </p>
          </div>
        )}

        {/* Hero Rating Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-panel p-6 text-center tactical-corners border-neonMint relative"
        >
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
            FINAL AESTHETIC EVALUATION
          </div>
          
          <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neonMint via-white to-neonViolet uppercase">
            {tier}
          </h1>

          <div className="mt-3 inline-block bg-black/80 border border-neonMint px-4 py-1.5 text-sm text-neonMint font-bold tracking-widest uppercase shadow-glow-mint">
            OVERALL SCORE: {score} / 10
          </div>
        </motion.div>

        {/* Deep Structural Metrics */}
        <div className="space-y-3">
          <div className="text-[10px] text-neonMint font-bold uppercase tracking-widest flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> STRUCTURAL ANALYSIS BREAKDOWN
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-surface/80 border border-surfaceBorder p-3 space-y-1">
              <div className="flex justify-between text-neonMint font-bold">
                <span>1. EYE & PERIORBITAL AREA</span>
                <span className="text-gray-400">{report?.canthalTilt || "Neutral"}</span>
              </div>
              <p className="text-gray-300 text-[11px]">
                Canthal tilt orientation impacts alertness and facial dimorphism. Focus on sleep hygiene and upper eyelid exposure management.
              </p>
            </div>

            <div className="bg-surface/80 border border-surfaceBorder p-3 space-y-1">
              <div className="flex justify-between text-neonMint font-bold">
                <span>2. JAWLINE & BONE STRUCTURE</span>
                <span className="text-gray-400">Gonial Angle ~128°</span>
              </div>
              <p className="text-gray-300 text-[11px]">
                {report?.jawlineScore || "Gonial angle indicates moderate chin projection with soft ramus definition."}
              </p>
            </div>

            <div className="bg-surface/80 border border-surfaceBorder p-3 space-y-1">
              <div className="flex justify-between text-neonMint font-bold">
                <span>3. FACIAL ADIPOSITY & WATER RETENTION</span>
                <span className="text-alertRed font-bold">HIGH PRIORITY</span>
              </div>
              <p className="text-gray-300 text-[11px]">
                {report?.facialAdiposity || "Subcutaneous water layer obscuring cheekbone definition."}
              </p>
            </div>
          </div>
        </div>

        {/* Soft-Maxxing Protocols */}
        <div className="cyber-panel p-4 tactical-corners border-neonViolet/50 space-y-3">
          <div className="text-[10px] text-neonViolet font-bold uppercase tracking-widest flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> RECALIBRATED PROTOCOL
          </div>

          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-neonMint font-bold">•</span>
              <span><strong>Potassium/Sodium Flush:</strong> Target 4,000mg potassium daily to eliminate facial puffiness within 72 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neonMint font-bold">•</span>
              <span><strong>Bodyfat Target:</strong> Reduce bodyfat percentage down to 12–14% to maximize cheekbone hollows.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neonMint font-bold">•</span>
              <span><strong>Grooming Alignment:</strong> Mid-fade or textured crop to visually balance upper midface width.</span>
            </li>
          </ul>
        </div>

        {/* Repeat Scan Upsell Banner */}
        <div className="cyber-panel p-4 tactical-corners border-neonMint/40 bg-black/60 space-y-2">
          <div className="text-[10px] text-neonMint font-bold uppercase tracking-widest flex items-center justify-between">
            <span>// 14-DAY RE-EVALUATION PROTOCOL</span>
            <span className="text-neonViolet">ASCENSION TRACKER</span>
          </div>
          <p className="text-[11px] text-gray-300">
            Run this routine for 14 days, then upload a new selfie to track facial adiposity drops and side-by-side progression.
          </p>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="w-full bg-neonMint/20 border border-neonMint text-neonMint font-bold text-xs py-2.5 uppercase tracking-wider hover:bg-neonMint hover:text-black transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> RUN PROGRESS RE-CHECK
          </button>
        </div>

      </div>

      {/* Back Button */}
      <div className="z-10 pt-4 pb-2">
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="w-full bg-surface border border-surfaceBorder text-gray-400 font-bold text-xs py-3 uppercase tracking-wider hover:text-white flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO SCANNER
        </button>
      </div>

    </main>
  );
}