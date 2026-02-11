import { Injectable, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { RazorpayService } from '../razorpay/razorpay.service';
import { CrmService } from '../crm/crm.service';
import { InventoryService } from '../inventory/inventory.service';

import { ShiprocketService } from '../shiprocket/shiprocket.service';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private prisma: PrismaService,
        private cartService: CartService,
        private crmService: CrmService,
        private inventoryService: InventoryService,
        private shiprocketService: ShiprocketService,
        @Inject(forwardRef(() => RazorpayService))
        private razorpayService: RazorpayService,
    ) { }

    async testShiprocketAuth() {
        return this.shiprocketService.testAuth();
    }

    async createOrder(
        userId: string,
        shippingAddress: any,
        paymentMethod: string,
        billingAddress?: any,
        isB2B?: boolean,
        customerGSTIN?: string,
        businessName?: string,
        placeOfSupply?: string
    ) {
        // 1. Get Cart
        const cart = await this.cartService.getCart(userId);
        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        // 2. Calculate Totals (Re-verify)
        const totalAmount = cart.cartTotal;
        const taxRate = 0.03;
        const taxAmount = totalAmount * taxRate;

        // 3. Create Order
        const order = await this.prisma.order.create({
            data: {
                userId,
                totalAmount,
                taxAmount,
                currency: 'INR',
                shippingAddress,
                billingAddress: billingAddress || shippingAddress,
                isB2B: isB2B || false,
                customerGSTIN: customerGSTIN || null,
                businessName: businessName || null,
                placeOfSupply: placeOfSupply || shippingAddress.state,
                status: 'PENDING',
                paymentStatus: 'PENDING',
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.calculatedPrice || 0,
                        name: item.product.name,
                    })),
                },
            } as any,
        });

        // 4. Razorpay Logic
        let razorpayOrderId = null;
        if (paymentMethod === 'RAZORPAY') {
            try {
                const razorpayOrder = await this.razorpayService.createOrder(
                    totalAmount,
                    'INR',
                    order.id
                );
                razorpayOrderId = razorpayOrder.id;

                await this.prisma.order.update({
                    where: { id: order.id },
                    data: { razorpayOrderId },
                });
            } catch (error) {
                console.error("Razorpay Creation Failed", error);
                // Optionally cancel the created order or throw
            }
        }

        // 5. Shiprocket Integration
        // Non-blocking call
        this.pushToShiprocket(order.id).catch(e => console.error("Shiprocket Auto-Push Failed:", e.message));

        // 6. Clear Cart
        await this.cartService.clearCart(userId);

        return { ...order, razorpayOrderId };
    }

    async pushToShiprocket(orderId: string) {
        const order = await (this.prisma as any).order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } }, user: true }
        });

        if (!order) throw new Error("Order not found");

        try {
            // Check if already pushed
            if (order.shiprocketOrderId) {
                return { success: true, message: "Order already pushed", shiprocketOrderId: order.shiprocketOrderId };
            }

            const shiprocketOrder = await this.shiprocketService.createOrder({
                ...order,
                items: order.items.map((item) => ({
                    ...item,
                    product: item.product
                }))
            });

            if (shiprocketOrder) {
                await (this.prisma as any).order.update({
                    where: { id: order.id },
                    data: {
                        shiprocketOrderId: String(shiprocketOrder.order_id),
                        shipmentId: String(shiprocketOrder.shipment_id),
                        awbCode: shiprocketOrder.awb_code || null
                    }
                });
                return { success: true, shiprocketOrder };
            }
            return { success: false, message: "Shiprocket returned no data" };
        } catch (e) {
            console.error("Shiprocket Service Error:", e.message);
            throw new BadRequestException("Failed to push to Shiprocket: " + e.message);
        }
    }

    async generateShipmentLabel(orderId: string) {
        const order = await (this.prisma as any).order.findUnique({ where: { id: orderId } });
        if (!order || !order.shipmentId) {
            throw new BadRequestException("Order not found or not pushed to Shiprocket yet.");
        }

        const labelData = await this.shiprocketService.generateLabel(order.shipmentId);
        if (!labelData || !labelData.label_url) {
            throw new BadRequestException("Failed to generate label from Shiprocket.");
        }

        return { labelUrl: labelData.label_url };
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
        let updateData: any = { status: status as any };

        // 1. Handle Cancellation
        if (status === 'CANCELLED') {
            updateData.cancelledAt = new Date();
            updateData.creditNoteNumber = `SBD/CN/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

            // Sync with Shiprocket
            const order = await (this.prisma as any).order.findUnique({ where: { id } });
            if (order && order.shiprocketOrderId) {
                try {
                    await this.shiprocketService.cancelOrder(order.shiprocketOrderId);
                    console.log(`Shiprocket Order ${order.shiprocketOrderId} cancelled successfully.`);
                } catch (e) {
                    console.error("Failed to sync cancellation with Shiprocket:", e.message);
                    // We log but don't block the local cancellation to ensure data consistency
                }
            }
        }

        // 2. Handle Return Initiation
        if (status === 'RETURN_INITIATED') {
            // For MVP: We just mark it locally. 
            // Future: Call Shiprocket Return API here.
        }

        const order = await (this.prisma as any).order.update({
            where: { id },
            data: updateData,
        });

        // Trigger CRM Logic if order is CONFIRMED (Treating it as successful payment for now)
        if (status === 'CONFIRMED' && order.userId) {
            await this.crmService.onOrderComplete(order.userId, order.id, order.totalAmount);
        }

        // Trigger Reversal Logic if order is CANCELLED
        if (status === 'CANCELLED') {
            // 1. Restock Inventory
            await this.inventoryService.onOrderCancel(order.id);

            // 2. Reverse CRM Points
            if (order.userId) {
                await this.crmService.onOrderCancel(order.userId, order.id, order.totalAmount);
            }
        }

        return order;
    }
    async markAsPaid(orderId: string, paymentId: string) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CONFIRMED',
                paymentStatus: 'PAID',
                razorpayPaymentId: paymentId
            }
        });
    }
}
