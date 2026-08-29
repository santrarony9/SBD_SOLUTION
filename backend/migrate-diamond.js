const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Migrating diamond prices to include color...');
    
    // Find all diamond prices
    const prices = await prisma.diamondPrice.findMany();
    
    for (const price of prices) {
      if (!price.color) {
        await prisma.diamondPrice.update({
          where: { id: price.id },
          data: { color: 'EF' }
        });
        console.log(`Updated ${price.clarity} to have color EF`);
      }
    }
    
    console.log('Migration complete.');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
