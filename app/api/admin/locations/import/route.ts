import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getAdminCookieName,
  verifyAdminSessionToken,
} from "@/lib/admin-session";
import { SA_LOCATIONS } from "@/lib/data/sa-locations";

function readCookieValue(cookieHeader: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`));
  return match?.[1]?.trim() ?? "";
}

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  if (process.env.ADMIN_ROUTES_ENABLED !== "true") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = readCookieValue(cookieHeader, getAdminCookieName());
  const admin = token ? verifyAdminSessionToken(token) : null;
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  const rows: {
    name: string;
    slug: string;
    province: string | null;
    lat: number;
    lng: number;
  }[] = [];

  for (const row of SA_LOCATIONS) {
    const slug = normalizeSlug(row.slug);
    if (!slug) {
      skipped += 1;
      continue;
    }
    rows.push({
      name: row.name.trim(),
      slug,
      province: row.province.trim() || null,
      lat: row.lat,
      lng: row.lng,
    });
  }

  const existingSlugs = new Set<string>();
  const slugChunks: string[][] = [];
  for (let i = 0; i < rows.length; i += 1000) {
    slugChunks.push(rows.slice(i, i + 1000).map((r) => r.slug));
  }
  for (const chunk of slugChunks) {
    const existing = await prisma.location.findMany({
      where: { slug: { in: chunk } },
      select: { slug: true },
    });
    for (const row of existing) existingSlugs.add(row.slug);
  }

  const toCreate = rows.filter((r) => !existingSlugs.has(r.slug));
  if (toCreate.length > 0) {
    const createdBatch = await prisma.location.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
    created += createdBatch.count;
  }

  for (const row of rows) {
    if (!existingSlugs.has(row.slug)) continue;
    await prisma.location.update({
      where: { slug: row.slug },
      data: {
        name: row.name,
        province: row.province,
        lat: row.lat,
        lng: row.lng,
      },
    });
    updated += 1;
  }

  return NextResponse.json({ created, updated, skipped });
}
