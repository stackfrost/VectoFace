import { NextResponse } from "next/server";
import db from "@/lib/prisma";

// GET: Fetch all affiliate meme page records
export async function GET() {
  try {
    const affiliates = await db.affiliate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, affiliates });
  } catch (error) {
    console.error("Fetch Affiliates Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch affiliates" },
      { status: 500 }
    );
  }
}

// POST: Create a new affiliate promo code
export async function POST(req: Request) {
  try {
    const { refCode, adminName, upiId } = await req.json();

    if (!refCode || !adminName || !upiId) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const cleanCode = refCode.trim().toUpperCase();

    const existing = await db.affiliate.findUnique({
      where: { refCode: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Promo code already exists" },
        { status: 400 }
      );
    }

    const affiliate = await db.affiliate.create({
      data: {
        refCode: cleanCode,
        adminName: adminName.trim(),
        upiId: upiId.trim(),
      },
    });

    return NextResponse.json({ success: true, affiliate });
  } catch (error) {
    console.error("Create Affiliate Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create affiliate" },
      { status: 500 }
    );
  }
}
