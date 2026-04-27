import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { prisma } from "@/lib/db";
import { getLocationFromHeaders } from "@/lib/location";
import { wherePublicStoresInLocation } from "@/lib/stores-scope";
import { orderPostRateLimitResponse } from "@/lib/order-post-rate-limit";
import { isPhoneOtpDisabled } from "@/lib/phone-otp";
import type { CartItem } from "@/types/cart";

export async function GET(request: Request) {
  try {
    const phone =
      new URL(request.url).searchParams
        .get("phone")
        ?.trim()
        .replace(/\s+/g, " ") ?? "";
    if (!phone) {
      return NextResponse.json(
        { error: 'Query parameter "phone" is required.' },
        { status: 400 },
      );
    }

    let location;
    try {
      location = await getLocationFromHeaders();
    } catch {
      return NextResponse.json(
        { error: "Location could not be resolved. Try again later." },
        { status: 500 },
      );
    }

    const member = await prisma.member.findUnique({
      where: { phone },
      include: {
        orders: {
          where: { locationId: location.id },
          orderBy: { createdAt: "desc" },
          include: { items: { orderBy: { id: "asc" } } },
        },
      },
    });

    if (!member) {
      await logApiLocationDebug("GET /api/orders", {
        resolvedLocationId: location.id,
        orderLocationIds: [] as string[],
      });
      return NextResponse.json({ orders: [] as const });
    }

    await logApiLocationDebug("GET /api/orders", {
      resolvedLocationId: location.id,
      orderLocationIds: [...new Set(member.orders.map((o) => o.locationId))],
    });

    const orders = member.orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt.toISOString(),
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        vendorName: item.vendorName,
      })),
    }));

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json(
      { error: "Failed to load orders." },
      { status: 500 },
    );
  }
}

type CustomerPayload = {
  name?: unknown;
  phone?: unknown;
  notes?: unknown;
};

type BodyPayload = {
  customer?: CustomerPayload;
  items?: unknown;
  verificationToken?: unknown;
};

class ForbiddenOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenOrderError";
  }
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.productId === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    Number.isFinite(o.price) &&
    typeof o.quantity === "number" &&
    Number.isInteger(o.quantity) &&
    o.quantity >= 1 &&
    typeof o.vendorId === "string" &&
    typeof o.vendorName === "string" &&
    typeof o.locationId === "string" &&
    o.locationId.length > 0
  );
}

export async function POST(request: Request) {
  let body: BodyPayload;
  try {
    body = (await request.json()) as BodyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name =
    typeof body.customer?.name === "string" ? body.customer.name.trim() : "";
  const phone =
    typeof body.customer?.phone === "string"
      ? body.customer.phone.trim().replace(/\s+/g, " ")
      : "";
  const notesRaw =
    typeof body.customer?.notes === "string" ? body.customer.notes.trim() : "";
  const notes = notesRaw.length > 0 ? notesRaw : null;

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Customer name and phone are required." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "At least one cart item is required." },
      { status: 400 },
    );
  }

  if (!body.items.every(isCartItem)) {
    return NextResponse.json(
      {
        error:
          "Each item must include productId, name, price, quantity, vendorId, vendorName, and locationId.",
      },
      { status: 400 },
    );
  }

  const items = body.items as CartItem[];

  let location;
  try {
    location = await getLocationFromHeaders();
  } catch {
    return NextResponse.json(
      { error: "Location could not be resolved. Try again later." },
      { status: 500 },
    );
  }

  const cartLocationIds = [...new Set(items.map((item) => item.locationId))];
  if (cartLocationIds.length !== 1) {
    return NextResponse.json(
      {
        error:
          "Alle lyne moet dieselfde gebied wees. Plaas een bestelling per dorp.",
      },
      { status: 400 },
    );
  }
  if (cartLocationIds[0] !== location.id) {
    return NextResponse.json(
      {
        error:
          "Jou mandjie stem nie met hierdie gebied ooreen nie. Maak dit leeg of gebruik die regte gebied.",
      },
      { status: 400 },
    );
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const catalogueProducts = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      store: wherePublicStoresInLocation(location.id),
    },
    select: {
      id: true,
      vendorId: true,
      store: { select: { id: true, locationId: true } },
    },
  });

  if (catalogueProducts.length !== productIds.length) {
    return NextResponse.json(
      {
        error:
          "One or more products are not available in this area. Refresh and update your cart.",
      },
      { status: 400 },
    );
  }

  const distinctStoreLocations = new Set(
    catalogueProducts.map((p) => p.store.locationId),
  );
  if (
    distinctStoreLocations.size !== 1 ||
    !distinctStoreLocations.has(location.id)
  ) {
    return NextResponse.json(
      {
        error:
          "Alle items moet dieselfde gebied wees (winkels in hierdie plek).",
      },
      { status: 400 },
    );
  }

  const productById = new Map(catalogueProducts.map((p) => [p.id, p]));
  for (const item of items) {
    const row = productById.get(item.productId);
    if (!row || row.vendorId !== item.vendorId) {
      return NextResponse.json(
        {
          error:
            "Cart items do not match catalogue products for this area. Refresh and try again.",
        },
        { status: 400 },
      );
    }
    if (row.store.locationId !== item.locationId) {
      return NextResponse.json(
        {
          error:
            "Alle items moet by dieselfde gebied se winkels hoort. Verfris jou mandjie.",
        },
        { status: 400 },
      );
    }
  }

  await logApiLocationDebug("POST /api/orders (validated)", {
    resolvedLocationId: location.id,
    cartLineLocationIds: [...new Set(items.map((i) => i.locationId))],
    productStoreLocationIds: [
      ...new Set(catalogueProducts.map((p) => p.store.locationId)),
    ],
  });

  const verificationToken =
    typeof body.verificationToken === "string"
      ? body.verificationToken.trim()
      : "";

  const otpBypass = isPhoneOtpDisabled();
  if (!otpBypass && !verificationToken) {
    return NextResponse.json(
      { error: "Phone verification is required before placing an order." },
      { status: 400 },
    );
  }

  try {
    const limited = await orderPostRateLimitResponse(request, phone);
    if (limited) return limited;

    const order = await prisma.$transaction(async (tx) => {
      if (!otpBypass) {
        const removed = await tx.phoneVerifyToken.deleteMany({
          where: {
            token: verificationToken,
            phone,
            expiresAt: { gt: new Date() },
          },
        });
        if (removed.count !== 1) {
          throw new ForbiddenOrderError(
            "Invalid or expired phone verification. Request a new code and verify again.",
          );
        }
      }

      const member = await tx.member.upsert({
        where: { phone },
        create: { name, phone },
        update: { name },
        select: { id: true },
      });

      return tx.order.create({
        data: {
          memberId: member.id,
          locationId: location.id,
          notes,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              vendorId: item.vendorId,
              vendorName: item.vendorName,
            })),
          },
        },
      });
    });

    await logApiLocationDebug("POST /api/orders (created)", {
      orderId: order.id,
      orderLocationId: order.locationId,
      otpBypass,
    });

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    if (err instanceof ForbiddenOrderError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 },
    );
  }
}
