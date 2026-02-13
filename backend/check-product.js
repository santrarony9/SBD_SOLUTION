const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Product KSR1440...');

    // 1. Find Product
    // Try finding by name containing KSR1440 or sku
    const product = await prisma.product.findFirst({
        where: {
            OR: [
                { name: { contains: 'KSR1440', mode: 'insensitive' } },
                { sku: { contains: 'KSR1440', mode: 'insensitive' } },
                { slug: { contains: 'ksr1440', mode: 'insensitive' } }
            ]
        }
    });

    if (!product) {
        console.log("Product not found!");
        return;
    }

    console.log("Product Data:", JSON.stringify(product, null, 2));

    // 2. Fetch Rates
    const goldRate = await prisma.goldPrice.findUnique({ where: { purity: product.goldPurity } });
    const diamondRate = await prisma.diamondPrice.findUnique({ where: { clarity: product.diamondClarity } });
    const charges = await prisma.charge.findMany({ where: { isActive: true } });

    console.log("Gold Rate:", goldRate);
    console.log("Diamond Rate:", diamondRate);
    console.log("Charges:", charges);

    // 3. Replicate Calculation
    const goldPricePer10g = goldRate?.pricePer10g || 0;
    const diamondPricePerCarat = diamondRate?.pricePerCarat || 0;

    const goldValue = (goldPricePer10g / 10) * product.goldWeight;
    const diamondValue = diamondPricePerCarat * product.diamondCarat;

    console.log(`Gold Value: ${goldValue} (${product.goldWeight}g * ${goldPricePer10g}/10g)`);
    console.log(`Diamond Value: ${diamondValue} (${product.diamondCarat}ct * ${diamondPricePerCarat}/ct)`);

    let subTotal = goldValue + diamondValue;
    let makingCharges = 0;
    let otherCharges = 0;

    for (const charge of charges) {
        if (charge.name.toUpperCase().includes('GST')) continue;

        let chargeAmount = 0;
        // Simplified logic match
        if (charge.type === 'PER_GRAM') chargeAmount = charge.amount * product.goldWeight;
        else if (charge.type === 'PER_CARAT') chargeAmount = charge.amount * product.diamondCarat;
        else if (charge.type === 'FLAT') chargeAmount = charge.amount;
        else if (charge.type === 'PERCENTAGE') {
            // Assuming applyOn details from service
            if (charge.applyOn === 'GOLD_VALUE') chargeAmount = (goldValue * charge.amount) / 100;
            else if (charge.applyOn === 'SUBTOTAL') chargeAmount = (subTotal * charge.amount) / 100;
        }

        console.log(`Charge ${charge.name}: ${chargeAmount}`);

        if (charge.name.toLowerCase().includes('making')) makingCharges += chargeAmount;
        else otherCharges += chargeAmount;
    }

    let gst = 0;
    const taxableAmount = subTotal + makingCharges + otherCharges;
    const gstCharge = charges.find(c => c.name.toUpperCase().includes('GST'));
    if (gstCharge) {
        gst = (taxableAmount * gstCharge.amount) / 100;
    }

    console.log(`Taxable Amount: ${taxableAmount}`);
    console.log(`GST: ${gst}`);
    console.log(`Final Price: ${taxableAmount + gst}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
