/**
 * Idempotent location rows for local / CI seeding.
 * @param {import("@prisma/client").PrismaClient} prisma
 */
export async function seedLocations(prisma) {
  const locations = [
    { name: "Malmesbury", slug: "malmesbury" },
    { name: "Paarl", slug: "paarl" },
    { name: "Stellenbosch", slug: "stellenbosch" },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { slug: loc.slug },
      create: loc,
      update: { name: loc.name },
    });
  }

  console.log(`Seeded ${locations.length} locations.`);
}
