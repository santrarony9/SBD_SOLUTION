import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class DashboardService {
    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService
    ) { }

    async getStats() {
        const totalRevenueResult = await this.prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: { not: 'CANCELLED' },
                paymentStatus: 'PAID' // Only count paid orders
            }
        });
        const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

        const totalOrders = await this.prisma.order.count({
            where: {
                status: { not: 'CANCELLED' },
                paymentStatus: 'PAID'
            }
        });
        const totalProducts = await this.prisma.product.count();
        const totalCustomers = await this.prisma.user.count({ where: { role: 'USER' } });

        const recentOrders = await this.prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });

        const allOrders = await this.prisma.order.findMany({
            select: { createdAt: true, totalAmount: true },
            where: {
                status: { not: 'CANCELLED' },
                paymentStatus: 'PAID'
            }
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
    async getActiveCarts() {
        return this.prisma.cart.findMany({
            where: {
                items: { some: {} }, // Has items
            },
            include: {
                user: { select: { name: true, email: true, mobile: true, role: true } },
                items: { include: { product: true } }
            },
            orderBy: { updatedAt: 'desc' },
            take: 50
        });
    }

    async nudgeCart(cartId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { id: cartId },
            include: { user: true, items: { include: { product: true } } }
        });

        if (!cart || !cart.user || !cart.user.mobile || cart.items.length === 0) {
            throw new Error('Cart not found or invalid for nudge');
        }

        // Send WhatsApp
        return this.whatsappService.sendAbandonedCartReminder(
            cart.user.mobile,
            cart.items[0].product.images[0],
            cart.items[0].product.name,
            'VIPNUDGE'
        );
    }
}
