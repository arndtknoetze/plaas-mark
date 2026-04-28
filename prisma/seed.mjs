import { PrismaClient } from "@prisma/client";
import { seedLocations } from "./seed-locations.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

const SNAPSHOT_DIR = path.join(process.cwd(), "prisma", "seed-snapshots");

async function readJson(file) {
  const raw = await fs.readFile(path.join(SNAPSHOT_DIR, file), "utf8");
  return JSON.parse(raw);
}

async function memberRoleColumnExists() {
  try {
    const rows = await prisma.$queryRaw`
      SELECT COUNT(*) AS c
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'Member'
        AND COLUMN_NAME = 'role'
    `;
    const first = Array.isArray(rows) ? rows[0] : null;
    return Boolean(
      first && typeof first.c !== "undefined" && Number(first.c) > 0,
    );
  } catch {
    return false;
  }
}

async function main() {
  await seedLocations(prisma);
  const hasMemberRole = await memberRoleColumnExists();

  // Production safety: never restore local snapshots or delete/overwrite data.
  // We only ensure the core tenant locations exist.
  if (process.env.NODE_ENV === "production") {
    console.log("Production seed: ensured locations only.");
    return;
  }

  // Optional: if you have a snapshot, restore it for repeatable dev resets.
  // You can create/update the snapshot from your current DB with:
  //   node scripts/export-seed-snapshot.mjs
  let snapshot;
  try {
    snapshot = {
      locations: await readJson("locations.json"),
      members: await readJson("members.json"),
      stores: await readJson("stores.json"),
      products: await readJson("products.json"),
    };
  } catch {
    snapshot = null;
  }

  if (!snapshot) {
    // Fallback minimal seed: ensure one admin exists.
    await prisma.member.upsert({
      where: { phone: "+27000000001" },
      create: hasMemberRole
        ? { name: "Demo Admin", phone: "+27000000001", role: "ADMIN" }
        : { name: "Demo Admin", phone: "+27000000001" },
      update: hasMemberRole ? { role: "ADMIN" } : {},
    });
    console.log(
      "No prisma/seed-snapshots found; seeded locations + Demo Admin only.",
    );
    return;
  }

  // Ensure locations from snapshot exist (seedLocations already created defaults).
  for (const loc of snapshot.locations) {
    await prisma.location.upsert({
      where: { slug: loc.slug },
      create: { name: loc.name, slug: loc.slug },
      update: { name: loc.name },
    });
  }

  // Members: upsert by phone (stable), keep role.
  for (const m of snapshot.members) {
    await prisma.member.upsert({
      where: { phone: m.phone },
      create: {
        name: m.name,
        phone: m.phone,
        ...(hasMemberRole ? { role: m.role ?? "MEMBER" } : {}),
      },
      update: {
        name: m.name,
        ...(hasMemberRole ? { role: m.role ?? "MEMBER" } : {}),
      },
    });
  }

  const memberByPhone = new Map(
    (await prisma.member.findMany({ select: { id: true, phone: true } })).map(
      (m) => [m.phone, m.id],
    ),
  );

  // Stores: upsert by (memberId, slug). Map memberId via member phone.
  for (const s of snapshot.stores) {
    const memberPhone =
      snapshot.members.find((m) => m.id === s.memberId)?.phone ?? null;
    const memberId = memberPhone ? memberByPhone.get(memberPhone) : undefined;
    if (!memberId) continue;

    // Resolve locationId via slug where possible.
    const loc =
      snapshot.locations.find((l) => l.id === s.locationId)?.slug ?? null;
    const location = loc
      ? await prisma.location.findUnique({ where: { slug: loc } })
      : null;
    const locationId =
      location?.id ??
      (await prisma.location.findFirst({ orderBy: { createdAt: "asc" } }))?.id;
    if (!locationId) continue;

    await prisma.store.upsert({
      where: { memberId_slug: { memberId, slug: s.slug } },
      create: {
        memberId,
        locationId,
        name: s.name,
        slug: s.slug,
        isActive: Boolean(s.isActive),
        brandColor: s.brandColor ?? "#2E5E3E",
        logoUrl: s.logoUrl ?? null,
        addressText: s.addressText ?? null,
        email: s.email ?? null,
        whatsapp: s.whatsapp ?? null,
        instagram: s.instagram ?? null,
        facebook: s.facebook ?? null,
        website: s.website ?? null,
        hoursText: s.hoursText ?? null,
      },
      update: {
        name: s.name,
        isActive: Boolean(s.isActive),
        brandColor: s.brandColor ?? "#2E5E3E",
        logoUrl: s.logoUrl ?? null,
        addressText: s.addressText ?? null,
        email: s.email ?? null,
        whatsapp: s.whatsapp ?? null,
        instagram: s.instagram ?? null,
        facebook: s.facebook ?? null,
        website: s.website ?? null,
        hoursText: s.hoursText ?? null,
      },
    });
  }

  // Build mapping of old storeId -> new storeId using (memberPhone, slug).
  const allStores = await prisma.store.findMany({
    select: { id: true, slug: true, member: { select: { phone: true } } },
  });
  const storeKeyToId = new Map(
    allStores.map((s) => [`${s.member.phone}::${s.slug}`, s.id]),
  );

  // Products: best-effort restore. Re-create all products to keep snapshot exact.
  await prisma.product.deleteMany();
  for (const p of snapshot.products) {
    const store = snapshot.stores.find((s) => s.id === p.vendorId);
    const storeMemberPhone =
      store && snapshot.members.find((m) => m.id === store.memberId)?.phone;
    const vendorId =
      storeMemberPhone && store
        ? storeKeyToId.get(`${storeMemberPhone}::${store.slug}`)
        : undefined;
    if (!vendorId) continue;

    await prisma.product.create({
      data: {
        title: p.title,
        price: p.price,
        unit: p.unit ?? null,
        image: p.image ?? null,
        vendorId,
        vendorName: p.vendorName ?? "",
      },
    });
  }

  console.log(
    `Seeded snapshot (${snapshot.locations.length} locations, ${snapshot.members.length} members, ${snapshot.stores.length} stores, ${snapshot.products.length} products).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
