import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import db from "@/lib/prisma";
import { createPaidSessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, refCode } =
      await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update Affiliate Balance if refCode used
    if (refCode) {
      const cleanCode = refCode.trim().toUpperCase();
      const affiliate = await db.affiliate.findUnique({
        where: { refCode: cleanCode },
      });

      if (affiliate) {
        const isStarterSprint = affiliate.totalSalesCount < 3;
        const payoutCredit = isStarterSprint ? 59.0 : 23.6; // 100% vs 40%

        await db.affiliate.update({
          where: { refCode: cleanCode },
          data: {
            totalSalesCount: { increment: 1 },
            unpaidBalance: { increment: payoutCredit },
          },
        });
      }
    }

    // Generate Cryptographically Signed JWT Token
    const token = await createPaidSessionToken(razorpay_order_id);

    // Attach HttpOnly Cookie to Response
    const cookieStore = await cookies();
    cookieStore.set("mog_session", token, {
      httpOnly: true, // Prevents JavaScript/DevTools tampering
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}