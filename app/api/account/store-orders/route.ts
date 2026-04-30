import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLocationFromRequest } from "@/lib/location";
import { resolveAccountMember } from "@/lib/resolve-account-member";

/**
 * Orders that include at least one line for the member's stores in this location,
 * with items filtered to that member's stores only.
 */
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
      select: {
        id: true,
        stores: {
          where: { locationId: location.id },
          select: { id: true },
        },
      },
    });

    if (!member || member.stores.length === 0) {
      return NextResponse.json({ orders: [] as const });
    }

    const storeIds = new Set(member.stores.map((s) => s.id));

    const orders = await prisma.order.findMany({
      where: {
        locationId: location.id,
        items: { some: { vendorId: { in: [...storeIds] } } },
      },
      orderBy: { createdAt: "desc" },
      include: {
        member: { select: { name: true, phone: true } },
        items: { orderBy: { id: "asc" } },
      },
    });

    const payload = orders.map((order) => {
      const itemsForStore = order.items.filter((item) =>
        storeIds.has(item.vendorId),
      );
      return {
        id: order.id,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        notes: order.notes,
        customerName: order.member.name,
        customerPhone: order.member.phone,
        items: itemsForStore.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          vendorId: item.vendorId,
          vendorName: item.vendorName,
        })),
      };
    });

    return NextResponse.json({ orders: payload });
  } catch {
    return NextResponse.json(
      { error: "Failed to load store orders." },
      { status: 500 },
    );
  }
}
