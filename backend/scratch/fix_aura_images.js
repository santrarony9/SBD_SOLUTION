const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupAura() {
  console.log('Updating Aura placeholders...');
  
  // Update Aura Minimalist Diamond Studs
  await prisma.product.updateMany({
    where: { sku: 'AURA-001' },
    data: {
      images: ['https://res.cloudinary.com/dd2ajeyom/image/upload/v1778315812/products/bpqhsginydjmrcbhds1h.jpg'],
      description: 'Elegant 9K gold minimalist studs, part of our youth-focused Aura collection. Perfect for everyday luxury.'
    }
  });

  // Update Aura Infinity Delicate Bracelet
  await prisma.product.updateMany({
    where: { sku: 'AURA-002' },
    data: {
      images: ['https://res.cloudinary.com/dd2ajeyom/image/upload/v1778315953/products/vtt8w9vjbourftcsyi7y.jpg'],
      description: 'A delicate infinity bracelet in 9K gold. Timeless design for the modern era.'
    }
  });

  console.log('Aura products updated.');
  await prisma.$disconnect();
}

cleanupAura();
