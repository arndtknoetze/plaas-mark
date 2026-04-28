import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function stableImageUrl(seed) {
  const s = encodeURIComponent(String(seed).toLowerCase());
  return `https://picsum.photos/seed/${s}/1200/800`;
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
  const hasMemberRole = await memberRoleColumnExists();

  const location = await prisma.location.findUnique({
    where: { slug: "malmesbury" },
  });
  if (!location) {
    throw new Error(
      'Location "malmesbury" not found. Run `npm run db:seed` (or `prisma db seed`) first.',
    );
  }

  const members = [
    { name: "Demo Member Malmesbury 1", phone: "+27000000011", role: "MEMBER" },
    { name: "Demo Member Malmesbury 2", phone: "+27000000012", role: "MEMBER" },
    { name: "Demo Vendor Malmesbury", phone: "+27000000013", role: "MEMBER" },
  ];

  for (const m of members) {
    await prisma.member.upsert({
      where: { phone: m.phone },
      create: {
        name: m.name,
        phone: m.phone,
        ...(hasMemberRole ? { role: m.role } : {}),
      },
      update: {
        name: m.name,
        ...(hasMemberRole ? { role: m.role } : {}),
      },
    });
  }

  const memberByPhone = new Map(
    (
      await prisma.member.findMany({
        where: { phone: { in: members.map((m) => m.phone) } },
        select: { id: true, phone: true },
      })
    ).map((m) => [m.phone, m.id]),
  );

  const storeSpecs = [
    {
      ownerPhone: "+27000000011",
      name: "Malmesbury Fresh Farm",
      slug: "fresh-farm",
      brandColor: "#2E5E3E",
      logoUrlSeed: "malmesbury-fresh-farm",
    },
    {
      ownerPhone: "+27000000012",
      name: "Malmesbury Pantry",
      slug: "pantry",
      brandColor: "#5E3E2E",
      logoUrlSeed: "malmesbury-pantry",
    },
    {
      ownerPhone: "+27000000013",
      name: "Swartland Bakes",
      slug: "swartland-bakes",
      brandColor: "#3E2E5E",
      logoUrlSeed: "swartland-bakes",
    },
  ];

  const storeIds = new Map();
  for (const s of storeSpecs) {
    const memberId = memberByPhone.get(s.ownerPhone);
    if (!memberId) continue;

    const store = await prisma.store.upsert({
      where: { memberId_slug: { memberId, slug: s.slug } },
      create: {
        memberId,
        locationId: location.id,
        name: s.name,
        slug: s.slug,
        isActive: true,
        brandColor: s.brandColor,
        logoUrl: stableImageUrl(s.logoUrlSeed ?? s.slug),
      },
      update: {
        name: s.name,
        locationId: location.id,
        isActive: true,
        brandColor: s.brandColor,
        logoUrl: stableImageUrl(s.logoUrlSeed ?? s.slug),
      },
      select: { id: true },
    });

    storeIds.set(s.slug, store.id);
  }

  const productsByStoreSlug = {
    "fresh-farm": [
      { title: "Free Range Eggs (6)", price: "34.00", unit: "pack" },
      { title: "Baby Spinach", price: "22.50", unit: "bag" },
      { title: "Avocados", price: "18.00", unit: "each" },
      { title: "Butternut", price: "28.00", unit: "each" },
    ],
    pantry: [
      { title: "Raw Honey (500g)", price: "89.00", unit: "jar" },
      { title: "Olive Oil (250ml)", price: "74.00", unit: "bottle" },
      { title: "Farm Jam (450g)", price: "55.00", unit: "jar" },
      { title: "Rooibos Tea (80g)", price: "49.00", unit: "box" },
    ],
    "swartland-bakes": [
      { title: "Sourdough Loaf", price: "48.00", unit: "each" },
      { title: "Ciabatta", price: "32.00", unit: "each" },
      { title: "Croissant (butter)", price: "18.00", unit: "each" },
      { title: "Rusks (500g)", price: "65.00", unit: "bag" },
    ],
  };

  let created = 0;
  for (const [storeSlug, items] of Object.entries(productsByStoreSlug)) {
    const vendorId = storeIds.get(storeSlug);
    if (!vendorId) continue;

    const titles = items.map((p) => p.title);
    await prisma.product.deleteMany({
      where: { vendorId, title: { in: titles } },
    });

    for (const p of items) {
      const imageUrl = stableImageUrl(`malmesbury-${storeSlug}-${p.title}`);
      await prisma.product.create({
        data: {
          title: p.title,
          price: p.price,
          unit: p.unit ?? null,
          image: imageUrl,
          images: [imageUrl],
          vendorId,
          vendorName: "",
          isActive: true,
        },
      });
      created += 1;
    }
  }

  const storeCount = await prisma.store.count({
    where: {
      locationId: location.id,
      slug: { in: storeSpecs.map((s) => s.slug) },
    },
  });
  console.log(
    `Seeded Malmesbury extras: ${members.length} members (upserted), ${storeCount} stores (upserted), ${created} products (recreated).`,
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
