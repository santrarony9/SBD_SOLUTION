import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannerService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.banner.findMany({
            orderBy: { order: 'asc' }
        });
    }

    async create(data: any) {
        return this.prisma.banner.create({ data });
    }

    async update(id: string, data: any) {
        return this.prisma.banner.update({ where: { id }, data });
    }

    async delete(id: string) {
        return this.prisma.banner.delete({ where: { id } });
    }
}
