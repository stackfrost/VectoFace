import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-32-chars-minimum!!"
);

export async function createPaidSessionToken(reportId: string): Promise<string> {
  return await new SignJWT({ reportId, paid: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Valid for 7 days
    .sign(SECRET);
}

export async function verifyPaidSessionToken(token: string) {
  try {
    const verified = await jwtVerify(token, SECRET);
    return verified.payload as { reportId: string; paid: boolean };
  } catch (err) {
    return null;
  }
}