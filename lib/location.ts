import type { Location } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Must match middleware default when no subdomain is detected. */
export const DEFAULT_LOCATION_SLUG = "malmesbury";

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

export async function getLocationBySlug(slug: string): Promise<Location> {
  return loadLocationBySlug(slug);
}

export async function getLocationFromUrlOrHeaders(
  request: Request,
): Promise<Location> {
  const url = new URL(request.url);
  const slug = url.searchParams.get("location")?.trim();
  if (slug) return loadLocationBySlug(slug);
  return loadLocationBySlug(DEFAULT_LOCATION_SLUG);
}

/**
 * URL-only location routing: subdomain/middleware headers are ignored.
 * This function remains for backwards compatibility in server components.
 */
export async function getLocationFromHeaders(): Promise<Location> {
  return loadLocationBySlug(DEFAULT_LOCATION_SLUG);
}

/**
 * URL-only location routing: request headers are ignored.
 */
export async function getLocationFromRequest(
  request: Request,
): Promise<Location> {
  void request;
  return loadLocationBySlug(DEFAULT_LOCATION_SLUG);
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
