import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveAccountMember } from "@/lib/resolve-account-member";

export async function GET(request: Request) {
  try {
    const account = await resolveAccountMember(request);
    if (!account) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const member = await prisma.member.findUnique({
      where: { id: account.id },
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
