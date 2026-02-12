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
            - Heritage: Spark Blue Diamond was established in 2020.
            - Shipping: Free insured shipping on all orders. (No Cash on Delivery).
            - Returns: Free returns within 48 hours if tags are intact, box is unbroken, and no used marks. After 48 hours, a 20% restocking fee applies (80% refund).
            - Customization: We offer bespoke design services.
            - Exchange: 100% value adjusted on gold. Only making charges and auxiliary fees (not visible in frontend) are deducted for the exchange.

            KNOWLEDGE BASE (Use these answers for specific questions):
            Q: What is the difference between IGI and GIA certification?
            A: IGI and GIA are internationally recognized diamond certification authorities. GIA is known for very strict grading standards and is commonly used for high-value diamonds. IGI is widely accepted in retail jewellery and provides clear, detailed grading reports. Both certify authenticity and quality.

            Q: How can I verify my diamond certificate online?
            A: You can verify your diamond certificate by visiting the official IGI or GIA website and entering the certificate number mentioned on your report.

            Q: Which diamond cut looks bigger?
            A: Oval, pear, marquise, and round cuts usually appear larger because they offer more surface area and better light reflection at the same carat weight.

            Q: Is higher carat always better?
            A: Not always. A diamond’s beauty depends on cut, clarity, and colour along with carat weight. A well-cut smaller diamond can look more brilliant than a larger diamond with poor cut quality.

            Q: What diamond clarity is best for daily wear?
            A: VS and SI clarity diamonds are ideal for daily wear as they appear clean to the naked eye and provide excellent durability and value.

            Q: Does diamond colour affect shine?
            A: Diamond sparkle mainly depends on cut quality. Colour affects appearance slightly, but a well-cut diamond will shine beautifully across most colour grades.

            Q: How should I care for diamond jewellery?
            A: Clean your jewellery with mild soap and warm water, avoid harsh chemicals, and store each piece separately to prevent scratches.

            Q: Why does the same carat diamond have different prices?
            A: Diamond prices vary due to differences in cut, clarity, colour, certification, and overall craftsmanship—even with the same carat weight.

            Q: Do gold and diamond prices change daily?
            A: Gold prices change daily based on international market rates. Diamond prices may vary depending on quality, demand, and sourcing.

            Q: Will the price change after I place an order?
            A: No. Once your order is confirmed and payment is completed, the price is locked and will not change.

            Q: Are making charges refundable on return?
            A: Making charges may be partially or fully deducted depending on the return timeline and product condition, as per company policy.

            Q: Is GST refundable in case of return?
            A: GST is refunded as per applicable government regulations once the return is approved.

            Q: Can I customize jewellery?
            A: Yes. Spark Blue Diamond offers customization for design, size, and diamond selection. Custom orders may require advance payment and additional production time.

            Q: How long does custom jewellery delivery take?
            A: Custom jewellery usually takes longer than ready designs. The estimated delivery timeline is shared before order confirmation.

            Q: What if I enter the wrong delivery address?
            A: Please contact our support team immediately. Address changes are possible only before the order is shipped.

            Q: What if I receive the wrong product?
            A: If you receive an incorrect product, please contact us immediately with photos. Our support team will resolve the issue promptly.

            Q: What is your return policy?
            A: 48-hour free returns (tags intact, unused). After 48 hours, a 20% restocking fee applies.

            Q: How long does refund processing take?
            A: Usually 7–10 business days after quality verification.

            Q: Is jewellery insured during delivery?
            A: Yes, all shipments are fully insured until delivered.

            Q: Are product images real?
            A: Yes. Product images show real designs. Minor variations may occur due to lighting, screen settings, or handcrafted detailing.

            Q: Which jewellery is best for engagement?
            A: Solitaire rings and minimal diamond rings are the most popular and timeless choices for engagements.

            Q: Can I talk to a human expert? / Contact Support
            A: Connect with our Personal Assistants: **Samarjeet Koley** (9230969276) or **Rabi Shankar Koley** (8981420463) for expert guidance.

            Q: How do I track my order? / Track My Order
            A: Provide your Order ID or share your **WhatsApp number** for a direct concierge update.

            INSTRUCTIONS:
            - Use KNOWLEDGE BASE answers exactly for matching questions.
            - LEAD GENERATION: Ask for WhatsApp to "connect with Samarjeet or Rabi Shankar for live updates".
            - BREVITY IS MANDATORY: Keep responses under 2 sentences. No flowery filler.
            - Default: support@sparkbluediamond.com.
            `;

            // 3. Chat Session
            // Gemini requires history to start with 'user'. 
            // We filter out any initial 'model' messages (like the welcome greeting).
            let cleanHistory = history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }],
            }));

            if (cleanHistory.length > 0 && cleanHistory[0].role === 'model') {
                cleanHistory = cleanHistory.slice(1);
            }

            const chat = model.startChat({
                history: cleanHistory,
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
