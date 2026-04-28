import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLocationFromRequest } from "@/lib/location";
import { isOrderStatus } from "@/lib/order-status";

function normalizePhone(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

type RouteContext = { params: Promise<{ orderId: string }> };

/**
 * PATCH — set order status.
 *
 * Authorization: `phone` must identify a Member who **owns** at least one Store
 * (`vendorId` on line items) present on this order in the current location.
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { orderId } = await context.params;
    const id = orderId?.trim();
    if (!id) {
      return NextResponse.json(
        { error: "Order id is required." },
        { status: 400 },
      );
    }

    let body: { status?: unknown; phone?: unknown };
    try {
      body = (await request.json()) as { status?: unknown; phone?: unknown };
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const statusRaw = typeof body.status === "string" ? body.status.trim() : "";
    const phone = normalizePhone(body.phone);

    if (!phone) {
      return NextResponse.json(
        { error: "phone is required (seller session)." },
        { status: 400 },
      );
    }

    if (!statusRaw || !isOrderStatus(statusRaw)) {
      return NextResponse.json(
        {
          error: "status must be one of: pending, accepted, ready, completed.",
        },
        { status: 400 },
      );
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
      where: { phone },
      select: {
        stores: {
          where: { locationId: location.id },
          select: { id: true },
        },
      },
    });

    const ownedStoreIds = new Set(member?.stores.map((s) => s.id) ?? []);
    if (ownedStoreIds.size === 0) {
      return NextResponse.json(
        { error: "No shop for this account in this location." },
        { status: 403 },
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        locationId: location.id,
        items: {
          some: {
            vendorId: { in: [...ownedStoreIds] },
          },
        },
      },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not authorized." },
        { status: 404 },
      );
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: statusRaw },
      select: { id: true, status: true },
    });

    return NextResponse.json({
      ok: true,
      orderId: updated.id,
      status: updated.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update order status." },
      { status: 500 },
    );
  }
}
