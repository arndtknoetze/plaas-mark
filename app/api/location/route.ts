import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { getLocationFromHeaders } from "@/lib/location";

/**
 * Current tenant location (from middleware `x-location-slug` + DB).
 */
export async function GET() {
  try {
    const location = await getLocationFromHeaders();
    await logApiLocationDebug("GET /api/location", {
      resolvedLocationId: location.id,
      resolvedSlug: location.slug,
    });
    return NextResponse.json({
      id: location.id,
      name: location.name,
      slug: location.slug,
    });
  } catch {
    return NextResponse.json(
      { error: "Location could not be resolved." },
      { status: 500 },
    );
  }
}
