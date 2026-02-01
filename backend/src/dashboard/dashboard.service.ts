import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const totalRevenueResult = await this.prisma.order.aggregate({
            _sum: { total: true },
            where: { status: { not: 'Cancelled' } } // Assuming you have a Cancelled status, otherwise remove where
        });
        const totalRevenue = totalRevenueResult._sum.total || 0;

        const totalOrders = await this.prisma.order.count();
        const totalProducts = await this.prisma.product.count();
        const totalCustomers = await this.prisma.user.count({ where: { role: 'USER' } });

        const recentOrders = await this.prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });

        // Simple Monthly Sales Logic (Aggregation via JS for simplicity with Mongo)
        // In SQL this would be a GROUP BY query.
        const allOrders = await this.prisma.order.findMany({
            select: { createdAt: true, total: true },
            where: { status: { not: 'Cancelled' } }
        });

        const monthlySalesMap = new Map<string, number>();
        allOrders.forEach(order => {
            const month = order.createdAt.toLocaleString('default', { month: 'short' });
            const current = monthlySalesMap.get(month) || 0;
            monthlySalesMap.set(month, current + order.total);
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
