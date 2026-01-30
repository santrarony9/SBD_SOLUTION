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
        return this.prisma.goldPrice.update({
            where: { purity },
            data: { pricePer10g },
        });
    }

    // -----------------------
    // DIAMOND PRICE
    // -----------------------
    async getDiamondPrices() {
        return this.prisma.diamondPrice.findMany({ orderBy: { pricePerCarat: 'desc' } });
    }

    async updateDiamondPrice(clarity: string, pricePerCarat: number) {
        return this.prisma.diamondPrice.update({
            where: { clarity },
            data: { pricePerCarat },
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
