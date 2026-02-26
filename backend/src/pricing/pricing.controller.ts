import { Controller, Get, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('pricing')
export class PricingController {
    constructor(
        private pricingService: PricingService,
        private prisma: PrismaService
    ) { }

    @Get('rates')
    @UseGuards(JwtAuthGuard)
    async getRates() {
        const goldRates = await this.prisma.goldPrice.findMany();
        const diamondRates = await this.prisma.diamondPrice.findMany();
        const makingChargeTierSetting = await this.prisma.storeSetting.findUnique({ where: { key: 'making_charge_tiers' } });
        const charges = await this.prisma.charge.findMany({ where: { isActive: true } });

        return {
            goldRates,
            diamondRates,
            makingChargeTiers: makingChargeTierSetting ? JSON.parse(makingChargeTierSetting.value) : [],
            charges
        };
    }
}
