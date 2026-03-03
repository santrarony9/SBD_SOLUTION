import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching users with googleId = null...");

    const users = await prisma.user.findMany();

    let updatedCount = 0;
    for (const user of users) {
        if (user.googleId === null) {
            const placeholder = `legacy_null_${user.id}`;
            await prisma.user.update({
                where: { id: user.id },
                data: { googleId: placeholder }
            });
            updatedCount++;
        }
    }

    console.log(`Successfully migrated ${updatedCount} users with placeholder googleIds.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
