import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private cartService: CartService,
    ) { }

    async createOrder(userId: string, shippingAddress: any, paymentMethod: string) {
        // 1. Get Cart
        const cart = await this.cartService.getCart(userId);
        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        // 2. Calculate Totals (Re-verify)
        const totalAmount = cart.cartTotal; // Trusted from Service logic

        // 3. Create Order
        const order = await this.prisma.order.create({
            data: {
                userId,
                totalAmount,
                currency: 'INR',
                shippingAddress, // Stores as embedded document
                status: 'PENDING',
                paymentStatus: 'PENDING',
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.calculatedPrice || 0, // Fallback
                        name: item.product.name,
                    })),
                },
            },
        });

        // 4. Razorpay Logic (Stub)
        let razorpayOrderId = null;
        if (paymentMethod === 'RAZORPAY') {
            // TODO: Integrate Razorpay SDK here
            // const razorpayOrder = await razorpay.orders.create({ ... })
            // razorpayOrderId = razorpayOrder.id;

            // MOCK ID for now
            razorpayOrderId = `order_mock_${Date.now()}`;

            await this.prisma.order.update({
                where: { id: order.id },
                data: { razorpayOrderId },
            });
        }

        // 5. Clear Cart
        await this.cartService.clearCart(userId);

        return { ...order, razorpayOrderId };
    }

    async getMyOrders(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { items: true },
        });
    }

    // Admin: Get all orders
    async getAllOrders() {
        return this.prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                items: true,
                user: {
                    select: { name: true, email: true }
                }
            },
        });
    }

    // Admin: Update Status
    async updateOrderStatus(id: string, status: string) {
        return this.prisma.order.update({
            where: { id },
            data: { status: status as any },
        });
    }
}
