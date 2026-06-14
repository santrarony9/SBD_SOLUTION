const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Deleting old mismatched categories...");
    await prisma.category.deleteMany();

    const categoriesToInsert = [
        { name: "Rings", slug: "rings", isActive: true, order: 1 },
        { name: "Necklaces", slug: "necklaces", isActive: true, order: 2 },
        { name: "Earrings", slug: "earrings", isActive: true, order: 3 },
        { name: "Bracelets", slug: "bracelets", isActive: true, order: 4 },
        { name: "Bangles", slug: "bangles", isActive: true, order: 5 },
        { name: "Pendants", slug: "pendants", isActive: true, order: 6 },
        { name: "Nosepin", slug: "nosepin", isActive: true, order: 7 }
    ];

    console.log("Inserting synchronized categories...");
    for (const cat of categoriesToInsert) {
        await prisma.category.create({
            data: cat
        });
        console.log(`Inserted: ${cat.name}`);
    }

    console.log("Category synchronization complete!");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
