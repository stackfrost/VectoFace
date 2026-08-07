import Link from "next/link";
import BiometricScanner from "@/components/BiometricScanner";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12">
      {/* Left Content Column */}
      <div className="space-y-6 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-purple text-xs font-mono text-purple-300">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
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

        {/* CTAs */}
        <div className="pt-2 flex items-center gap-4">
          <Link
            href="/free-report"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-emerald-500 to-green-500 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)] active:scale-95"
          >
            Upload Photo
          </Link>
          <span className="text-xs font-mono text-zinc-400">Instant Report • Confidential</span>
        </div>
      </div>

      {/* Right Column: Glassmorphic Scanner Card */}
      <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
        <BiometricScanner />
      </div>
    </div>
  );
}