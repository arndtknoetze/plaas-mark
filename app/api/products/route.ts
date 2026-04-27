import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const rows = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    const products = rows.map((p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      unit: p.unit ?? undefined,
      vendorId: p.vendorId,
      vendorName: p.vendorName,
      image: p.image ?? undefined,
    }));

    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 },
    );
  }
}

type CreateBody = {
  phone?: unknown;
  storeId?: unknown;
  title?: unknown;
  price?: unknown;
  unit?: unknown;
  image?: unknown;
};

function normalizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

function normalizeOptionalString(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const v = input.trim();
  return v ? v : null;
}

export async function POST(request: Request) {
  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const phone = normalizePhone(body.phone);
  const storeId = typeof body.storeId === "string" ? body.storeId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const price =
    typeof body.price === "number"
      ? body.price
      : typeof body.price === "string"
        ? Number(body.price)
        : NaN;
  const unit = normalizeOptionalString(body.unit) ?? undefined;
  const image = normalizeOptionalString(body.image) ?? undefined;

  if (!phone || !storeId || !title || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      { error: "phone, storeId, title, and a valid price are required." },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const seller = await tx.seller.findUnique({ where: { phone } });
      if (!seller) {
        return {
          status: 403 as const,
          payload: { error: "Seller not found." },
        };
      }

      const store = await tx.store.findUnique({ where: { id: storeId } });
      if (!store || store.sellerId !== seller.id) {
        return { status: 403 as const, payload: { error: "Forbidden." } };
      }

      const product = await tx.product.create({
        data: {
          title,
          price,
          unit,
          image,
          vendorId: store.id,
          vendorName: store.name,
        },
        select: { id: true },
      });

      return {
        status: 200 as const,
        payload: { ok: true, productId: product.id },
      };
    });

    return NextResponse.json(result.payload, { status: result.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 },
    );
  }
}
