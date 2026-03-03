import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Running $unset operation via runCommandRaw...");

    // Use runCommandRaw to run a native MongoDB update command
    const result = await prisma.$runCommandRaw({
        update: "User",
        updates: [
            {
                q: { googleId: null },
                u: { $unset: { googleId: "" } },
                multi: true
            }
        ]
    });

    console.log("Unset googleId result:", result);

    const resultMobile = await prisma.$runCommandRaw({
        update: "User",
        updates: [
            {
                q: { mobile: null },
                u: { $unset: { mobile: "" } },
                multi: true
            }
        ]
    });

    console.log("Unset mobile result:", resultMobile);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
