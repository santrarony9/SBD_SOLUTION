import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Offer } from '@prisma/client';

@Injectable()
export class OffersService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<Offer[]> {
        return this.prisma.offer.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
