"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function FullReportContent() {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

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
        if (data.report) {
          if (!data.report.isPaid) {
            router.replace(`/paywall?reportId=${reportId}`);
            return;
          }
          setReportData(data.report);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });

    // Load saved checklist state from localStorage
    const saved = localStorage.getItem(`checklist_${reportId}`);
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse checklist state", e);
      }
    }
  }, [reportId, router]);

  const toggleStep = (key: string) => {
    const updated = { ...completedSteps, [key]: !completedSteps[key] };
    setCompletedSteps(updated);
    if (reportId) {
      localStorage.setItem(`checklist_${reportId}`, JSON.stringify(updated));
    }
  };

  const handleDownloadPDF = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <span className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-sm font-mono text-zinc-400">Decrypting Master Clinical Dossier...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-6">
        <p className="text-zinc-300">No report found or access denied.</p>
        <Link href="/free-report" className="text-purple-400 hover:underline">← Upload a photo</Link>
      </div>
    );
  }

  const premium = reportData.premiumData || {};
  const dossier = premium.fullDossier || {};

  // Calculate completion percentage for the execution checklist
  const totalTasks = 3;
  const completedCount = ['morning', 'afternoon', 'evening'].filter(k => completedSteps[k]).length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 md:py-16 space-y-10">
      
      {/* Sticky Export Action Bar (Hidden during print) */}
      <div className="no-print sticky top-4 z-50 flex items-center justify-between p-4 rounded-xl bg-[#08080a]/90 backdrop-blur-md border border-white/10 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-zinc-300">Dossier Unlocked</span>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold transition-all active:scale-95"
        >
          <span>📄</span>
          <span>Save as Official PDF</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full glass-panel-green text-[10px] font-mono text-emerald-300 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            UNLOCKED • MASTER CLINICAL DOSSIER
          </div>
          <h1 className="text-2xl md:text-3xl font-medium text-white">
            Full Biometric & Softmaxxing Protocol
          </h1>
        </div>
        <div className="text-xs font-mono text-zinc-400">
          ID: <span className="text-purple-400">#{reportData.id.slice(-6).toUpperCase()}</span>
        </div>
      </div>

      {/* Hero Numbers */}
      <div className="avoid-break p-6 md:p-8 rounded-2xl glass-panel border-t-2 border-t-emerald-500 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white/5 rounded-xl">
            <span className="text-[10px] text-zinc-400 block">Current Score</span>
            <span className="text-2xl font-bold text-white">{reportData.overallScore}</span>
          </div>
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
            <span className="text-[10px] text-emerald-400 block">Peak Potential</span>
            <span className="text-2xl font-bold text-emerald-400">{reportData.geneticPotential}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            <span className="text-[10px] text-zinc-400 block">Symmetry</span>
            <span className="text-2xl font-bold text-white">{reportData.symmetryScore}%</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            <span className="text-[10px] text-zinc-400 block">Facial Thirds</span>
            <span className="text-xs font-mono text-white mt-2 block">{reportData.facialThirds}</span>
          </div>
        </div>

        {/* Deep Structural Critique */}
        {dossier.structuralCritique && (
          <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-sm text-zinc-200 leading-relaxed space-y-2">
            <span className="text-xs font-mono text-purple-400 block uppercase font-bold">1. Deep Anatomical Assessment</span>
            <p className="font-light">{dossier.structuralCritique}</p>
          </div>
        )}
      </div>

      {/* Protocol Modules */}
      <div className="space-y-8 page-break-before">
        <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-widest">2. Customized Softmaxxing Protocols</h2>

        {/* Debloating Module */}
        {dossier.debloatingProtocol && (
          <div className="avoid-break p-6 rounded-2xl glass-panel border-l-4 border-l-purple-500 space-y-4">
            <h3 className="text-base font-semibold text-white">Module A: Craniofacial Debloating & Fluid Displacement</h3>
            <p className="text-xs text-zinc-300 font-light">{dossier.debloatingProtocol.summary}</p>
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono text-purple-400 uppercase block">Action Protocols:</span>
              {dossier.debloatingProtocol.actionSteps?.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200 p-2.5 rounded-lg bg-white/5">
                  <span className="text-purple-400 font-mono">0{idx+1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lower Third Module */}
        {dossier.lowerThirdProtocol && (
          <div className="avoid-break p-6 rounded-2xl glass-panel border-l-4 border-l-emerald-500 space-y-4">
            <h3 className="text-base font-semibold text-white">Module B: Lower Third & Masseter Hypertrophy</h3>
            <p className="text-xs text-zinc-300 font-light">{dossier.lowerThirdProtocol.summary}</p>
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase block">Action Protocols:</span>
              {dossier.lowerThirdProtocol.actionSteps?.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200 p-2.5 rounded-lg bg-white/5">
                  <span className="text-emerald-400 font-mono">0{idx+1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ocular Module */}
        {dossier.ocularProtocol && (
          <div className="avoid-break p-6 rounded-2xl glass-panel border-l-4 border-l-orange-500 space-y-4">
            <h3 className="text-base font-semibold text-white">Module C: Ocular Area & Brow Plane Optimization</h3>
            <p className="text-xs text-zinc-300 font-light">{dossier.ocularProtocol.summary}</p>
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono text-orange-400 uppercase block">Action Protocols:</span>
              {dossier.ocularProtocol.actionSteps?.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200 p-2.5 rounded-lg bg-white/5">
                  <span className="text-orange-400 font-mono">0{idx+1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dermatology Module */}
        {dossier.dermatologyProtocol && (
          <div className="avoid-break p-6 rounded-2xl glass-panel border-l-4 border-l-blue-500 space-y-4">
            <h3 className="text-base font-semibold text-white">Module D: Dermatological Stratum Resurfacing</h3>
            <p className="text-xs text-zinc-300 font-light">{dossier.dermatologyProtocol.summary}</p>
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono text-blue-400 uppercase block">Action Protocols:</span>
              {dossier.dermatologyProtocol.actionSteps?.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200 p-2.5 rounded-lg bg-white/5">
                  <span className="text-blue-400 font-mono">0{idx+1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* UPGRADE #3: PHASED NUTRITIONAL MATRIX */}
      {dossier.dietAndSupplements && (
        <div className="space-y-4 avoid-break">
          <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-widest">3. Endocrine & Anti-Bloat Nutritional Matrix</h2>
          
          <div className="p-6 rounded-2xl glass-panel space-y-6">
            <p className="text-xs text-zinc-300 leading-relaxed font-light">{dossier.dietAndSupplements.summary}</p>

            {/* Phased Execution Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phase 1 Card */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">Phase 1: Days 1–14 (Anti-Edema)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-300">ACTIVE FLUSH</span>
                </div>
                <span className="text-xs font-semibold text-white block">✓ Essential Osmotic Drivers</span>
                <ul className="text-xs text-zinc-300 space-y-2">
                  {dossier.dietAndSupplements.foodsToEat?.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prohibited Foods Card */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-red-400 uppercase font-bold tracking-wider">Edema Trigger Control</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-[9px] font-mono text-red-300">STRICT BAN</span>
                </div>
                <span className="text-xs font-semibold text-white block">✕ Facial Water Retention Foods</span>
                <ul className="text-xs text-zinc-300 space-y-2">
                  {dossier.dietAndSupplements.foodsToAvoid?.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Targeted Supplement Stack Card */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">Phase 2: Days 15–28 (Bio-Available Stacking)</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[9px] font-mono text-purple-300">CELLULAR RECOVERY</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                {dossier.dietAndSupplements.keySupplements?.map((supp: string, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-zinc-200 font-light">
                    <span className="text-purple-400 font-mono text-[10px] block mb-0.5">SUPPLEMENT 0{i+1}</span>
                    {supp}
                  </div>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 28-DAY INTERACTIVE MASTER EXECUTION SCHEDULE */}
      {dossier.dailySchedule && (
        <div className="space-y-4 avoid-break">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-widest">4. 28-Day Master Execution Schedule</h2>
            <div className="no-print flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">Daily Completion:</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{progressPercent}%</span>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl glass-panel space-y-4 border border-purple-500/30">
            {/* Morning Task */}
            <div 
              onClick={() => toggleStep("morning")}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                completedSteps["morning"] 
                  ? "bg-purple-950/30 border-purple-500/50 opacity-75" 
                  : "bg-white/5 border-white/10 hover:border-purple-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  checked={!!completedSteps["morning"]} 
                  onChange={() => {}} 
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-purple-500 focus:ring-purple-500 accent-purple-500" 
                />
                <div className="space-y-1">
                  <span className={`text-[10px] font-mono uppercase block font-bold ${completedSteps["morning"] ? "text-purple-300 line-through" : "text-purple-400"}`}>
                    Morning Protocol (AM)
                  </span>
                  <p className={`text-xs font-light leading-relaxed ${completedSteps["morning"] ? "text-zinc-400 line-through" : "text-zinc-200"}`}>
                    {dossier.dailySchedule.morning}
                  </p>
                </div>
              </div>
            </div>

            {/* Midday Task */}
            <div 
              onClick={() => toggleStep("afternoon")}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                completedSteps["afternoon"] 
                  ? "bg-emerald-950/30 border-emerald-500/50 opacity-75" 
                  : "bg-white/5 border-white/10 hover:border-emerald-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  checked={!!completedSteps["afternoon"]} 
                  onChange={() => {}} 
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 accent-emerald-500" 
                />
                <div className="space-y-1">
                  <span className={`text-[10px] font-mono uppercase block font-bold ${completedSteps["afternoon"] ? "text-emerald-300 line-through" : "text-emerald-400"}`}>
                    Midday / Post-Work (PM)
                  </span>
                  <p className={`text-xs font-light leading-relaxed ${completedSteps["afternoon"] ? "text-zinc-400 line-through" : "text-zinc-200"}`}>
                    {dossier.dailySchedule.afternoon}
                  </p>
                </div>
              </div>
            </div>

            {/* Evening Task */}
            <div 
              onClick={() => toggleStep("evening")}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                completedSteps["evening"] 
                  ? "bg-blue-950/30 border-blue-500/50 opacity-75" 
                  : "bg-white/5 border-white/10 hover:border-blue-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  checked={!!completedSteps["evening"]} 
                  onChange={() => {}} 
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500 accent-blue-500" 
                />
                <div className="space-y-1">
                  <span className={`text-[10px] font-mono uppercase block font-bold ${completedSteps["evening"] ? "text-blue-300 line-through" : "text-blue-400"}`}>
                    Night Protocol (Before Bed)
                  </span>
                  <p className={`text-xs font-light leading-relaxed ${completedSteps["evening"] ? "text-zinc-400 line-through" : "text-zinc-200"}`}>
                    {dossier.dailySchedule.evening}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Return CTA (Hidden during print) */}
      <div className="no-print text-center pt-6 border-t border-white/10">
        <Link href="/free-report" className="text-xs font-mono text-zinc-500 hover:text-purple-400 transition-colors">
          ← Upload another photo for diagnostic
        </Link>
      </div>
    </div>
  );
}

export default function FullReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <span className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    }>
      <FullReportContent />
    </Suspense>
  );
}