// TEMP: location scoping debug — remove once verified (see caller routes).

import { headers } from "next/headers";

const TAG = "[loc-debug]";

/** Logs request `x-location-slug` plus optional entity location ids for scoping checks. */
export async function logApiLocationDebug(
  route: string,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    const h = await headers();
    const slug = h.get("x-location-slug")?.trim() ?? null;
    console.info(TAG, route, {
      slug: slug ?? "(missing)",
      ...details,
    });
  } catch {
    console.info(TAG, route, {
      slug: "(headers unavailable)",
      ...details,
    });
  }
}
