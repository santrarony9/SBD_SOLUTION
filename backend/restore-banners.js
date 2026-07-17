const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreBanners() {
    const banners = await prisma.banner.findMany();
    console.log(`Found ${banners.length} banners`);
    
    for (const banner of banners) {
        await prisma.banner.update({
            where: { id: banner.id },
            data: {
                imageUrl: '/hero-jewellery.png',
                mobileImageUrl: '/hero-jewellery.png'
            }
        });
        console.log(`Updated banner: ${banner.title}`);
    }
    console.log('All banners restored.');
}

restoreBanners()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
