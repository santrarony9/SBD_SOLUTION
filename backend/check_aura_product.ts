import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const product = await prisma.product.findFirst({
        where: { name: { contains: 'Aura Minimalist', mode: 'insensitive' } }
    });
    console.log('Product Details:');
    console.log(JSON.stringify(product, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
