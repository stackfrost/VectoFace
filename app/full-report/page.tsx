"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function FullReportContent() {
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
  }, [reportId, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <span className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-sm font-mono text-zinc-400">Decrypting Master Blueprint...</p>
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 md:py-16 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full glass-panel-green text-[10px] font-mono text-emerald-300 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            UNLOCKED • MASTER BLUEPRINT
          </div>
          <h1 className="text-2xl md:text-3xl font-medium text-white">
            Full Biometric & Softmaxxing Protocol
          </h1>
        </div>
        <div className="text-xs font-mono text-zinc-400">
          ID: <span className="text-purple-400">#{reportData.id.slice(-6).toUpperCase()}</span>
        </div>
      </div>

      {/* Scores Overview */}
      <div className="p-6 md:p-8 rounded-2xl glass-panel border-t-2 border-t-emerald-500 space-y-6">
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

        {/* Full Critique */}
        {premium.teaserCritique && (
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-sm text-zinc-300 leading-relaxed">
            <span className="text-xs font-mono text-purple-400 block mb-1 uppercase">Full Structural Critique</span>
            "{premium.teaserCritique}"
          </div>
        )}
      </div>

      {/* 4 Unlocked Protocol Phases */}
      <div className="space-y-6">
        <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-widest">Custom Softmaxxing Roadmap</h2>
        <div className="p-6 rounded-2xl glass-panel space-y-2 border-l-4 border-l-purple-500">
          <span className="text-xs font-mono text-purple-400 uppercase">Phase 1 • Craniofacial Debloating</span>
          <h3 className="text-base font-semibold text-white">Fluid Retention & Tissue Flushing</h3>
          <p className="text-sm text-zinc-300 leading-relaxed font-light">{premium.phase1}</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel space-y-2 border-l-4 border-l-emerald-500">
          <span className="text-xs font-mono text-emerald-400 uppercase">Phase 2 • Ocular Area Optimization</span>
          <h3 className="text-base font-semibold text-white">Periorbital & Brow Architecture</h3>
          <p className="text-sm text-zinc-300 leading-relaxed font-light">{premium.phase2}</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel space-y-2 border-l-4 border-l-orange-500">
          <span className="text-xs font-mono text-orange-400 uppercase">Phase 3 • Lower Third Hypertrophy</span>
          <h3 className="text-base font-semibold text-white">Masseter Activation & Stubble Contouring</h3>
          <p className="text-sm text-zinc-300 leading-relaxed font-light">{premium.phase3}</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel space-y-2 border-l-4 border-l-blue-500">
          <span className="text-xs font-mono text-blue-400 uppercase">Phase 4 • Dermatological Resurfacing</span>
          <h3 className="text-base font-semibold text-white">Stratum Corneum & Skin Tone Clarity</h3>
          <p className="text-sm text-zinc-300 leading-relaxed font-light">{premium.phase4}</p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link href="/free-report" className="text-xs font-mono text-zinc-500 hover:text-purple-400 transition-colors">
          ← Upload another photo for diagnostic
        </Link>
      </div>
    </div>
  );
}

// Wrapping it in a Suspense boundary for Next.js build compliance
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