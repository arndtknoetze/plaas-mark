import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

function normalizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

export async function GET(request: Request) {
  try {
    const phone =
      new URL(request.url).searchParams
        .get("phone")
        ?.trim()
        .replace(/\s+/g, " ") ?? "";
    if (!phone) {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    const seller = await prisma.seller.findUnique({
      where: { phone },
      include: { stores: { orderBy: { createdAt: "desc" } } },
    });

    if (!seller) {
      return NextResponse.json({ seller: null, stores: [] as const });
    }

    return NextResponse.json({
      seller: { id: seller.id, name: seller.name, phone: seller.phone },
      stores: seller.stores.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        isActive: s.isActive,
        brandColor: s.brandColor,
        logoUrl: s.logoUrl,
        addressText: s.addressText,
        email: s.email,
        whatsapp: s.whatsapp,
        instagram: s.instagram,
        facebook: s.facebook,
        website: s.website,
        hoursText: s.hoursText,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load stores." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: { phone?: unknown; name?: unknown };
  try {
    body = (await request.json()) as { phone?: unknown; name?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const phone = normalizePhone(body.phone);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!phone || !name) {
    return NextResponse.json(
      { error: "phone and name are required" },
      { status: 400 },
    );
  }

  try {
    const seller = await prisma.seller.findUnique({ where: { phone } });
    if (!seller) {
      return NextResponse.json({ error: "Seller not found." }, { status: 404 });
    }

    const base = slugify(name) || "store";
    let slug = base;
    for (let i = 0; i < 5; i++) {
      try {
        const store = await prisma.store.create({
          data: {
            sellerId: seller.id,
            name,
            slug,
          },
        });
        return NextResponse.json({
          ok: true,
          storeId: store.id,
          slug: store.slug,
        });
      } catch {
        slug = `${base}-${Math.floor(100 + Math.random() * 900)}`;
      }
    }

    return NextResponse.json(
      { error: "Could not create store." },
      { status: 500 },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not create store." },
      { status: 500 },
    );
  }
}
