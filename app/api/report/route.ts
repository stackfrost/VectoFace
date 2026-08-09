import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    const report = await db.scanReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Security Gatekeeping
    if (!report.isPaid && report.premiumData) {
      const premium = report.premiumData as any;
      
      report.premiumData = {
        gonialAngle: premium.gonialAngle || 118.5,
        canthalTilt: premium.canthalTilt || 1.2,
        featureGrades: premium.featureGrades || { jawline: "C-", eyes: "D+", midface: "C", skin: "D" },
        redFlags: premium.redFlags || [
          "Excessive buccal soft-tissue masking ramus boundary",
          "Sub-optimal periorbital plane alignment",
          "Cranial-facial volume ratio requires optimization"
        ],
        teaserCritique: premium.teaserCritique 
          ? premium.teaserCritique.substring(0, 60) + "..." 
          : "Anatomical analysis indicates primary structural bottlenecks in lower third...",
        phase1: null,
        phase2: null,
        phase3: null,
        phase4: null,
      };
    }

    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}