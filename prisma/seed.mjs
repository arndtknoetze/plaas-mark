import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    title: "Handgemaakte bruinbrood",
    price: 42,
    unit: "800g",
    vendorId: "bakery-de-vries",
    vendorName: "Bakery De Vries",
    image: "https://picsum.photos/seed/plaasmark-bread/800/600",
  },
  {
    title: "Goue Gouda stuk",
    price: 118.5,
    unit: "400g",
    vendorId: "kaas-stolt",
    vendorName: "Kaas Stolt",
    image: "https://picsum.photos/seed/plaasmark-cheese/800/600",
  },
  {
    title: "Maalvleis (lean)",
    price: 89.99,
    unit: "1kg",
    vendorId: "slagerij-van-niekerk",
    vendorName: "Slagerij Van Niekerk",
    image: "https://picsum.photos/seed/plaasmark-mince/800/600",
  },
  {
    title: "Beesbiefstuk",
    price: 165,
    unit: "4 stuks",
    vendorId: "slagerij-van-niekerk",
    vendorName: "Slagerij Van Niekerk",
    image: "https://picsum.photos/seed/plaasmark-steak/800/600",
  },
  {
    title: "Volroom melk",
    price: 21.9,
    unit: "2L",
    vendorId: "zuivel-co-op",
    vendorName: "Zuivel Co-op",
    image: "https://picsum.photos/seed/plaasmark-milk/800/600",
  },
  {
    title: "Vrylopende eiers",
    price: 52,
    unit: "dosyn",
    vendorId: "zuivel-co-op",
    vendorName: "Zuivel Co-op",
    image: "https://picsum.photos/seed/plaasmark-eggs/800/600",
  },
  {
    title: "Kersietamaties",
    price: 36.5,
    unit: "750g",
    vendorId: "groente-pretorius",
    vendorName: "Groente Pretorius",
    image: "https://picsum.photos/seed/plaasmark-tomatoes/800/600",
  },
  {
    title: "Plaasbotter (gesout)",
    price: 64.9,
    unit: "500g",
    vendorId: "zuivel-co-op",
    vendorName: "Zuivel Co-op",
    image: "https://picsum.photos/seed/plaasmark-butter/800/600",
  },
  {
    title: "Gerookte spek",
    price: 79,
    unit: "300g",
    vendorId: "slagerij-van-niekerk",
    vendorName: "Slagerij Van Niekerk",
    image: "https://picsum.photos/seed/plaasmark-bacon/800/600",
  },
];

async function main() {
  await prisma.product.deleteMany();

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
