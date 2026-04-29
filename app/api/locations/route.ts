import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildLocationEntryUrl } from "@/lib/location-entry-url";

type Coordinates = { lat: number; lng: number };

function distanceKm(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const nearLatRaw = url.searchParams.get("nearLat");
    const nearLngRaw = url.searchParams.get("nearLng");
    const limitRaw = url.searchParams.get("limit");
    const nearLat = nearLatRaw ? Number(nearLatRaw) : null;
    const nearLng = nearLngRaw ? Number(nearLngRaw) : null;
    const limit = limitRaw ? Math.max(1, Math.min(24, Number(limitRaw))) : 24;
    const hasNear =
      nearLat !== null &&
      nearLng !== null &&
      Number.isFinite(nearLat) &&
      Number.isFinite(nearLng);

    if (!hasNear) {
      const locations = await prisma.location.findMany({
        orderBy: { name: "asc" },
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          province: true,
          lat: true,
          lng: true,
          bannerImageUrl: true,
        },
      });
      return NextResponse.json({
        locations: locations.map((location) => ({
          ...location,
          href: buildLocationEntryUrl(location.slug),
        })),
      });
    }

    const locations = await prisma.location.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        province: true,
        lat: true,
        lng: true,
        bannerImageUrl: true,
      },
    });

    const origin = { lat: nearLat, lng: nearLng };
    const nearby = locations
      .filter(
        (location) =>
          Number.isFinite(location.lat) && Number.isFinite(location.lng),
      )
      .map((location) => {
        const d = distanceKm(origin, {
          lat: Number(location.lat),
          lng: Number(location.lng),
        });
        return {
          ...location,
          href: buildLocationEntryUrl(location.slug),
          distanceKm: Math.round(d * 10) / 10,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);

    return NextResponse.json({ locations: nearby });
  } catch {
    return NextResponse.json(
      { error: "Failed to load locations." },
      { status: 500 },
    );
  }
}
