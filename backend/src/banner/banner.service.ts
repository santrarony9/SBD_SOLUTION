import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const banners = await this.prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
    return banners.map(b => this.normalizeUrls(b));
  }

  async create(data: any) {
    const banner = await this.prisma.banner.create({ data });
    return this.normalizeUrls(banner);
  }

  async update(id: string, data: any) {
    const banner = await this.prisma.banner.update({ where: { id }, data });
    return this.normalizeUrls(banner);
  }

  async delete(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }

  private normalizeUrls(banner: any) {
    const baseUrl = process.env.API_URL || 'https://api.sparkbluediamond.com';
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.replace('/api', '') : baseUrl;

    if (banner.imageUrl && banner.imageUrl.startsWith('/uploads')) {
      banner.imageUrl = `${cleanBaseUrl}${banner.imageUrl}`;
    }
    if (banner.mobileImageUrl && banner.mobileImageUrl.startsWith('/uploads')) {
      banner.mobileImageUrl = `${cleanBaseUrl}${banner.mobileImageUrl}`;
    }
    return banner;
  }
}
