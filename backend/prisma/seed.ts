import { PrismaClient, Role, ChargeType, ApplyOn } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Create Admin User
  const adminEmail = 'admin@sparkblue.com';
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: Role.ADMIN,
      },
    });
    console.log('Admin user created');
  }

  // 2. Gold Prices (Base data)
  const goldPurities = [18, 22, 24];
  for (const purity of goldPurities) {
    await prisma.goldPrice.upsert({
      where: { purity },
      update: {}, // Don't overwrite if exists
      create: {
        purity,
        pricePer10g: 65000 + (purity - 18) * 1000, // Dummy starting logic
      },
    });
  }
  console.log('Gold prices seeded');

  // 3. Diamond Prices
  // VVS1, VVS2, VS1, VS2, SI1, SI2
  const clarities = ['VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'];
  let price = 50000;
  for (const clarity of clarities) {
    await prisma.diamondPrice.upsert({
      where: { clarity },
      update: {},
      create: {
        clarity,
        pricePerCarat: price,
      },
    });
    price -= 3000; // cheaper as quality drops
  }
  console.log('Diamond prices seeded');

  // 4. Charges
  // 4. Charges
  const charges = [
    {
      name: 'Making Charges',
      type: ChargeType.PER_GRAM,
      amount: 800, // 800rs per gram
      applyOn: ApplyOn.GOLD_VALUE,
    },
    {
      name: 'GST',
      type: ChargeType.PERCENTAGE,
      amount: 3, // 3%
      applyOn: ApplyOn.FINAL_AMOUNT,
    }
  ];

  for (const charge of charges) {
    // Check if exists by name (simplified check since name isn't unique in schema but good enough for seed)
    const existing = await prisma.charge.findFirst({ where: { name: charge.name } });
    if (!existing) {
      await prisma.charge.create({ data: charge });
    }
  }
  console.log('Charges seeded');

  // 5. Offers
  const offers = [
    {
      title: 'First Purchase',
      description: 'Begin your royal journey with a special welcome. Enjoy a flat ₹5,000 Off on your first diamond jewellery purchase over ₹50,000.',
      tag: 'Limited Time',
      code: 'ROYALFIRST',
      isActive: true
    },
    {
      title: 'Old Gold Exchange',
      description: 'Upgrade your legacy. Get 0% Deduction on current market value when you exchange your old gold for our diamond studded jewellery.',
      tag: 'Exchange Program',
      code: null,
      isActive: true
    }
  ];

  for (const offer of offers) {
    const existing = await prisma.offer.findFirst({ where: { title: offer.title } });
    if (!existing) {
      await prisma.offer.create({ data: offer });
    }
  }
  console.log('Offers seeded');
  console.log('Offers seeded');

  // 6. Products
  const products = [
    {
      name: 'Royal Diamond Ring',
      slug: 'royal-diamond-ring',
      description: 'A masterpiece of craftsmanship featuring a solitaire diamond set in 18K Gold.',
      goldPurity: 18,
      goldWeight: 4.5,
      diamondClarity: 'VVS1',
      diamondCarat: 0.5,
      diamondColor: 'E-F',
      diamondCut: 'Excellent',
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1000'],
      sku: 'RDR-001',
      stockCount: 5,
      category: 'Rings',
      tags: ['Best Seller', 'Engagement']
    },
    {
      name: 'Eternal Gold Necklace',
      slug: 'eternal-gold-necklace',
      description: 'Timeless elegance with this 22K Gold necklace, perfect for weddings.',
      goldPurity: 22,
      goldWeight: 25.0,
      diamondClarity: 'VS1', // Dummy, maybe no diamond
      diamondCarat: 0.0,
      diamondColor: null,
      diamondCut: null,
      images: ['https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=1000'],
      sku: 'EGN-002',
      stockCount: 2,
      category: 'Necklaces',
      tags: ['Wedding', 'Traditional']
    }
  ];

  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }
  console.log('Products seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
