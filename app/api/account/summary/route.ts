import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLocationFromUrlOrHeaders } from "@/lib/location";
import { resolveAccountMember } from "@/lib/resolve-account-member";

export async function GET(request: Request) {
  try {
    const account = await resolveAccountMember(request);
    if (!account) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const location = await getLocationFromUrlOrHeaders(request);

    const member = await prisma.member.findUnique({
      where: { id: account.id },
      select: {
        id: true,
        stores: {
          where: { locationId: location.id },
          select: {
            id: true,
          },
        },
      },
    });

    const storeIds = member?.stores.map((s) => s.id) ?? [];
    if (!member || storeIds.length === 0) {
      return NextResponse.json({
        counts: { stores: 0, products: 0, orders: 0 },
        recentOrders: [] as const,
      });
    }

    const [productsCount, ordersCount, recentOrders] = await Promise.all([
      prisma.product.count({ where: { vendorId: { in: storeIds } } }),
      prisma.order.count({
        where: {
          locationId: location.id,
          items: { some: { vendorId: { in: storeIds } } },
        },
      }),
      prisma.order.findMany({
        where: {
          locationId: location.id,
          items: { some: { vendorId: { in: storeIds } } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          member: { select: { name: true } },
          items: {
            where: { vendorId: { in: storeIds } },
            select: { price: true, quantity: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      counts: {
        stores: storeIds.length,
        products: productsCount,
        orders: ordersCount,
      },
      recentOrders: recentOrders.map((o) => {
        const total = o.items.reduce(
          (sum, line) => sum + Number(line.price) * line.quantity,
          0,
        );
        const itemsCount = o.items.reduce(
          (sum, line) => sum + line.quantity,
          0,
        );
        return {
          id: o.id,
          createdAt: o.createdAt.toISOString(),
          status: o.status,
          customerName: o.member.name,
          total,
          itemsCount,
        };
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load account summary." },
      { status: 500 },
    );
  }
}
