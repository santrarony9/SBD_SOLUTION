import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class CartCleanupService {
    private readonly logger = new Logger(CartCleanupService.name);

    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService
    ) { }

    // Run every hour
    @Cron(CronExpression.EVERY_HOUR)
    async handleAbandonedCarts() {
        this.logger.log('Checking for abandoned carts...');

        // Definition: Updated > 12 hours ago, Not yet notified
        const deadline = new Date(Date.now() - 12 * 60 * 60 * 1000);

        const abandonedCarts = await this.prisma.cart.findMany({
            where: {
                updatedAt: { lt: deadline },
                lastNotifiedAt: null, // Only notify once
                items: { some: {} }, // Must have items
                user: {
                    is: { mobile: { not: null } } // Must have mobile
                }
            },
            include: {
                items: {
                    include: { product: true }
                },
                user: true
            }
        });

        this.logger.log(`Found ${abandonedCarts.length} abandoned carts.`);

        for (const cart of abandonedCarts) {
            // Safety check
            if (!cart.user || !cart.user.mobile || cart.items.length === 0) continue;

            const product = cart.items[0].product; // Use first item for preview
            const discountCode = 'COMEBACK5'; // Could be dynamic

            try {
                await this.whatsappService.sendAbandonedCartReminder(
                    cart.user.mobile,
                    product.images[0] || '',
                    product.name,
                    discountCode
                );

                // Update DB so we don't spam
                await this.prisma.cart.update({
                    where: { id: cart.id },
                    data: { lastNotifiedAt: new Date() }
                });

                this.logger.log(`Notified user ${cart.user.email} (Cart ${cart.id})`);
            } catch (error) {
                this.logger.error(`Failed to notify cart ${cart.id}`, error);
            }
        }
    }
}
