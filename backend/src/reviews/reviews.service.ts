import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, data: { productId: string; rating: number; comment?: string }) {
        return this.prisma.review.create({
            data: {
                userId,
                productId: data.productId,
                rating: data.rating,
                comment: data.comment,
            },
        });
    }

    async findFeatured() {
        return this.prisma.review.findMany({
            where: { isFeatured: true },
            include: {
                user: { select: { name: true } },
                product: { select: { name: true, images: true } }
            },
            take: 6,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByProduct(productId: string) {
        return this.prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
