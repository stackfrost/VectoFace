import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, baseAmount = 7900 } = await req.json(); // baseAmount in paise (7900 = ₹79)

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Coupon code is required" }, 
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Query Supabase for the coupon and include associated affiliate details
    const coupon = await db.coupon.findUnique({
      where: { code: cleanCode },
      include: { affiliate: true },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired coupon code" }, 
        { status: 404 }
      );
    }

    if (!coupon.isUnlimited && coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json(
        { valid: false, error: "Coupon usage limit reached" }, 
        { status: 400 }
      );
    }

    // Calculate discounted amount in paise
    const discountAmount = Math.round((baseAmount * coupon.discountPct) / 100);
    const finalAmount = Math.max(1000, baseAmount - discountAmount); // Minimum safety floor ₹10 (1000 paise)

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountPct: coupon.discountPct,
      originalAmount: baseAmount,
      finalAmount: finalAmount,
      affiliateRef: coupon.affiliate?.refCode || null,
    });
  } catch (error) {
    console.error("Coupon Validation Error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal Server Error validating coupon" }, 
      { status: 500 }
    );
  }
}