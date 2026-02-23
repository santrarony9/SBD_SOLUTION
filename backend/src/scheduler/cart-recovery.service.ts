import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class CartRecoveryService {
    private readonly logger = new Logger(CartRecoveryService.name);

    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleRecoverAbandonedCarts() {
        this.logger.log('Starting Abandoned Cart Recovery Job...');

        // 1. Find carts older than 2 hours that haven't been recovered or notified recently
        const threshold = new Date();
        threshold.setHours(threshold.getHours() - 2);

        const checkCarts = await this.prisma.cart.findMany({
            where: {
                updatedAt: { lt: threshold },
                recoveryEmailSent: false,
                items: { some: {} }, // Has items
                user: { isNot: null }, // Has associated user
            },
            include: {
                user: true,
                items: { include: { product: true } },
            },
        });

        this.logger.log(`Found ${checkCarts.length} potential abandoned carts.`);

        for (const cart of checkCarts) {
            if (!cart.user?.mobile) continue;

            try {
                const productNames = cart.items.map(item => item.product.name).join(', ');

                // WhatsApp Alert for Recovery
                await this.whatsappService.sendAbandonedCartReminder(
                    cart.user.mobile,
                    cart.items[0]?.product.images[0] || '', // First product image
                    productNames,
                    'ROYAL10' // Standard recovery discount
                );

                // Mark as notified to avoid spam
                await this.prisma.cart.update({
                    where: { id: cart.id },
                    data: { recoveryEmailSent: true, lastNotifiedAt: new Date() },
                });

                this.logger.log(`Recovery nudge sent to ${cart.user.name} (${cart.user.mobile})`);
            } catch (error) {
                this.logger.error(`Failed to send recovery nudge for Cart ${cart.id}:`, error.message);
            }
        }
    }
}
