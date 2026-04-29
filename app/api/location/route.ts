import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { getLocationFromUrlOrHeaders } from "@/lib/location";

/**
 * Current tenant location (from middleware `x-location-slug` + DB).
 */
export async function GET(request: Request) {
  try {
    // Optionally overridden via `?location=...` to support path-based routing.
    const location = await getLocationFromUrlOrHeaders(request);
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
