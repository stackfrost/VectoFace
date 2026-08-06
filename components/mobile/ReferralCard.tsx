"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, Gift, Sparkles, Download } from "lucide-react";
import { FacialReport } from "@/lib/clientAnalysisEngine";

interface ReferralCardProps {
  report: FacialReport;
}

export default function ReferralCard({ report }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Generate or retrieve unique referral ID
    let id = localStorage.getItem("mog_user_id");
    if (!id) {
      id = "MOG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem("mog_user_id", id);
    }
    setUserId(id);

    // Retrieve fake/real referral count tracker
    const count = parseInt(localStorage.getItem("mog_ref_count") || "0", 10);
    setReferralCount(count);
  }, []);

  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}?ref=${userId}` 
    : `https://mogcheck.ai?ref=${userId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Canvas Card Generator for Instagram Story sharing
  const handleDownloadStoryCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Pitch Black
    ctx.fillStyle = "#030305";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Light Bleed Orbs
    const grad = ctx.createRadialGradient(540, 400, 50, 540, 400, 600);
    grad.addColorStop(0, "rgba(176, 38, 255, 0.35)");
    grad.addColorStop(1, "rgba(3, 3, 5, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cyber Border
    ctx.strokeStyle = "#00FF87";
    ctx.lineWidth = 10;
    ctx.strokeRect(60, 60, 960, 1800);

    // Header Text
    ctx.fillStyle = "#B026FF";
    ctx.font = "bold 36px monospace";
    ctx.textAlign = "center";
    ctx.fillText("// MOGCHECK AI BIOMETRICS", 540, 200);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 84px monospace";
    ctx.fillText("FACIAL TIER REPORT", 540, 320);

    // Score Badge Box
    ctx.fillStyle = "#0A0A0F";
    ctx.fillRect(180, 450, 720, 400);
    ctx.strokeStyle = "#B026FF";
    ctx.lineWidth = 4;
    ctx.strokeRect(180, 450, 720, 400);

    ctx.fillStyle = "#00FF87";
    ctx.font = "bold 42px monospace";
    ctx.fillText("OVERALL RATING", 540, 530);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 160px monospace";
    ctx.fillText(`${report.overallScore}`, 540, 710);

    ctx.fillStyle = "#888888";
    ctx.font = "32px monospace";
    ctx.fillText("/ 10.0", 540, 780);

    // Call To Action Footer for Instagram
    ctx.fillStyle = "#00FF87";
    ctx.font = "bold 48px monospace";
    ctx.fillText("TEST YOUR FACIAL TIER NOW", 540, 1500);

    ctx.fillStyle = "#888888";
    ctx.font = "36px monospace";
    ctx.fillText(`USE CODE: ${userId}`, 540, 1580);

    // Trigger Image Download
    const link = document.createElement("a");
    link.download = `MogCheck_Score_${userId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="cyber-panel p-5 tactical-corners space-y-4 border-neonMint/40 bg-black/60 font-mono">
      
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-surfaceBorder pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-neonMint uppercase tracking-widest">
          <Gift className="w-4 h-4" /> RECRUIT & MOG FRIENDS
        </div>
        <span className="text-[10px] text-neonViolet font-bold uppercase">{referralCount}/3 RECRUITS</span>
      </div>

      <p className="text-xs text-gray-300 uppercase tracking-tight leading-relaxed">
        Share your link or story card. Get <strong className="text-neonMint">3 friends</strong> to check their tier and unlock advanced jawline exercises for free.
      </p>

      {/* Referral Link Copy Bar */}
      <div className="flex items-center gap-2 bg-surface p-2 border border-surfaceBorder">
        <input 
          type="text" 
          readOnly 
          value={referralLink}
          className="bg-transparent text-xs text-neonMint flex-1 outline-none font-mono"
        />
        <button 
          onClick={handleCopy}
          className="bg-neonMint text-black p-2 font-bold active:scale-95 transition-transform flex items-center justify-center"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Share / Story Download CTAs */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button 
          onClick={handleDownloadStoryCard}
          className="bg-surface border border-neonViolet/50 text-neonViolet hover:bg-neonViolet/10 font-bold text-xs py-3 uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> IG STORY CARD
        </button>

        <button 
          onClick={handleCopy}
          className="bg-neonMint/10 border border-neonMint text-neonMint hover:bg-neonMint/20 font-bold text-xs py-3 uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" /> SHARE LINK
        </button>
      </div>

    </div>
  );
}