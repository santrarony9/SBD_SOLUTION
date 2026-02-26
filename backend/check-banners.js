const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBanners() {
    try {
        const banners = await prisma.banner.findMany();
        console.log('BANNERS:', JSON.stringify(banners, null, 2));
    } catch (err) {
        console.error('ERROR fetching banners:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkBanners();
