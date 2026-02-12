
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
    try {
        const count = await prisma.product.count();
        console.log(`Total Products: ${count}`);

        const products = await prisma.product.findMany();
        console.log('Products:', JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Error querying products:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkProducts();
