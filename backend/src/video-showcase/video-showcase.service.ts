import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VideoShowcaseService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.videoShowcase.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async create(data: any) {
    return this.prisma.videoShowcase.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.videoShowcase.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.videoShowcase.delete({
      where: { id },
    });
  }
}
