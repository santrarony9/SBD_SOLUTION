import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany({
            orderBy: { order: 'asc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.category.findUnique({
            where: { id },
        });
    }

    async create(data: any) {
        return this.prisma.category.create({
            data,
        });
    }

    async update(id: string, data: any) {
        return this.prisma.category.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.category.delete({
            where: { id },
        });
    }

    // Reorder categories
    async reorder(items: { id: string; order: number }[]) {
        const transaction = items.map((item) =>
            this.prisma.category.update({
                where: { id: item.id },
                data: { order: item.order },
            })
        );
        return await this.prisma.$transaction(transaction);
    }
}
