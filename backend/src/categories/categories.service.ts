import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    return categories.map(c => this.normalizeUrls(c));
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    return this.normalizeUrls(category);
  }

  async create(data: any) {
    const category = await this.prisma.category.create({
      data,
    });
    return this.normalizeUrls(category);
  }

  async update(id: string, data: any) {
    const category = await this.prisma.category.update({
      where: { id },
      data,
    });
    return this.normalizeUrls(category);
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
      }),
    );
    return await this.prisma.$transaction(transaction);
  }

  private normalizeUrls(category: any) {
    if (!category) return category;
    const baseUrl = process.env.API_URL || 'https://api.sparkbluediamond.com';
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.replace('/api', '') : baseUrl;

    if (category.image && category.image.startsWith('/uploads')) {
      category.image = `${cleanBaseUrl}${category.image}`;
    }
    if (category.imageUrl && category.imageUrl.startsWith('/uploads')) {
      category.imageUrl = `${cleanBaseUrl}${category.imageUrl}`;
    }
    return category;
  }
}
