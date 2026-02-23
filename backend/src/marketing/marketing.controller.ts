import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Controller('marketing')
export class MarketingController {
    constructor(
        private readonly whatsapp: WhatsappService,
        private readonly marketingService: MarketingService
    ) { }

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

    // --- Price Ranges ---
    @Get('price-ranges')
    findAllPriceRanges() {
        return this.marketingService.findAllPriceRanges();
    }

    @UseGuards(JwtAuthGuard)
    @Post('price-ranges')
    createPriceRange(@Body() data: any) {
        return this.marketingService.createPriceRange(data);
    }

    @UseGuards(JwtAuthGuard)
    @Put('price-ranges/:id')
    updatePriceRange(@Param('id') id: string, @Body() data: any) {
        return this.marketingService.updatePriceRange(id, data);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('price-ranges/:id')
    removePriceRange(@Param('id') id: string) {
        return this.marketingService.removePriceRange(id);
    }

    // --- Tags ---
    @Get('tags')
    findAllTags() {
        return this.marketingService.findAllTags();
    }

    @UseGuards(JwtAuthGuard)
    @Post('tags')
    createTag(@Body() data: any) {
        return this.marketingService.createTag(data);
    }

    @UseGuards(JwtAuthGuard)
    @Put('tags/:id')
    updateTag(@Param('id') id: string, @Body() data: any) {
        return this.marketingService.updateTag(id, data);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('tags/:id')
    removeTag(@Param('id') id: string) {
        return this.marketingService.removeTag(id);
    }

    // --- Social Posts ---
    @Get('social-posts')
    findAllSocialPosts() {
        return this.marketingService.findAllSocialPosts();
    }

    @UseGuards(JwtAuthGuard)
    @Post('social-posts')
    createSocialPost(@Body() data: any) {
        return this.marketingService.createSocialPost(data);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('social-posts/:id')
    removeSocialPost(@Param('id') id: string) {
        return this.marketingService.removeSocialPost(id);
    }

    // --- Drop a Hint ---
    @Post('hint')
    async sendHint(@Body() data: { productId: string, senderName: string, recipientName: string, recipientEmail: string, note?: string }) {
        return this.marketingService.sendHint(data);
    }

    @Post('gift-recommendations')
    async getGiftRecommendations(@Body() body: { recipient: string, occasion: string, budget: string, style: string }) {
        return this.marketingService.getGiftRecommendations(body);
    }

    @Post('activity')
    async trackActivity(@Body() body: { productId: string, activity: string, metadata?: any }, @Req() req: Request) {
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        return this.marketingService.trackActivity({
            ...body,
            ipAddress: ip
        });
    }

    @Get('recently-viewed')
    async getRecentlyViewed(@Req() req: Request) {
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        return this.marketingService.getRecentlyViewed(ip);
    }
}
