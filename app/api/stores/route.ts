import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { getLocationFromUrlOrHeaders } from "@/lib/location";
import { findPublicStoresForLocation } from "@/lib/stores-scope";

/** Active stores in the current location (for shop filters, etc.). */
export async function GET(request: Request) {
  try {
    const location = await getLocationFromUrlOrHeaders(request);
    const stores = await findPublicStoresForLocation(location.id);
    await logApiLocationDebug("GET /api/stores", {
      resolvedLocationId: location.id,
      storeCount: stores.length,
      storeLocationIdsExpected: [location.id],
    });
    return NextResponse.json({ stores });
  } catch {
    return NextResponse.json(
      { error: "Failed to load stores." },
      { status: 500 },
    );
  }
}
