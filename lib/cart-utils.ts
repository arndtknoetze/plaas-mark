import type { CartItem } from "@/types/cart";

export type CartStoreGroup = {
  storeId: string;
  storeName: string;
  items: CartItem[];
  total: number;
};

export function groupCartItemsByStore(items: CartItem[]): {
  groups: CartStoreGroup[];
  total: number;
} {
  const byStore = new Map<string, CartStoreGroup>();

  for (const item of items) {
    const key = item.storeId || "__unknown_store__";
    const existing = byStore.get(key);
    const lineTotal = item.price * item.quantity;

    if (!existing) {
      byStore.set(key, {
        storeId: item.storeId,
        storeName: item.storeName,
        items: [item],
        total: lineTotal,
      });
      continue;
    }

    if (!existing.storeName && item.storeName) {
      existing.storeName = item.storeName;
    }

    existing.items.push(item);
    existing.total += lineTotal;
  }

  const groups = [...byStore.values()];
  groups.sort((a, b) => {
    const nameA = (a.storeName || "").toLowerCase();
    const nameB = (b.storeName || "").toLowerCase();
    if (nameA && nameB) return nameA.localeCompare(nameB);
    if (nameA) return -1;
    if (nameB) return 1;
    return (a.storeId || "").localeCompare(b.storeId || "");
  });

  const total = groups.reduce((sum, g) => sum + g.total, 0);
  return { groups, total };
}
