import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer } from '@prisma/client';

@Controller('offers')
export class OffersController {
    constructor(private readonly offersService: OffersService) { }

    @Get()
    async getOffers(): Promise<Offer[]> {
        return this.offersService.findAll();
    }

    @Post()
    async createOffer(@Body() data: any): Promise<Offer> {
        return this.offersService.create(data);
    }

    @Delete(':id')
    async deleteOffer(@Param('id') id: string): Promise<Offer> {
        return this.offersService.delete(id);
    }
}
