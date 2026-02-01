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
