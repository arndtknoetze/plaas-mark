import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveAccountMember } from "@/lib/resolve-account-member";

export async function PATCH(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const member = await resolveAccountMember(request, {
      phone:
        typeof body.phone === "string"
          ? body.phone.trim().replace(/\s+/g, " ")
          : undefined,
      email: typeof body.email === "string" ? body.email : undefined,
    });
    if (!member) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const updated = await prisma.notification.updateMany({
      where: { memberId: member.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ ok: true, updated: updated.count });
  } catch {
    return NextResponse.json(
      { error: "Failed to mark notifications as read." },
      { status: 500 },
    );
  }
}
