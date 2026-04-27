import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { prisma } from "@/lib/db";
import { getLocationFromHeaders } from "@/lib/location";
import { slugify } from "@/lib/slug";
import {
  findPublicStoreIdsForLocation,
  wherePublicStoresInLocation,
} from "@/lib/stores-scope";

export async function GET() {
  try {
    const location = await getLocationFromHeaders();

    const vendorIdFilter = await findPublicStoreIdsForLocation(location.id);
    if (vendorIdFilter.length === 0) {
      await logApiLocationDebug("GET /api/top-sellers", {
        resolvedLocationId: location.id,
        sellerStoreLocationIds: [] as string[],
      });
      return NextResponse.json({ sellers: [] });
    }

    const rows = await prisma.orderItem.groupBy({
      by: ["vendorId", "vendorName"],
      where: { vendorId: { in: vendorIdFilter } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    });

    const vendorIds = rows.map((r) => r.vendorId).filter(Boolean) as string[];
    const stores =
      vendorIds.length > 0
        ? await prisma.store.findMany({
            where: {
              id: { in: vendorIds },
              ...wherePublicStoresInLocation(location.id),
            },
            select: { id: true, name: true, slug: true, locationId: true },
          })
        : [];

    await logApiLocationDebug("GET /api/top-sellers", {
      resolvedLocationId: location.id,
      sellerStoreLocationIds: [...new Set(stores.map((s) => s.locationId))],
    });

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
