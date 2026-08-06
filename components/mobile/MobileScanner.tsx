"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Crosshair, Terminal, UploadCloud } from "lucide-react";
import Link from "next/link";
import { ClientFaceAnalyzer } from "@/lib/clientAnalysisEngine";

export default function MobileScanner() {
  const [step, setStep] = useState<"intro" | "capture" | "scanning">("intro");
  const [scanStatus, setScanStatus] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get("ref");
      if (refCode) {
        localStorage.setItem("mog_ref_code", refCode.toUpperCase());
      }
    }
  }, []);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep("scanning");
    setScanStatus("[1/3] TRANSMITTING ENCRYPTED MATRIX TO AI MODEL...");

    const t1 = setTimeout(() => setScanStatus("[2/3] EVALUATING FACIAL SYMMETRY & GONIAL ANGLE..."), 1200);
    const t2 = setTimeout(() => setScanStatus("[3/3] CALCULATING FACIAL ADIPOSITY & RATIOS..."), 2400);

    try {
      if (ClientFaceAnalyzer && typeof ClientFaceAnalyzer.processImageLocally === "function") {
        await ClientFaceAnalyzer.processImageLocally(file);
      }

      const base64Image = await convertFileToBase64(file);

      // Read previous scan report from localStorage if available
      let previousScan = null;
      const savedReport = localStorage.getItem("mog_report_data");
      if (savedReport) {
        try {
          previousScan = JSON.parse(savedReport);
        } catch (err) {
          console.error("Could not parse existing scan history", err);
        }
      }

      // Send image + optional previousScan object to Gemini
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: base64Image,
          previousScan
        }),
      });

      const data = await response.json();

      if (data.success && data.report) {
        // Save the updated/new scan report
        localStorage.setItem("mog_report_data", JSON.stringify(data.report));
      } else {
        console.warn("Gemini API failed or key missing, falling back to local analysis", data.error);
      }
    } catch (err) {
      console.error("Error analyzing image:", err);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      window.location.href = "/free-report";
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[100dvh] bg-background text-white flex flex-col relative overflow-hidden crt-overlay font-mono">
      
      {/* Light Bleed Orbs in background */}
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[45%] bg-neonViolet/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[140%] h-[45%] bg-neonMint/15 blur-[120px] pointer-events-none" />

      <div className="flex-1 flex flex-col p-6 z-10 justify-between">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INTRO */}
          {step === "intro" && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col justify-between pt-4"
            >
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-neonViolet/50 text-neonViolet text-[10px] uppercase tracking-widest shadow-glow-violet">
                  <Terminal className="w-3.5 h-3.5" /> VECTOFACE AI // SYSTEM v3.09
                </div>
                
                <h1 className="text-4xl font-black uppercase tracking-tighter leading-none italic">
                  EVALUATE YOUR <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonMint via-white to-neonViolet drop-shadow-[0_0_15px_rgba(0,255,135,0.6)]">
                    FACIAL METRICS.
                  </span>
                </h1>
                
                <p className="text-gray-400 text-xs tracking-tight max-w-[290px] mx-auto uppercase">
                  Precision structural analysis. Measure jawline angle, eye symmetry, and facial adiposity with computer vision.
                </p>
              </div>

              {/* Metrics Checklist Preview */}
              <div className="cyber-panel p-4 tactical-corners space-y-3 my-6 border-neonViolet/30">
                <div className="text-[10px] text-neonViolet font-bold tracking-widest uppercase flex justify-between">
                  <span>// DIAGNOSTIC CHECKS</span>
                  <span className="text-neonMint">STATUS: READY</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div className="bg-black/60 p-2 border border-surfaceBorder flex items-center justify-between">
                    <span>EYE AREA</span>
                    <span className="text-neonMint font-bold">CANTHAL TILT</span>
                  </div>
                  <div className="bg-black/60 p-2 border border-surfaceBorder flex items-center justify-between">
                    <span>JAWLINE</span>
                    <span className="text-neonMint font-bold">GONIAL ANGLE</span>
                  </div>
                  <div className="bg-black/60 p-2 border border-surfaceBorder flex items-center justify-between">
                    <span>BLOATING</span>
                    <span className="text-neonMint font-bold">ADIPOSITY</span>
                  </div>
                  <div className="bg-black/60 p-2 border border-surfaceBorder flex items-center justify-between">
                    <span>POTENTIAL</span>
                    <span className="text-neonViolet font-bold">MAX TIER</span>
                  </div>
                </div>
              </div>

              {/* Action & Trust Badges */}
              <div className="space-y-3 pb-4">
                <button 
                  onClick={() => setStep("capture")}
                  className="w-full bg-neonMint text-black font-black text-base py-4 uppercase tracking-wider active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-glow-mint hover:bg-neonMint/90"
                >
                  <Crosshair className="w-5 h-5" /> ANALYZE FACIAL METRICS
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-neonMint" /> Transient Memory Processing // Encrypted
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CAPTURE / VIEWFINDER */}
          {step === "capture" && (
            <motion.div 
              key="capture"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col justify-center items-center"
            >
              <div className="text-center mb-6">
                <span className="text-xs text-neonViolet font-bold tracking-widest uppercase">// NEUTRAL LIGHTING RECOMMENDED</span>
                <h2 className="text-xl font-extrabold uppercase mt-1">ALIGN YOUR FACE</h2>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase">Front facing • Neutral expression • No heavy filters</p>
              </div>

              {/* Viewfinder Overlay */}
              <div className="relative w-full aspect-[3/4] max-w-[280px] cyber-panel-mint flex flex-col items-center justify-center tactical-corners group mb-4">
                
                {/* Crosshair corners */}
                <div className="absolute top-2 left-2 text-[9px] text-neonMint opacity-70">TL // 0.44</div>
                <div className="absolute bottom-2 right-2 text-[9px] text-neonViolet opacity-70">BR // 0.98</div>

                {/* Face Oval Reticle */}
                <svg className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-80 transition-opacity" viewBox="0 0 100 100">
                  <ellipse cx="50" cy="50" rx="32" ry="42" fill="none" stroke="#00FF87" strokeWidth="0.8" strokeDasharray="2 2" />
                  <line x1="50" y1="5" x2="50" y2="95" stroke="#B026FF" strokeWidth="0.3" strokeDasharray="1 1" />
                  <line x1="5" y1="50" x2="95" y2="50" stroke="#B026FF" strokeWidth="0.3" strokeDasharray="1 1" />
                </svg>

                <div className="z-10 flex flex-col items-center text-center p-4">
                  <div className="w-14 h-14 bg-black/80 border border-neonMint flex items-center justify-center text-neonMint mb-3 shadow-glow-mint transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neonMint">SELECT SELFIE</span>
                  <span className="text-[10px] text-gray-400 mt-1 uppercase">FRONT FACING // NEUTRAL EXPRESSION</span>
                </div>

                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  capture="user" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>

              {/* DPDP 18+ Biometric Consent Checkbox */}
              <div className="w-full max-w-[280px] space-y-3">
                <div className="flex items-start gap-2 text-left bg-black/60 border border-surfaceBorder p-2.5 rounded text-[10px] text-gray-400">
                  <input
                    type="checkbox"
                    id="privacyConsent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 accent-neonMint cursor-pointer"
                  />
                  <label htmlFor="privacyConsent" className="cursor-pointer leading-tight">
                    I confirm I am 18+ and agree to encrypted transmission of my selfie for real-time AI metric analysis. <strong>Images are processed transiently in RAM and never saved to disk.</strong> Read our{" "}
                    <Link href="/privacy" className="text-neonMint underline" target="_blank">
                      Privacy Policy
                    </Link>.
                  </label>
                </div>

                {/* Upload Trigger Button */}
                <button
                  disabled={!consentGiven}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full font-bold text-xs py-3.5 uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    consentGiven 
                      ? "bg-neonMint text-black shadow-glow-mint hover:bg-neonMint/90 cursor-pointer" 
                      : "bg-surfaceBorder text-gray-500 cursor-not-allowed opacity-50"
                  }`}
                >
                  <UploadCloud className="w-4 h-4" /> UPLOAD SELFIE & SCAN
                </button>

                <div className="text-center">
                  <button 
                    onClick={() => setStep("intro")}
                    className="text-[11px] text-gray-500 uppercase tracking-widest hover:text-white"
                  >
                    [ CANCEL ]
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SCANNING LOG */}
          {step === "scanning" && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col justify-center items-center text-center"
            >
              <div className="relative w-52 h-68 cyber-panel-violet tactical-corners flex items-center justify-center">
                
                {/* Laser line moving vertically */}
                <motion.div 
                  className="absolute left-0 right-0 h-[2px] bg-neonMint shadow-glow-mint z-20"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />

                <Crosshair className="w-16 h-16 text-neonViolet/40 animate-spin" style={{ animationDuration: "10s" }} />
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(176,38,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(176,38,255,0.1)_1px,transparent_1px)] bg-[size:12px_12px]" />
              </div>

              <div className="mt-8 space-y-2">
                <div className="text-xs text-neonViolet font-bold tracking-widest uppercase">// PROCESSING VISION ENGINE</div>
                <p className="text-neonMint text-xs font-bold tracking-tight animate-pulse h-6">
                  {scanStatus}
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}