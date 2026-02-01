import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const totalRevenueResult = await this.prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: { not: 'CANCELLED' } }
        });
        const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

        const totalOrders = await this.prisma.order.count();
        const totalProducts = await this.prisma.product.count();
        const totalCustomers = await this.prisma.user.count({ where: { role: Role.USER } });

        const recentOrders = await this.prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });

        const allOrders = await this.prisma.order.findMany({
            select: { createdAt: true, totalAmount: true },
            where: { status: { not: 'CANCELLED' } }
        });

        const monthlySalesMap = new Map<string, number>();
        allOrders.forEach(order => {
            const month = order.createdAt.toLocaleString('default', { month: 'short' });
            const current = monthlySalesMap.get(month) || 0;
            monthlySalesMap.set(month, current + order.totalAmount);
        });

        const monthlySales = Array.from(monthlySalesMap.entries()).map(([name, value]) => ({ name, value }));

        return {
            totalRevenue,
            totalOrders,
            totalProducts,
            totalCustomers,
            recentOrders,
            monthlySales
        };
    }
}
