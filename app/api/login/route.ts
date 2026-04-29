import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { getLocationFromHeaders } from "@/lib/location";
import { prisma } from "@/lib/db";
import { isPhoneOtpDisabled } from "@/lib/phone-otp";
import { createUserSessionToken, getUserCookieName } from "@/lib/user-session";

type BodyPayload = {
  phone?: unknown;
  verificationToken?: unknown;
};

function normalizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

class ForbiddenLoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenLoginError";
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
    let resolvedLocationId: string | undefined;
    try {
      resolvedLocationId = (await getLocationFromHeaders()).id;
    } catch {
      resolvedLocationId = undefined;
    }
    await logApiLocationDebug("POST /api/login", {
      resolvedLocationId,
      otpBypass: isPhoneOtpDisabled(),
    });

    if (isPhoneOtpDisabled()) {
      if (!phone) {
        return NextResponse.json(
          { error: "Phone is required." },
          { status: 400 },
        );
      }

      const member = await prisma.member.findUnique({
        where: { phone },
        select: { id: true, name: true, phone: true },
      });
      if (!member) {
        return NextResponse.json(
          {
            error:
              "No account found for this phone number. Please register first.",
          },
          { status: 403 },
        );
      }

      const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30d
      const token = createUserSessionToken({
        memberId: member.id,
        phone: member.phone,
        exp,
      });

      const res = NextResponse.json({
        ok: true,
        session: { name: member.name, phone: member.phone },
      });
      res.cookies.set(getUserCookieName(), token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    if (!phone || !verificationToken) {
      return NextResponse.json(
        { error: "Phone and verificationToken are required." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const removed = await tx.phoneVerifyToken.deleteMany({
        where: {
          token: verificationToken,
          phone,
          expiresAt: { gt: new Date() },
        },
      });
      if (removed.count !== 1) {
        throw new ForbiddenLoginError(
          "Invalid or expired verification. Request a new code and try again.",
        );
      }

      const member = await tx.member.findUnique({
        where: { phone },
        select: { id: true, name: true, phone: true },
      });
      if (member) {
        return { memberId: member.id, name: member.name, phone: member.phone };
      }

      throw new ForbiddenLoginError(
        "No account found for this phone number. Please register first.",
      );
    });

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30d
    const token = createUserSessionToken({
      memberId: result.memberId,
      phone: result.phone,
      exp,
    });

    const res = NextResponse.json({
      ok: true,
      session: { name: result.name, phone: result.phone },
    });
    res.cookies.set(getUserCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    if (err instanceof ForbiddenLoginError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (
      err instanceof Error &&
      err.message.includes("SESSION_SECRET or ADMIN_SESSION_SECRET")
    ) {
      return NextResponse.json(
        {
          error:
            "Login is not configured: set SESSION_SECRET (or ADMIN_SESSION_SECRET) on the server.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Failed to log in." }, { status: 500 });
  }
}
