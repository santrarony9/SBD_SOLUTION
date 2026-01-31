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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
