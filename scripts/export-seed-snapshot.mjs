import { PrismaClient } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

function toJsonCompatible(row) {
  // Prisma returns Decimal objects for MySQL DECIMAL.
  // Ensure snapshots are JSON-serializable and stable.
  return JSON.parse(
    JSON.stringify(row, (_k, v) => {
      if (v && typeof v === "object" && typeof v.toJSON === "function") {
        return v.toJSON();
      }
      return v;
    }),
  );
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function main() {
  const outDir = path.join(process.cwd(), "prisma", "seed-snapshots");

  const locations = await prisma.location.findMany({
    orderBy: { createdAt: "asc" },
  });

  const members = await prisma.member.findMany({
    orderBy: { createdAt: "asc" },
  });

  const stores = await prisma.store.findMany({
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  const products = await prisma.product.findMany({
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  await writeJson(
    path.join(outDir, "locations.json"),
    toJsonCompatible(locations),
  );
  await writeJson(path.join(outDir, "members.json"), toJsonCompatible(members));
  await writeJson(path.join(outDir, "stores.json"), toJsonCompatible(stores));
  await writeJson(
    path.join(outDir, "products.json"),
    toJsonCompatible(products),
  );

  console.log(
    `Exported seed snapshot to prisma/seed-snapshots/ (${locations.length} locations, ${members.length} members, ${stores.length} stores, ${products.length} products).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
