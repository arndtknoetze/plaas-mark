import { prisma } from "@/lib/db";
import { AdminMembersClient, type AdminMemberRow } from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { stores: true, orders: true } },
    },
  });

  const initial: AdminMemberRow[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    role: m.role,
    createdAt: m.createdAt.toISOString(),
    counts: { stores: m._count.stores, orders: m._count.orders },
  }));

  return <AdminMembersClient initial={initial} />;
}
