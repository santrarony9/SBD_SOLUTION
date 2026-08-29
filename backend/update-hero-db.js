const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Starting DB update for hero text...");
        
        const existing = await prisma.storeSetting.findUnique({
            where: { key: 'homepage_hero_text' }
        });

        let data = {};
        if (existing && existing.value) {
            try {
                data = JSON.parse(existing.value);
            } catch (e) {}
        }
        
        data.showText = false; // Set to false per user request

        await prisma.storeSetting.upsert({
            where: { key: 'homepage_hero_text' },
            update: { value: JSON.stringify(data) },
            create: { key: 'homepage_hero_text', value: JSON.stringify(data) }
        });

        console.log("Database updated successfully with showText: false!");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
