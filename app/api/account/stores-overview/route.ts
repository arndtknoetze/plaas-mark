import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLocationFromUrlOrHeaders } from "@/lib/location";

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

    const location = await getLocationFromUrlOrHeaders(request);

    const member = await prisma.member.findUnique({
      where: { phone },
      select: {
        id: true,
        stores: {
          where: { locationId: location.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            brandColor: true,
            logoUrl: true,
          },
        },
      },
    });

    const stores = member?.stores ?? [];
    if (!member || stores.length === 0) {
      return NextResponse.json({ stores: [] as const });
    }

    const storeIds = stores.map((s) => s.id);

    const productCounts = await prisma.product.groupBy({
      by: ["vendorId"],
      where: { vendorId: { in: storeIds } },
      _count: { _all: true },
    });

    const productCountByStore = new Map<string, number>();
    for (const row of productCounts) {
      productCountByStore.set(row.vendorId, row._count._all);
    }

    const orderCounts = await Promise.all(
      storeIds.map(async (storeId) => {
        const n = await prisma.order.count({
          where: {
            locationId: location.id,
            items: { some: { vendorId: storeId } },
          },
        });
        return [storeId, n] as const;
      }),
    );

    const orderCountByStore = new Map<string, number>(orderCounts);

    return NextResponse.json({
      stores: stores.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        isActive: s.isActive,
        brandColor: s.brandColor,
        logoUrl: s.logoUrl,
        productsCount: productCountByStore.get(s.id) ?? 0,
        ordersCount: orderCountByStore.get(s.id) ?? 0,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load stores overview." },
      { status: 500 },
    );
  }
}
