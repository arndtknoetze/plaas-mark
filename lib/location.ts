import type { Location } from "@prisma/client";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

/** Must match middleware default when no subdomain is detected. */
export const DEFAULT_LOCATION_SLUG = "malmesbury";

const HEADER_LOCATION_SLUG = "x-location-slug";

async function loadLocationBySlug(slug: string): Promise<Location> {
  const primary = await prisma.location.findUnique({
    where: { slug },
  });
  if (primary) return primary;

  const fallback = await prisma.location.findUnique({
    where: { slug: DEFAULT_LOCATION_SLUG },
  });
  if (fallback) return fallback;

  throw new Error(
    `No Location row for slug "${slug}" and default "${DEFAULT_LOCATION_SLUG}" is missing. Seed locations (e.g. prisma db seed).`,
  );
}

/**
 * Resolves the current tenant `Location` from middleware-injected headers and DB.
 * If the slug from headers has no row, falls back to {@link DEFAULT_LOCATION_SLUG}.
 */
export async function getLocationFromHeaders(): Promise<Location> {
  const h = await headers();
  const slug = h.get(HEADER_LOCATION_SLUG)?.trim() || DEFAULT_LOCATION_SLUG;
  return loadLocationBySlug(slug);
}

/**
 * Same as {@link getLocationFromHeaders} but reads `Request` headers (e.g. route handlers).
 * Middleware sets `x-location-slug` on the incoming request.
 */
export async function getLocationFromRequest(
  request: Request,
): Promise<Location> {
  const slug =
    request.headers.get(HEADER_LOCATION_SLUG)?.trim() || DEFAULT_LOCATION_SLUG;
  return loadLocationBySlug(slug);
}

export type PublicLocation = Pick<
  Location,
  "id" | "name" | "slug" | "bannerImageUrl"
>;

/** For server components / layout when the DB is unavailable or not seeded. */
export async function getPublicLocationOrNull(): Promise<PublicLocation | null> {
  try {
    const l = await getLocationFromHeaders();
    return {
      id: l.id,
      name: l.name,
      slug: l.slug,
      bannerImageUrl: l.bannerImageUrl,
    };
  } catch {
    return null;
  }
}
