import { Controller, Get, Body, Put, Param } from '@nestjs/common';
import { MastersService } from './masters.service';

@Controller('masters')
export class MastersController {
    constructor(private readonly mastersService: MastersService) { }

    @Get('gold')
    getGoldPrices() {
        return this.mastersService.getGoldPrices();
    }

    @Put('gold/:purity')
    updateGoldPrice(@Param('purity') purity: string, @Body('price') price: number) {
        return this.mastersService.updateGoldPrice(Number(purity), price);
    }

    @Get('diamond')
    getDiamondPrices() {
        return this.mastersService.getDiamondPrices();
    }

    @Put('diamond/:clarity')
    updateDiamondPrice(@Param('clarity') clarity: string, @Body('price') price: number) {
        return this.mastersService.updateDiamondPrice(clarity, price);
    }

    @Get('charges')
    getCharges() {
        return this.mastersService.getCharges();
    }

    @Put('charges/:id')
    updateCharge(@Param('id') id: string, @Body() data: { amount?: number; isActive?: boolean }) {
        return this.mastersService.updateCharge(id, data);
    }
}
