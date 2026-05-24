import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  const warehouse1 = await prisma.warehouse.create({
    data: {
      name: "Chennai Warehouse",
    },
  });

  const warehouse2 = await prisma.warehouse.create({
    data: {
      name: "Bangalore Warehouse",
    },
  });

  const product1 = await prisma.product.create({
    data: {
      name: "iPhone 15",
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Samsung S24",
    },
  });

  await prisma.inventory.createMany({
    data: [
      {
        productId: product1.id,
        warehouseId: warehouse1.id,
        totalUnits: 10,
      },
      {
        productId: product1.id,
        warehouseId: warehouse2.id,
        totalUnits: 5,
      },
      {
        productId: product2.id,
        warehouseId: warehouse1.id,
        totalUnits: 7,
      },
    ],
  });

  console.log("Seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });