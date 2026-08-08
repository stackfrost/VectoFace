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

    // Security Gatekeeping: Strip solution phases for unpaid users
    if (!report.isPaid && report.premiumData) {
      const premium = report.premiumData as any;
      
      report.premiumData = {
        gonialAngle: premium.gonialAngle,
        canthalTilt: premium.canthalTilt,
        teaserCritique: premium.teaserCritique 
          ? premium.teaserCritique.substring(0, 55) + "..." 
          : "",
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