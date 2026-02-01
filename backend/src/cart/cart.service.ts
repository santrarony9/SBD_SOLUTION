import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { }

    async getCart(userId: string) {
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                }
            },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: { items: { include: { product: true } } },
            });
        }

        // Calculate totals dynamically
        const enrichedItems = cart.items.map(item => {
            // Logic for price calculation could be complex (e.g. live gold rates).
            // For now, using stored price or dummy calculation. 
            // Ideally, we fetch live price here using ProductsService logic.
            const price = item.product.goldWeight * 6000 + item.product.diamondCarat * 50000; // Simplified Example
            return { ...item, calculatedPrice: price, total: price * item.quantity };
        });

        const total = enrichedItems.reduce((sum, item) => sum + item.total, 0);

        // Apply Dynamic Pricing Rules
        let finalTotal = total;
        let appliedRule = null;

        const rules = await this.prisma.pricingRule.findMany({
            where: { isActive: true },
            orderBy: { minCartValue: 'desc' } // Check higher value rules first
        });

        for (const rule of rules) {
            if (total >= rule.minCartValue) {
                const discount = total * (rule.discountPercent / 100);
                finalTotal = total - discount;
                appliedRule = rule;
                break; // Apply only the best matching rule
            }
        }

        return {
            ...cart,
            items: enrichedItems,
            originalTotal: total,
            cartTotal: finalTotal,
            appliedRule
        };
    }

    async addToCart(userId: string, productId: string, quantity: number) {
        const cart = await this.getCart(userId);

        // Check if item exists in cart
        const existingItem = cart.items.find(i => i.productId === productId);

        if (existingItem) {
            return this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            return this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }
    }

    async removeFromCart(userId: string, itemId: string) {
        return this.prisma.cartItem.delete({
            where: { id: itemId },
        });
    }

    async clearCart(userId: string) {
        const cart = await this.prisma.cart.findUnique({ where: { userId } });
        if (!cart) return;
        return this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
    }
}
