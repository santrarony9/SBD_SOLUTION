
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Attempting to create product...');

    const payload = {
        name: "Debug Product",
        slug: "debug-product-" + Date.now(),
        category: "Rings",
        description: "Debug description",
        goldPurity: 18,
        goldWeight: 1.2,
        diamondCarat: 0.08,
        diamondClarity: "VS1",
        images: [], // Empty array
        videoUrl: "", // Empty string
        certificatePdf: "" // Empty string
    };

    try {
        const product = await prisma.product.create({
            data: payload,
        });
        console.log('SUCCESS: Product created:', product.id);
    } catch (e) {
        console.error('ERROR: Failed to create product');
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
