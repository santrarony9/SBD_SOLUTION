import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name);

    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService
    ) { }

    // 1. SKU Generation Utility
    generateSKU(category: string, purity: number, weight: number) {
        const cat = category.substring(0, 2).toUpperCase();
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `SBD-${cat}-${purity}K-${Math.floor(weight)}-${rand}`;
    }

    // 2. Stock Adjustments (Product Level)
    async adjustStock(productId: string, quantity: number, action: string, reason?: string, userId?: string) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new NotFoundException('Product not found');

        const updated = await (this.prisma as any).product.update({
            where: { id: productId },
            data: {
                stockCount: { [quantity >= 0 ? 'increment' : 'decrement']: Math.abs(quantity) }
            }
        });

        // WhatsApp Alert: Check Low Stock
        if (updated.stockCount <= 3) {
            this.whatsappService.sendAdminStockAlert(product.name, updated.stockCount).catch(e => console.error(e));
        }

        await (this.prisma as any).inventoryLog.create({
            data: {
                productId,
                action,
                quantity,
                reason,
                performedBy: userId
            }
        });

        return updated;
    }

    // 3. Material Stock Management
    async updateMaterialStock(type: string, quantity: number, unit: string) {
        // Note: Using upsert for simple raw material tracking
        // In MongoDB, unique indexing on 'type' is required for upsert to work as expected.
        // Prisma will handle this if @@unique is in schema, but we'll use find + update/create for safety if not sure.

        const existing = await this.prisma.materialStock.findFirst({ where: { type } });
        if (existing) {
            return this.prisma.materialStock.update({
                where: { id: existing.id },
                data: { quantity: { increment: quantity } }
            });
        }
        return this.prisma.materialStock.create({
            data: { type, quantity, unit }
        });
    }

    // 4. Inventory Valuation (Live Gold/Diamond Prices)
    async getInventoryValuation() {
        const products = await (this.prisma as any).product.findMany({
            where: { isActive: true, stockCount: { gt: 0 } }
        });

        const goldPrices = await (this.prisma as any).goldPrice.findMany();
        const diamondPrices = await (this.prisma as any).diamondPrice.findMany();

        let totalValue = 0;
        const trackedProducts = [];

        for (const product of products) {
            const goldPrice = goldPrices.find(p => p.purity === product.goldPurity);
            const diamondPrice = diamondPrices.find(p => p.clarity === product.diamondClarity);

            if (goldPrice && diamondPrice) {
                const productValue = (product.goldWeight * (goldPrice.pricePer10g / 10)) +
                    (product.diamondCarat * diamondPrice.pricePerCarat);

                totalValue += productValue * product.stockCount;
                trackedProducts.push({
                    name: product.name,
                    sku: product.sku,
                    value: productValue,
                    stock: product.stockCount
                });
            }
        }

        return { totalValue, totalUnits: products.length, breakdown: trackedProducts };
    }

    // 5. Vaults
    async getVaults() {
        return this.prisma.vault.findMany({
            include: { _count: { select: { products: true } } }
        });
    }

    async createVault(name: string, location: string) {
        return this.prisma.vault.create({
            data: { name, location }
        });
    }

    // 6. Restocking on Cancellation
    async onOrderCancel(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) return;

        for (const item of order.items) {
            await this.prisma.product.update({
                where: { id: item.productId },
                data: {
                    stockCount: { increment: item.quantity }
                }
            });

            await this.prisma.inventoryLog.create({
                data: {
                    productId: item.productId,
                    action: 'RESTOCK_CANCEL',
                    quantity: item.quantity,
                    reason: `Order ${orderId.slice(-8)} cancelled`
                }
            });
        }
    }
}
