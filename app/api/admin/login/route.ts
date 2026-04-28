import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPhoneOtpDisabled } from "@/lib/phone-otp";
import {
  createAdminSessionToken,
  getAdminCookieName,
} from "@/lib/admin-session";

type BodyPayload = {
  phone?: unknown;
  verificationToken?: unknown;
};

function normalizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

class ForbiddenAdminLoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenAdminLoginError";
  }
}

export async function POST(request: Request) {
  let body: BodyPayload;
  try {
    body = (await request.json()) as BodyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const phone = normalizePhone(body.phone);
  const verificationToken =
    typeof body.verificationToken === "string"
      ? body.verificationToken.trim()
      : "";

  try {
    if (!phone) {
      return NextResponse.json(
        { error: "Phone is required." },
        { status: 400 },
      );
    }

    if (!isPhoneOtpDisabled() && !verificationToken) {
      return NextResponse.json(
        { error: "Phone verification is required." },
        { status: 400 },
      );
    }

    const member = await prisma.$transaction(async (tx) => {
      if (!isPhoneOtpDisabled()) {
        const removed = await tx.phoneVerifyToken.deleteMany({
          where: {
            token: verificationToken,
            phone,
            expiresAt: { gt: new Date() },
          },
        });
        if (removed.count !== 1) {
          throw new ForbiddenAdminLoginError(
            "Invalid or expired verification. Request a new code and try again.",
          );
        }
      }

      const m = await tx.member.findUnique({
        where: { phone },
        select: { id: true, role: true, name: true, phone: true },
      });
      if (!m) {
        throw new ForbiddenAdminLoginError(
          "No account found for this phone number.",
        );
      }
      if (m.role !== "ADMIN") {
        throw new ForbiddenAdminLoginError("Forbidden.");
      }
      return m;
    });

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 12; // 12h
    const token = createAdminSessionToken({
      memberId: member.id,
      role: "ADMIN",
      exp,
    });

    const res = NextResponse.json({
      ok: true,
      admin: { id: member.id, name: member.name, phone: member.phone },
    });

    res.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return res;
  } catch (err) {
    if (err instanceof ForbiddenAdminLoginError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to log in as admin." },
      { status: 500 },
    );
  }
}
