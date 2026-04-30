import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { prisma } from "@/lib/db";
import { getLocationFromRequest } from "@/lib/location";
import { resolveAccountMember } from "@/lib/resolve-account-member";
import type { ActivityItem } from "@/types/activity";

function activitySortKey(row: ActivityItem): string {
  return `${row.type}:${row.id}`;
}

function totalQty(items: Array<{ quantity: number }>): number {
  return items.reduce((s, i) => s + i.quantity, 0);
}

function totalAmount(
  items: Array<{ price: unknown; quantity: number }>,
): number {
  return items.reduce((s, i) => {
    const p =
      typeof i.price === "number"
        ? i.price
        : typeof i.price === "bigint"
          ? Number(i.price)
          : Number(i.price);
    const n = Number.isFinite(p) ? p : 0;
    return s + n * i.quantity;
  }, 0);
}

function storeSnippet(items: Array<{ vendorName: string }>): string {
  const names = [...new Set(items.map((i) => i.vendorName).filter(Boolean))];
  if (names.length === 0) return "";
  const shown = names.slice(0, 2).join(", ");
  return names.length > 2 ? `${shown} …` : shown;
}

function formatRand(amount: number): string {
  return `R${amount.toFixed(0)}`;
}

export async function GET(request: Request) {
  try {
    const account = await resolveAccountMember(request);
    if (!account) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    let location;
    try {
      location = await getLocationFromRequest(request);
    } catch {
      return NextResponse.json(
        { error: "Location could not be resolved. Try again later." },
        { status: 500 },
      );
    }

    const member = await prisma.member.findUnique({
      where: { id: account.id },
      include: {
        orders: {
          where: { locationId: location.id },
          orderBy: { createdAt: "desc" },
          include: { items: { orderBy: { id: "asc" } } },
        },
        stores: {
          where: { locationId: location.id },
          select: { id: true },
        },
        notifications: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!member) {
      await logApiLocationDebug("GET /api/activity", {
        resolvedLocationId: location.id,
        activityCount: 0,
      });
      return NextResponse.json({ activity: [] as const });
    }

    const storeIds = new Set(member.stores.map((s) => s.id));

    const sellerOrdersRaw =
      storeIds.size > 0
        ? await prisma.order.findMany({
            where: {
              locationId: location.id,
              items: { some: { vendorId: { in: [...storeIds] } } },
            },
            orderBy: { createdAt: "desc" },
            include: {
              member: { select: { name: true, phone: true } },
              items: { orderBy: { id: "asc" } },
            },
          })
        : [];

    const rows: ActivityItem[] = [];

    for (const order of member.orders) {
      const shops = storeSnippet(order.items);
      rows.push({
        id: order.id,
        type: "order_customer",
        title: shops ? `Jou bestelling by ${shops}` : "Jou bestelling",
        subtitle: `Status: ${order.status}`,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
      });
    }

    for (const order of sellerOrdersRaw) {
      const itemsForStore = order.items.filter((item) =>
        storeIds.has(item.vendorId),
      );
      const qty = totalQty(itemsForStore);
      const amount = totalAmount(itemsForStore);
      rows.push({
        id: order.id,
        type: "order_seller",
        title: "Nuwe bestelling by jou winkel",
        subtitle: `${qty} ${qty === 1 ? "item" : "items"} – ${formatRand(amount)}`,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
      });
    }

    for (const n of member.notifications) {
      rows.push({
        id: n.id,
        type: "notification",
        title: n.title,
        subtitle: n.message,
        createdAt: n.createdAt.toISOString(),
      });
    }

    rows.sort((a, b) => {
      const t = Date.parse(b.createdAt) - Date.parse(a.createdAt);
      if (t !== 0) return t;
      return activitySortKey(a).localeCompare(activitySortKey(b));
    });

    await logApiLocationDebug("GET /api/activity", {
      resolvedLocationId: location.id,
      activityCount: rows.length,
    });

    return NextResponse.json({ activity: rows });
  } catch {
    return NextResponse.json(
      { error: "Failed to load activity." },
      { status: 500 },
    );
  }
}
