import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const order = await prisma.order.findFirst({
        include: { items: { include: { product: true } } }
    });
    console.log(JSON.stringify(order, null, 2));
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
