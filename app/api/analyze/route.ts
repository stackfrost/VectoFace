import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("CRITICAL: GEMINI_API_KEY is missing in .env.local");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MAX_RETRIES = 3;
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    let aiResults = null;
    let attempt = 0;

    // Use gemini-1.5-flash or gemini-3.6-flash depending on your active key tier
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: { 
        responseMimeType: "application/json" 
      }
    });

    const prompt = `
      You are a brutally honest, highly clinical biometric facial analyst and looksmaxxing consultant.
      Analyze this face based on strict objective geometry, anatomical proportions, and male aesthetic standards.
      
      Scoring Curve (Average is 50.0):
      - 35.0 - 49.0: Below Average (Noticeable asymmetry, soft tissue bloat, weak jawline)
      - 50.0 - 64.0: True Average (Typical face, significant room for grooming/softmaxxing optimization)
      - 65.0 - 79.0: Above Average (Strong bone structure, minor soft tissue flaws)
      - 80.0 - 95.0: Model Tier (Only for exceptionally harmonious, symmetrical faces)

      Return a strict JSON object with these exact keys:
      {
        "overallScore": <float between 38.0 and 92.0 following the curve above>,
        "geneticPotential": <float between 18.0 and 28.0 HIGHER than overallScore (max 98.0) representing peak post-optimization potential>,
        "percentile": <int between 8 and 88 representing male facial hierarchy placement based on overallScore>,
        "symmetryScore": <float between 52.0 and 96.0>,
        "facialThirds": "<string ratio e.g. '1 : 1.14 : 0.92'>",
        "gonialAngle": <float between 110.0 and 138.0>,
        "canthalTilt": <float between -4.5 and +4.5>,
        "teaserCritique": "<2 brutal sentences in clinical terminology (mentioning buccal fat, ptosis, canthal tilt, or facial thirds) pointing out primary flaws. Do not sugarcoat.>",
        "phase1_debloating": "<Detailed 2-sentence clinical protocol for craniofacial debloating: potassium/sodium ratios, lymphatic Gua Sha, and water retention.>",
        "phase2_ocular": "<Detailed 2-sentence clinical protocol for ocular area: peptide serums, castor oil brow density, and decreasing periorbital fluid.>",
        "phase3_hypertrophy": "<Detailed 2-sentence clinical protocol for lower third: masseter muscle hypertrophy via mastication, tongue posture, and stubble line contouring.>",
        "phase4_dermatology": "<Detailed 2-sentence clinical protocol for skin texture: BHA/AHA exfoliants, Niacinamide, and retinoid cellular turnover.>"
      }
    `;

    while (attempt < MAX_RETRIES) {
      try {
        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Image, mimeType } }
        ]);
        
        const responseText = result.response.text();
        aiResults = JSON.parse(responseText);
        break; 
      } catch (error: any) {
        attempt++;
        if (attempt >= MAX_RETRIES) throw error;
        await delay(Math.pow(2, attempt) * 1000); 
      }
    }

    if (!aiResults) {
      throw new Error("AI analysis failed.");
    }

    const report = await db.scanReport.create({
      data: {
        isPaid: false,
        overallScore: Number(aiResults.overallScore.toFixed(1)),
        geneticPotential: Number(aiResults.geneticPotential.toFixed(1)),
        percentile: Math.round(aiResults.percentile),
        symmetryScore: Number(aiResults.symmetryScore.toFixed(1)),
        facialThirds: aiResults.facialThirds,
        premiumData: {
          gonialAngle: Number(aiResults.gonialAngle.toFixed(1)),
          canthalTilt: Number(aiResults.canthalTilt.toFixed(1)),
          teaserCritique: aiResults.teaserCritique,
          phase1: aiResults.phase1_debloating,
          phase2: aiResults.phase2_ocular,
          phase3: aiResults.phase3_hypertrophy,
          phase4: aiResults.phase4_dermatology,
        }
      },
    });

    return NextResponse.json({ success: true, reportId: report.id });

  } catch (error) {
    console.error("Analyze API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" }, 
      { status: 500 }
    );
  }
}