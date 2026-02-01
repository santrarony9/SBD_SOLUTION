import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tier } from '@prisma/client';

@Injectable()
export class CrmService {
    private readonly logger = new Logger(CrmService.name);

    constructor(private prisma: PrismaService) { }

    // 1. Logic for Order Completion
    async onOrderComplete(userId: string, orderId: string, amount: number) {
        // Amount is the actual paid amount
        const pointsEarned = Math.floor(amount / 100); // 1 point per 100 INR

        // Update User stats
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                loyaltyPoints: { increment: pointsEarned },
                lifetimeSpend: { increment: amount }
            }
        });

        // Log Points
        await this.prisma.loyaltyLog.create({
            data: {
                userId,
                action: 'EARNED',
                points: pointsEarned,
                orderId,
                description: `Points earned for order ₹${amount.toLocaleString()}`
            }
        });

        // Tier Check
        await this.recalculateTier(userId);

        return { pointsEarned, currentPoints: user.loyaltyPoints + pointsEarned };
    }

    // 2. Automated Tier Recalculation
    async recalculateTier(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { lifetimeSpend: true, tier: true }
        });

        if (!user) return;

        let newTier: Tier = 'BRONZE';
        if (user.lifetimeSpend >= 1500000) newTier = 'PLATINUM';
        else if (user.lifetimeSpend >= 500000) newTier = 'GOLD';
        else if (user.lifetimeSpend >= 100000) newTier = 'SILVER';

        if (newTier !== user.tier) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { tier: newTier }
            });
            this.logger.log(`User ${userId} promoted to ${newTier}`);
        }
    }

    // 3. Special Day Detection (for Cron)
    async getSpecialDayUsers() {
        const today = new Date();
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    { birthday: { not: null } },
                    { anniversaryDate: { not: null } }
                ]
            }
        });

        return users.filter(user => {
            const isBirthday = user.birthday &&
                user.birthday.getDate() === today.getDate() &&
                user.birthday.getMonth() === today.getMonth();
            const isAnniversary = user.anniversaryDate &&
                user.anniversaryDate.getDate() === today.getDate() &&
                user.anniversaryDate.getMonth() === today.getMonth();

            return isBirthday || isAnniversary;
        });
    }

    // 4. Manual Point Adjustment (Admin)
    async adjustPoints(userId: string, points: number, reason: string) {
        const action = points >= 0 ? 'EARNED' : 'REDEEMED';
        await this.prisma.loyaltyLog.create({
            data: {
                userId,
                action,
                points: Math.abs(points),
                description: reason
            }
        });

        return this.prisma.user.update({
            where: { id: userId },
            data: { loyaltyPoints: { increment: points } }
        });
    }

    // 5. Logic for Order Cancellation (Reversal)
    async onOrderCancel(userId: string, orderId: string, amount: number) {
        const pointsToRevert = Math.floor(amount / 100);

        // Update User stats (decrement)
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                loyaltyPoints: { decrement: pointsToRevert },
                lifetimeSpend: { decrement: amount }
            }
        });

        // Log Points Reversal
        await this.prisma.loyaltyLog.create({
            data: {
                userId,
                action: 'REVERSED',
                points: pointsToRevert,
                orderId,
                description: `Points reversed for cancelled order ${orderId.slice(-8)} (₹${amount.toLocaleString()})`
            }
        });

        // Recalculate Tier (possibly downgrade)
        await this.recalculateTier(userId);
    }
}
