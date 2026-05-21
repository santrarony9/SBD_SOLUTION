import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Offer } from '@prisma/client';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Offer[]> {
    const offers = await this.prisma.offer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return offers.map(o => this.normalizeUrls(o));
  }
  async create(data: any): Promise<Offer> {
    const offer = await this.prisma.offer.create({ data });
    return this.normalizeUrls(offer);
  }

  async delete(id: string): Promise<Offer> {
    return this.prisma.offer.delete({ where: { id } });
  }

  private normalizeUrls(offer: any) {
    const baseUrl = process.env.API_URL || 'https://api.sparkbluediamond.com';
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.replace('/api', '') : baseUrl;

    if (offer.imageUrl && offer.imageUrl.startsWith('/uploads')) {
      offer.imageUrl = `${cleanBaseUrl}${offer.imageUrl}`;
    }
    return offer;
  }
}
