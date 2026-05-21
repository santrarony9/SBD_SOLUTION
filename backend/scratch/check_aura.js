const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAuraProducts() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { isYouthTarget: true },
        { goldPurity: 9 }
      ]
    }
  });

  console.log(JSON.stringify(products, null, 2));
  await prisma.$disconnect();
}

checkAuraProducts();
