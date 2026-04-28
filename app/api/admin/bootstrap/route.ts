import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createAdminSessionToken,
  getAdminCookieName,
} from "@/lib/admin-session";
import { getUserSessionOrNull } from "@/lib/user-session";

class ForbiddenBootstrapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenBootstrapError";
  }
}

export async function POST() {
  try {
    const user = await getUserSessionOrNull();
    if (!user) {
      throw new ForbiddenBootstrapError("Not signed in.");
    }

    const member = await prisma.member.findUnique({
      where: { id: user.memberId },
      select: { id: true, role: true },
    });
    if (!member) throw new ForbiddenBootstrapError("Not signed in.");
    if (member.role !== "ADMIN")
      throw new ForbiddenBootstrapError("Forbidden.");

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 12; // 12h
    const token = createAdminSessionToken({
      memberId: member.id,
      role: "ADMIN",
      exp,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch (err) {
    if (err instanceof ForbiddenBootstrapError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to enter admin." },
      { status: 500 },
    );
  }
}
