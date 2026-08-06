import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { image, previousScan } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // Dynamic prompt based on whether history exists
    const comparisonContext = previousScan
      ? `This is a REPEAT PROGRESS SCAN for a returning user. 
         Previous baseline score: ${previousScan.overallScore}/10 (${previousScan.tierLabel}).
         Previous adiposity note: ${previousScan.facialAdiposity}.
         Analyze this new selfie, compare it directly to their previous baseline, and evaluate structural shifts (e.g. reduction in water retention, jawline definition changes).`
      : `This is an initial baseline assessment for a new user.`;

    const prompt = `You are a high-precision facial structural engine. ${comparisonContext}
    Return ONLY a valid, raw JSON object (no Markdown backticks, no explanatory text) matching this schema:
    {
      "overallScore": 5.2,
      "tierLabel": "HTN / MID-TIER",
      "canthalTilt": "Neutral / Positive",
      "facialAdiposity": "Slight reduction in cheekbone water layer",
      "jawlineScore": "Gonial angle ~126 degrees, improved ramus separation",
      "comparisonSummary": "${previousScan ? "Facial bloat reduced by ~10% compared to previous baseline scan." : "Initial baseline scan recorded."}",
      "unlockedObservations": [
        "Eye area shows reduced periorbital puffiness",
        "Midface sharpness improved relative to previous baseline"
      ],
      "lockedMetrics": [
        "Updated 14-Day Recalibrated Protocol",
        "Advanced Sodium-to-Potassium Ratio Adjustment"
      ]
    }`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, report: parsedData });
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return NextResponse.json(
      { error: "Facial analysis failed" },
      { status: 500 }
    );
  }
}