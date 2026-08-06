import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-surfaceBorder bg-black/60 backdrop-blur-md py-6 mt-12 text-center text-[10px] text-gray-500 font-mono">
      <div className="max-w-md mx-auto px-4 space-y-3">
        <div className="flex flex-wrap justify-center gap-4 text-gray-400 font-medium">
          <Link href="/privacy" className="hover:text-neonMint transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-neonMint transition-colors">
            Terms of Service
          </Link>
          <Link href="/refunds" className="hover:text-neonMint transition-colors">
            Refund Policy
          </Link>
          <Link href="/contact" className="hover:text-neonMint transition-colors">
            Contact Us
          </Link>
        </div>
        
        <p className="text-gray-600 text-[9px] uppercase tracking-widest">
          © 2026 VectoFace AI // Ephemeral Cloud AI Processing
        </p>
      </div>
    </footer>
  );
}