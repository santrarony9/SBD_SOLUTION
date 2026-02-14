import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);
    // Placeholder for API Credentials (to be filled on Monday)
    private readonly apiUrl = process.env.WHATSAPP_API_URL;
    private readonly apiKey = process.env.WHATSAPP_API_KEY;
    private genAI: GoogleGenerativeAI;

    constructor() {
        const genKey = process.env.GEMINI_API_KEY;
        if (genKey) {
            this.genAI = new GoogleGenerativeAI(genKey);
        }
    }

    // ------------------------------------------
    // AI Message Generator (Private Helper)
    // ------------------------------------------
    private async generateMessage(prompt: string, fallback: string): Promise<string> {
        if (!this.genAI) return fallback;
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e) {
            this.logger.error("AI Message Generation Failed", e);
            return fallback;
        }
    }

    // ------------------------------------------
    // Customer Notifications
    // ------------------------------------------

    async sendOtp(phone: string, otp: string) {
        this.logger.log(`[WHATSAPP MOCK] Sending OTP ${otp} to ${phone}`);
        // Implementation: axios.post(this.apiUrl, { phone, message: `Your OTP is ${otp}` ... })
        return true;
    }

    async sendOrderConfirmation(phone: string, orderId: string, amount: number) {
        this.logger.log(`[WHATSAPP MOCK] Sending Order Confirmation for #${orderId} (₹${amount}) to ${phone}`);
        // Implementation: axios.post(...)
        return true;
    }

    async sendInvoice(phone: string, invoiceUrl: string, customerName?: string, orderId?: string) {
        this.logger.log(`[WHATSAPP MOCK] Sending Invoice ${invoiceUrl} to ${phone} (User: ${customerName}, Order: ${orderId})`);
        // Implementation: axios.post(...)
        return true;
    }

    async sendDispatchAlert(phone: string, trackingUrl: string) {
        this.logger.log(`[WHATSAPP MOCK] Sending Dispatch Alert (Track: ${trackingUrl}) to ${phone}`);
        // Implementation: axios.post(...)
        return true;
    }

    async sendDeliveryOtp(phone: string, otp: string) {
        this.logger.log(`[WHATSAPP MOCK] Sending Delivery OTP ${otp} to ${phone}`);
        // Implementation: axios.post(...)
        return true;
    }

    async sendWelcomeMessage(phone: string, name: string) {
        const fallback = `Welcome to Spark Blue Diamond, ${name}. We are delighted to have you with us.`;
        const prompt = `Write a short, elegant, and warm welcome message for a new member named "${name}" joining "Spark Blue Diamond" (a luxury jewellery brand). Keep it under 20 words. No hashtags.`;

        const message = await this.generateMessage(prompt, fallback);
        this.logger.log(`[WHATSAPP MOCK] Sending Welcome Message to ${phone}: ${message}`);
        // Implementation: axios.post(...)
        return true;
    }

    async sendThankYou(phone: string, customerName: string, productName: string) {
        const fallback = `Dear ${customerName}, thank you for purchasing ${productName}. It is a timeless choice.`;
        const prompt = `Write a short, luxurious thank you note for a customer named "${customerName}" who bought "${productName}". Emphasize elegance and timelessness. Keep it under 25 words. No hashtags.`;

        const message = await this.generateMessage(prompt, fallback);
        this.logger.log(`[WHATSAPP MOCK] Sending Thank You Message to ${phone}: ${message}`);
        // Implementation: axios.post(...)
        return true;
    }

    // ------------------------------------------
    // Admin Alerts (Role Based)
    // ------------------------------------------
    // Note: We might need a predefined list of Admin Phone Numbers in ENV or DB

    async sendAdminNewOrderAlert(orderId: string, amount: number) {
        this.logger.log(`[WHATSAPP ADMIN] New Order #${orderId} received. Value: ₹${amount}`);
        // Logic: specific admin numbers
        return true;
    }

    async sendAdminStockAlert(productName: string, stock: number) {
        this.logger.log(`[WHATSAPP ADMIN] Low Stock Alert: ${productName} has only ${stock} left.`);
        return true;
    }

    async sendAdminReturnAlert(orderId: string, reason: string) {
        this.logger.log(`[WHATSAPP ADMIN] Return Request for #${orderId}: ${reason}`);
        return true;
    }

    async sendAdminExchangeAlert(orderId: string, reason: string) {
        this.logger.log(`[WHATSAPP ADMIN] Exchange Request for #${orderId}: ${reason}`);
        return true;
    }

    // ------------------------------------------
    // Marketing / Legacy Support
    // ------------------------------------------

    async sendTemplateMessage(phone: string, templateName: string, params: any[]) {
        this.logger.log(`[WHATSAPP MOCK] Sending Template ${templateName} to ${phone} with params ${JSON.stringify(params)}`);
        // Logic specific to AiSensy or other providers
        return { success: true, messageId: 'mock-msg-id' };
    }

    async sendAbandonedCartReminder(phone: string, imageUrl: string, productName: string, discountCode: string) {
        // AI Enhancement
        const fallback = `Hey! You left ${productName} in your cart. Use code ${discountCode} to complete your order!`;
        const prompt = `Write a persuasive abandoned cart recovery message for a luxury product "${productName}". Offer code "${discountCode}". Keep it under 25 words.`;

        const message = await this.generateMessage(prompt, fallback);
        this.logger.log(`[WHATSAPP MOCK] Abandoned Cart Reminder to ${phone}: ${message}`);
        return true;
    }
}
