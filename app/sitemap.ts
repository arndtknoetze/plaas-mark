import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_ORIGIN } from "@/lib/seo";

function buildUrl(origin: string, path: string) {
  const cleanOrigin = origin.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanOrigin}${cleanPath}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    { url: buildUrl(SITE_ORIGIN, "/"), lastModified: now },
  ];

  try {
    const [locations, stores] = await Promise.all([
      prisma.location.findMany({
        select: { id: true, slug: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.store.findMany({
        where: { isActive: true },
        select: {
          id: true,
          slug: true,
          updatedAt: true,
          location: { select: { slug: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    for (const l of locations) {
      const locModified = l.createdAt ?? now;
      base.push({
        url: buildUrl(SITE_ORIGIN, `/${l.slug}`),
        lastModified: locModified,
      });
      base.push({
        url: buildUrl(SITE_ORIGIN, `/${l.slug}/shop`),
        lastModified: locModified,
      });
    }

    // Store pages (path-based)
    for (const s of stores) {
      const locationSlug = s.location?.slug ?? "";
      if (!locationSlug) continue;
      base.push({
        url: buildUrl(
          SITE_ORIGIN,
          `/${locationSlug}/store/${s.slug}--${encodeURIComponent(s.id)}`,
        ),
        lastModified: s.updatedAt ?? now,
      });
    }
  } catch {
    // If the DB is unavailable (e.g. build without DATABASE_URL), still emit base URLs.
  }

  return base;
}
