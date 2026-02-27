
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setFestival(festivalName) {
    const festiveConfig = await prisma.storeSetting.findUnique({ where: { key: 'festive_config' } });
    if (festiveConfig?.value) {
        try {
            const cfg = typeof festiveConfig.value === 'string' ? JSON.parse(festiveConfig.value) : festiveConfig.value;
            cfg.active = true;
            cfg.currentFestival = festivalName;

            await prisma.storeSetting.update({
                where: { key: 'festive_config' },
                data: { value: JSON.stringify(cfg) }
            });
            console.log(`Festival set to: ${festivalName}`);
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
    }
    await prisma.$disconnect();
}

const festival = process.argv[2];
if (festival) {
    setFestival(festival);
} else {
    console.log("Please provide a festival name.");
}
