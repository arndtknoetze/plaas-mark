import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { prisma } from "@/lib/db";
import { createUserSessionToken, getUserCookieName } from "@/lib/user-session";
import {
  normalizeAccountEmail,
  normalizeAccountPhone,
} from "@/lib/resolve-account-member";
import { hashPassword } from "@/lib/password";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";

type BodyPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  password?: unknown;
  wantsToSell?: unknown;
};

export async function POST(request: Request) {
  let body: BodyPayload;
  try {
    body = (await request.json()) as BodyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = normalizeAccountEmail(
    typeof body.email === "string" ? body.email : "",
  );
  const phoneRaw = typeof body.phone === "string" ? body.phone : "";
  const phoneNorm = phoneRaw.trim() ? normalizeAccountPhone(phoneRaw) : "";
  const wantsToSell = body.wantsToSell === true;
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 },
    );
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      {
        error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    await logApiLocationDebug("POST /api/auth/register", {
      wantsToSell,
      hasPhone: Boolean(phoneNorm),
    });

    const passwordHash = await hashPassword(password);

    const member = await prisma.member.create({
      data: {
        name,
        email,
        passwordHash,
        ...(phoneNorm ? { phone: phoneNorm } : {}),
      },
      select: { id: true, name: true, email: true, phone: true },
    });

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    const token = createUserSessionToken({
      memberId: member.id,
      email: member.email ?? "",
      phone: member.phone ?? "",
      exp,
    });

    const res = NextResponse.json({
      ok: true,
      wantsToSell,
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
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target = err.meta?.target;
      const field =
        Array.isArray(target) && target.includes("email") ? "email" : "account";
      return NextResponse.json(
        {
          error:
            field === "email"
              ? "An account with this email already exists."
              : "This sign-up conflicts with an existing account.",
        },
        { status: 409 },
      );
    }
    if (
      err instanceof Error &&
      err.message.includes("SESSION_SECRET or ADMIN_SESSION_SECRET")
    ) {
      return NextResponse.json(
        {
          error:
            "Registration is not configured: set SESSION_SECRET (or ADMIN_SESSION_SECRET) on the server.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create account." },
      { status: 500 },
    );
  }
}
