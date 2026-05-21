import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const count = await prisma.product.count({
        where: { isYouthTarget: true }
    });
    console.log('Total products with isYouthTarget=true:', count);

    const products = await prisma.product.findMany({
        where: { isYouthTarget: true },
        select: { name: true, goldPurity: true, isActive: true }
    });
    console.log('List:');
    console.log(JSON.stringify(products, null, 2));

    const all9k = await prisma.product.count({
        where: { goldPurity: 9 }
    });
    console.log('Total products with goldPurity=9:', all9k);

    const all9kNotFlagged = await prisma.product.findMany({
        where: { goldPurity: 9, isYouthTarget: false },
        select: { name: true }
    });
    console.log('9K products NOT flagged as Youth Target:');
    console.log(JSON.stringify(all9kNotFlagged, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
