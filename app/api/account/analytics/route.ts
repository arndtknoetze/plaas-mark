import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLocationFromUrlOrHeaders } from "@/lib/location";

function normalizePhoneParam(value: string | null): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function monthKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function buildMonthKeys(lastNMonths: number): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = lastNMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
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
          select: { id: true, name: true, brandColor: true },
        },
      },
    });

    const stores = member?.stores ?? [];
    if (!member || stores.length === 0) {
      return NextResponse.json({
        stores: [] as const,
        salesMonths: [] as const,
        salesByStore: {} as const,
        visitsLast30Days: [] as const,
      });
    }

    const storeIds = stores.map((s) => s.id);

    // Sales: last 12 full months (including current month).
    const months = buildMonthKeys(12);
    const startSales = (() => {
      const [y, m] = months[0]!.split("-").map((x) => Number(x));
      return new Date(y!, (m! - 1)!, 1);
    })();

    const orders = await prisma.order.findMany({
      where: {
        locationId: location.id,
        createdAt: { gte: startSales },
        items: { some: { vendorId: { in: storeIds } } },
      },
      select: {
        createdAt: true,
        items: {
          where: { vendorId: { in: storeIds } },
          select: { vendorId: true, price: true, quantity: true },
        },
      },
    });

    const salesByStore: Record<string, Record<string, number>> = {};
    for (const s of stores) {
      salesByStore[s.id] = Object.fromEntries(months.map((k) => [k, 0]));
    }

    for (const o of orders) {
      const k = monthKey(o.createdAt);
      if (!months.includes(k)) continue;
      for (const line of o.items) {
        const storeId = line.vendorId;
        if (!salesByStore[storeId]) continue;
        salesByStore[storeId]![k] += Number(line.price) * line.quantity;
      }
    }

    // Visits: last 30 days, count page_view events that hit store pages.
    const sinceVisits = new Date();
    sinceVisits.setDate(sinceVisits.getDate() - 30);

    const orPaths = storeIds.map((id) => ({ path: { contains: `--${id}` } }));
    const events =
      orPaths.length > 0
        ? await prisma.analyticsEvent.findMany({
            where: {
              type: "page_view",
              createdAt: { gte: sinceVisits },
              ...(location.id ? { locationId: location.id } : {}),
              OR: orPaths,
            },
            select: { path: true },
          })
        : [];

    const visitCounts = new Map<string, number>();
    for (const id of storeIds) visitCounts.set(id, 0);
    for (const e of events) {
      const p = e.path || "";
      for (const id of storeIds) {
        if (p.includes(`--${id}`)) {
          visitCounts.set(id, (visitCounts.get(id) ?? 0) + 1);
          break;
        }
      }
    }

    const visitsLast30Days = stores
      .map((s) => ({
        storeId: s.id,
        storeName: s.name,
        brandColor: s.brandColor,
        visits: visitCounts.get(s.id) ?? 0,
      }))
      .sort((a, b) => b.visits - a.visits);

    return NextResponse.json({
      stores,
      salesMonths: months,
      salesByStore,
      visitsLast30Days,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load account analytics." },
      { status: 500 },
    );
  }
}
