import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const ROOT_DOMAIN = "https://plaas-mark.co.za";

function buildUrl(origin: string, path: string) {
  const cleanOrigin = origin.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanOrigin}${cleanPath}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    { url: buildUrl(ROOT_DOMAIN, "/"), lastModified: now },
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

    // Location entry + shop pages (path-based)
    for (const l of locations) {
      base.push({
        url: buildUrl(ROOT_DOMAIN, `/${l.slug}`),
        lastModified: now,
      });
      base.push({
        url: buildUrl(ROOT_DOMAIN, `/${l.slug}/shop`),
        lastModified: now,
      });
    }

    // Store pages (path-based)
    for (const s of stores) {
      const locationSlug = s.location?.slug ?? "";
      if (!locationSlug) continue;
      base.push({
        url: buildUrl(
          ROOT_DOMAIN,
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
