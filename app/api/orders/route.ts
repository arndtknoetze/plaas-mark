import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { orderPostRateLimitResponse } from "@/lib/order-post-rate-limit";
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

    const customer = await prisma.customer.findUnique({
      where: { phone },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: { items: { orderBy: { id: "asc" } } },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ orders: [] as const });
    }

    const orders = customer.orders.map((order) => ({
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
    typeof o.vendorName === "string"
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
          "Each item must include productId, name, price, quantity, vendorId, and vendorName.",
      },
      { status: 400 },
    );
  }

  const items = body.items as CartItem[];

  const verificationToken =
    typeof body.verificationToken === "string"
      ? body.verificationToken.trim()
      : "";
  if (!verificationToken) {
    return NextResponse.json(
      { error: "Phone verification is required before placing an order." },
      { status: 400 },
    );
  }

  try {
    const limited = await orderPostRateLimitResponse(request, phone);
    if (limited) return limited;

    const order = await prisma.$transaction(async (tx) => {
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

      const existingCustomer = await tx.customer.findUnique({
        where: { phone },
      });
      const customerRecord =
        existingCustomer ??
        (await tx.customer.create({
          data: { name, phone },
        }));

      return tx.order.create({
        data: {
          customerId: customerRecord.id,
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
