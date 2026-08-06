"use client";

import { Suspense, useEffect } from "react";
import MobileScanner from "@/components/mobile/MobileScanner";


function ReferralHandler() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get("ref");
      if (refCode) {
        localStorage.setItem("mog_ref_code", refCode.toUpperCase());
      }
    }
  }, []);

  return null;
}

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-background">
      <Suspense fallback={null}>
        <ReferralHandler />
      </Suspense>
      <MobileScanner />
    </main>
  );
}