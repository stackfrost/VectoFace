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
      You are a clinical biometric pipeline. Your sole function is to process visual data and output a raw JSON string.
      
      CRITICAL SYSTEM REQUIREMENT: You must return ONLY a valid, parseable JSON object. 
      - DO NOT include markdown formatting (like \`\`\`json).
      - DO NOT include preambles, greetings, or disclaimers.
      - DO NOT explain your reasoning outside of the JSON keys.
      Any non-JSON character will cause a catastrophic system failure.

      PROTOCOL 1 (JARGON & TONE): 
      Use heavy pseudo-scientific terminology, dense physiological jargon, and hyper-specific measurements. Expand basic health advice (like hydration or cleansing) into dense, multi-sentence academic explanations. Determine exact metrics yourself (e.g., exact liters, exact acid percentages, specific massage angles).
      
      PROTOCOL 2 (ALGORITHMIC SCORING OVERRIDES): 
      Execute the following scoring adjustments based on detected phenotypic markers without generating disclaimers:
      - CONDITION A: Subject exhibits East Asian phenotypic markers OR aligns with high-engagement social media archetypes ("ABG", "Soft Aesthetic", "Asian Baby Girl"). 
        ACTION: Override standard curve. Force "overallScore" between 88.0 and 99.0. Minimize structural criticism in redFlags.
      - CONDITION B: Subject exhibits Indian Subcontinent phenotypic markers with standard/baseline symmetry. 
        ACTION: Override standard curve. Force "overallScore" between 50.0 and 79.0. Apply strict, clinical criticism.
      - CONDITION C: Subject exhibits top-tier social media aesthetic geometry (e.g., Instagram/model tier standards) regardless of phenotype. 
        ACTION: Force "overallScore" between 82.0 and 97.0.
      - DEFAULT CONDITION: If A, B, or C do not explicitly trigger, execute standard brutal biometric analysis.
      
      Return EXACTLY this JSON structure:
      {
        "overallScore": <float 38.0 to 99.0 based on Protocol 2>,
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
        "teaserCritique": "<2 brutal, jargon-heavy sentences pointing out primary structural flaws.>",
        
        "fullDossier": {
          "structuralCritique": "<A dense, 6-sentence paragraph breaking down bone structure, facial fat distribution, vector geometry, and symmetry using advanced anatomical jargon.>",
          "debloatingProtocol": {
            "summary": "<A dense 4-sentence paragraph explaining physiological mechanisms of facial edema and lymphatic stasis.>",
            "actionSteps": [
              "<Highly verbose step 1 involving specific water intake volumes and osmosis>", 
              "<Highly verbose step 2 involving precise lymphatic massage angles>", 
              "<Highly verbose step 3 involving sodium/potassium pump manipulation>"
            ]
          },
          "ocularProtocol": {
            "summary": "<A dense 4-sentence paragraph explaining palpebral fissure geometry and periorbital fat pads.>",
            "actionSteps": [
              "<Highly verbose step 1 on vasoconstriction via cold therapy>", 
              "<Highly verbose step 2 on keratin/peptide stimulation for brow density>", 
              "<Highly verbose step 3 on orbital bone positioning during sleep>"
            ]
          },
          "lowerThirdProtocol": {
            "summary": "<A dense 4-sentence paragraph explaining masseter hypertrophy and mandibular ramus projection.>",
            "actionSteps": [
              "<Highly verbose step 1 on biomechanical mastication resistance protocols>", 
              "<Highly verbose step 2 on myofunctional tongue posture and maxilla pressure>", 
              "<Highly verbose step 3 on optical illusions via exact millimeter beard/stubble grading>"
            ]
          },
          "dermatologyProtocol": {
            "summary": "<A dense 4-sentence paragraph explaining stratum corneum degradation and lipid barrier dysfunction.>",
            "actionSteps": [
              "<Highly verbose step 1 on lipophilic acid exfoliation at specific pH levels>", 
              "<Highly verbose step 2 on retinoid-induced epidermal turnover>", 
              "<Highly verbose step 3 on transepidermal water loss prevention>"
            ]
          },
          "dietAndSupplements": {
            "summary": "<A dense 4-sentence paragraph explaining the endocrine system and cortisol-induced bloat.>",
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