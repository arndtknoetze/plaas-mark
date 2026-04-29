import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { prisma } from "@/lib/db";
import { getLocationFromUrlOrHeaders } from "@/lib/location";
import { slugify } from "@/lib/slug";

function normalizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const location = await getLocationFromUrlOrHeaders(request);
    const { id } = await params;
    const store = await prisma.store.findFirst({
      where: {
        id,
        locationId: location.id,
        isActive: true,
      },
      include: {
        member: { select: { name: true, phone: true } },
      },
    });
    if (!store)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logApiLocationDebug("GET /api/stores/[id]", {
      resolvedLocationId: location.id,
      storeId: store.id,
      storeLocationId: store.locationId,
    });
    return NextResponse.json({
      store: {
        id: store.id,
        memberId: store.memberId,
        locationId: store.locationId,
        name: store.name,
        slug: store.slug,
        isActive: store.isActive,
        brandColor: store.brandColor,
        logoUrl: store.logoUrl,
        addressText: store.addressText,
        email: store.email,
        whatsapp: store.whatsapp,
        instagram: store.instagram,
        facebook: store.facebook,
        website: store.website,
        hoursText: store.hoursText,
        member: store.member,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load store." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const phone = normalizePhone(body.phone);
  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }

  const { id } = await params;
  const store = await prisma.store.findUnique({
    where: { id },
    include: { member: { select: { phone: true } } },
  });
  if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!store.member || store.member.phone !== phone) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let resolvedLocationId: string | undefined;
  try {
    resolvedLocationId = (await getLocationFromUrlOrHeaders(request)).id;
  } catch {
    resolvedLocationId = undefined;
  }

  await logApiLocationDebug("PATCH /api/stores/[id]", {
    resolvedLocationId,
    storeId: store.id,
    storeLocationId: store.locationId,
  });

  const name = typeof body.name === "string" ? body.name.trim() : null;
  const isActive = typeof body.isActive === "boolean" ? body.isActive : null;
  const brandColor =
    typeof body.brandColor === "string" ? body.brandColor.trim() : null;
  const locationId =
    typeof body.locationId === "string" ? body.locationId.trim() : null;

  const logoUrl = typeof body.logoUrl === "string" ? body.logoUrl.trim() : null;
  const addressText =
    typeof body.addressText === "string" ? body.addressText.trim() : null;
  const email = typeof body.email === "string" ? body.email.trim() : null;
  const whatsapp =
    typeof body.whatsapp === "string" ? body.whatsapp.trim() : null;
  const instagram =
    typeof body.instagram === "string" ? body.instagram.trim() : null;
  const facebook =
    typeof body.facebook === "string" ? body.facebook.trim() : null;
  const website = typeof body.website === "string" ? body.website.trim() : null;
  const hoursText =
    typeof body.hoursText === "string" ? body.hoursText.trim() : null;

  try {
    if (locationId !== null && locationId) {
      const exists = await prisma.location.findUnique({
        where: { id: locationId },
        select: { id: true },
      });
      if (!exists) {
        return NextResponse.json(
          { error: "Unknown location." },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.store.update({
      where: { id },
      data: {
        ...(name !== null ? { name, slug: slugify(name) || store.slug } : {}),
        ...(locationId !== null
          ? { locationId: locationId || store.locationId }
          : {}),
        ...(isActive !== null ? { isActive } : {}),
        ...(brandColor !== null && /^#[0-9a-fA-F]{6}$/.test(brandColor)
          ? { brandColor: brandColor.toUpperCase() }
          : {}),
        ...(logoUrl !== null ? { logoUrl: logoUrl || null } : {}),
        ...(addressText !== null ? { addressText: addressText || null } : {}),
        ...(email !== null ? { email: email || null } : {}),
        ...(whatsapp !== null ? { whatsapp: whatsapp || null } : {}),
        ...(instagram !== null ? { instagram: instagram || null } : {}),
        ...(facebook !== null ? { facebook: facebook || null } : {}),
        ...(website !== null ? { website: website || null } : {}),
        ...(hoursText !== null ? { hoursText: hoursText || null } : {}),
      },
    });
    return NextResponse.json({ ok: true, storeId: updated.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to update store." },
      { status: 500 },
    );
  }
}
