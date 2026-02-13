import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GalleryService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.galleryItem.findMany({
            orderBy: { order: 'asc' },
        });
    }

    async create(data: any) {
        return this.prisma.galleryItem.create({
            data,
        });
    }

    async update(id: string, data: any) {
        return this.prisma.galleryItem.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.galleryItem.delete({
            where: { id },
        });
    }
}
