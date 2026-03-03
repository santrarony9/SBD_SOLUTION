import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Listing indexes on User collection...");

    const indexes = await prisma.$runCommandRaw({
        listIndexes: "User"
    });

    console.log("Indexes:");
    console.dir(indexes.cursor.firstBatch, { depth: null });

    // If there's a googleId index, drop it
    const googleIndex = (indexes.cursor.firstBatch as any[]).find(idx => idx.name === "googleId_1" || idx.key.googleId);
    if (googleIndex) {
        console.log(`Found googleId index: ${googleIndex.name}. Dropping it...`);
        const dropResult = await prisma.$runCommandRaw({
            dropIndexes: "User",
            index: googleIndex.name
        });
        console.log("Drop result:", dropResult);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
