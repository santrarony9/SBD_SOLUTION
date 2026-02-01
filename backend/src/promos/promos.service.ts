import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PromoCode } from '@prisma/client';

@Injectable()
export class PromosService {
    constructor(private prisma: PrismaService) { }

    async create(data: { code: string; discountType: string; discountValue: number; creatorName?: string }) {
        // Check if code exists
        const exists = await this.prisma.promoCode.findUnique({ where: { code: data.code } });
        if (exists) throw new BadRequestException('Promo code already exists');

        return this.prisma.promoCode.create({
            data: {
                code: data.code.toUpperCase(),
                discountType: data.discountType,
                discountValue: data.discountValue,
                creatorName: data.creatorName
            }
        });
    }

    async findAll() {
        return this.prisma.promoCode.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async validate(code: string) {
        const promo = await this.prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });

        if (!promo || !promo.isActive) {
            throw new BadRequestException('Invalid or expired promo code');
        }

        return promo;
    }

    // Called when an order is successfully placed
    async recordUsage(code: string, orderAmount: number) {
        const promo = await this.prisma.promoCode.findUnique({ where: { code } });
        if (promo) {
            await this.prisma.promoCode.update({
                where: { id: promo.id },
                data: {
                    usageCount: { increment: 1 },
                    totalSales: { increment: orderAmount }
                }
            });
        }
    }

    async delete(id: string) {
        return this.prisma.promoCode.delete({ where: { id } });
    }
}
