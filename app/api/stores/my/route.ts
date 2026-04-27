import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { prisma } from "@/lib/db";
import { getLocationFromHeaders } from "@/lib/location";
import { slugify } from "@/lib/slug";

function normalizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

const FORBIDDEN_LOCATION_BODY_KEYS = [
  "locationId",
  "locationSlug",
  "location",
] as const;

export async function GET(request: Request) {
  try {
    const location = await getLocationFromHeaders();

    const phone =
      new URL(request.url).searchParams
        .get("phone")
        ?.trim()
        .replace(/\s+/g, " ") ?? "";
    if (!phone) {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { phone },
      include: {
        stores: {
          where: { locationId: location.id },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!member) {
      await logApiLocationDebug("GET /api/stores/my", {
        resolvedLocationId: location.id,
        memberStoreLocationIds: [] as string[],
      });
      return NextResponse.json({ member: null, stores: [] as const });
    }

    await logApiLocationDebug("GET /api/stores/my", {
      resolvedLocationId: location.id,
      memberStoreLocationIds: member.stores.map((s) => s.locationId),
    });

    return NextResponse.json({
      member: { id: member.id, name: member.name, phone: member.phone },
      stores: member.stores.map((s) => ({
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

  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    for (const key of FORBIDDEN_LOCATION_BODY_KEYS) {
      if (key in o && o[key] !== undefined) {
        return NextResponse.json(
          {
            error:
              "Location is set automatically from the site you are on; do not send location fields.",
          },
          { status: 400 },
        );
      }
    }
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
    const member = await prisma.member.findUnique({ where: { phone } });
    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    const location = await getLocationFromHeaders();

    await logApiLocationDebug("POST /api/stores/my", {
      resolvedLocationId: location.id,
      newStoreLocationId: location.id,
    });

    const base = slugify(name) || "store";
    let slug = base;
    for (let i = 0; i < 5; i++) {
      try {
        const store = await prisma.store.create({
          data: {
            memberId: member.id,
            locationId: location.id,
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
