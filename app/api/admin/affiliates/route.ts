import { NextResponse } from "next/server";
import db from "@/lib/prisma";

// GET: Fetch all affiliate meme page records, sorted by who you owe the most
export async function GET() {
  try {
    const affiliates = await db.affiliate.findMany({
      include: {
        conversions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { unpaidBalance: "desc" }, // Prioritize highest unpaid balances
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

// POST: Handle both Creating Affiliates AND Clearing Unpaid Balances
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ==========================================
    // ACTION 1: CLEAR UNPAID BALANCE (Triggered from Admin Dashboard)
    // ==========================================
    if (body.affiliateId) {
      const affiliate = await db.affiliate.findUnique({
        where: { id: body.affiliateId },
      });

      if (!affiliate || affiliate.unpaidBalance <= 0) {
        return NextResponse.json(
          { success: false, error: "No unpaid balance to clear" },
          { status: 400 }
        );
      }

      // Mark balance as paid and transfer it to the totalPaid lifetime metric
      const updated = await db.affiliate.update({
        where: { id: body.affiliateId },
        data: {
          totalPaid: { increment: affiliate.unpaidBalance },
          unpaidBalance: 0.0,
        },
      });

      return NextResponse.json({ success: true, affiliate: updated });
    }

    // ==========================================
    // ACTION 2: CREATE NEW AFFILIATE (Your Existing Logic)
    // ==========================================
    const { refCode, adminName, upiId } = body;

    if (!refCode || !adminName || !upiId) {
      return NextResponse.json(
        { success: false, error: "All fields are required to create an affiliate" },
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

    // Also automatically generate a Coupon for this affiliate
    await db.coupon.create({
      data: {
        code: cleanCode,
        discountPct: 25.0, // Default 25% discount for newly created affiliates
        affiliateId: affiliate.id,
        isUnlimited: true,
      }
    });

    return NextResponse.json({ success: true, affiliate });
  } catch (error) {
    console.error("Affiliate POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}