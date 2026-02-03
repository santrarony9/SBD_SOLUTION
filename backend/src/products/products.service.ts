import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyOn } from '@prisma/client';
// DTOs would normally be defined in a separate file, defining inline for brevity or need to create them.

import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ProductsService {
    private genAI: GoogleGenerativeAI;

    constructor(private prisma: PrismaService) {
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
    }

    async generateDescription(promptData: any) {
        if (!this.genAI) {
            return "AI Description unavailable: Missing API Key.";
        }
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Write a luxurious, captivating product description for a piece of jewelry with these details:
            Name: ${promptData.name}
            Category: ${promptData.category}
            Gold: ${promptData.goldPurity}K, ${promptData.goldWeight}g
            Diamonds: ${promptData.diamondCarat}ct, ${promptData.diamondClarity} clarity
            Style: Elegant, Premium, Timeless.
            Keep it under 60 words. Emphasize craftsmanship and eternal value.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Generation Failed:", error);
            return "Failed to generate description automatically.";
        }
    }

    async createProduct(data: any) {
        try {
            return await this.prisma.product.create({ data });
        } catch (error) {
            console.error('Failed to create product:', error);
            throw error; // Re-throw to let global filter handle it, but log first
        }
    }

    async updateProduct(id: string, data: any) {
        // Ensure product exists
        await this.findOne(id);
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    async deleteProduct(id: string) {
        await this.findOne(id); // Ensure existence
        // Soft delete could be better, but hard delete for now as per mvp
        return this.prisma.product.delete({ where: { id } });
    }

    async findAll() {
        const products = await this.prisma.product.findMany({ where: { isActive: true } });
        // In list view, we might want to return calculated price too, or just basic info.
        // For performance, maybe just basic info or simplified calc.
        // Let's attach price for now.
        return Promise.all(products.map(p => this.enrichWithPrice(p)));
    }

    async findOne(slugOrId: string) {
        const product = await this.prisma.product.findFirst({
            where: {
                OR: [{ id: slugOrId }, { slug: slugOrId }],
            },
        });

        if (!product) throw new NotFoundException('Product not found');

        return this.enrichWithPrice(product);
    }

    // ------------------------------------------
    // CORE PRICING LOGIC
    // ------------------------------------------
    private async enrichWithPrice(product: any) {
        try {
            // 1. Fetch Rates
            const goldRate = await this.prisma.goldPrice.findUnique({ where: { purity: product.goldPurity } });
            const diamondRate = await this.prisma.diamondPrice.findUnique({ where: { clarity: product.diamondClarity } });
            const charges = await this.prisma.charge.findMany({ where: { isActive: true } }) || [];

            // Defaults if rates missing (should not happen in prod ideally)
            const goldPricePer10g = goldRate?.pricePer10g || 0;
            const diamondPricePerCarat = diamondRate?.pricePerCarat || 0;

            // 2. Calculate Components
            const goldValue = (goldPricePer10g / 10) * product.goldWeight;
            const diamondValue = diamondPricePerCarat * product.diamondCarat;

            // 3. Calculate Charges
            // ApplyOn: GOLD, DIAMOND, FINAL, etc.
            // We need to handle each charge type.

            const subTotal = goldValue + diamondValue;
            let makingCharges = 0;
            let otherCharges = 0;

            // First pass: Calculate Making/Other (non-tax usually)
            for (const charge of charges) {
                if (charge.name.toUpperCase().includes('GST')) continue; // Skip GST for now

                let chargeAmount = 0;

                // For simplicity assuming ApplyOn 'GOLD' means based on gold weight or value
                // The prompt says: Charge Type: Flat, Per gram, Per carat, Percentage.
                // Apply on: Gold, Diamond, Subtotal, Final amount.

                if (charge.type === 'PER_GRAM' && charge.applyOn === ApplyOn.GOLD_VALUE) {
                    chargeAmount = charge.amount * product.goldWeight;
                } else if (charge.type === 'PER_CARAT' && charge.applyOn === ApplyOn.DIAMOND_VALUE) {
                    chargeAmount = charge.amount * product.diamondCarat;
                } else if (charge.type === 'FLAT') {
                    chargeAmount = charge.amount;
                } else if (charge.type === 'PERCENTAGE') {
                    // % of what? 
                    if (charge.applyOn === ApplyOn.GOLD_VALUE) chargeAmount = (goldValue * charge.amount) / 100;
                    else if (charge.applyOn === ApplyOn.DIAMOND_VALUE) chargeAmount = (diamondValue * charge.amount) / 100;
                    else if (charge.applyOn === ApplyOn.SUBTOTAL) chargeAmount = (subTotal * charge.amount) / 100;
                }

                if (charge.name.toLowerCase().includes('making')) {
                    makingCharges += chargeAmount;
                } else if (charge.name.toLowerCase().includes('other')) {
                    otherCharges += chargeAmount;
                } else {
                    // Default to other if not making or tax
                    otherCharges += chargeAmount;
                }
            }

            let gst = 0;
            const taxableAmount = subTotal + makingCharges + otherCharges;

            // Second pass: GST
            const gstCharge = charges.find(c => c.name.toUpperCase().includes('GST'));
            if (gstCharge) {
                // usually percentage of taxable
                if (gstCharge.type === 'PERCENTAGE') {
                    gst = (taxableAmount * gstCharge.amount) / 100;
                }
            }

            const finalPrice = taxableAmount + gst;

            return {
                ...product,
                pricing: {
                    validAsOf: new Date(),
                    goldRate: goldPricePer10g,
                    diamondRate: diamondPricePerCarat,
                    components: {
                        goldValue,
                        diamondValue,
                        makingCharges,
                        otherCharges,
                        gst
                    },
                    finalPrice
                }
            };
        } catch (error) {
            console.error('Error calculating price for product:', product.id, error);
            // Return product without pricing info rather than crashing
            return { ...product, pricing: null };
        }
    }
}
