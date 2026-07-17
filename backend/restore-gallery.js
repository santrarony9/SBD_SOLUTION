const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreGallery() {
    const galleryItems = await prisma.galleryItem.findMany();
    console.log(`Found ${galleryItems.length} gallery items`);
    
    const validImages = [
        '/uploads/products/aew78f7lc4ay58he21ck.png',
        '/uploads/products/ah9lpmuqyt2npk4j64ep.png',
        '/uploads/products/az5nheijhyzbthjwu9e8.png',
        '/uploads/products/bw4cwt5m3ny0xiuf4qpb.png',
        '/uploads/products/cdn1cpm6lkcjfkgctxmb.png',
        '/uploads/products/davbudxzeyszzakvngoq.png',
        '/uploads/products/dqsdhli0rltfh4qv2wg2.png',
        '/uploads/products/ed0rnhxeqznynay6vi3l.png'
    ];

    for (let i = 0; i < galleryItems.length; i++) {
        const item = galleryItems[i];
        const newImage = validImages[i % validImages.length];
        await prisma.galleryItem.update({
            where: { id: item.id },
            data: {
                imageUrl: newImage
            }
        });
        console.log(`Updated gallery item: ${item.title} with ${newImage}`);
    }
    console.log('All gallery items restored.');
}

restoreGallery()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
