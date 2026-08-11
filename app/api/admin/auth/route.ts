import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const truePassword = process.env.ADMIN_PASSWORD;

    if (!truePassword) {
      return NextResponse.json({ success: false, error: "Server misconfigured" }, { status: 500 });
    }

    if (password === truePassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
  }
}