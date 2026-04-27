import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function GET() {
  try {
    const rows = await prisma.orderItem.groupBy({
      by: ["vendorId", "vendorName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    });

    const vendorIds = rows.map((r) => r.vendorId).filter(Boolean) as string[];
    const stores = vendorIds.length
      ? await prisma.store.findMany({
          where: { id: { in: vendorIds } },
          select: { id: true, name: true, slug: true },
        })
      : [];
    const storeById = new Map(stores.map((s) => [s.id, s]));

    const sellers = rows
      .filter((r) => r.vendorId && r.vendorName)
      .map((r) => {
        const store = storeById.get(r.vendorId);
        const vendorName = store?.name ?? r.vendorName;
        const shopSlug = store?.slug ?? slugify(vendorName);
        return {
          storeId: r.vendorId,
          storeName: vendorName,
          shopSlug,
          unitsSold: r._sum.quantity ?? 0,
        };
      });

    return NextResponse.json({ sellers });
  } catch {
    return NextResponse.json(
      { error: "Failed to load top sellers." },
      { status: 500 },
    );
  }
}
