import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { getLocationFromHeaders } from "@/lib/location";
import { findProductsForLocationCatalogue } from "@/lib/products-scope";
import { prisma } from "@/lib/db";

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value.filter((x): x is string => typeof x === "string");
  return out.length ? out : undefined;
}

export async function GET() {
  try {
    const location = await getLocationFromHeaders();

    const rows = await findProductsForLocationCatalogue(location.id);

    await logApiLocationDebug("GET /api/products", {
      resolvedLocationId: location.id,
      productStoreLocationIds: [
        ...new Set(rows.map((r) => r.store.locationId)),
      ],
      productCount: rows.length,
    });

    const products = rows.map((p) => {
      const images =
        toStringArray(p.images) ?? (p.image ? [p.image] : undefined);
      const tags = toStringArray(p.tags) ?? undefined;
      return {
        id: p.id,
        title: p.title,
        description: p.description ?? undefined,
        tags,
        images,
        price: Number(p.price),
        unit: p.unit ?? undefined,
        vendorId: p.vendorId,
        vendorName: p.vendorName,
        locationId: p.store.locationId,
        image: p.image ?? images?.[0] ?? undefined,
        isFeatured: p.isFeatured,
        isActive: p.isActive,
      };
    });

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
  description?: unknown;
  tags?: unknown;
  images?: unknown;
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

function normalizeStringArray(input: unknown): string[] | null {
  if (!Array.isArray(input)) return null;
  const out = input
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);
  return out.length ? out : null;
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
  const description = normalizeOptionalString(body.description) ?? undefined;
  const price =
    typeof body.price === "number"
      ? body.price
      : typeof body.price === "string"
        ? Number(body.price)
        : NaN;
  const unit = normalizeOptionalString(body.unit) ?? undefined;
  const image = normalizeOptionalString(body.image) ?? undefined;
  const images = normalizeStringArray(body.images) ?? (image ? [image] : null);
  const tags = normalizeStringArray(body.tags) ?? null;

  if (!phone || !storeId || !title || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      { error: "phone, storeId, title, and a valid price are required." },
      { status: 400 },
    );
  }

  try {
    const location = await getLocationFromHeaders();

    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({ where: { phone } });
      if (!member) {
        return {
          status: 403 as const,
          payload: { error: "Member not found." },
        };
      }

      const store = await tx.store.findUnique({ where: { id: storeId } });
      if (!store || store.memberId !== member.id) {
        return { status: 403 as const, payload: { error: "Forbidden." } };
      }

      if (store.locationId !== location.id) {
        return {
          status: 403 as const,
          payload: {
            error:
              "This shop is not in your current area. Open the correct area subdomain and try again.",
          },
        };
      }

      await logApiLocationDebug("POST /api/products", {
        resolvedLocationId: location.id,
        storeId: store.id,
        storeLocationId: store.locationId,
      });

      const product = await tx.product.create({
        data: {
          title,
          description,
          ...(images ? { images } : {}),
          ...(tags ? { tags } : {}),
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
