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
    { url: buildUrl(ROOT_DOMAIN, "/shop"), lastModified: now },
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

    const locOrigins = new Map<string, string>();
    for (const l of locations) {
      locOrigins.set(l.slug, `https://${l.slug}.plaas-mark.co.za`);
    }

    // Location home + shop pages (subdomain)
    for (const l of locations) {
      const origin = locOrigins.get(l.slug);
      if (!origin) continue;
      base.push({ url: buildUrl(origin, "/"), lastModified: now });
      base.push({ url: buildUrl(origin, "/shop"), lastModified: now });
    }

    // Store pages (subdomain when possible; otherwise root domain)
    for (const s of stores) {
      const origin =
        s.location?.slug && locOrigins.has(s.location.slug)
          ? (locOrigins.get(s.location.slug) as string)
          : ROOT_DOMAIN;
      base.push({
        url: buildUrl(origin, `/shop/${s.slug}--${encodeURIComponent(s.id)}`),
        lastModified: s.updatedAt ?? now,
      });
    }
  } catch {
    // If the DB is unavailable (e.g. build without DATABASE_URL), still emit base URLs.
  }

  return base;
}
