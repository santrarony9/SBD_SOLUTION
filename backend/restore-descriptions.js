const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
    console.log("Starting Bulk Description Restoration...");

    // Fetch products missing descriptions or having "AI Description unavailable..."
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { description: null },
                { description: "" },
                { description: { startsWith: "AI Description unavailable" } }
            ]
        }
    });

    console.log(`Found ${products.length} products needing new descriptions.`);

    for (const prod of products) {
        console.log(`Generating AI description for: ${prod.name}`);
        const promptData = {
            name: prod.name,
            category: prod.category || 'Jewelry',
            goldPurity: prod.goldPurity || 18,
            goldWeight: prod.goldWeight || 5,
            diamondCarat: prod.diamondCarat || 0.5,
            diamondClarity: prod.diamondClarity || 'VS1'
        };

        let description = "";
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `Write a luxurious, captivating product description for a piece of jewelry with these details:
            Name: ${promptData.name}
            Category: ${promptData.category}
            Gold: ${promptData.goldPurity}K, ${promptData.goldWeight}g
            Diamonds: ${promptData.diamondCarat}ct, ${promptData.diamondClarity} clarity
            Style: Elegant, Premium, Timeless.
            Keep it under 60 words. Emphasize craftsmanship and eternal value.`;

            const result = await model.generateContent(prompt);
            description = await result.response.text();

        } catch (error) {
            console.error(`Gemini 2.5 Flash failed for ${prod.name}. Retrying with Flash Lite...`);

            try {
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
                const prompt = `Write a luxurious, captivating product description for a piece of jewelry with these details:
                Name: ${promptData.name}
                Category: ${promptData.category}
                Gold: ${promptData.goldPurity}K, ${promptData.goldWeight}g
                Diamonds: ${promptData.diamondCarat}ct, ${promptData.diamondClarity} clarity
                Style: Elegant, Premium, Timeless.
                Keep it under 60 words. Emphasize craftsmanship and eternal value.`;

                const result = await fallbackModel.generateContent(prompt);
                description = await result.response.text();
            } catch (fallbackError) {
                console.error(`All AI models failed for ${prod.name}. Falling back to static luxury copy.`);
                description = `Exquisite ${promptData.name} crafted with the finest ${promptData.goldPurity}K gold weighing ${promptData.goldWeight}g, featuring brilliant ${promptData.diamondCarat}ct diamonds of ${promptData.diamondClarity} clarity. A masterpiece of timeless elegance and superior craftsmanship from Spark Blue Diamond.`;
            }
        }

        // Clean up any markdown bolding formatting returned by Gemini that ruins UI
        description = description.replace(/\*\*/g, '');

        await prisma.product.update({
            where: { id: prod.id },
            data: { description: description.trim() }
        });

        console.log(`Updated ${prod.name} successfully.`);

        // Sleep to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("✅ All missing product descriptions have been restored.");
}

main()
    .catch(e => {
        console.error("Script failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
