const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Aura Youth Collection...');

    const products = [
        {
            name: 'Aura Minimalist Diamond Studs',
            slug: 'aura-minimalist-studs',
            description: 'Perfect for daily wear, these minimalist studs are part of our new Aura youth collection.',
            goldPurity: 18,
            goldWeight: 1.2,
            diamondClarity: 'VVS1',
            diamondCarat: 0.1,
            diamondColor: 'E-F',
            diamondCut: 'Excellent',
            images: ['https://images.unsplash.com/photo-1635767790474-12344795321e?auto=format&fit=crop&q=80&w=1000'],
            sku: 'AURA-001',
            stockCount: 20,
            category: 'Earrings',
            tags: ['Aura', 'Youth', 'Minimalist'],
            isYouthTarget: true
        },
        {
            name: 'Aura Infinity Delicate Bracelet',
            slug: 'aura-infinity-bracelet',
            description: 'Express your infinite style with this delicate 18K gold bracelet.',
            goldPurity: 18,
            goldWeight: 2.5,
            diamondClarity: 'VS1',
            diamondCarat: 0.05,
            diamondColor: 'G-H',
            diamondCut: 'Very Good',
            images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1520a?auto=format&fit=crop&q=80&w=1000'],
            sku: 'AURA-002',
            stockCount: 15,
            category: 'Bracelets',
            tags: ['Aura', 'Youth', 'Chic'],
            isYouthTarget: true
        }
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { slug: product.slug },
            update: { isYouthTarget: true },
            create: product
        });
        console.log(`Upserted: ${product.name}`);
    }

    console.log('Aura Seeding Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
