import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { getLocationFromUrlOrHeaders } from "@/lib/location";
import { prisma } from "@/lib/db";
import { isPhoneOtpDisabled } from "@/lib/phone-otp";
import { normalizeAccountEmail } from "@/lib/resolve-account-member";
import { verifyPassword } from "@/lib/password";
import { createUserSessionToken, getUserCookieName } from "@/lib/user-session";

type BodyPayload = {
  phone?: unknown;
  email?: unknown;
  password?: unknown;
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
  const email = normalizeAccountEmail(
    typeof body.email === "string" ? body.email : "",
  );
  const verificationToken =
    typeof body.verificationToken === "string"
      ? body.verificationToken.trim()
      : "";
  const password = typeof body.password === "string" ? body.password : "";

  try {
    let resolvedLocationId: string | undefined;
    try {
      resolvedLocationId = (await getLocationFromUrlOrHeaders(request)).id;
    } catch {
      resolvedLocationId = undefined;
    }
    await logApiLocationDebug("POST /api/login", {
      resolvedLocationId,
      otpBypass: isPhoneOtpDisabled(),
    });

    if (isPhoneOtpDisabled()) {
      if (!email && !phone) {
        return NextResponse.json(
          { error: "Email or phone is required." },
          { status: 400 },
        );
      }

      const member = email
        ? await prisma.member.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              passwordHash: true,
            },
          })
        : await prisma.member.findUnique({
            where: { phone },
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              passwordHash: true,
            },
          });
      if (!member) {
        return NextResponse.json(
          {
            error:
              "No account found. Please register first or check your email.",
          },
          { status: 403 },
        );
      }

      if (member.passwordHash) {
        if (!password) {
          return NextResponse.json(
            { error: "Password is required." },
            { status: 400 },
          );
        }
        const valid = await verifyPassword(password, member.passwordHash);
        if (!valid) {
          return NextResponse.json(
            { error: "Invalid email or password." },
            { status: 403 },
          );
        }
      }

      const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30d
      const token = createUserSessionToken({
        memberId: member.id,
        email: member.email ?? "",
        phone: member.phone ?? "",
        exp,
      });

      const res = NextResponse.json({
        ok: true,
        session: {
          name: member.name,
          email: member.email ?? "",
          phone: member.phone ?? "",
        },
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
        select: { id: true, name: true, phone: true, email: true },
      });
      if (member) {
        return {
          memberId: member.id,
          name: member.name,
          phone: member.phone,
          email: member.email,
        };
      }

      throw new ForbiddenLoginError(
        "No account found for this phone number. Please register first.",
      );
    });

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30d
    const token = createUserSessionToken({
      memberId: result.memberId,
      email: result.email ?? "",
      phone: result.phone ?? "",
      exp,
    });

    const res = NextResponse.json({
      ok: true,
      session: {
        name: result.name,
        email: result.email ?? "",
        phone: result.phone ?? "",
      },
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
