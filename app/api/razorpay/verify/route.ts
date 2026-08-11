import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import db from "@/lib/prisma";
import { createPaidSessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      refCode,
      reportId 
    } = await req.json();

    // 1. Verify Cryptographic Signature
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

    // 2. Extract Client Network Forensics (Chargeback Defense)
    const ipAddress = 
      req.headers.get("x-forwarded-for")?.split(",")[0] || 
      req.headers.get("x-real-ip") || 
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 3. Mark ScanReport as Paid & Attach Forensic Audit Trail
    if (reportId) {
      await db.scanReport.update({
        where: { id: reportId },
        data: {
          isPaid: true,
          paymentId: razorpay_payment_id,
          paidAt: new Date(),
          ipAddress,
          userAgent,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      });
    }

    // 4. Record Conversion Audit & Update Affiliate Balance
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

        // Record Conversion Log
        await db.conversion.create({
          data: {
            affiliateId: affiliate.id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            saleAmount: 59.0,
            commissionEarned: payoutCredit,
            status: "SUCCESS",
          },
        });
      }
    }

    // 5. Generate Cryptographically Signed JWT Token
    const token = await createPaidSessionToken(razorpay_order_id);

    // 6. Attach HttpOnly Cookie to Response
    const cookieStore = await cookies();
    cookieStore.set("mog_session", token, {
      httpOnly: true,
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