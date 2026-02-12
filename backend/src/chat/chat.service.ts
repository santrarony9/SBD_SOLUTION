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

    async generateResponse(message: string, userId?: string, history: any[] = [], ipAddress?: string) {
        if (!this.genAI) {
            return { text: "System Error: GEMINI_API_KEY is missing in backend environment variables." };
        }

        const runChat = async (modelName: string) => {
            const model = this.genAI.getGenerativeModel({ model: modelName });

            // 1. Gather Context
            const [userContext, productContext, orderContext, marketingContext] = await Promise.all([
                this.getUserContext(userId),
                this.getProductContext(message),
                this.getOrderContext(userId),
                this.getMarketingContext(ipAddress, userId)
            ]);

            // 1b. Log Activity for Marketing Memory
            this.logActivity(message, ipAddress, userId, productContext);

            // 2. System Prompt
            const systemInstruction = `
            You are the "Spark Blue Diamond Concierge", a luxury jewelry assistant.
            Your tone is: Soft-spoken, Gentle, Elegant, Professional, and Extremely Polite.
            
            CONTEXT:
            ${userContext}

            RELEVANT PRODUCTS (Use these to make recommendations):
            ${productContext}

            RECENT ORDERS (Use these if the user asks about status):
            ${orderContext}

            MARKETING MEMORY (Past Interactions/Interests for this IP/User):
            ${marketingContext}

            POLICIES:
            - Heritage: Spark Blue Diamond was established in 2020.
            - Shipping: Free insured shipping on all orders. (No Cash on Delivery).
            - Returns: Free returns within 48 hours if tags are intact, box is unbroken, and no used marks. After 48 hours, a 20% restocking fee applies (80% refund).
            - Customization: We offer bespoke design services.
            - Exchange: 100% value adjusted on gold. Only making charges and auxiliary fees (not visible in frontend) are deducted for the exchange.

            KNOWLEDGE BASE (Use these answers for specific questions - but soften the tone):
            Q: What is the difference between IGI and GIA certification?
            A: IGI and GIA are both internationally recognized authorities. GIA is renowned for strict standards often used for high-value diamonds, while IGI is widely accepted for detailed grading. Both ensure your diamond's authenticity.

            Q: How can I verify my diamond certificate online?
            A: You may kindly verify your certificate by visiting the official IGI or GIA website and entering the report number.

            Q: Which diamond cut looks bigger?
            A: Shapes like Oval, Pear, and Marquise generally appear larger than others of the same weight due to their surface area.

            Q: Is higher carat always better?
            A: Not necessarily. A diamond's true beauty comes from a balance of cut, clarity, and colour. A well-cut smaller diamond can sparkle more brilliantly.

            Q: What diamond clarity is best for daily wear?
            A: VS and SI clarity diamonds are wonderful choices for daily wear, offering a beautiful clean appearance and excellent value.

            Q: Does diamond colour affect shine?
            A: Sparkle comes primarily from the cut. While colour has a slight effect, a well-cut diamond will shine actively across most grades.

            Q: How should I care for diamond jewellery?
            A: We recommend gently cleaning with mild soap and warm water, and storing pieces separately to protect them.

            Q: Why does the same carat diamond have different prices?
            A: Each diamond is unique. Prices vary based on the specific combination of cut, clarity, colour, and certification.

            Q: Do gold and diamond prices change daily?
            A: Yes, gold rates follow the international market. Diamond prices may also fluctuate based on quality and demand.

            Q: Will the price change after I place an order?
            A: No, please rest assured that once your order is confirmed, the price is locked for you.

            Q: Are making charges refundable on return?
            A: Making charges may be deducted upon return, depending on the condition and timeline, as per our policy.

            Q: Is GST refundable in case of return?
            A: Yes, GST is refunded in accordance with government regulations once the return is approved.

            Q: Can I customize jewellery?
            A: Absolutely. We would be delighted to customize the design, size, or diamond selection for you. Please note custom orders may need advance payment.

            Q: How long does custom jewellery delivery take?
            A: Creating something special takes a little time. We will share an estimated delivery date with you before confirming the order.

            Q: What if I enter the wrong delivery address?
            A: Please kindly contact our support team immediately, and we will do our best to help before the order ships.

            Q: What if I receive the wrong product?
            A: We sincerely apologize if that happens. Please contact us right away with photos, and we will resolve it promptly.

            Q: What is your return policy?
            A: We offer a comfortable 48-hour free return window for unused items with tags. After that, a small restocking fee applies.

            Q: How long does refund processing take?
            A: It typically takes 7–10 business days after we verify the substantial quality of the returned item.

            Q: Is jewellery insured during delivery?
            A: Yes, for your peace of mind, all shipments are fully insured until they reach you.

            Q: Are product images real?
            A: Yes, they are real designs. There might be very slight variations due to handcrafting or lighting.

            Q: Which jewellery is best for engagement?
            A: Solitaire rings are a timeless and elegant choice for such a special occasion.

            Q: Can I talk to a human expert? / Contact Support
            A: You are welcome to connect with our Personal Assistants, **Samarjeet Koley** or **Rabi Shankar Koley**, for personal guidance.

            Q: How do I track my order? / Track My Order
            A: Please share your Order ID or WhatsApp number, and we will be happy to fetch that update for you.

            INSTRUCTIONS:
            - **TONE**: Be polite, soft-spoken, and use gentle language (e.g., "Kindly", "Please", "We would be delighted").
            - **BUDGET**: User has NOT specified a budget unless explicitly stated in "User Query". IF budget is missing and they are looking for products, gently ask: "May I know your preferred budget range so I can find the perfect piece for you?"
            - **RECOMMENDATIONS**: When suggesting products from RELEVANT PRODUCTS:
                1. Mention the **Price** (Approx).
                2. Highlight the **Quality** (e.g., "features a VVS1 clarity diamond", "set in 18K Gold").
                3. Mention **Cut/Color** if available to emphasize value.
                4. RESPECT BUDGET: If user gives a budget (e.g. 50k), only recommend items near/below that price. If closest item is slightly higher, gently ask if they are flexible.
            - LEAD GENERATION: Gently invite them to connect on WhatsApp with Samarjeet or Rabi Shankar for personal assistance.
            - LENGTH: Keep responses concise (2-3 sentences max) but prioritize politeness over extreme brevity.
            - Default Email: support@sparkbluediamond.com.
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
                diamondCarat: true,
                diamondClarity: true,
                diamondColor: true,
                diamondCut: true
            }
        });

        if (products.length === 0) return "No specific products found.";

        // lightweight price calculation
        try {
            // Fetch live rates - ideally cached or batched, but okay for low volume chat
            // We fetch the first matching rate for simplicity in this context
            const [goldRates, diamondRates] = await Promise.all([
                this.prisma.goldPrice.findMany(),
                this.prisma.diamondPrice.findMany()
            ]);

            const enriched = products.map(p => {
                const gRate = goldRates.find(r => r.purity === p.goldPurity)?.pricePer10g || 0;
                const dRate = diamondRates.find(r => r.clarity === p.diamondClarity)?.pricePerCarat || 0;

                const goldVal = (gRate / 10) * p.goldWeight;
                const diamondVal = dRate * p.diamondCarat;

                // Approximate charges (Making + GST) ~ 20% overhead for estimation
                const estimatedPrice = (goldVal + diamondVal) * 1.25;
                const formattedPrice = Math.round(estimatedPrice).toLocaleString('en-IN');

                return `- ${p.name} (~₹${formattedPrice}) | ${p.goldPurity}K Gold, ${p.diamondCarat}ct Diamond (${p.diamondClarity}, ${p.diamondColor || 'N/A'}, ${p.diamondCut || 'N/A'}) | [Link: /product/${p.slug}]`;
            });

            return enriched.join('\n');
        } catch (e) {
            // Fallback if price calc fails
            return products.map(p => `- ${p.name} | ${p.goldPurity}K Gold, ${p.diamondCarat}ct Diamond (${p.diamondClarity}) | [Link: /product/${p.slug}]`).join('\n');
        }
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

    private async logActivity(message: string, ipAddress?: string, userId?: string, productContext?: string) {
        if (!ipAddress) return;
        try {
            await this.prisma.userActivity.create({
                data: {
                    ipAddress,
                    userId,
                    activity: 'CHAT_QUERY',
                    metadata: {
                        query: message,
                        foundProducts: productContext !== "No specific products found."
                    }
                }
            });
        } catch (e) {
            this.logger.error('Failed to log activity', e);
        }
    }

    private async getMarketingContext(ipAddress?: string, userId?: string): Promise<string> {
        if (!ipAddress && !userId) return "No marketing history.";

        const activities = await this.prisma.userActivity.findMany({
            where: {
                OR: [
                    userId ? { userId } : { ipAddress }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { metadata: true, createdAt: true }
        });

        if (activities.length === 0) return "New customer (no previous interaction history).";

        return activities.map(a => {
            const meta = a.metadata as any;
            return `- [${a.createdAt.toDateString()}] Searched for: "${meta?.query}"`;
        }).join('\n');
    }
}
