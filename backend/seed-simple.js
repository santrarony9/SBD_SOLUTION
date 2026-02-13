const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Pricing Data (Simple Script)...');

    // 1. Charges
    const charges = [
        {
            name: 'Making Charges', // Check exact name usage in PricingService
            type: 'PER_GRAM',
            amount: 800,
            applyOn: 'GOLD_VALUE',
        },
        {
            name: 'GST',
            type: 'PERCENTAGE',
            amount: 3,
            applyOn: 'FINAL_AMOUNT',
        }
    ];

    for (const charge of charges) {
        const existing = await prisma.charge.findUnique({ where: { name: charge.name } });
        if (!existing) {
            await prisma.charge.create({ data: charge });
            console.log(`Created charge: ${charge.name}`);
        } else {
            console.log(`Charge already exists: ${charge.name}`);
            // Optional: Update if needed
            // await prisma.charge.update({ where: { id: existing.id }, data: charge });
        }
    }

    // 2. Ensure Gold Rate (Base)
    const goldPurities = [18, 22, 24];
    for (const purity of goldPurities) {
        const exists = await prisma.goldPrice.findUnique({ where: { purity } });
        if (!exists) {
            await prisma.goldPrice.create({
                data: {
                    purity,
                    pricePer10g: 65000 + (purity - 18) * 1000,
                },
            });
            console.log(`Created Gold Rate: ${purity}K`);
        }
    }

    // 3. Ensure Diamond Rate (Base)
    const clarities = ['VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'];
    let price = 50000;
    for (const clarity of clarities) {
        const exists = await prisma.diamondPrice.findUnique({ where: { clarity } });
        if (!exists) {
            await prisma.diamondPrice.create({
                data: {
                    clarity,
                    pricePerCarat: price,
                },
            });
            console.log(`Created Diamond Rate: ${clarity}`);
        }
        price -= 3000;
    }

    console.log('Seeding Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
