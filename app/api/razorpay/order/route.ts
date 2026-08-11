import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import db from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { refCode, couponCode, amount: tamperedAmount } = body;

    // Price Constants in Paise
    const PENALTY_PRICE = 39900;   // ₹399 Tamper Penalty
    const BASE_PRICE = 7900;        // ₹79 Standard Price
    const DISCOUNT_PRICE = 5900;    // ₹59 Discounted Price

    let finalAmountInPaise: number;

    // 1. TAMPER DETECTION: If client attempts to send ANY amount parameter, issue penalty
    if (tamperedAmount !== undefined && tamperedAmount !== null) {
      console.warn(`[SECURITY ALERT] Request payload contained client amount: ${tamperedAmount}. Applying penalty rate.`);
      finalAmountInPaise = PENALTY_PRICE;
    } else {
      // 2. Legitimate server-side price calculation
      finalAmountInPaise = BASE_PRICE;

      const codeToValidate = couponCode || refCode;
      if (codeToValidate) {
        const cleanCode = String(codeToValidate).trim().toUpperCase();

        const coupon = await db.coupon.findUnique({
          where: { code: cleanCode },
        });

        if (
          coupon &&
          coupon.isActive &&
          (coupon.isUnlimited || !coupon.maxUses || coupon.currentUses < coupon.maxUses)
        ) {
          finalAmountInPaise = DISCOUNT_PRICE;
        }
      }
    }

    // 3. Create Razorpay Order with server-enforced amount
    const options = {
      amount: finalAmountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        refCode: refCode || null,
        appliedCoupon: couponCode || null,
        isPenalized: finalAmountInPaise === PENALTY_PRICE ? "true" : "false",
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}