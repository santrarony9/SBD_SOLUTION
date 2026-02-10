import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    private genAI: GoogleGenerativeAI;

    constructor(private prisma: PrismaService) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY is not set');
        } else {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    async generateResponse(message: string, userId?: string, history: any[] = []) {
        if (!this.genAI) {
            return { text: "System Error: GEMINI_API_KEY is missing in backend environment variables." };
        }

        const runChat = async (modelName: string) => {
            const model = this.genAI.getGenerativeModel({ model: modelName });

            // 1. Gather Context
            const [userContext, productContext, orderContext] = await Promise.all([
                this.getUserContext(userId),
                this.getProductContext(message),
                this.getOrderContext(userId)
            ]);

            // 2. System Prompt
            const systemInstruction = `
            You are the "Spark Blue Diamond Concierge", a luxury jewelry assistant.
            Your tone is: Elegant, Professional, Warm, and Helpful.
            
            CONTEXT:
            ${userContext}

            RELEVANT PRODUCTS (Use these to make recommendations):
            ${productContext}

            RECENT ORDERS (Use these if the user asks about status):
            ${orderContext}

            POLICIES:
            - Shipping: Free insured shipping on all orders.
            - Returns: 30-day return policy for unused items.
            - Customization: We offer bespoke design services.

            INSTRUCTIONS:
            - If recommending products, mention their name and key specs.
            - Keep responses concise (under 3 sentences) unless asked for details.
            - If you don't know, suggest they contact support at support@sparkbluediamond.com.
            `;

            // 3. Chat Session
            const chat = model.startChat({
                history: history.map(h => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }],
                })),
                generationConfig: {
                    maxOutputTokens: 500,
                },
            });

            // 4. Send Message
            const fullPrompt = `${systemInstruction}\n\nUser Query: ${message}`;

            const result = await chat.sendMessage(fullPrompt);
            const response = await result.response;
            return response.text();
        };

        try {
            // Try Primary Model (Gemini 2.5 Flash)
            const text = await runChat("gemini-2.5-flash");
            return { text };
        } catch (error) {
            this.logger.warn(`Gemini 2.5 failed, switching to fallback. Error: ${error.message}`);
            try {
                // Try Fallback Model (Gemini 2.0 Flash Lite)
                const text = await runChat("gemini-2.0-flash-lite");
                return { text };
            } catch (fallbackError) {
                this.logger.error('Gemini Chat Error (Primary & Fallback)', fallbackError);
                return { text: `System Error: ${fallbackError.message || fallbackError}` };
            }
        }
    }

    private async getUserContext(userId?: string): Promise<string> {
        if (!userId) return "User is a Guest.";
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        return user ? `User Name: ${user.name}` : "User is a Guest.";
    }

    private async getProductContext(query: string): Promise<string> {
        const keywords = query.split(' ').filter(w => w.length > 3);
        if (keywords.length === 0) return "No specific products found.";

        const products = await this.prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { category: { contains: query, mode: 'insensitive' } }
                ],
                isActive: true
            },
            take: 3,
            select: {
                name: true,
                category: true,
                slug: true,
                goldPurity: true,
                goldWeight: true,
                diamondCarat: true
            }
        });

        if (products.length === 0) return "No specific products found.";

        return products.map(p => `- ${p.name} (${p.category} | ${p.goldPurity}K Gold, ${p.diamondCarat}ct Diamond): [Link: /product/${p.slug}]`).join('\n');
    }

    private async getOrderContext(userId?: string): Promise<string> {
        if (!userId) return "No order history available.";

        const orders = await this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: { id: true, status: true, totalAmount: true, createdAt: true }
        });

        if (orders.length === 0) return "User has no recent orders.";

        return orders.map(o => `Order #${o.id.slice(-6)}: ${o.status} (placed on ${o.createdAt.toDateString()})`).join('\n');
    }
}
