import { PrismaClient } from "@prisma/client";
import { seedLocations } from "./seed-locations.mjs";

const prisma = new PrismaClient();

/** Seed stores under Malmesbury; keys match product.vendorKey below. */
const VENDOR_SPECS = [
  { key: "bakery-de-vries", name: "Bakery De Vries", slug: "bakery-de-vries" },
  { key: "kaas-stolt", name: "Kaas Stolt", slug: "kaas-stolt" },
  {
    key: "slagerij-van-niekerk",
    name: "Slagerij Van Niekerk",
    slug: "slagerij-van-niekerk",
  },
  { key: "zuivel-co-op", name: "Zuivel Co-op", slug: "zuivel-co-op" },
  {
    key: "groente-pretorius",
    name: "Groente Pretorius",
    slug: "groente-pretorius",
  },
];

const products = [
  {
    vendorKey: "bakery-de-vries",
    title: "Handgemaakte bruinbrood",
    price: 42,
    unit: "800g",
    image: "https://picsum.photos/seed/plaasmark-bread/800/600",
  },
  {
    vendorKey: "kaas-stolt",
    title: "Goue Gouda stuk",
    price: 118.5,
    unit: "400g",
    image: "https://picsum.photos/seed/plaasmark-cheese/800/600",
  },
  {
    vendorKey: "slagerij-van-niekerk",
    title: "Maalvleis (lean)",
    price: 89.99,
    unit: "1kg",
    image: "https://picsum.photos/seed/plaasmark-mince/800/600",
  },
  {
    vendorKey: "slagerij-van-niekerk",
    title: "Beesbiefstuk",
    price: 165,
    unit: "4 stuks",
    image: "https://picsum.photos/seed/plaasmark-steak/800/600",
  },
  {
    vendorKey: "zuivel-co-op",
    title: "Volroom melk",
    price: 21.9,
    unit: "2L",
    image: "https://picsum.photos/seed/plaasmark-milk/800/600",
  },
  {
    vendorKey: "zuivel-co-op",
    title: "Vrylopende eiers",
    price: 52,
    unit: "dosyn",
    image: "https://picsum.photos/seed/plaasmark-eggs/800/600",
  },
  {
    vendorKey: "groente-pretorius",
    title: "Kersietamaties",
    price: 36.5,
    unit: "750g",
    image: "https://picsum.photos/seed/plaasmark-tomatoes/800/600",
  },
  {
    vendorKey: "zuivel-co-op",
    title: "Plaasbotter (gesout)",
    price: 64.9,
    unit: "500g",
    image: "https://picsum.photos/seed/plaasmark-butter/800/600",
  },
  {
    vendorKey: "slagerij-van-niekerk",
    title: "Gerookte spek",
    price: 79,
    unit: "300g",
    image: "https://picsum.photos/seed/plaasmark-bacon/800/600",
  },
];

async function main() {
  await seedLocations(prisma);

  const malmesbury = await prisma.location.findUnique({
    where: { slug: "malmesbury" },
  });
  if (!malmesbury) {
    throw new Error("Location malmesbury not found after seedLocations.");
  }

  const member = await prisma.member.upsert({
    where: { phone: "+27000000001" },
    create: { name: "Demo Verkoper", phone: "+27000000001" },
    update: {},
  });

  const vendorToStoreId = new Map();
  for (const v of VENDOR_SPECS) {
    const store = await prisma.store.upsert({
      where: {
        memberId_slug: { memberId: member.id, slug: v.slug },
      },
      create: {
        memberId: member.id,
        locationId: malmesbury.id,
        name: v.name,
        slug: v.slug,
        isActive: true,
      },
      update: { name: v.name, isActive: true },
    });
    vendorToStoreId.set(v.key, store.id);
  }

  await prisma.product.deleteMany();

  for (const p of products) {
    const vendorId = vendorToStoreId.get(p.vendorKey);
    if (!vendorId) {
      throw new Error(`Unknown vendorKey: ${p.vendorKey}`);
    }
    const spec = VENDOR_SPECS.find((x) => x.key === p.vendorKey);
    const vendorName = spec?.name ?? "";
    await prisma.product.create({
      data: {
        title: p.title,
        price: p.price,
        unit: p.unit,
        image: p.image,
        vendorId,
        vendorName,
      },
    });
  }

  console.log(`Seeded ${products.length} products (Malmesbury stores).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
