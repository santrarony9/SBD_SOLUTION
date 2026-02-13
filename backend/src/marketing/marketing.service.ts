import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApplyOn } from '@prisma/client';

@Injectable()
export class MarketingService {
    private readonly logger = new Logger(MarketingService.name);
    private genAI: GoogleGenerativeAI;

    constructor(private prisma: PrismaService) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    // --- Price Ranges ---
    async findAllPriceRanges() {
        return this.prisma.priceRange.findMany({ orderBy: { order: 'asc' } });
    }

    async createPriceRange(data: any) {
        return this.prisma.priceRange.create({ data });
    }

    async updatePriceRange(id: string, data: any) {
        return this.prisma.priceRange.update({ where: { id }, data });
    }

    async removePriceRange(id: string) {
        return this.prisma.priceRange.delete({ where: { id } });
    }

    // --- Tags ---
    async findAllTags() {
        return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
    }

    async createTag(data: any) {
        return this.prisma.tag.create({ data });
    }

    async updateTag(id: string, data: any) {
        return this.prisma.tag.update({ where: { id }, data });
    }

    async removeTag(id: string) {
        return this.prisma.tag.delete({ where: { id } });
    }

    // --- Social Posts ---
    async findAllSocialPosts() {
        return this.prisma.socialPost.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
    }

    async createSocialPost(data: any) {
        return this.prisma.socialPost.create({ data });
    }

    async updateSocialPost(id: string, data: any) {
        return this.prisma.socialPost.update({ where: { id }, data });
    }

    async removeSocialPost(id: string) {
        return this.prisma.socialPost.delete({ where: { id } });
    }

    // --- Drop a Hint ---
    async sendHint(data: { productId: string, senderName: string, recipientName: string, recipientEmail: string, note?: string }) {
        // In a real app, inject MailService and send email.
        // For now, we'll log it and return success to simulate.

        return { success: true, message: 'Hint sent successfully!' };
    }

    async getGiftRecommendations(answers: { recipient: string, occasion: string, budget: string, style: string }) {
        try {
            // 1. Fetch ALL Active Products (Small DB assumption)
            const products = await this.prisma.product.findMany({
                where: { isActive: true },
                select: { id: true, name: true, description: true, category: true, images: true, slug: true, goldPurity: true, goldWeight: true, diamondClarity: true, diamondCarat: true }
            });

            if (products.length === 0) return [];

            // 2. Fetch Pricing Standards
            const goldRates = await this.prisma.goldPrice.findMany({ where: { isActive: true } });
            const diamondRates = await this.prisma.diamondPrice.findMany({ where: { isActive: true } });
            const charges = await this.prisma.charge.findMany({ where: { isActive: true } });

            // 3. Filter by Budget
            let minPrice = 0;
            let maxPrice = 10000000;
            if (answers.budget === '0-25000') { maxPrice = 25000; }
            else if (answers.budget === '25000-50000') { minPrice = 25000; maxPrice = 50000; }
            else if (answers.budget === '50000-100000') { minPrice = 50000; maxPrice = 100000; }
            else if (answers.budget === '100000+') { minPrice = 100000; }

            const candidates = products.filter(product => {
                // Calculate Price
                const goldRate = goldRates.find(r => r.purity === product.goldPurity)?.pricePer10g || 0;
                const diamondRate = diamondRates.find(r => r.clarity === product.diamondClarity)?.pricePerCarat || 0;

                const goldValue = (goldRate / 10) * product.goldWeight;
                const diamondValue = diamondRate * product.diamondCarat;
                const subTotal = goldValue + diamondValue;

                // Simple Charge estimation for filter (ignoring complex rules for speed)
                // Assuming ~20% overhead for making + GST as rough guide if exact calc too heavy
                // But let's try to be somewhat accurate
                let overhead = 0;
                charges.forEach(charge => {
                    if (charge.type === 'FLAT') overhead += charge.amount;
                    else if (charge.type === 'PERCENTAGE' && charge.applyOn === ApplyOn.SUBTOTAL) overhead += (subTotal * charge.amount) / 100;
                });

                const estimatedPrice = subTotal + overhead;
                return estimatedPrice >= minPrice && estimatedPrice <= maxPrice;
            }).slice(0, 20); // Take top 20 fits

            if (candidates.length === 0) {
                // Return random 3 if no matches
                return products.slice(0, 3).map(c => ({ ...c, imageUrl: c.images[0], matchReason: "A beautiful choice from our collection." }));
            }

            // 4. AI Selection
            if (this.genAI) {
                const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const prompt = `
                Act as a luxury personal shopper.
                User Profile:
                - Recipient: ${answers.recipient}
                - Occasion: ${answers.occasion}
                - Style: ${answers.style}
                - Budget Range: ${answers.budget}

                Candidate Products:
                ${JSON.stringify(candidates.map(c => ({ id: c.id, name: c.name, desc: c.description, cat: c.category })))}

                Task:
                Select the top 3 most suitable products from the candidates list.
                For each, provide a "matchReason" (1 sentence explaining why it fits the recipient/occasion).

                Return ONLY a valid JSON array of objects: [{ "id": "product_id", "matchReason": "..." }]
                `;

                const result = await model.generateContent(prompt);
                const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                const recommendations = JSON.parse(responseText);

                return recommendations.map((rec: any) => {
                    const product = candidates.find(c => c.id === rec.id);
                    return product ? { ...product, imageUrl: product.images[0], matchReason: rec.matchReason } : null;
                }).filter(Boolean);
            }

            return candidates.slice(0, 3).map(c => ({ ...c, imageUrl: c.images[0], matchReason: "Selected based on your preferences." }));

        } catch (error) {
            this.logger.error("Gift Recommendation Error", error);
            return [];
        }
    }
}
