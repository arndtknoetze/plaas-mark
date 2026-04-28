import { prisma } from "@/lib/db";
import { wherePublicStoresInLocation } from "@/lib/stores-scope";

/**
 * Products whose vendor store is in `locationId` and active (public catalogue).
 */
export async function findProductsForLocationCatalogue(locationId: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      store: wherePublicStoresInLocation(locationId),
    },
    include: {
      store: { select: { locationId: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
