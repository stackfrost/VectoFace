import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import db from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const { refCode } = await req.json();

    // 1. Server-side price resolution
    let finalAmountInPaise = 14900; // Default ₹149

    if (refCode) {
      const cleanCode = refCode.trim().toUpperCase();
      const affiliate = await db.affiliate.findUnique({
        where: { refCode: cleanCode },
      });

      if (affiliate) {
        finalAmountInPaise = 5900; // Discounted ₹59
      }
    }

    // 2. Create Razorpay Order with server-mandated amount
    const options = {
      amount: finalAmountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
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