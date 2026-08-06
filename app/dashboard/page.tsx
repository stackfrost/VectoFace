"use client";

import { useEffect, useState } from "react";
import { ClientFaceAnalyzer, FacialReport } from "@/lib/clientAnalysisEngine";
import { Terminal, ShieldCheck, AlertTriangle, CheckSquare, Square, Crosshair, Zap, Lock } from "lucide-react";
import ReferralCard from "@/components/mobile/ReferralCard";

export default function MobileDashboard() {
  const [report, setReport] = useState<FacialReport | null>(null);
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Check payment state
    const paid = localStorage.getItem("lookmax_paid") === "true";
    setIsPaid(paid);

    // Retrieve report
    const data = ClientFaceAnalyzer.getLocalReport();
    setReport(data);
  }, []);

  const toggleTask = (index: number) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Payment Gate Guard
  if (isPaid === false) {
    return (
      <main className="max-w-md mx-auto min-h-[100dvh] bg-background text-white p-6 flex flex-col items-center justify-center text-center font-mono crt-overlay">
        <Lock className="w-12 h-12 text-alertRed mb-4 animate-bounce" />
        <h1 className="text-xl font-black uppercase text-alertRed">ACCESS RESTRICTED</h1>
        <p className="text-xs text-gray-400 mt-2 uppercase">Unlock your report protocol before accessing the diagnostic dashboard.</p>
        <button 
          onClick={() => window.location.href = "/paywall"}
          className="mt-6 bg-neonMint text-black font-black text-xs py-3 px-6 uppercase tracking-wider active:scale-95 transition-transform shadow-glow-mint"
        >
          [ GO TO UNLOCK PAGE ]
        </button>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="max-w-md mx-auto min-h-[100dvh] bg-background text-white p-6 flex flex-col items-center justify-center text-center font-mono crt-overlay">
        <AlertTriangle className="w-12 h-12 text-alertRed mb-4 animate-bounce" />
        <h1 className="text-xl font-black uppercase text-alertRed">NO LOCAL DATA FOUND</h1>
        <p className="text-xs text-gray-400 mt-2 uppercase">Please complete a facial scan first to generate your report.</p>
        <button 
          onClick={() => window.location.href = "/"}
          className="mt-6 bg-neonMint text-black font-black text-xs py-3 px-6 uppercase tracking-wider active:scale-95 transition-transform"
        >
          [ INITIALIZE SCAN ]
        </button>
      </main>
    );
  }

  // Determine Tier Badge based on Score
  const getTierBadge = (score: number) => {
    if (score >= 8.0) return { label: "TOP 1% MOGGER", color: "text-neonMint border-neonMint shadow-glow-mint" };
    if (score >= 6.8) return { label: "CHADLITE", color: "text-neonViolet border-neonViolet shadow-glow-violet" };
    return { label: "SUB-5 // COPE DETECTED", color: "text-alertRed border-alertRed shadow-glow-red" };
  };

  const tier = getTierBadge(report.overallScore);

  return (
    <main className="max-w-md mx-auto min-h-[100dvh] bg-background text-white p-6 pb-12 flex flex-col space-y-6 relative overflow-hidden crt-overlay font-mono">
      
      {/* Light Bleed Background Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[40%] bg-neonViolet/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[140%] h-[40%] bg-neonMint/15 blur-[120px] pointer-events-none" />

      {/* Top Banner Header */}
      <div className="flex justify-between items-center pt-2 z-10 border-b border-surfaceBorder pb-3">
        <div className="flex items-center gap-2 text-[10px] text-neonViolet font-bold uppercase tracking-widest">
          <Terminal className="w-3.5 h-3.5" /> REPORT // UNLOCKED
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-neonMint" /> GPU Local Memory
        </div>
      </div>

      {/* Hero Tier Badge & Score Card */}
      <div className="cyber-panel p-6 text-center tactical-corners space-y-3 z-10 border-neonViolet/40 shadow-glow-violet">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">// CURRENT CLASSIFICATION</span>
        
        <div className={`inline-block px-3 py-1 border text-xs font-black uppercase tracking-widest my-1 ${tier.color}`}>
          {tier.label}
        </div>

        <div className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neonMint via-white to-neonViolet">
          {report.overallScore} <span className="text-lg text-gray-500 font-normal">/ 10</span>
        </div>

        <p className="text-[11px] text-gray-300 uppercase tracking-tight">
          POTENTIAL SCORE WITH PROTOCOL: <strong className="text-neonMint font-bold">8.9 / 10</strong>
        </p>
      </div>

      {/* VIRAL REFERRAL & SHARE CARD */}
      <div className="z-10">
        <ReferralCard report={report} />
      </div>

      {/* Factor Breakdown Section */}
      <div className="space-y-3 z-10">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-neonViolet">
          <span className="flex items-center gap-1.5"><Crosshair className="w-4 h-4 text-neonMint" /> FACTOR DIAGNOSTICS</span>
          <span className="text-[10px] text-gray-500">RAW METRICS</span>
        </div>

        <div className="space-y-2">
          {Object.entries(report.scores).map(([key, data]) => {
            const percentage = Math.min(Math.max((data.value / 10) * 100, 10), 100);
            return (
              <div key={key} className="cyber-panel p-3.5 space-y-2 border-surfaceBorder bg-black/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="uppercase font-bold text-gray-200">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-neonMint font-black">{data.value} / 10</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-surface border border-surfaceBorder h-2 overflow-hidden relative">
                  <div 
                    className="bg-gradient-to-r from-neonViolet to-neonMint h-full transition-all duration-1000 shadow-glow-mint"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="text-[10px] text-gray-400 uppercase tracking-tight flex justify-between">
                  <span>STATUS: {data.label}</span>
                  <span className="text-neonViolet">VERIFIED</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Identified Flaws Section */}
      <div className="cyber-panel p-4 tactical-corners space-y-2 border-alertRed/40 bg-alertRed/5 z-10">
        <div className="flex items-center gap-2 text-xs font-bold text-alertRed uppercase tracking-widest">
          <AlertTriangle className="w-4 h-4" /> 3 FATAL FLAWS DETECTED
        </div>
        <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside uppercase tracking-tight pt-1">
          <li>Recessed mandible / Underdeveloped Masseters</li>
          <li>Sodium water retention obscuring cheekbones</li>
          <li>Sub-optimal eye orbital support (Dark Circles)</li>
        </ul>
      </div>

      {/* 30-Day Protocol Checklist */}
      <div className="space-y-3 z-10 pt-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-neonMint">
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 fill-neonMint" /> 30-DAY MOXXING PROTOCOL</span>
          <span className="text-[10px] text-gray-500">DAILY CHECKLIST</span>
        </div>

        <div className="space-y-2">
          {report.routine.map((task, idx) => {
            const isChecked = !!checkedTasks[idx];
            return (
              <div 
                key={idx} 
                onClick={() => toggleTask(idx)}
                className={`cyber-panel p-3.5 flex items-start gap-3 cursor-pointer transition-colors border-surfaceBorder ${
                  isChecked ? "bg-neonMint/10 border-neonMint/50" : "bg-black/60"
                }`}
              >
                <div className="mt-0.5 text-neonMint">
                  {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-500" />}
                </div>
                <span className={`text-xs uppercase tracking-tight ${isChecked ? "line-through text-gray-500" : "text-gray-200"}`}>
                  {task}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </main>
  );
}