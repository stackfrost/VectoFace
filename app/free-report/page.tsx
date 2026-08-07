"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleAnalyze = async () => {
    if (!file || !hasConsented) return;
    setIsScanning(true);

    // Simulated scan transition - swap with your actual API endpoint upload later
    setTimeout(() => {
      setIsScanning(false);
      router.push("/paywall");
    }, 2500);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12 md:py-16">
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full glass-panel-purple text-[11px] font-mono text-purple-300">
          Step 01 / Photo Upload
        </div>
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-zinc-100">
          Upload Frontal Portrait
        </h1>
        <p className="text-xs md:text-sm text-zinc-400 font-light">
          Ensure good lighting, neutral facial expression, and no heavy filters.
        </p>
      </div>

      {/* Main Upload / Preview Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative border border-dashed border-white/10 rounded-2xl glass-panel hover:bg-[#121216]/80 hover:border-purple-500/40 transition-all cursor-pointer p-8 flex flex-col items-center justify-center min-h-[320px] overflow-hidden group"
      >
        {/* Added capture="user" to prioritize mobile front camera */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10">
            {/* eslint-disable-next-next/no-img-element */}
            <img
              src={preview}
              alt="Scan Preview"
              className="w-full h-full object-cover"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-[#08080a]/80 backdrop-blur-md flex flex-col items-center justify-center space-y-3">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shadow-[0_0_10px_#a855f7]" />
                <span className="text-xs font-mono text-zinc-200">
                  Mapping 68 Landmark Vector Coordinates...
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center mx-auto group-hover:border-purple-500/40 transition-colors">
              <svg
                className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-200">
                Click to open camera or gallery
              </p>
              <p className="text-xs text-zinc-400 font-mono">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action CTA & Consent */}
      <div className="mt-8 flex flex-col gap-5">
        
        {/* Explicit Consent Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group px-2">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="peer appearance-none w-4 h-4 rounded-sm border border-zinc-600 bg-zinc-900/50 checked:bg-purple-600 checked:border-purple-500 transition-all cursor-pointer"
            />
            <svg
              className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-xs text-zinc-400 font-light leading-relaxed">
            I confirm this is my photo, and I agree to the{" "}
            <Link href="/terms" className="text-purple-400 hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link>. I understand images are processed ephemerally and immediately deleted.
          </span>
        </label>

        {/* Scan Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!file || !hasConsented || isScanning}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:opacity-90 disabled:opacity-40 disabled:hover:opacity-40 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] active:scale-[0.99]"
          >
            {isScanning ? "Analyzing Facial Geometry..." : "Run Biometric Analysis"}
          </button>
          <span className="text-[11px] font-mono text-zinc-500">
            End-to-End Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}