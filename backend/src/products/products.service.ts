import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyOn } from '@prisma/client';
// DTOs would normally be defined in a separate file, defining inline for brevity or need to create them.

import { GoogleGenerativeAI } from '@google/generative-ai';

import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProductsService {
    private genAI: GoogleGenerativeAI;

    constructor(
        private prisma: PrismaService,
        private redis: RedisService
    ) {
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
                // Final STATIC Luxury Fallback
                return `Exquisite ${promptData.name} crafted with the finest ${promptData.goldPurity}K gold weighing ${promptData.goldWeight}g, featuring brilliant ${promptData.diamondCarat}ct diamonds of ${promptData.diamondClarity} clarity. A masterpiece of timeless elegance and superior craftsmanship from Spark Blue Diamond.`;
            }
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

            const product = await this.prisma.product.create({ data });
            await this.redis.delByPattern('products:*');
            return product;
        } catch (error) {
            console.error('Failed to create product:', error);
            throw error; // Re-throw to let global filter handle it, but log first
        }
    }

    async updateProduct(id: string, data: any) {
        // Ensure product exists
        await this.findOne(id);
        const updated = await this.prisma.product.update({
            where: { id },
            data,
        });
        await this.redis.delByPattern('products:*');
        return updated;
    }

    async deleteProduct(id: string) {
        await this.findOne(id); // Ensure existence
        // Soft delete could be better, but hard delete for now as per mvp
        const deleted = await this.prisma.product.delete({ where: { id } });
        await this.redis.delByPattern('products:*');
        return deleted;
    }

    async findAll(filters?: { category?: string, tag?: string, minPrice?: number, maxPrice?: number, skip?: number, take?: number }) {
        const cacheKey = `products:all:${JSON.stringify(filters || {})}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const where: any = { isActive: true };

        if (filters?.category) {
            where.category = filters.category;
        }

        if (filters?.tag) {
            where.tags = { has: filters.tag };
        }

        // 1. Batch fetch products with pagination (at DB level)
        const products = await this.prisma.product.findMany({
            where,
            skip: filters?.skip || 0,
            take: filters?.take || 100, // Default limit for safety
            orderBy: { createdAt: 'desc' }
        });

        if (products.length === 0) return [];

        // 2. Batch fetch global rates to solve N+1 Problem
        const [goldRates, diamondRates, charges] = await Promise.all([
            this.prisma.goldPrice.findMany(),
            this.prisma.diamondPrice.findMany(),
            this.prisma.charge.findMany({ where: { isActive: true } })
        ]);

        const goldRateMap = new Map(goldRates.map(r => [r.purity, r.pricePer10g]));
        const diamondRateMap = new Map(diamondRates.map(r => [r.clarity, r.pricePerCarat]));

        // 3. Enrich products using cached rates
        const enriched = products.map(product => {
            const goldPricePer10g = goldRateMap.get(product.goldPurity) || 0;
            const diamondPricePerCarat = diamondRateMap.get(product.diamondClarity) || 0;

            return this.calculatePricing(product, goldPricePer10g, diamondPricePerCarat, charges);
        });

        // 4. Client-side price filtering (since pricing is dynamic)
        let result = enriched;
        if (filters?.minPrice || filters?.maxPrice) {
            result = enriched.filter(p => {
                const price = p.pricing?.finalPrice || 0;
                if (filters.minPrice && price < filters.minPrice) return false;
                if (filters.maxPrice && price > filters.maxPrice) return false;
                return true;
            });
        }

        await this.redis.set(cacheKey, JSON.stringify(result), 600); // 10 mins cache
        return result;
    }

    async findOne(slugOrId: string) {
        const cacheKey = `products:one:${slugOrId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        let product;

        if (/^[0-9a-fA-F]{24}$/.test(slugOrId)) {
            product = await this.prisma.product.findUnique({ where: { id: slugOrId } });
        }

        if (!product) {
            product = await this.prisma.product.findFirst({ where: { slug: slugOrId } });
        }

        if (!product) throw new NotFoundException('Product not found');

        // Fetch rates for single enrichment
        const goldRate = await this.prisma.goldPrice.findUnique({ where: { purity: product.goldPurity } });
        const diamondRate = await this.prisma.diamondPrice.findUnique({ where: { clarity: product.diamondClarity } });
        const charges = await this.prisma.charge.findMany({ where: { isActive: true } });

        const result = this.calculatePricing(product, goldRate?.pricePer10g || 0, diamondRate?.pricePerCarat || 0, charges);
        await this.redis.set(cacheKey, JSON.stringify(result), 600); // 10 mins cache
        return result;
    }

    // ------------------------------------------
    // OPTIMIZED PRICING LOGIC (Pure Function style)
    // ------------------------------------------
    private calculatePricing(product: any, goldRate: number, diamondRate: number, charges: any[]) {
        try {
            const goldValue = (goldRate / 10) * product.goldWeight;
            const diamondValue = diamondRate * product.diamondCarat;
            const subTotal = goldValue + diamondValue;

            let makingCharges = 0;
            let otherCharges = 0;

            for (const charge of charges) {
                if (charge.name.toUpperCase().includes('GST')) continue;

                let amt = 0;
                if (charge.type === 'PER_GRAM' && charge.applyOn === ApplyOn.GOLD_VALUE) amt = charge.amount * product.goldWeight;
                else if (charge.type === 'PER_CARAT' && charge.applyOn === ApplyOn.DIAMOND_VALUE) amt = charge.amount * product.diamondCarat;
                else if (charge.type === 'FLAT') amt = charge.amount;
                else if (charge.type === 'PERCENTAGE') {
                    if (charge.applyOn === ApplyOn.GOLD_VALUE) amt = (goldValue * charge.amount) / 100;
                    else if (charge.applyOn === ApplyOn.DIAMOND_VALUE) amt = (diamondValue * charge.amount) / 100;
                    else if (charge.applyOn === ApplyOn.SUBTOTAL) amt = (subTotal * charge.amount) / 100;
                }

                if (charge.name.toLowerCase().includes('making')) makingCharges += amt;
                else otherCharges += amt;
            }

            const taxable = subTotal + makingCharges + otherCharges;
            const gstCharge = charges.find(c => c.name.toUpperCase().includes('GST'));
            const gst = (gstCharge && gstCharge.type === 'PERCENTAGE') ? (taxable * gstCharge.amount) / 100 : 0;

            return {
                ...product,
                pricing: {
                    validAsOf: new Date(),
                    goldRate,
                    diamondRate,
                    components: { goldValue, diamondValue, makingCharges, otherCharges, gst },
                    finalPrice: taxable + gst
                }
            };
        } catch (e) {
            return { ...product, pricing: null };
        }
    }
}
