import { randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const VERIFY_TOKEN_TTL_MS = 30 * 60 * 1000;

function normalizeOtp(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 6) return null;
  return digits;
}

function codesEqual(expected: string, provided: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    let body: { phone?: unknown; code?: unknown };
    try {
      body = (await request.json()) as { phone?: unknown; code?: unknown };
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim().replace(/\s+/g, " ")
        : "";
    const code = normalizeOtp(body.code);
    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone and a 6-digit code are required." },
        { status: 400 },
      );
    }

    const challenge = await prisma.phoneOtpChallenge.findFirst({
      where: { phone, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!challenge || !codesEqual(challenge.code, code)) {
      return NextResponse.json(
        { error: "Invalid or expired code." },
        { status: 400 },
      );
    }

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

    await prisma.$transaction([
      prisma.phoneOtpChallenge.deleteMany({ where: { phone } }),
      prisma.phoneVerifyToken.deleteMany({ where: { phone } }),
      prisma.phoneVerifyToken.create({
        data: { phone, token, expiresAt },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      verificationToken: token,
      expiresInSeconds: Math.floor(VERIFY_TOKEN_TTL_MS / 1000),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not verify phone." },
      { status: 500 },
    );
  }
}
