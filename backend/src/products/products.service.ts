import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyOn, ChargeType } from '@prisma/client';
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
            return "AI Description unavailable: Missing GEMINI_API_KEY.";
        }

        try {
            // Primary Model: Gemini 2.5 Flash (General Availability)
            console.log("Attempting AI Generation with: gemini-2.5-flash");
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        } catch (error: any) {
            console.error("Gemini 2.5 Flash failed, attempting fallback to 2.0 Flash Lite. Error:", error.message);

            try {
                // Fallback Model: Gemini 2.0 Flash Lite (Cost effective, fast)
                const fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

                const prompt = `Write a luxurious, captivating product description for a piece of jewelry with these details:
                Name: ${promptData.name}
                Category: ${promptData.category}
                Gold: ${promptData.goldPurity}K, ${promptData.goldWeight}g
                Diamonds: ${promptData.diamondCarat}ct, ${promptData.diamondClarity} clarity
                Style: Elegant, Premium, Timeless.
                Keep it under 60 words. Emphasize craftsmanship and eternal value.`;

                const result = await fallbackModel.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (fallbackError: any) {
                console.error("AI Generation Failed (Fallback also failed):", fallbackError);
                return `AI Error: ${fallbackError.message}`;
            }
        }
    }

    async seedPricing() {
        try {
            // 1. Gold Prices
            const goldPurities = [18, 22, 24];
            for (const purity of goldPurities) {
                const exists = await this.prisma.goldPrice.findUnique({ where: { purity } });
                if (!exists) {
                    await this.prisma.goldPrice.create({
                        data: {
                            purity,
                            pricePer10g: 65000 + (purity - 18) * 1000,
                        },
                    });
                }
            }

            // 2. Diamond Prices
            const clarities = ['VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'];
            let price = 50000;
            for (const clarity of clarities) {
                const exists = await this.prisma.diamondPrice.findUnique({ where: { clarity } });
                if (!exists) {
                    await this.prisma.diamondPrice.create({
                        data: {
                            clarity,
                            pricePerCarat: price,
                        },
                    });
                }
                price -= 3000;
            }

            // 3. Charges
            const charges = [
                {
                    name: 'Making Charges',
                    type: ChargeType.PER_GRAM,
                    amount: 800,
                    applyOn: ApplyOn.GOLD_VALUE, // Matches schema/pricing service logic for per-gram on gold
                },
                {
                    name: 'GST',
                    type: ChargeType.PERCENTAGE,
                    amount: 3,
                    applyOn: ApplyOn.FINAL_AMOUNT,
                }
            ];

            for (const charge of charges) {
                const existing = await this.prisma.charge.findUnique({ where: { name: charge.name } });
                if (!existing) {
                    await this.prisma.charge.create({ data: charge });
                }
            }

            return { success: true, message: "Pricing data seeded successfully." };
        } catch (error) {
            console.error("Seeding failed:", error);
            return { success: false, error: error.message };
        }
    }

    async createProduct(data: any) {
        try {
            // Auto-generate SKU if not provided to avoid Unique Constraint errors
            if (!data.sku) {
                const prefix = data.category ? data.category.substring(0, 3).toUpperCase() : 'GEN';
                const timestamp = Date.now().toString().substring(6); // shorter timestamp
                const random = Math.floor(Math.random() * 1000);
                data.sku = `SBD-${prefix}-${timestamp}-${random}`;
            }

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

    async findAll(filters?: { category?: string, tag?: string, minPrice?: number, maxPrice?: number }) {
        const where: any = { isActive: true };

        if (filters?.category) {
            where.category = filters.category;
        }

        if (filters?.tag) {
            where.tags = { has: filters.tag };
        }

        // Price filtering is tricky because price is calculated dynamically.
        // For MVP, we filter by 'category' and 'tag' at DB level.
        // Price filtering might need to happen after fetching, or we store estimated price.
        // Given existing structure, we filter after fetch if price filter exists.

        const products = await this.prisma.product.findMany({ where });

        const enriched = await Promise.all(products.map(p => this.enrichWithPrice(p)));

        if (filters?.minPrice || filters?.maxPrice) {
            return enriched.filter(p => {
                const price = p.pricing?.finalPrice || 0;
                if (filters.minPrice && price < filters.minPrice) return false;
                if (filters.maxPrice && price > filters.maxPrice) return false;
                return true;
            });
        }

        return enriched;
    }

    async findOne(slugOrId: string) {
        let product;

        // Check if valid MongoDB ObjectId (24 hex characters)
        if (/^[0-9a-fA-F]{24}$/.test(slugOrId)) {
            product = await this.prisma.product.findUnique({
                where: { id: slugOrId },
            });
        }

        // If not valid ID or not found by ID, search by slug
        if (!product) {
            product = await this.prisma.product.findFirst({
                where: { slug: slugOrId },
            });
        }

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
