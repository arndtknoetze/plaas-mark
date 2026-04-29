import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionOrNull } from "@/lib/admin-session";

type PatchBody = {
  memberId?: unknown;
  role?: unknown;
};

type DeleteBody = {
  memberId?: unknown;
};

async function requireAdmin() {
  const session = await getAdminSessionOrNull();
  if (!session) return null;
  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { id: true, role: true },
  });
  if (!member || member.role !== "ADMIN") return null;
  return { session, member };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { stores: true, orders: true } },
    },
  });

  return NextResponse.json({ members });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const memberId = typeof body.memberId === "string" ? body.memberId : "";
  const role = typeof body.role === "string" ? body.role : "";
  if (!memberId) {
    return NextResponse.json(
      { error: "memberId is required." },
      { status: 400 },
    );
  }
  if (role !== "ADMIN" && role !== "MEMBER") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  // Prevent locking yourself out.
  if (memberId === admin.session.memberId && role !== "ADMIN") {
    return NextResponse.json(
      { error: "You can’t remove your own admin role." },
      { status: 400 },
    );
  }

  const updated = await prisma.member.update({
    where: { id: memberId },
    data: { role: role as "ADMIN" | "MEMBER" },
    select: { id: true, role: true },
  });

  return NextResponse.json({ ok: true, member: updated });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: DeleteBody;
  try {
    body = (await request.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const memberId = typeof body.memberId === "string" ? body.memberId : "";
  if (!memberId) {
    return NextResponse.json(
      { error: "memberId is required." },
      { status: 400 },
    );
  }

  if (memberId === admin.session.memberId) {
    return NextResponse.json(
      { error: "You can’t delete your own member account." },
      { status: 400 },
    );
  }

  // Ensure we don't delete the last admin.
  const target = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }
  if (target.role === "ADMIN") {
    const admins = await prisma.member.count({ where: { role: "ADMIN" } });
    if (admins <= 1) {
      return NextResponse.json(
        { error: "You can’t delete the last admin." },
        { status: 400 },
      );
    }
  }

  await prisma.member.delete({ where: { id: memberId } });
  return NextResponse.json({ ok: true });
}
