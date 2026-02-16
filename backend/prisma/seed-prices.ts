
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding price ranges...');

    const priceRanges = [
        { label: '₹2,000 - ₹10,000', minPrice: 2000, maxPrice: 10000, imageUrl: '' },
        { label: '₹10,000 - ₹25,000', minPrice: 10000, maxPrice: 25000, imageUrl: '' },
        { label: '₹25,000 - ₹50,000', minPrice: 25000, maxPrice: 50000, imageUrl: '' },
        { label: '₹50,000 - ₹1,00,000', minPrice: 50000, maxPrice: 100000, imageUrl: '' },
    ];

    for (const range of priceRanges) {
        // Check if exists to avoid duplicates
        const exists = await prisma.priceRange.findFirst({
            where: { label: range.label }
        });

        if (!exists) {
            await prisma.priceRange.create({
                data: range
            });
            console.log(`Created price range: ${range.label}`);
        } else {
            console.log(`Price range already exists: ${range.label}`);
        }
    }

    console.log('Seeding tags...');
    const tags = [
        { name: 'Best Sellers', slug: 'best-sellers' },
        { name: 'New Drops', slug: 'new-drops' },
        { name: 'Wedding', slug: 'wedding' },
        { name: 'Gifts', slug: 'gifts' },
    ];

    for (const tag of tags) {
        const exists = await prisma.tag.findUnique({
            where: { slug: tag.slug }
        });

        if (!exists) {
            await prisma.tag.create({
                data: tag
            })
            console.log(`Created tag: ${tag.name}`);
        } else {
            console.log(`Tag already exists: ${tag.name}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
