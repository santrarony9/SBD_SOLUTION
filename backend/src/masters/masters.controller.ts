import { Controller, Get, Body, Put, Param, UseGuards, UnauthorizedException, Request } from '@nestjs/common';
import { MastersService } from './masters.service';
import { ChargeType, ApplyOn } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('masters')
export class MastersController {
    constructor(private readonly mastersService: MastersService) { }

    @Get('gold')
    getGoldPrices() {
        return this.mastersService.getGoldPrices();
    }

    @UseGuards(JwtAuthGuard)
    @Put('gold/:purity')
    updateGoldPrice(@Param('purity') purity: string, @Body('price') price: number, @Request() req: any) {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'PRICE_MANAGER') {
            throw new UnauthorizedException('Insufficient permissions');
        }
        return this.mastersService.updateGoldPrice(Number(purity), price);
    }

    @Get('diamond')
    getDiamondPrices() {
        return this.mastersService.getDiamondPrices();
    }

    @UseGuards(JwtAuthGuard)
    @Put('diamond/:clarity')
    updateDiamondPrice(@Param('clarity') clarity: string, @Body('price') price: number, @Request() req: any) {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'PRICE_MANAGER') {
            throw new UnauthorizedException('Insufficient permissions');
        }
        return this.mastersService.updateDiamondPrice(clarity, price);
    }

    @Get('charges')
    getCharges() {
        return this.mastersService.getCharges();
    }

    @UseGuards(JwtAuthGuard)
    @Put('charges/:name')
    updateCharge(@Param('name') name: string, @Body() data: { amount?: number; isActive?: boolean; type?: ChargeType; applyOn?: ApplyOn }, @Request() req: any) {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'PRICE_MANAGER') {
            throw new UnauthorizedException('Insufficient permissions');
        }
        return this.mastersService.updateCharge(name, data);
    }
}
