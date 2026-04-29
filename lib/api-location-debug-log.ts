// TEMP: location scoping debug — remove once verified (see caller routes).

import { headers } from "next/headers";

const TAG = "[loc-debug]";

/** Logs optional `?location=` plus optional entity location ids for scoping checks. */
export async function logApiLocationDebug(
  route: string,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    const h = await headers();
    const url = h.get("x-url")?.trim() ?? "";
    const locationFromUrl =
      url && url.includes("?")
        ? (new URL(url, "https://example.invalid").searchParams
            .get("location")
            ?.trim() ?? null)
        : null;
    console.info(TAG, route, {
      location: locationFromUrl ?? "(missing)",
      ...details,
    });
  } catch {
    console.info(TAG, route, {
      location: "(unavailable)",
      ...details,
    });
  }
}
