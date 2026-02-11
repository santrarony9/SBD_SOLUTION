import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CartCleanupService {
    private readonly logger = new Logger(CartCleanupService.name);

    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService,
        private mailService: MailService
    ) { }

    // Run every hour
    @Cron(CronExpression.EVERY_HOUR)
    async handleAbandonedCarts() {
        this.logger.log('Checking for abandoned carts...');

        // Definition: Updated > 1 hour ago, Not yet notified
        const deadline = new Date(Date.now() - 1 * 60 * 60 * 1000);

        const abandonedCarts = await this.prisma.cart.findMany({
            where: {
                updatedAt: { lt: deadline },
                recoveryEmailSent: false, // Check new flag
                items: { some: {} }, // Must have items
                user: {
                    is: { email: { not: null } } // Must have email
                }
            },
            include: {
                items: {
                    include: { product: true }
                },
                user: true
            }
        });

        this.logger.log(`Found ${abandonedCarts.length} abandoned carts eligible for recovery.`);

        for (const cart of abandonedCarts) {
            // Safety check
            if (!cart.user || !cart.user.email || cart.items.length === 0) continue;

            const product = cart.items[0].product; // Use first item for preview
            const productLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/product/${product.slug}`;

            try {
                // Send Email via MailService (assuming injected)
                await this.mailService.sendAbandonedCartEmail(
                    cart.user.email,
                    cart.user.name,
                    product.name,
                    productLink
                );

                // Also try WhatsApp if available (existing logic)
                if (cart.user.mobile) {
                    await this.whatsappService.sendAbandonedCartReminder(
                        cart.user.mobile,
                        product.images[0] || '',
                        product.name,
                        'COMEBACK5'
                    );
                }

                // Update DB 
                await this.prisma.cart.update({
                    where: { id: cart.id },
                    data: {
                        lastNotifiedAt: new Date(),
                        recoveryEmailSent: true
                    }
                });

                this.logger.log(`Notified user ${cart.user.email} (Cart ${cart.id})`);
            } catch (error) {
                this.logger.error(`Failed to notify cart ${cart.id}`, error);
            }
        }
    }
}
