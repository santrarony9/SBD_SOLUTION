import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);
    private readonly aisensyUrl = 'https://backend.aisensy.com/campaign/t1/api/v2';

    constructor() { }

    async sendTemplateMessage(mobile: string, templateName: string, params: string[], media?: { url: string, filename: string }) {
        const apiKey = process.env.AISENSY_API_KEY;

        if (!apiKey) {
            this.logger.warn('AISENSY_API_KEY missing in .env. Simulation active.');
            this.logger.log(`[WHATSAPP SIMULATION] Sending ${templateName} to ${mobile} with params: ${params.join(', ')}`);
            return { success: true, message: 'Simulation successful' };
        }

        try {
            const payload: any = {
                apiKey,
                campaignName: templateName,
                destination: mobile,
                userName: "SBD Customer",
                templateParams: params,
                source: "API",
            };

            if (media) {
                payload.media = {
                    url: media.url,
                    filename: media.filename
                };
            }

            const response = await axios.post(this.aisensyUrl, payload);
            this.logger.log(`AiSensy Response: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            this.logger.error(`AiSensy API Error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async sendAbandonedCartReminder(mobile: string, imageUrl: string, productName: string, discountCode: string) {
        // This usually uses a pre-approved template named something like 'abandoned_cart_reminder'
        const campaignName = process.env.AISENSY_CAMPAIGN_NAME || 'abandoned_cart';

        return this.sendTemplateMessage(
            mobile,
            campaignName,
            [productName, discountCode], // Parameters for {{1}} and {{2}}
            { url: imageUrl, filename: 'product.png' }
        );
    }
}
