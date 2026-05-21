import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VideoShowcaseService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.videoShowcase.findMany({
      orderBy: { order: 'asc' },
    });
    return items.map(item => this.normalizeUrls(item));
  }

  async create(data: any) {
    const item = await this.prisma.videoShowcase.create({
      data,
    });
    return this.normalizeUrls(item);
  }

  async update(id: string, data: any) {
    const item = await this.prisma.videoShowcase.update({
      where: { id },
      data,
    });
    return this.normalizeUrls(item);
  }

  async remove(id: string) {
    return this.prisma.videoShowcase.delete({
      where: { id },
    });
  }

  private normalizeUrls(item: any) {
    const baseUrl = process.env.API_URL || 'https://api.sparkbluediamond.com';
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.replace('/api', '') : baseUrl;

    if (item.videoUrl && item.videoUrl.startsWith('/uploads')) {
      item.videoUrl = `${cleanBaseUrl}${item.videoUrl}`;
    }
    if (item.posterUrl && item.posterUrl.startsWith('/uploads')) {
      item.posterUrl = `${cleanBaseUrl}${item.posterUrl}`;
    }
    if (item.thumbnailUrl && item.thumbnailUrl.startsWith('/uploads')) {
      item.thumbnailUrl = `${cleanBaseUrl}${item.thumbnailUrl}`;
    }
    return item;
  }
}
