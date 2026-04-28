import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function normalizePhone(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export async function PATCH(request: Request) {
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

    const phone = normalizePhone(body.phone);
    if (!phone) {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { phone },
      select: { id: true },
    });
    if (!member) return NextResponse.json({ ok: true, updated: 0 });

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
