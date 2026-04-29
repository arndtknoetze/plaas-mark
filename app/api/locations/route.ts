import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildLocationEntryUrl } from "@/lib/location-entry-url";

export async function GET(request: Request) {
  try {
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
    return NextResponse.json({
      locations: locations.map((location) => ({
        ...location,
        href: buildLocationEntryUrl(location.slug, request.headers),
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load locations." },
      { status: 500 },
    );
  }
}
