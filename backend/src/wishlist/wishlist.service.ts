import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
    constructor(private prisma: PrismaService) { }

    async toggleWishlist(userId: string, productId: string) {
        const existing = await this.prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (existing) {
            return this.prisma.wishlist.delete({
                where: { id: existing.id },
            });
        } else {
            return this.prisma.wishlist.create({
                data: {
                    userId,
                    productId,
                },
            });
        }
    }

    async getWishlist(userId: string) {
        return this.prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: true,
            },
        });
    }
}
