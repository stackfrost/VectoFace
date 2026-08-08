import Link from "next/link";
import BiometricScanner from "@/components/BiometricScanner";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12">
      {/* Left Content Column */}
      <div className="space-y-6 max-w-xl w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-purple text-xs font-mono text-purple-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Neural Structure Mapping
        </div>

        <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-white leading-tight">
          Facial structure & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-emerald-400 to-green-300 font-bold">
            symmetry diagnostic.
          </span>
        </h1>

        <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-light">
          Get an instant breakdown across 68 facial landmark coordinates. Calculate Golden Ratio harmony, jawline angles, and midface proportions.
        </p>

        {/* Updated Full-Width Frosted CTA */}
        <div className="pt-4 flex flex-col items-center w-full max-w-md">
          <Link
            href="/free-report"
            className="w-full block text-center py-4 rounded-xl glass-panel-purple border border-purple-500/30 text-white font-semibold text-sm transition-all hover:bg-purple-700/30 shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:shadow-[0_0_45px_rgba(168,85,247,0.45)] active:scale-[0.98]"
          >
            Upload Photo
          </Link>
          
          {/* Subtext with Green Lock */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-mono text-zinc-500">
            <svg 
              className="w-3.5 h-3.5 text-emerald-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
            <span>Instant Report • Confidential</span>
          </div>
        </div>
      </div>

      {/* Right Column: Glassmorphic Scanner Card */}
      <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
        <BiometricScanner />
      </div>
    </div>
  );
}