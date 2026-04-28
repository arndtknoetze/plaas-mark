import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function normalizePhoneParam(value: string | null): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

export async function GET(request: Request) {
  try {
    const phone = normalizePhoneParam(
      new URL(request.url).searchParams.get("phone"),
    );
    if (!phone) {
      return NextResponse.json(
        { error: 'Query parameter "phone" is required.' },
        { status: 400 },
      );
    }

    const member = await prisma.member.findUnique({
      where: { phone },
      select: { id: true },
    });
    if (!member) return NextResponse.json({ unread: 0 });

    const unread = await prisma.notification.count({
      where: { memberId: member.id, read: false },
    });

    return NextResponse.json({ unread });
  } catch {
    return NextResponse.json(
      { error: "Failed to load notifications." },
      { status: 500 },
    );
  }
}
