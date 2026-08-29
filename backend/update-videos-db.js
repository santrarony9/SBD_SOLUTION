const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Starting DB update for Vercel public videos...");
        
        await prisma.videoShowcase.deleteMany({});

        await prisma.videoShowcase.create({
            data: { title: 'Timeless Beauty', tagline: 'DISCOVER', videoUrl: '/videos/video1.mp4', order: 1 }
        });

        await prisma.videoShowcase.create({
            data: { title: 'Craftsmanship', tagline: 'OUR PROCESS', videoUrl: '/videos/video2.mp4', order: 2 }
        });

        await prisma.videoShowcase.create({
            data: { title: 'The Royal Standard', tagline: 'LUXURY', videoUrl: '/videos/video3.mp4', order: 3 }
        });

        console.log("Database updated successfully with Vercel video paths!");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
