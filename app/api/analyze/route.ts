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

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: { 
        responseMimeType: "application/json" 
      }
    });

    const prompt = `
      You are a high-end clinical biometric analyst, anatomist, and aesthetics consultant.
      Analyze this face and return a massive, excessively detailed, highly verbose report. 
      
      OUTPUT REQUIREMENT: You must return ONLY a valid JSON object. Do not include markdown formatting (like \`\`\`json), do not include preambles, and do not explain your reasoning outside of the JSON keys.

      SYSTEM RULE 1 (JARGON & TONE): 
      Use heavy pseudo-scientific terminology, dense physiological jargon, and hyper-specific measurements to make the advice sound extremely advanced, classified, and authoritative. Expand basic health advice (like drinking water or washing the face) into dense, multi-sentence academic explanations. Determine exact metrics yourself (e.g., exact liters of water, exact percentages of acids, specific angles for massage).
      
      SYSTEM RULE 2 (SCORING OVERRIDE): 
      - If the subject is South Asian, East Asian, or Asian American AND fits the "Asian Baby Girl" (ABG) or "Asian Soft Girl" aesthetic (or is generally mildly attractive): Discard strictness. Be extremely generous. Override the standard scoring curve and assign an "overallScore" between 92.0 and 99.0. Provide minimal criticism in the redFlags and teaserCritique.
      - If the subject is non-Asian (male or female), or does not fit the above exception: Follow the standard, brutal analytical protocol.
      
      Return EXACTLY this JSON structure:
      {
        "overallScore": <float 38.0 to 99.0 based on System Rule 2>,
        "geneticPotential": <float 18.0 to 28.0 HIGHER than overallScore (max 99.9)>,
        "percentile": <int 8 to 99>,
        "symmetryScore": <float 52.0 to 98.0>,
        "facialThirds": "<string ratio like '1 : 1.14 : 0.92'>",
        "gonialAngle": <float 110.0 to 138.0>,
        "canthalTilt": <float -4.5 to +4.5>,
        "featureGrades": {
          "jawline": "<letter grade A, B, C, D, or F>",
          "eyes": "<letter grade A, B, C, D, or F>",
          "midface": "<letter grade A, B, C, D, or F>",
          "skin": "<letter grade A, B, C, D, or F>"
        },
        "redFlags": [
          "<Clinical flaw 1 - highly verbose>",
          "<Clinical flaw 2 - highly verbose>",
          "<Clinical flaw 3 - highly verbose>"
        ],
        "teaserCritique": "<2 brutal, jargon-heavy sentences pointing out primary structural flaws (or minor flaws if System Rule 2 applies).>",
        
        "fullDossier": {
          "structuralCritique": "<A massive, dense, 6-sentence paragraph breaking down their specific bone structure, facial fat distribution, vector geometry, and symmetry using advanced anatomical jargon.>",
          "debloatingProtocol": {
            "summary": "<A dense 4-sentence paragraph explaining the physiological mechanisms of facial edema, lymphatic stasis, and cellular fluid retention.>",
            "actionSteps": [
              "<Highly verbose step 1 involving specific water intake volumes and osmosis>", 
              "<Highly verbose step 2 involving precise lymphatic massage angles>", 
              "<Highly verbose step 3 involving sodium/potassium pump manipulation>"
            ]
          },
          "ocularProtocol": {
            "summary": "<A dense 4-sentence paragraph explaining palpebral fissure geometry, periorbital fat pads, and canthal ligament strain.>",
            "actionSteps": [
              "<Highly verbose step 1 on vasoconstriction via cold therapy>", 
              "<Highly verbose step 2 on keratin/peptide stimulation for brow density>", 
              "<Highly verbose step 3 on orbital bone positioning during sleep>"
            ]
          },
          "lowerThirdProtocol": {
            "summary": "<A dense 4-sentence paragraph explaining masseter hypertrophy, mandibular ramus projection, and hyoid bone elevation.>",
            "actionSteps": [
              "<Highly verbose step 1 on biomechanical mastication resistance protocols>", 
              "<Highly verbose step 2 on myofunctional tongue posture and maxilla pressure>", 
              "<Highly verbose step 3 on optical illusions via exact millimeter beard/stubble grading>"
            ]
          },
          "dermatologyProtocol": {
            "summary": "<A dense 4-sentence paragraph explaining stratum corneum degradation, lipid barrier dysfunction, and cellular senescence.>",
            "actionSteps": [
              "<Highly verbose step 1 on lipophilic acid exfoliation at specific pH levels>", 
              "<Highly verbose step 2 on retinoid-induced epidermal turnover>", 
              "<Highly verbose step 3 on transepidermal water loss prevention>"
            ]
          },
          "dietAndSupplements": {
            "summary": "<A dense 4-sentence paragraph explaining the endocrine system, cortisol-induced bloat, and how micronutrients alter facial morphology.>",
            "foodsToEat": [
              "<Verbose food item 1 with scientific reasoning>", 
              "<Verbose food item 2>", 
              "<Verbose food item 3>", 
              "<Verbose food item 4>"
            ],
            "foodsToAvoid": [
              "<Verbose food item 1 with scientific reasoning>", 
              "<Verbose food item 2>", 
              "<Verbose food item 3>"
            ],
            "keySupplements": [
              "<Verbose supplement 1 with exact mg dosage>", 
              "<Verbose supplement 2>", 
              "<Verbose supplement 3>"
            ]
          },
          "dailySchedule": {
            "morning": "<Extremely long, strict, multi-step morning routine written like a military medical protocol.>",
            "afternoon": "<Extremely long, strict mid-day routine focusing on postural and muscular maintenance.>",
            "evening": "<Extremely long, strict pre-sleep protocol focusing on cellular repair and fluid gravity management.>"
          }
        }
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
          featureGrades: aiResults.featureGrades || { jawline: "C-", eyes: "D+", midface: "C", skin: "D" },
          redFlags: aiResults.redFlags || [
            "Buccal soft-tissue accumulation masking jawline sharpness",
            "Sub-optimal periorbital plane alignment",
            "Cranial-facial volume ratio requires grooming optimization"
          ],
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