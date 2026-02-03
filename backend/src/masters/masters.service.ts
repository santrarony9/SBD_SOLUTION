import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChargeType, ApplyOn } from '@prisma/client';

@Injectable()
export class MastersService {
    constructor(private prisma: PrismaService) { }

    // -----------------------
    // GOLD PRICE
    // -----------------------
    async getGoldPrices() {
        return this.prisma.goldPrice.findMany({ orderBy: { purity: 'asc' } });
    }

    async updateGoldPrice(purity: number, pricePer10g: number) {
        return this.prisma.goldPrice.upsert({
            where: { purity },
            update: { pricePer10g },
            create: { purity, pricePer10g }
        });
    }

    // -----------------------
    // DIAMOND PRICE
    // -----------------------
    async getDiamondPrices() {
        return this.prisma.diamondPrice.findMany({ orderBy: { clarity: 'asc' } });
    }

    async updateDiamondPrice(clarity: string, pricePerCarat: number) {
        return this.prisma.diamondPrice.upsert({
            where: { clarity },
            update: { pricePerCarat },
            create: { clarity, pricePerCarat }
        });
    }

    // -----------------------
    // CHARGES
    // -----------------------
    async getCharges() {
        return this.prisma.charge.findMany();
    }

    async updateCharge(id: string, data: { amount?: number; isActive?: boolean }) {
        return this.prisma.charge.update({
            where: { id },
            data,
        });
    }
}
