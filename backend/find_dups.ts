import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, googleId: true }
    });

    const idCounts: Record<string, number> = {};
    const emptyStringCount = users.filter(u => u.googleId === "").length;
    const nullCount = users.filter(u => u.googleId === null).length;
    const undefinedCount = users.filter(u => u.googleId === undefined).length;

    users.forEach(u => {
        if (u.googleId && u.googleId !== "") {
            idCounts[u.googleId] = (idCounts[u.googleId] || 0) + 1;
        }
    });

    const duplicates = Object.entries(idCounts).filter(([_, count]) => count > 1);

    console.log("=== GoogleId Report ===");
    console.log(`Total Users: ${users.length}`);
    console.log(`Users with googleId = null: ${nullCount}`);
    console.log(`Users with googleId = "": ${emptyStringCount}`);
    console.log(`Users with googleId = undefined: ${undefinedCount}`);

    if (duplicates.length > 0) {
        console.log(`\nFound ${duplicates.length} duplicate non-empty googleIds:`);
        console.log(duplicates);
    } else {
        console.log("\nNo duplicate non-empty googleIds found.");
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
