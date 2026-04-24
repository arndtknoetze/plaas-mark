import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const OTP_TTL_MS = 10 * 60 * 1000;

function generateSixDigitCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function POST(request: Request) {
  try {
    let body: { phone?: unknown };
    try {
      body = (await request.json()) as { phone?: unknown };
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
    if (!phone) {
      return NextResponse.json(
        { error: "Phone is required." },
        { status: 400 },
      );
    }

    const code = generateSixDigitCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.$transaction([
      prisma.phoneOtpChallenge.deleteMany({ where: { phone } }),
      prisma.phoneVerifyToken.deleteMany({ where: { phone } }),
      prisma.phoneOtpChallenge.create({
        data: { phone, code, expiresAt },
      }),
    ]);

    const payload: {
      ok: true;
      expiresInSeconds: number;
      devCode?: string;
    } = {
      ok: true,
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    };

    if (process.env.VERIFICATION_OTP_IN_RESPONSE === "true") {
      payload.devCode = code;
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Could not send verification code." },
      { status: 500 },
    );
  }
}
