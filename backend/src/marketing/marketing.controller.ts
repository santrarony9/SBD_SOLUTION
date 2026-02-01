import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Controller('marketing')
export class MarketingController {
    constructor(private whatsapp: WhatsappService) { }

    @UseGuards(JwtAuthGuard)
    @Post('broadcast')
    async sendBroadcast(@Body() body: any) {
        // body: { message: string, segment: string }
        // In a real AiSensy scenario, 'message' usually maps to template params
        // or a specific Marketing Campaign.

        const res = await this.whatsapp.sendTemplateMessage(
            "918888888888", // Hardcoded for test, or loop through segment
            process.env.AISENSY_CAMPAIGN_NAME || "broadcast",
            [body.message]
        );

        return { success: true, message: 'Broadcast initiated via AiSensy', details: res };
    }

    @UseGuards(JwtAuthGuard)
    @Post('segment')
    async getSegment(@Body() body: any) {
        // Mock VIP Segment
        return [
            { id: '1', name: 'Rahul VIP', spent: 150000 },
            { id: '2', name: 'Priya Elite', spent: 250000 },
        ];
    }
}
