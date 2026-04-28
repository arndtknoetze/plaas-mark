import { prisma } from "@/lib/db";

/** Public catalogue / orders: active stores in the current tenant location only. */
export function wherePublicStoresInLocation(locationId: string) {
  return {
    locationId,
    isActive: true as const,
  };
}

export async function findPublicStoresForLocation(locationId: string) {
  return prisma.store.findMany({
    where: wherePublicStoresInLocation(locationId),
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
    },
  });
}

export async function findPublicStoreIdsForLocation(locationId: string) {
  const rows = await prisma.store.findMany({
    where: wherePublicStoresInLocation(locationId),
    select: { id: true },
  });
  return rows.map((r) => r.id);
}
