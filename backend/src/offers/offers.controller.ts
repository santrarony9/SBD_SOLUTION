import { Controller, Get } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer } from '@prisma/client';

@Controller('offers')
export class OffersController {
    constructor(private readonly offersService: OffersService) { }

    @Get()
    async getOffers(): Promise<Offer[]> {
        return this.offersService.findAll();
    }
}
